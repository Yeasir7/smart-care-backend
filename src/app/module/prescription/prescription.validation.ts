import { z } from "zod";

const createPrescriptionSchema = z.object({
  appointmentId: z.string({ message: "Appointment ID is required" }),
  instructions: z.string({ message: "Instructions are required" }),
  followUpDate: z.string().optional(),
});

export const PrescriptionValidation = {
  createPrescriptionSchema,
};
