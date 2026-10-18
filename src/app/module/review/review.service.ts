import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const createReview = async (user: IRequestUser, payload: any) => {
    const appointmentData = await prisma.appointment.findUnique({
        where: { id: payload.appointmentId },
        include: { doctor: true, patient: true }
    });

    if (!appointmentData) {
        throw new AppError(status.NOT_FOUND, "Appointment not found");
    }

    if (user.email !== appointmentData.patient.email) {
        throw new AppError(status.BAD_REQUEST, "This is not your appointment");
    }

    if (appointmentData.status !== AppointmentStatus.COMPLETED) {
        throw new AppError(status.BAD_REQUEST, "Appointment must be COMPLETED");
    }

    const existingReview = await prisma.review.findUnique({
        where: { appointmentId: payload.appointmentId }
    });

    if (existingReview) {
        throw new AppError(status.BAD_REQUEST, "Review already exists for this appointment");
    }

    const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                appointmentId: appointmentData.id,
                doctorId: appointmentData.doctorId,
                patientId: appointmentData.patientId,
                rating: payload.rating,
                comment: payload.comment
            },
            include: { doctor: true, patient: true, appointment: true }
        });

        // Update doctor average rating (optional but good idea if model supports it)
        const allReviews = await tx.review.findMany({
            where: { doctorId: appointmentData.doctorId }
        });

        if (allReviews.length > 0) {
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            await tx.doctor.update({
                where: { id: appointmentData.doctorId },
                data: { averageRating: avgRating }
            });
        }

        return review;
    });

    return result;
};

const getDoctorReviews = async (doctorId: string) => {
    return await prisma.review.findMany({
        where: { doctorId },
        include: { patient: true }
    });
};

const getMyReviews = async (user: IRequestUser) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: { email: user.email }
    });

    return await prisma.review.findMany({
        where: { patientId: patientData.id },
        include: { doctor: true, appointment: true }
    });
};

const getAllReviews = async () => {
    return await prisma.review.findMany({
        include: { doctor: true, patient: true, appointment: true }
    });
};

const deleteReview = async (id: string) => {
    const reviewData = await prisma.review.findUnique({ where: { id } });
    if (!reviewData) {
        throw new AppError(status.NOT_FOUND, "Review not found");
    }

    const result = await prisma.$transaction(async (tx) => {
        const deleted = await tx.review.delete({
            where: { id }
        });

        const allReviews = await tx.review.findMany({
            where: { doctorId: reviewData.doctorId }
        });

        const avgRating = allReviews.length > 0 
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0.0;
            
        await tx.doctor.update({
            where: { id: reviewData.doctorId },
            data: { averageRating: avgRating }
        });

        return deleted;
    });

    return result;
};

export const ReviewService = {
    createReview,
    getDoctorReviews,
    getMyReviews,
    getAllReviews,
    deleteReview
};
