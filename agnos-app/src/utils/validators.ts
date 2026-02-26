import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z.string().refine((val) => {
    // Basic date format validation (YYYY-MM-DD)
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, "Invalid date format (YYYY-MM-DD)"),
  gender: z.string().trim().min(1, "Gender is required"),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{10,20}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email address"),
  address: z.string().trim().min(1, "Address is required"),
  preferredLanguage: z.string().trim().min(1, "Preferred language is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  emergencyContact: z.object({
    name: z.string().trim().min(1, "Emergency contact name is required"),
    relationship: z.string().trim().min(1, "Emergency contact relationship is required"),
  }).optional(),
  religion: z.string().trim().optional(),
});

export type PatientSchema = z.infer<typeof patientSchema>;
