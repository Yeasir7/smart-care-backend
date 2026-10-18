import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { RagController } from "./rag.controller";
import { RagValidation } from "./rag.validation";

const router = Router();

router.post("/query", validateRequest(RagValidation.querySchema), RagController.queryRag);
router.post("/ingest-doctors", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), RagController.ingestDoctors);

export const RagRoutes = router;
