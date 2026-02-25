"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Patient } from "@/types/patient";
import { patientSchema } from "@/utils/validators";

export default function PatientForm() {
  const socket = useSocket();

  // UI State
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounce emission of form data
  useEffect(() => {
    if (!socket) return;

    const timeoutId = setTimeout(() => {
      // Transform to Data Model
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ");

      const payload: Partial<Patient> = {
        firstName,
        lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      };

      // Real-time validation (checking only fields present in this step)
      // We pick relevant fields from the full schema
      const stepSchema = patientSchema.pick({
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
      });

      const result = stepSchema.safeParse(payload);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            // Map firstName/lastName errors back to fullName if needed
            if (err.path[0] === 'firstName' || err.path[0] === 'lastName') {
                 fieldErrors['fullName'] = "Full name is required (First and Last)";
            } else {
                 fieldErrors[err.path[0] as string] = err.message;
            }
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({});
      }

      socket.emit("patient:update", payload);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, socket]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header Section */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-agnos-dark mb-3">Personal Information</h1>
        <p className="text-agnos-gray text-lg">
          Please provide your details as they appear on your official identification documents.
        </p>
      </section>

      {/* Form Section */}
      <form id="intake-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Full Name Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="font-bold text-agnos-dark">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none text-lg ${errors.fullName ? 'border-red-500' : 'border-agnos-border'}`}
            required
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
        </div>

        {/* Date of Birth Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dateOfBirth" className="font-bold text-agnos-dark">
            Date of Birth
          </label>
          <div className="relative">
            <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none text-lg appearance-none bg-white ${errors.dateOfBirth ? 'border-red-500' : 'border-agnos-border'}`}
                required
            />
          </div>
          {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
        </div>

        {/* Gender Selection */}
        <div className="flex flex-col gap-3">
          <label className="font-bold text-agnos-dark">Gender</label>
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            {["Male", "Female", "Other"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleGenderSelect(option)}
                className={`flex-1 py-3 px-4 border border-agnos-border rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-50 text-lg
                  ${
                    formData.gender === option
                      ? "border-agnos-blue ring-1 ring-agnos-blue text-agnos-blue active"
                      : ""
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
        </div>

        {/* HIPAA Compliance Notice */}
        <div className="flex items-start gap-3 pt-4 text-agnos-gray">
          <div className="mt-1">
            <svg
              className="h-5 w-5 text-agnos-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
          <p className="text-sm leading-relaxed">
            Your data is encrypted and handled according to medical privacy standards (HIPAA compliant).
          </p>
        </div>
      </form>
    </div>
  );
}
