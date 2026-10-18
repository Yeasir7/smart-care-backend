import { z } from "zod";

const updateProfileSchema = z.object({
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  name: z.string().optional()
});

export const PatientValidation = {
  updateProfileSchema,
};
