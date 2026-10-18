import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

interface VectorDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata: { name?: string; specialty?: string; [key: string]: unknown };
    sourceType: string;
}

let vectorStore: VectorDocument[] = [];

const cosineSimilarity = (a: number[], b: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const ingestDoctors = async () => {
    try {
        const doctors = await prisma.doctor.findMany({
            where: { isDeleted: false },
            include: { user: true, specialties: { include: { specialty: true } }, reviews: true }
        });

        const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        vectorStore = []; // Clear existing store
        
        for (const doctor of doctors) {
            const specialties = doctor.specialties.map(s => s.specialty.title).join(", ");
            const addressText = doctor.address ? ` Chamber Address: ${doctor.address}.` : "";
            const textContent = `Dr. ${doctor.name} - Specialty: ${specialties}. Qualification: ${doctor.qualification}. Experience: ${doctor.experience} years. Consultation Fee: ${doctor.appointmentFee} BDT. Rating: ${doctor.averageRating}. Hospital/Workplace: ${doctor.currentWorkingPlace}.${addressText} Designation: ${doctor.designation}`;
            
            const result = await model.embedContent(textContent);
            const embedding = result.embedding.values;

            vectorStore.push({
                id: doctor.id,
                content: textContent,
                embedding,
                metadata: {
                    name: doctor.name,
                    specialty: specialties,
                },
                sourceType: 'doctor'
            });
        }

        return { indexedCount: vectorStore.length };
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to ingest doctors: ${error.message}`);
    }
};

const queryRag = async (query: string, limit: number = 5) => {
    try {
        // Auto-ingest doctors if vector store is empty (e.g. after server restart)
        if (vectorStore.length === 0) {
            try {
                await ingestDoctors();
            } catch (e) {
                console.error("Auto-ingest failed:", e);
            }
        }

        if (vectorStore.length === 0) {
            return {
                answer: "No doctors found in the system. Please contact an admin.",
                sources: [],
                contextUsed: ""
            };
        }

        const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY || "");
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        
        const embedResult = await embeddingModel.embedContent(query);
        const queryEmbedding = embedResult.embedding.values;

        const scoredDocs = vectorStore.map(doc => ({
            ...doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
        }));

        scoredDocs.sort((a, b) => b.score - a.score);
        const topDocs = scoredDocs.slice(0, limit);

        const context = topDocs.map(d => d.content).join("\n\n");

        const chatModel = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        const prompt = `You are a helpful healthcare assistant for Smart Care hospital. Based on the following doctor information, answer the user's question. If the information doesn't contain relevant data, say so politely. Format doctor recommendations clearly with name, specialty, hospital/chamber address, consultation fee, and why they're a good match. Note that appointments are for in-person chamber consultations with fee payable on arrival at the clinic reception.
        
Context:
${context}

Question:
${query}`;

        const result = await chatModel.generateContent(prompt);
        const answer = result.response.text();

        return {
            answer,
            sources: topDocs.map(d => ({
                id: d.id,
                name: d.metadata.name,
                score: d.score,
                content: d.content
            })),
            contextUsed: context
        };
    } catch (error: any) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to query: ${error.message}`);
    }
};

export const RagService = {
    ingestDoctors,
    queryRag
};
