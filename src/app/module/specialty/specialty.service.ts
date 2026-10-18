import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    // throw new Error("Testing error handling in create specialty service");
    const specialty = await prisma.specialty.create({
        data: payload
    })

    return specialty;

}

const getAllSpecialties = async (): Promise<Specialty[]> => {
    const specialties = await prisma.specialty.findMany({
        where: { isDeleted: false }
    });
    return specialties;
}

const updateSpecialty = async (id: string, payload: any): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: payload
    });
    return specialty;
}

const deleteSpecialty = async (id: string): Promise<Specialty> => {
    const specialty = await prisma.specialty.update({
        where: { id },
        data: { isDeleted: true }
    });
    return specialty;
}

export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecialty
}