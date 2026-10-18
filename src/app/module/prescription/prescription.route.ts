import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { PrescriptionController } from "./prescription.controller";
import { PrescriptionValidation } from "./prescription.validation";

const router = Router();

router.post("/", checkAuth(Role.DOCTOR), validateRequest(PrescriptionValidation.createPrescriptionSchema), PrescriptionController.createPrescription);
router.get("/my-prescriptions", checkAuth(Role.PATIENT), PrescriptionController.getMyPrescriptions);
router.get("/doctor-prescriptions", checkAuth(Role.DOCTOR), PrescriptionController.getDoctorPrescriptions);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PrescriptionController.getAllPrescriptions);
router.get("/:id", checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN), PrescriptionController.getPrescriptionById);

export const PrescriptionRoutes = router;
