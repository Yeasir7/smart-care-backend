import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getAllPatients = async (query: any) => {
    return await prisma.patient.findMany({
        include: { user: true }
    });
};

const getPatientById = async (id: string) => {
    const patient = await prisma.patient.findUnique({
        where: { id },
        include: { user: true, patientHealthData: true, appointments: true }
    });
    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient not found");
    }
    return patient;
};

const getMyProfile = async (user: IRequestUser) => {
    const patient = await prisma.patient.findUnique({
        where: { email: user.email },
        include: { user: true, patientHealthData: true }
    });
    if (!patient) {
        throw new AppError(status.NOT_FOUND, "Patient profile not found");
    }
    return patient;
};

const updateMyProfile = async (user: IRequestUser, data: any) => {
    const patient = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    const result = await prisma.$transaction(async (tx) => {
        const updatedPatient = await tx.patient.update({
            where: { id: patient.id },
            data: {
                contactNumber: data.contactNumber !== undefined ? data.contactNumber : patient.contactNumber,
                address: data.address !== undefined ? data.address : patient.address
            }
        });

        if (data.name) {
            await tx.user.update({
                where: { email: user.email },
                data: { name: data.name }
            });
        }

        return updatedPatient;
    });

    return result;
};

export const PatientService = {
    getAllPatients,
    getPatientById,
    getMyProfile,
    updateMyProfile
};
