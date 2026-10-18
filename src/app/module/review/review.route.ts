import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post("/", checkAuth(Role.PATIENT), validateRequest(ReviewValidation.createReviewSchema), ReviewController.createReview);
router.get("/my-reviews", checkAuth(Role.PATIENT), ReviewController.getMyReviews);
router.get("/doctor/:doctorId", ReviewController.getDoctorReviews);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getAllReviews);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.deleteReview);

export const ReviewRoutes = router;
