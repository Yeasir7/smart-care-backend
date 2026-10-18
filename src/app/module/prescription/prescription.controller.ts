import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.createPrescription(user, req.body);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Prescription created successfully',
        data: result
    });
});

const getMyPrescriptions = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.getMyPrescriptions(user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Prescriptions retrieved successfully',
        data: result
    });
});

const getDoctorPrescriptions = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PrescriptionService.getDoctorPrescriptions(user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Prescriptions retrieved successfully',
        data: result
    });
});

const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await PrescriptionService.getAllPrescriptions();
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Prescriptions retrieved successfully',
        data: result
    });
});

const getPrescriptionById = catchAsync(async (req: Request, res: Response) => {
    const result = await PrescriptionService.getPrescriptionById(req.params.id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Prescription retrieved successfully',
        data: result
    });
});

export const PrescriptionController = {
    createPrescription,
    getMyPrescriptions,
    getDoctorPrescriptions,
    getAllPrescriptions,
    getPrescriptionById
};
