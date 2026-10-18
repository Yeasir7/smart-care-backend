import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PatientController } from "./patient.controller";
import { PatientValidation } from "./patient.validation";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PatientController.getAllPatients);
router.get("/me", checkAuth(Role.PATIENT), PatientController.getMyProfile);
router.patch("/me", checkAuth(Role.PATIENT), validateRequest(PatientValidation.updateProfileSchema), PatientController.updateMyProfile);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR), PatientController.getPatientById);

export const PatientRoutes = router;
