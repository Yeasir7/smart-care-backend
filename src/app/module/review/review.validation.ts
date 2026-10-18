import { z } from "zod";

const createReviewSchema = z.object({
  appointmentId: z.string({ message: "Appointment ID is required" }),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const ReviewValidation = {
  createReviewSchema,
};
