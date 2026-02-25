import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().refine((val) => {
    // Basic date format validation (YYYY-MM-DD)
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, "Invalid date format (YYYY-MM-DD)"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  preferredLanguage: z.string().optional(),
  nationality: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
  }).optional(),
  religion: z.string().optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
