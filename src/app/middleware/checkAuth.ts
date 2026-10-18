/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
        const accessToken = CookieUtils.getCookie(req, "accessToken") || req.headers.authorization?.replace(/^Bearer\s+/i, "");

        if (!sessionToken && !accessToken) {
            throw new AppError(status.UNAUTHORIZED, "Unauthorized access! No authentication token provided.");
        }

        // 1. Try session token first if available
        if (sessionToken) {
            const sessionExists = await prisma.session.findFirst({
                where: {
                    token: sessionToken,
                    expiresAt: {
                        gt: new Date(),
                    }
                },
                include: {
                    user: true,
                }
            });

            if (sessionExists && sessionExists.user) {
                const user = sessionExists.user;

                if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is not active.");
                }

                if (user.isDeleted) {
                    throw new AppError(status.UNAUTHORIZED, "Unauthorized access! User is deleted.");
                }

                if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                    throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
                }

                req.user = {
                    userId: user.id,
                    role: user.role,
                    email: user.email,
                };

                return next();
            }
        }

        // 2. Otherwise verify JWT access token
        if (accessToken) {
            const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

            if (!verifiedToken.success || !verifiedToken.data) {
                throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
            }

            const tokenData = verifiedToken.data as any;
            const role = (tokenData.role || tokenData.userRole) as Role;

            if (authRoles.length > 0 && !authRoles.includes(role)) {
                throw new AppError(status.FORBIDDEN, "Forbidden access! You do not have permission to access this resource.");
            }

            req.user = {
                userId: tokenData.userId || tokenData.id,
                role: role,
                email: tokenData.email || "",
            };

            return next();
        }

        throw new AppError(status.UNAUTHORIZED, "Unauthorized access! Invalid or expired session.");
    } catch (error: any) {
        next(error);
    }
};