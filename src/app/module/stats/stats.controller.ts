import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StatsService } from "./stats.service";

const getStats = catchAsync(async (req: Request, res: Response) => {
    const result = await StatsService.getStats();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: result,
    });
});

export const StatsController = {
    getStats,
};
