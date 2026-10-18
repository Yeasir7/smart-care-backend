import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RagService } from "./rag.service";

const ingestDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await RagService.ingestDoctors();
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Doctors ingested successfully',
        data: result
    });
});

const queryRag = catchAsync(async (req: Request, res: Response) => {
    const { query, limit } = req.body;
    const result = await RagService.queryRag(query, limit);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Query processed successfully',
        data: result
    });
});

export const RagController = {
    ingestDoctors,
    queryRag
};
