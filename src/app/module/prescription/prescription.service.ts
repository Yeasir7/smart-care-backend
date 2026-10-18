import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";

const createPrescription = async (user: IRequestUser, payload: any) => {
    const appointmentData = await prisma.appointment.findUnique({
        where: { id: payload.appointmentId },
        include: { doctor: true, patient: true }
    });

    if (!appointmentData) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    if (user.email !== appointmentData.doctor.email) {
        throw new AppError(status.BAD_REQUEST, "This is not your appointment");
    }

    if (appointmentData.status !== AppointmentStatus.INPROGRESS && appointmentData.status !== AppointmentStatus.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "Appointment must be INPROGRESS or COMPLETED");
    }

    const existingPrescription = await prisma.prescription.findUnique({
        where: { appointmentId: payload.appointmentId }
    });

    if (existingPrescription) {
        throw new AppError(status.BAD_REQUEST, "Prescription already exists for this appointment");
    }

    const result = await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions,
            followUpDate: new Date(payload.followUpDate)
        },
        include: { doctor: true, patient: true, appointment: true }
    });

    return result;
};

const getMyPrescriptions = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    return await prisma.prescription.findMany({
        where: { patientId: patientData.id },
        include: { doctor: true, appointment: true }
    });
};

const getDoctorPrescriptions = async (user: IRequestUser) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: { email: user.email }
    });

    return await prisma.prescription.findMany({
        where: { doctorId: doctorData.id },
        include: { patient: true, appointment: true }
    });
};

const getAllPrescriptions = async () => {
    return await prisma.prescription.findMany({
        include: { doctor: true, patient: true, appointment: true }
    });
};

const getPrescriptionById = async (id: string) => {
    const result = await prisma.prescription.findUnique({
        where: { id },
        include: { doctor: true, patient: true, appointment: true }
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "Prescription not found");
    }
    return result;
};

export const PrescriptionService = {
    createPrescription,
    getMyPrescriptions,
    getDoctorPrescriptions,
    getAllPrescriptions,
    getPrescriptionById
};
