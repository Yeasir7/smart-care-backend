import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReviewService.createReview(user, req.body);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Review created successfully',
        data: result
    });
});

const getDoctorReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getDoctorReviews(req.params.doctorId as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Reviews retrieved successfully',
        data: result
    });
});

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ReviewService.getMyReviews(user);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Reviews retrieved successfully',
        data: result
    });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.getAllReviews();
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Reviews retrieved successfully',
        data: result
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewService.deleteReview(req.params.id as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Review deleted successfully',
        data: result
    });
});

export const ReviewController = {
    createReview,
    getDoctorReviews,
    getMyReviews,
    getAllReviews,
    deleteReview
};
