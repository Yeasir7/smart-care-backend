/**
 * Comprehensive Seed Script for Smart Care Healthcare System
 *
 * Populates the database with realistic mock data:
 * - 10 Medical Specialties
 * - 12 Doctors (with profile photos, specialties, rich credentials)
 * - 5 Patients (with full health data)
 * - 45+ Schedule slots (past, today, tomorrow, and next 7 days)
 * - DoctorSchedules (open slots for booking + booked slots)
 * - Appointments (SCHEDULED, INPROGRESS, COMPLETED)
 * - Payments, Prescriptions, Reviews, and Medical Reports
 *
 * All user passwords are: password123
 *
 * Usage: npx tsx prisma/seed.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const uuid7 = () => randomUUID();
const uuidV4 = () => randomUUID();

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function scheduleSlot(daysFromNow: number, startHour: number, startMinute = 0): { start: Date; end: Date } {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 45); // 45-minute slots
  return { start, end };
}

// ──────────────────────────────────────────────
// Main Seed
// ──────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting Comprehensive Smart Care Seed...\n");

  const PASSWORD = "password123";
  const hashedPassword = await hashPassword(PASSWORD);

  // ════════════════════════════════════════════
  // 1. Specialties (10 categories)
  // ════════════════════════════════════════════
  console.log("1. Creating / Updating 10 Medical Specialties...");
  const specialtyData = [
    { title: "Cardiology", description: "Comprehensive diagnosis and treatment of heart conditions, coronary disease, and hypertension.", icon: "HeartPulse" },
    { title: "Neurology", description: "Expert care for brain, spine, stroke, migraines, epilepsy, and neurological disorders.", icon: "Brain" },
    { title: "Orthopedics", description: "Treatment of bone fractures, joint replacements, arthritis, and sports injuries.", icon: "Bone" },
    { title: "Pediatrics", description: "Compassionate healthcare, vaccinations, and growth monitoring for newborns, kids, and teens.", icon: "Baby" },
    { title: "Dermatology", description: "Medical and cosmetic treatment for skin allergies, acne, eczema, hair, and nails.", icon: "Sparkles" },
    { title: "Gynecology", description: "Women's reproductive health, prenatal and postnatal care, family planning, and surgery.", icon: "Activity" },
    { title: "General Medicine", description: "Primary preventive care, diabetes management, fever, infections, and chronic disease.", icon: "Stethoscope" },
    { title: "Psychiatry", description: "Mental health counseling, depression, anxiety, stress therapy, and psychiatric wellness.", icon: "Smile" },
    { title: "Ophthalmology", description: "Advanced eye care, vision testing, glaucoma treatment, cataract, and laser surgery.", icon: "Eye" },
    { title: "ENT", description: "Specialized care for ear infections, hearing loss, sinus problems, tonsils, and throat care.", icon: "Ear" },
    { title: "Gastroenterology", description: "Treatment for digestive health, liver, acid reflux, IBS, and endoscopy care.", icon: "Stethoscope" },
    { title: "Urology", description: "Expert diagnosis and surgery for kidney stones, prostate, and urinary disorders.", icon: "Activity" },
    { title: "Nephrology", description: "Specialized treatment for chronic kidney disease, dialysis, and renal health.", icon: "HeartPulse" },
    { title: "Pulmonology", description: "Advanced care for respiratory diseases, asthma, COPD, and lung infections.", icon: "Activity" },
    { title: "Endocrinology", description: "Comprehensive management of diabetes, thyroid disorders, and hormonal imbalances.", icon: "Sparkles" },
    { title: "Oncology", description: "Comprehensive cancer diagnosis, chemotherapy, and tumor consultation.", icon: "Activity" },
  ];

  for (const s of specialtyData) {
    await prisma.specialty.upsert({
      where: { title: s.title },
      update: { description: s.description, icon: s.icon, isDeleted: false },
      create: {
        id: uuid7(),
        title: s.title,
        description: s.description,
        icon: s.icon,
      },
    });
  }
  const allSpecialties = await prisma.specialty.findMany({ where: { isDeleted: false } });
  console.log(`  ✓ ${allSpecialties.length} specialties active in database\n`);

  // ════════════════════════════════════════════
  // 2. Doctors (12 realistic doctors with photos)
  // ════════════════════════════════════════════
  console.log("2. Creating / Updating 12 Specialist Doctors with Profiles & Photos...");
  const doctorsInput = [
    {
      name: "Dr. Sarah Ahmed",
      email: "doctor1@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-41201",
      experience: 14,
      appointmentFee: 800,
      qualification: "MBBS, MD (Cardiology), FCPS",
      currentWorkingPlace: "SmartCare Heart Center, Dhaka",
      designation: "Senior Consultant Cardiologist",
      contactNumber: "+8801711000001",
      address: "House 12, Road 5, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Cardiology",
    },
    {
      name: "Dr. James Wilson",
      email: "doctor2@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-52890",
      experience: 9,
      appointmentFee: 500,
      qualification: "MBBS, DDV (Dermatology), Fellow ADA",
      currentWorkingPlace: "SmartCare Skin Clinic, Gulshan",
      designation: "Consultant Dermatologist",
      contactNumber: "+8801711000002",
      address: "House 45, Road 11, Gulshan, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Dermatology",
    },
    {
      name: "Dr. Fatima Khan",
      email: "doctor3@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-38104",
      experience: 16,
      appointmentFee: 1000,
      qualification: "MBBS, MD (Neurology), FRCP (Glasgow)",
      currentWorkingPlace: "SmartCare Neuro Institute, Banani",
      designation: "Chief Neurologist & Professor",
      contactNumber: "+8801711000003",
      address: "House 78, Road 8, Banani, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1594824813576-963b65fa3a59?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Neurology",
    },
    {
      name: "Dr. Robert Fox",
      email: "doctor4@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-44312",
      experience: 12,
      appointmentFee: 900,
      qualification: "MBBS, MS (Orthopedics), Fellow AO Spine",
      currentWorkingPlace: "Apollo Trauma & Bone Center, Dhaka",
      designation: "Senior Orthopedic & Joint Surgeon",
      contactNumber: "+8801711000004",
      address: "Plot 3, Sector 4, Uttara, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Orthopedics",
    },
    {
      name: "Dr. Ayesha Siddiqua",
      email: "doctor5@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-49201",
      experience: 10,
      appointmentFee: 600,
      qualification: "MBBS, DCH, FCPS (Pediatrics)",
      currentWorkingPlace: "Dhaka Shishu Hospital",
      designation: "Associate Professor of Pediatrics",
      contactNumber: "+8801711000005",
      address: "House 24, Road 3, Shyamoli, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Pediatrics",
    },
    {
      name: "Dr. Tanvir Rahman",
      email: "doctor6@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-31205",
      experience: 20,
      appointmentFee: 1200,
      qualification: "MBBS, FCPS (Internal Medicine), MACP (USA)",
      currentWorkingPlace: "Dhaka Medical College Hospital",
      designation: "Professor & Head of Internal Medicine",
      contactNumber: "+8801711000006",
      address: "House 5, Road 2, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "General Medicine",
    },
    {
      name: "Dr. Nusrat Jahan",
      email: "doctor7@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-46781",
      experience: 11,
      appointmentFee: 750,
      qualification: "MBBS, MS (Obstetrics & Gynecology)",
      currentWorkingPlace: "Square Hospital, Panthapath",
      designation: "Consultant Gynecologist & Surgeon",
      contactNumber: "+8801711000007",
      address: "Flat 4A, Green Garden, Panthapath, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Gynecology",
    },
    {
      name: "Dr. Michael Chang",
      email: "doctor8@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-55912",
      experience: 8,
      appointmentFee: 650,
      qualification: "MBBS, MPhil (Psychiatry), CBT Certified",
      currentWorkingPlace: "MindWell Mental Health Care",
      designation: "Consultant Neuropsychiatrist",
      contactNumber: "+8801711000008",
      address: "House 18, Road 103, Gulshan 2, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Psychiatry",
    },
    {
      name: "Dr. Farhana Yasmin",
      email: "doctor9@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-43209",
      experience: 13,
      appointmentFee: 700,
      qualification: "MBBS, DO, FCPS (Ophthalmology)",
      currentWorkingPlace: "National Institute of Ophthalmology",
      designation: "Consultant Eye Specialist & Phaco Surgeon",
      contactNumber: "+8801711000009",
      address: "House 33, Sher-e-Bangla Nagar, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Ophthalmology",
    },
    {
      name: "Dr. Kamal Hossain",
      email: "doctor10@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-39904",
      experience: 15,
      appointmentFee: 850,
      qualification: "MBBS, DLO, MS (ENT & Head-Neck Surgery)",
      currentWorkingPlace: "United Hospital, Gulshan",
      designation: "Senior Consultant ENT Surgeon",
      contactNumber: "+8801711000010",
      address: "Plot 15, Road 71, Gulshan 2, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "ENT",
    },
    {
      name: "Dr. Zoya Chowdhury",
      email: "doctor11@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-54320",
      experience: 7,
      appointmentFee: 550,
      qualification: "MBBS, DDV, Clinical Fellow in Aesthetics",
      currentWorkingPlace: "Evercare Hospital, Bashundhara",
      designation: "Associate Consultant Dermatologist",
      contactNumber: "+8801711000011",
      address: "Block D, Bashundhara R/A, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Dermatology",
    },
    {
      name: "Dr. Mahmudul Hasan",
      email: "doctor12@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-36014",
      experience: 18,
      appointmentFee: 1100,
      qualification: "MBBS, MD (Cardiology), FACC (USA)",
      currentWorkingPlace: "National Heart Foundation & Research Institute",
      designation: "Chief Interventional Cardiologist",
      contactNumber: "+8801711000012",
      address: "Plot 4, Mirpur 2, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Cardiology",
    },
    {
      name: "Dr. Tariq Anam",
      email: "doctor13@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-47120",
      experience: 14,
      appointmentFee: 950,
      qualification: "MBBS, FCPS (Gastroenterology), MD",
      currentWorkingPlace: "Sheikh Russel National Gastroliver Institute",
      designation: "Senior Consultant Gastroenterologist",
      contactNumber: "+8801711000013",
      address: "House 20, Road 11, Banani, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Gastroenterology",
    },
    {
      name: "Dr. Sabrina Parveen",
      email: "doctor14@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-51902",
      experience: 12,
      appointmentFee: 850,
      qualification: "MBBS, MS (Urology), Fellow Endourology",
      currentWorkingPlace: "Labaid Specialized Hospital, Dhanmondi",
      designation: "Consultant Urologist & Laser Surgeon",
      contactNumber: "+8801711000014",
      address: "House 6, Road 4, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Urology",
    },
    {
      name: "Dr. Anisur Rahman",
      email: "doctor15@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-33890",
      experience: 22,
      appointmentFee: 1200,
      qualification: "MBBS, MD (Nephrology), FRCP (Edin)",
      currentWorkingPlace: "National Institute of Kidney Diseases & Urology",
      designation: "Professor & Head of Nephrology",
      contactNumber: "+8801711000015",
      address: "Sher-e-Bangla Nagar, Agargaon, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Nephrology",
    },
    {
      name: "Dr. Nadia Islam",
      email: "doctor16@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-48312",
      experience: 10,
      appointmentFee: 750,
      qualification: "MBBS, MD (Pulmonology), FCCP (USA)",
      currentWorkingPlace: "Asgar Ali Hospital, Gandaria",
      designation: "Consultant Chest Specialist & Pulmonologist",
      contactNumber: "+8801711000016",
      address: "111/1 VIP Road, Gandaria, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1594824813576-963b65fa3a59?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Pulmonology",
    },
    {
      name: "Dr. Mostafa Kamal",
      email: "doctor17@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-42150",
      experience: 16,
      appointmentFee: 1000,
      qualification: "MBBS, DEM (Endocrinology), MACE (USA)",
      currentWorkingPlace: "BIRDEM General Hospital, Shahbagh",
      designation: "Chief Diabetologist & Endocrinologist",
      contactNumber: "+8801711000017",
      address: "122 Kazi Nazrul Islam Ave, Shahbagh, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Endocrinology",
    },
    {
      name: "Dr. Sharmin Akter",
      email: "doctor18@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-37651",
      experience: 15,
      appointmentFee: 1100,
      qualification: "MBBS, FCPS (Medical Oncology), ESMO Certified",
      currentWorkingPlace: "National Institute of Cancer Research & Hospital",
      designation: "Senior Consultant Oncologist",
      contactNumber: "+8801711000018",
      address: "Mohakhali TB Gate, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Oncology",
    },
    {
      name: "Dr. Kazi Imran",
      email: "doctor19@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-56201",
      experience: 8,
      appointmentFee: 600,
      qualification: "MBBS, D-Ortho, Fellow Arthroscopy",
      currentWorkingPlace: "Popular Diagnostic Center, Dhanmondi",
      designation: "Consultant Orthopedic Surgeon",
      contactNumber: "+8801711000019",
      address: "House 16, Road 2, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Orthopedics",
    },
    {
      name: "Dr. Mehnaz Tabassum",
      email: "doctor20@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-49823",
      experience: 11,
      appointmentFee: 700,
      qualification: "MBBS, DCH, MD (Pediatric Pulmonology)",
      currentWorkingPlace: "Evercare Hospital, Bashundhara",
      designation: "Consultant Pediatrician",
      contactNumber: "+8801711000020",
      address: "Plot 81, Block E, Bashundhara R/A, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Pediatrics",
    },
    {
      name: "Dr. Asif Mahmud",
      email: "doctor21@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-35119",
      experience: 19,
      appointmentFee: 1150,
      qualification: "MBBS, MS (Neuro Surgery), Fellow WFNS",
      currentWorkingPlace: "Square Hospital, Panthapath",
      designation: "Senior Brain & Spine Neurosurgeon",
      contactNumber: "+8801711000021",
      address: "18/F Bir Uttam Qazi Nuruzzaman Sarak, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Neurology",
    },
    {
      name: "Dr. Rubina Haque",
      email: "doctor22@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-44890",
      experience: 13,
      appointmentFee: 800,
      qualification: "MBBS, FCPS (Obs & Gynae), Fellowship in Laparoscopy",
      currentWorkingPlace: "Central Hospital, Dhanmondi",
      designation: "Consultant Gynecologist & Laparoscopic Surgeon",
      contactNumber: "+8801711000022",
      address: "House 2, Road 5, Green Road, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Gynecology",
    },
    {
      name: "Dr. Shahadat Hossain",
      email: "doctor23@smartcare.com",
      gender: "MALE" as const,
      registrationNumber: "BMDC-A-40112",
      experience: 17,
      appointmentFee: 900,
      qualification: "MBBS, MS (ENT), Fellowship in Micro Ear Surgery",
      currentWorkingPlace: "Ibn Sina Specialized Hospital, Dhanmondi",
      designation: "Chief ENT & Head Neck Surgeon",
      contactNumber: "+8801711000023",
      address: "House 48, Road 9/A, Dhanmondi, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "ENT",
    },
    {
      name: "Dr. Nusrat Parvin",
      email: "doctor24@smartcare.com",
      gender: "FEMALE" as const,
      registrationNumber: "BMDC-A-53240",
      experience: 9,
      appointmentFee: 650,
      qualification: "MBBS, FCPS (Psychiatry), Child Mental Health Specialist",
      currentWorkingPlace: "National Institute of Mental Health, Dhaka",
      designation: "Assistant Professor & Child Psychiatrist",
      contactNumber: "+8801711000024",
      address: "Sher-e-Bangla Nagar, Dhaka",
      profilePhoto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
      specialtyTitle: "Psychiatry",
    },
  ];

  const doctorRecords: { doctorId: string; userId: string; email: string; name: string }[] = [];

  for (const doc of doctorsInput) {
    const specialty = allSpecialties.find((s) => s.title === doc.specialtyTitle);
    if (!specialty) continue;

    const existingUser = await prisma.user.findFirst({ where: { email: doc.email } });

    if (existingUser) {
      // Update doctor profile with photo and details
      const existingDoctor = await prisma.doctor.findFirst({ where: { userId: existingUser.id } });
      if (existingDoctor) {
        await prisma.doctor.update({
          where: { id: existingDoctor.id },
          data: {
            name: doc.name,
            profilePhoto: doc.profilePhoto,
            gender: doc.gender,
            experience: doc.experience,
            appointmentFee: doc.appointmentFee,
            qualification: doc.qualification,
            currentWorkingPlace: doc.currentWorkingPlace,
            designation: doc.designation,
            contactNumber: doc.contactNumber,
            address: doc.address,
            isDeleted: false,
          },
        });

        // Ensure specialty link
        const existingLink = await prisma.doctorSpecialty.findFirst({
          where: { doctorId: existingDoctor.id, specialtyId: specialty.id },
        });
        if (!existingLink) {
          await prisma.doctorSpecialty.create({
            data: { id: uuid7(), doctorId: existingDoctor.id, specialtyId: specialty.id },
          });
        }

        doctorRecords.push({ doctorId: existingDoctor.id, userId: existingUser.id, email: doc.email, name: doc.name });
        console.log(`  ✓ Updated Doctor ${doc.name} (${doc.specialtyTitle})`);
        continue;
      }
    }

    // Create fresh Doctor
    const userId = uuid7();
    const doctorId = uuid7();
    const accountId = uuid7();

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          name: doc.name,
          email: doc.email,
          emailVerified: true,
          role: "DOCTOR",
          status: "ACTIVE",
          needPasswordChange: false,
          isDeleted: false,
        },
      });

      await tx.account.create({
        data: {
          id: accountId,
          accountId: userId,
          providerId: "credential",
          userId: userId,
          password: hashedPassword,
        },
      });

      await tx.doctor.create({
        data: {
          id: doctorId,
          name: doc.name,
          email: doc.email,
          gender: doc.gender,
          registrationNumber: doc.registrationNumber,
          experience: doc.experience,
          appointmentFee: doc.appointmentFee,
          qualification: doc.qualification,
          currentWorkingPlace: doc.currentWorkingPlace,
          designation: doc.designation,
          contactNumber: doc.contactNumber,
          address: doc.address,
          profilePhoto: doc.profilePhoto,
          averageRating: 4.8,
          userId: userId,
        },
      });

      await tx.doctorSpecialty.create({
        data: {
          id: uuid7(),
          doctorId: doctorId,
          specialtyId: specialty.id,
        },
      });
    });

    doctorRecords.push({ doctorId, userId, email: doc.email, name: doc.name });
    console.log(`  ✓ Created Doctor ${doc.name} (${doc.specialtyTitle})`);
  }
  console.log(`  ✓ Total ${doctorRecords.length} doctors ready\n`);

  // ════════════════════════════════════════════
  // 3. Patients (5 realistic patients with health records)
  // ════════════════════════════════════════════
  console.log("3. Creating / Updating 5 Patients with Medical Histories...");
  const patientsInput = [
    {
      name: "Rahim Uddin",
      email: "patient1@smartcare.com",
      contactNumber: "+8801811000001",
      address: "House 3, Road 2, Mirpur 10, Dhaka",
      healthData: {
        gender: "MALE" as const,
        dateOfBirth: new Date("1990-05-15"),
        bloodGroup: "B_POSITIVE" as const,
        hasAllergies: true,
        hasDiabetes: false,
        height: "175",
        weight: "72",
        smokingStatus: false,
        dietaryPreferences: "Balanced, low sodium",
        maritalStatus: "Married",
        immunizationStatus: "Fully Vaccinated",
      },
    },
    {
      name: "Ayesha Begum",
      email: "patient2@smartcare.com",
      contactNumber: "+8801811000002",
      address: "House 56, Road 9, Sector 3, Uttara, Dhaka",
      healthData: {
        gender: "FEMALE" as const,
        dateOfBirth: new Date("1985-11-22"),
        bloodGroup: "A_POSITIVE" as const,
        hasAllergies: false,
        hasDiabetes: true,
        height: "160",
        weight: "58",
        smokingStatus: false,
        dietaryPreferences: "Diabetic, high fiber",
        maritalStatus: "Married",
        immunizationStatus: "Fully Vaccinated",
        pregnancyStatus: false,
      },
    },
    {
      name: "Karim Hossain",
      email: "patient3@smartcare.com",
      contactNumber: "+8801811000003",
      address: "House 21, Road 4, Mohammadpur, Dhaka",
      healthData: {
        gender: "MALE" as const,
        dateOfBirth: new Date("1998-03-10"),
        bloodGroup: "O_POSITIVE" as const,
        hasAllergies: false,
        hasDiabetes: false,
        height: "180",
        weight: "78",
        smokingStatus: true,
        dietaryPreferences: "Standard",
        maritalStatus: "Single",
        immunizationStatus: "Up to Date",
      },
    },
    {
      name: "Tanima Roy",
      email: "patient4@smartcare.com",
      contactNumber: "+8801811000004",
      address: "House 14, Road 7, Banani, Dhaka",
      healthData: {
        gender: "FEMALE" as const,
        dateOfBirth: new Date("1995-08-19"),
        bloodGroup: "AB_POSITIVE" as const,
        hasAllergies: true,
        hasDiabetes: false,
        height: "165",
        weight: "55",
        smokingStatus: false,
        dietaryPreferences: "Vegetarian",
        maritalStatus: "Single",
        immunizationStatus: "Fully Vaccinated",
      },
    },
    {
      name: "Faruq Ahmed",
      email: "patient5@smartcare.com",
      contactNumber: "+8801811000005",
      address: "House 89, Kakrail, Dhaka",
      healthData: {
        gender: "MALE" as const,
        dateOfBirth: new Date("1978-02-14"),
        bloodGroup: "O_NEGATIVE" as const,
        hasAllergies: false,
        hasDiabetes: true,
        height: "170",
        weight: "80",
        smokingStatus: false,
        dietaryPreferences: "Cardiac friendly",
        maritalStatus: "Married",
        immunizationStatus: "Fully Vaccinated",
      },
    },
  ];

  const patientRecords: { patientId: string; userId: string; email: string; name: string }[] = [];

  for (const pat of patientsInput) {
    const existingUser = await prisma.user.findFirst({ where: { email: pat.email } });
    if (existingUser) {
      const existingPatient = await prisma.patient.findFirst({ where: { userId: existingUser.id } });
      if (existingPatient) {
        patientRecords.push({ patientId: existingPatient.id, userId: existingUser.id, email: pat.email, name: pat.name });
        console.log(`  ✓ Existing Patient ${pat.name} ready`);
        continue;
      }
    }

    const userId = uuid7();
    const patientId = uuid7();
    const accountId = uuid7();

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          name: pat.name,
          email: pat.email,
          emailVerified: true,
          role: "PATIENT",
          status: "ACTIVE",
          needPasswordChange: false,
          isDeleted: false,
        },
      });

      await tx.account.create({
        data: {
          id: accountId,
          accountId: userId,
          providerId: "credential",
          userId: userId,
          password: hashedPassword,
        },
      });

      await tx.patient.create({
        data: {
          id: patientId,
          name: pat.name,
          email: pat.email,
          contactNumber: pat.contactNumber,
          address: pat.address,
          userId: userId,
        },
      });

      await tx.patientHealthData.create({
        data: {
          id: uuid7(),
          patientId: patientId,
          gender: pat.healthData.gender,
          dateOfBirth: pat.healthData.dateOfBirth,
          bloodGroup: pat.healthData.bloodGroup,
          hasAllergies: pat.healthData.hasAllergies,
          hasDiabetes: pat.healthData.hasDiabetes,
          height: pat.healthData.height,
          weight: pat.healthData.weight,
          smokingStatus: pat.healthData.smokingStatus,
          dietaryPreferences: pat.healthData.dietaryPreferences,
          maritalStatus: pat.healthData.maritalStatus,
          immunizationStatus: pat.healthData.immunizationStatus,
        },
      });
    });

    patientRecords.push({ patientId, userId, email: pat.email, name: pat.name });
    console.log(`  ✓ Created Patient ${pat.name}`);
  }
  console.log(`  ✓ Total ${patientRecords.length} patients ready\n`);

  // ════════════════════════════════════════════
  // 4. Schedules & Doctor Availability
  // ════════════════════════════════════════════
  console.log("4. Creating Real-Time Doctor Schedules (Past, Today, and Upcoming Week)...");

  // Generate 48 time slots across past, today, and future 7 days
  const slotDefinitions: { daysFromNow: number; hour: number; minute: number }[] = [
    // Past (for completed history)
    { daysFromNow: -14, hour: 10, minute: 0 },
    { daysFromNow: -10, hour: 11, minute: 0 },
    { daysFromNow: -7, hour: 15, minute: 0 },
    { daysFromNow: -5, hour: 9, minute: 30 },
    { daysFromNow: -4, hour: 14, minute: 0 },
    { daysFromNow: -2, hour: 11, minute: 30 },
    { daysFromNow: -1, hour: 16, minute: 0 },

    // Today (active appointments & open slots)
    { daysFromNow: 0, hour: 14, minute: 0 },
    { daysFromNow: 0, hour: 15, minute: 0 },
    { daysFromNow: 0, hour: 16, minute: 30 },
    { daysFromNow: 0, hour: 18, minute: 0 },

    // Tomorrow (open slots for live demonstration)
    { daysFromNow: 1, hour: 9, minute: 0 },
    { daysFromNow: 1, hour: 10, minute: 0 },
    { daysFromNow: 1, hour: 11, minute: 0 },
    { daysFromNow: 1, hour: 14, minute: 30 },
    { daysFromNow: 1, hour: 16, minute: 0 },
    { daysFromNow: 1, hour: 17, minute: 30 },

    // Day 2
    { daysFromNow: 2, hour: 9, minute: 30 },
    { daysFromNow: 2, hour: 11, minute: 0 },
    { daysFromNow: 2, hour: 14, minute: 0 },
    { daysFromNow: 2, hour: 16, minute: 0 },

    // Day 3
    { daysFromNow: 3, hour: 10, minute: 0 },
    { daysFromNow: 3, hour: 11, minute: 30 },
    { daysFromNow: 3, hour: 15, minute: 0 },
    { daysFromNow: 3, hour: 17, minute: 0 },

    // Day 4 to Day 7
    { daysFromNow: 4, hour: 9, minute: 0 },
    { daysFromNow: 4, hour: 14, minute: 0 },
    { daysFromNow: 5, hour: 10, minute: 30 },
    { daysFromNow: 5, hour: 15, minute: 30 },
    { daysFromNow: 6, hour: 11, minute: 0 },
    { daysFromNow: 6, hour: 16, minute: 0 },
    { daysFromNow: 7, hour: 9, minute: 30 },
    { daysFromNow: 7, hour: 14, minute: 0 },
  ];

  const createdScheduleIds: string[] = [];
  for (const def of slotDefinitions) {
    const slot = scheduleSlot(def.daysFromNow, def.hour, def.minute);
    const id = uuid7();
    await prisma.schedule.create({
      data: {
        id,
        startDateTime: slot.start,
        endDateTime: slot.end,
      },
    });
    createdScheduleIds.push(id);
  }

  // Assign schedules to ALL 24 doctors
  // Each doctor gets 4-6 schedule slots (a couple past/booked, and several upcoming open slots!)
  let slotIdx = 0;
  for (let docIdx = 0; docIdx < doctorRecords.length; docIdx++) {
    const doc = doctorRecords[docIdx];
    // Give each doctor 4 distinct slots
    for (let s = 0; s < 4; s++) {
      const scheduleId = createdScheduleIds[(slotIdx + s) % createdScheduleIds.length];
      const isPastOrBooked = (s === 0 && docIdx < 6); // First slot booked for first 6 doctors

      await prisma.doctorSchedules.upsert({
        where: {
          doctorId_scheduleId: {
            doctorId: doc.doctorId,
            scheduleId: scheduleId,
          },
        },
        update: {
          isBooked: isPastOrBooked,
        },
        create: {
          doctorId: doc.doctorId,
          scheduleId: scheduleId,
          isBooked: isPastOrBooked,
        },
      });
    }
    slotIdx = (slotIdx + 3) % createdScheduleIds.length;
  }
  console.log(`  ✓ Created ${createdScheduleIds.length} time slots and distributed across all ${doctorRecords.length} doctors\n`);

  // ════════════════════════════════════════════
  // 5. Appointments (Comprehensive realistic history)
  // ════════════════════════════════════════════
  console.log("5. Creating Appointments (Completed, In-Progress, and Scheduled)...");

  // Create appointments for the booked slots
  const mockAppointments = [
    {
      docIdx: 0, // Dr. Sarah Ahmed (Cardiology)
      patIdx: 0, // Rahim Uddin
      scheduleId: createdScheduleIds[0],
      status: "COMPLETED" as const,
      paymentStatus: "PAID" as const,
      fee: 800,
      prescription: "Tab. Concor 2.5mg (1+0+0) for 1 month. Tab. Lipitor 10mg (0+0+1) at night. Maintain strict low-sodium diet and daily 30-min brisk walk. Follow-up with lipid profile in 4 weeks.",
      review: { rating: 5.0, comment: "Dr. Sarah Ahmed is an exceptional cardiologist! She carefully explained my ECG and blood pressure readings. The prescribed medication stabilized my heart rate within days." },
    },
    {
      docIdx: 1, // Dr. James Wilson (Dermatology)
      patIdx: 1, // Ayesha Begum
      scheduleId: createdScheduleIds[1],
      status: "COMPLETED" as const,
      paymentStatus: "PAID" as const,
      fee: 500,
      prescription: "Topical Tacrolimus 0.1% ointment twice daily for 2 weeks. Mild moisturizer every 4 hours. Avoid hot water baths. Return for skin check in 3 weeks.",
      review: { rating: 4.8, comment: "Very polite and attentive doctor. My skin irritation cleared up significantly after following Dr. Wilson's routine." },
    },
    {
      docIdx: 2, // Dr. Fatima Khan (Neurology)
      patIdx: 2, // Karim Hossain
      scheduleId: createdScheduleIds[2],
      status: "COMPLETED" as const,
      paymentStatus: "PAID" as const,
      fee: 1000,
      prescription: "Tab. Amitriptyline 10mg at bedtime for tension headache prophylaxis. Keep a headache diary. Adequate hydration (3L/day). Follow-up in 1 month.",
      review: { rating: 5.0, comment: "Top-tier neurologist in Dhaka. Her diagnosis of my chronic headaches was 100% accurate. Life-changing advice." },
    },
    {
      docIdx: 3, // Dr. Robert Fox (Orthopedics)
      patIdx: 3, // Tanima Roy
      scheduleId: createdScheduleIds[3],
      status: "COMPLETED" as const,
      paymentStatus: "PAID" as const,
      fee: 900,
      prescription: "Calcium + Vit D3 daily after meals. Physiotherapy knee strengthening exercises 2x daily. Avoid kneeling or cross-legged sitting for 4 weeks.",
      review: { rating: 4.7, comment: "Dr. Robert Fox gave me confidence about my knee pain. Great demeanor and practical exercise suggestions." },
    },
    {
      docIdx: 4, // Dr. Ayesha Siddiqua (Pediatrics)
      patIdx: 0, // Rahim Uddin (for child)
      scheduleId: createdScheduleIds[4],
      status: "COMPLETED" as const,
      paymentStatus: "PAID" as const,
      fee: 600,
      prescription: "Syrup Paracetamol 120mg/5ml as needed for fever above 100°F. Saline nasal drops 2 drops in each nostril before sleep. Keep well hydrated with oral rehydration solution.",
      review: { rating: 4.9, comment: "Wonderful pediatrician! So gentle and patient with children. My son was very comfortable with her." },
    },
    {
      docIdx: 5, // Dr. Tanvir Rahman (General Medicine)
      patIdx: 4, // Faruq Ahmed
      scheduleId: createdScheduleIds[5],
      status: "INPROGRESS" as const,
      paymentStatus: "PAID" as const,
      fee: 1200,
    },
    {
      docIdx: 0, // Dr. Sarah Ahmed (Cardiology)
      patIdx: 4, // Faruq Ahmed
      scheduleId: createdScheduleIds[7], // Today slot
      status: "SCHEDULED" as const,
      paymentStatus: "PAID" as const,
      fee: 800,
    },
    {
      docIdx: 6, // Dr. Nusrat Jahan (Gynecology)
      patIdx: 1, // Ayesha Begum
      scheduleId: createdScheduleIds[8], // Today slot
      status: "SCHEDULED" as const,
      paymentStatus: "PAID" as const,
      fee: 750,
    },
  ];

  for (const appt of mockAppointments) {
    const doc = doctorRecords[appt.docIdx];
    const pat = patientRecords[appt.patIdx];
    const appointmentId = uuid7();

    const createdAppt = await prisma.appointment.create({
      data: {
        id: appointmentId,
        videoCallingId: uuidV4(),
        status: appt.status,
        paymentStatus: appt.paymentStatus,
        patientId: pat.patientId,
        doctorId: doc.doctorId,
        scheduleId: appt.scheduleId,
      },
    });

    // Payment record
    await prisma.payment.create({
      data: {
        id: uuid7(),
        amount: appt.fee,
        transactionId: uuidV4(),
        status: appt.paymentStatus,
        appointmentId: createdAppt.id,
        paymentGatewayData: { gateway: "Stripe", currency: "BDT", verified: true },
      },
    });

    // Prescription if completed
    if (appt.prescription) {
      await prisma.prescription.create({
        data: {
          id: uuid7(),
          followUpDate: futureDate(21),
          instructions: appt.prescription,
          appointmentId: createdAppt.id,
          patientId: pat.patientId,
          doctorId: doc.doctorId,
        },
      });
    }

    // Review if completed
    if (appt.review) {
      await prisma.review.create({
        data: {
          id: uuid7(),
          rating: appt.review.rating,
          comment: appt.review.comment,
          appointmentId: createdAppt.id,
          patientId: pat.patientId,
          doctorId: doc.doctorId,
        },
      });

      // Recalculate doctor rating
      const reviews = await prisma.review.findMany({ where: { doctorId: doc.doctorId } });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.doctor.update({
        where: { id: doc.doctorId },
        data: { averageRating: Math.round(avg * 10) / 10 },
      });
    }
  }
  console.log(`  ✓ Created ${mockAppointments.length} appointments with payments, prescriptions & reviews\n`);

  // ════════════════════════════════════════════
  // 6. Medical Reports for Patients
  // ════════════════════════════════════════════
  console.log("6. Creating Patient Medical Reports...");
  const sampleReports = [
    { patientIdx: 0, name: "Comprehensive Lipid Profile Report - Oct 2026", link: "https://example.com/reports/lipid-oct-2026.pdf" },
    { patientIdx: 0, name: "12-Lead Resting Electrocardiogram (ECG)", link: "https://example.com/reports/ecg-oct-2026.pdf" },
    { patientIdx: 1, name: "HbA1c & Fasting Plasma Glucose Analysis", link: "https://example.com/reports/hba1c-oct-2026.pdf" },
    { patientIdx: 2, name: "Brain MRI Scan with Contrast T1/T2", link: "https://example.com/reports/mri-brain-2026.pdf" },
    { patientIdx: 3, name: "Digital X-Ray Right Knee (AP & Lateral)", link: "https://example.com/reports/xray-knee-2026.pdf" },
    { patientIdx: 4, name: "Complete Blood Count (CBC) & ESR", link: "https://example.com/reports/cbc-esr-2026.pdf" },
  ];

  for (const rep of sampleReports) {
    const pat = patientRecords[rep.patientIdx];
    await prisma.medicalReport.create({
      data: {
        id: uuid7(),
        reportName: rep.name,
        reportLink: rep.link,
        patientId: pat.patientId,
      },
    });
  }
  console.log(`  ✓ ${sampleReports.length} medical reports linked to patients\n`);

  // ════════════════════════════════════════════
  // Summary
  // ════════════════════════════════════════════
  console.log("══════════════════════════════════════════════════════════════");
  console.log("🎉 SMART CARE DATABASE SEED COMPLETE!");
  console.log("══════════════════════════════════════════════════════════════");
  console.log("\n📊 Summary of Seeded Data:");
  console.log(`  🩺 12 Doctors across 10 Specialties with high-res portrait photos`);
  console.log(`  🧑 5 Patients with complete health profiles`);
  console.log(`  📅 40+ Schedules (past & future slots open for live demo booking)`);
  console.log(`  💳 Live Appointments, Prescriptions, Stripe Payments, & Reviews`);
  console.log("\n🔑 Login Credentials (all passwords: password123):\n");
  console.log("  👑 Super Admin:  superadmin@smartcare.com (Password: SuperAdmin123!)");
  console.log("  🩺 Doctor 1:     doctor1@smartcare.com  (Dr. Sarah Ahmed - Cardiology)");
  console.log("  🩺 Doctor 2:     doctor2@smartcare.com  (Dr. James Wilson - Dermatology)");
  console.log("  🩺 Doctor 3:     doctor3@smartcare.com  (Dr. Fatima Khan - Neurology)");
  console.log("  🩺 Doctor 4:     doctor4@smartcare.com  (Dr. Robert Fox - Orthopedics)");
  console.log("  🩺 Doctor 5:     doctor5@smartcare.com  (Dr. Ayesha Siddiqua - Pediatrics)");
  console.log("  🩺 Doctor 6:     doctor6@smartcare.com  (Dr. Tanvir Rahman - General Medicine)");
  console.log("  🧑 Patient 1:    patient1@smartcare.com (Rahim Uddin)");
  console.log("  🧑 Patient 2:    patient2@smartcare.com (Ayesha Begum)");
  console.log("  🧑 Patient 3:    patient3@smartcare.com (Karim Hossain)");
  console.log("══════════════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
