import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/webhook", PaymentController.handleStripeWebhookEvent);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getAllPayments);
router.get("/my-payments", checkAuth(Role.PATIENT), PaymentController.getMyPayments);

export const PaymentRoutes = router;
