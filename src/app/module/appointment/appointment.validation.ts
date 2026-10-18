import { z } from "zod";
import { AppointmentStatus } from "../../../generated/prisma/enums";

const changeStatusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus)
});

export const AppointmentValidation = {
  changeStatusSchema
};
