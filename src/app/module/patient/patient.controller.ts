import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PatientService } from "./patient.service";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.getAllPatients(req.query);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Patients retrieved successfully',
        data: result
    });
});

const getPatientById = catchAsync(async (req: Request, res: Response) => {
    const result = await PatientService.getPatientById(req.params.id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Patient retrieved successfully',
        data: result
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PatientService.getMyProfile(user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Patient profile retrieved successfully',
        data: result
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await PatientService.updateMyProfile(user, req.body);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Patient profile updated successfully',
        data: result
    });
});

export const PatientController = {
    getAllPatients,
    getPatientById,
    getMyProfile,
    updateMyProfile
};
