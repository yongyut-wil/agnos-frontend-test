"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Patient } from "@/types/patient";
import { patientSchema } from "@/utils/validators";
import { ZodIssue } from "zod";

type FormStatus = "idle" | "typing" | "submitted";

type FormDataState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  religion: string;
};

const initialFormData: FormDataState = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  religion: "",
};

const DOB_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatDateForDisplay = (value: string) => {
  if (!value) return "Select date of birth";

  const parsed = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function PatientForm() {
  const socket = useSocket();

  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [activityTick, setActivityTick] = useState(0);
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isDobCalendarOpen, setIsDobCalendarOpen] = useState(false);
  const [dobViewDate, setDobViewDate] = useState(() => new Date());
  const dobCalendarRef = useRef<HTMLDivElement | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const buildPayload = useCallback((): Partial<Patient> => {
    const hasEmergencyInput =
      formData.emergencyContactName.trim().length > 0 ||
      formData.emergencyContactRelationship.trim().length > 0;

    return {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      preferredLanguage: formData.preferredLanguage.trim(),
      nationality: formData.nationality.trim(),
      emergencyContact: hasEmergencyInput
        ? {
            name: formData.emergencyContactName.trim(),
            relationship: formData.emergencyContactRelationship.trim(),
          }
        : undefined,
      religion: formData.religion.trim() || undefined,
    };
  }, [formData]);

  const mapValidationErrors = (issues: ZodIssue[]) => {
    const fieldErrors: Record<string, string> = {};

    issues.forEach((err) => {
      const path = err.path.map((segment) => String(segment)).join(".");

      if (path === "emergencyContact.name") {
        fieldErrors.emergencyContactName = err.message;
      } else if (path === "emergencyContact.relationship") {
        fieldErrors.emergencyContactRelationship = err.message;
      } else if (path) {
        fieldErrors[path] = err.message;
      }
    });

    return fieldErrors;
  };

  const shouldShowError = (field: string) => {
    if (field === "dateOfBirth" && isDobCalendarOpen) {
      return false;
    }

    return Boolean(errors[field]) && (hasSubmittedAttempt || touchedFields[field]);
  };

  useEffect(() => {
    if (!isDobCalendarOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (dobCalendarRef.current && !dobCalendarRef.current.contains(event.target as Node)) {
        setIsDobCalendarOpen(false);
        setTouchedFields((prev) => ({ ...prev, dateOfBirth: true }));
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDobCalendarOpen]);

  useEffect(() => {
    if (!socket || activityTick === 0) return;

    const timeoutId = setTimeout(() => {
      const payload = buildPayload();
      const result = patientSchema.safeParse(payload);

      if (!result.success) {
        setErrors(mapValidationErrors(result.error.issues));
      } else {
        setErrors({});
      }

      socket.emit("patient:update", payload);
      socket.emit("patient:status", { status: "typing" });
      setFormStatus((prev) => (prev === "submitted" ? prev : "typing"));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [buildPayload, socket, activityTick]);

  useEffect(() => {
    if (!socket || formStatus === "submitted") return;

    const timeoutId = setTimeout(() => {
      setFormStatus("idle");
      socket.emit("patient:status", { status: "idle" });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [activityTick, socket, formStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setActivityTick((prev) => prev + 1);
    if (formStatus === "submitted") {
      setFormStatus("typing");
    }
    setSubmitMessage("");
  };

  const handleDateOfBirthSelect = (selectedDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) return;

    const selectedValue = toISODate(selectedDate);

    setFormData((prev) => ({ ...prev, dateOfBirth: selectedValue }));
    setTouchedFields((prev) => ({ ...prev, dateOfBirth: true }));
    setErrors((prev) => {
      const { dateOfBirth, ...rest } = prev;
      return dateOfBirth ? rest : prev;
    });
    setActivityTick((prev) => prev + 1);

    if (formStatus === "submitted") {
      setFormStatus("typing");
    }

    setSubmitMessage("");
    setIsDobCalendarOpen(false);
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
    setTouchedFields((prev) => ({ ...prev, gender: true }));
    setErrors((prev) => {
      const { gender, ...rest } = prev;
      return gender ? rest : prev;
    });
    setActivityTick((prev) => prev + 1);
    if (formStatus === "submitted") {
      setFormStatus("typing");
    }
    setSubmitMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmittedAttempt(true);

    const payload = buildPayload();
    const result = patientSchema.safeParse(payload);

    if (!result.success) {
      setErrors(mapValidationErrors(result.error.issues));
      setSubmitMessage("Please fix validation errors before submitting.");
      return;
    }

    setErrors({});
    setHasSubmittedAttempt(false);
    setFormStatus("submitted");
    setSubmitMessage("Form submitted successfully.");

    if (socket) {
      socket.emit("patient:update", payload);
      socket.emit("patient:submit", payload);
      socket.emit("patient:status", { status: "submitted" });
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-agnos-dark mb-3">Patient Intake Form</h1>
        <p className="text-agnos-gray text-lg">
          Please complete the form below. Your information is synced with staff in real-time.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-agnos-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-agnos-gray">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              formStatus === "submitted"
                ? "bg-green-500"
                : formStatus === "typing"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-gray-400"
            }`}
          />
          {formStatus === "submitted" ? "Submitted" : formStatus === "typing" ? "Filling form" : "Idle"}
        </div>
      </section>

      <form
        id="intake-form"
        onSubmit={handleSubmit}
        onBlurCapture={(e) => {
          const fieldName = (e.target as unknown as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).name;

          if (fieldName) {
            setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
          }
        }}
        className="space-y-8 [&_input]:text-agnos-dark [&_input]:caret-agnos-dark [&_textarea]:text-agnos-dark [&_textarea]:caret-agnos-dark"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="firstName" className="font-bold text-agnos-dark">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="e.g. Somchai"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("firstName") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("firstName") && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="middleName" className="font-bold text-agnos-dark">
              Middle Name (Optional)
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              placeholder="e.g. Chai"
              className="w-full p-4 border border-agnos-border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="lastName" className="font-bold text-agnos-dark">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="e.g. Suksawat"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("lastName") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("lastName") && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="dateOfBirth" className="font-bold text-agnos-dark">
              Date of Birth *
            </label>
            <div className="relative" ref={dobCalendarRef}>
              <button
                type="button"
                onClick={() => {
                  if (isDobCalendarOpen) {
                    setIsDobCalendarOpen(false);
                    setTouchedFields((prev) => ({ ...prev, dateOfBirth: true }));
                    return;
                  }

                  const selectedDate = formData.dateOfBirth ? new Date(`${formData.dateOfBirth}T00:00:00`) : new Date();
                  if (!Number.isNaN(selectedDate.getTime())) {
                    setDobViewDate(selectedDate);
                  }
                  setIsDobCalendarOpen(true);
                }}
                id="dateOfBirth"
                className={`w-full h-14 px-4 border rounded-xl outline-none bg-white shadow-sm text-left transition-colors focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue ${
                  shouldShowError("dateOfBirth") ? "border-red-500 bg-red-50/30" : "border-agnos-border hover:border-agnos-blue/40"
                } ${formData.dateOfBirth ? "text-agnos-dark" : "text-agnos-gray"}`}
                aria-haspopup="dialog"
                aria-expanded={isDobCalendarOpen}
              >
                <span>{formatDateForDisplay(formData.dateOfBirth)}</span>
              </button>

              {isDobCalendarOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-agnos-border bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDobViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="rounded-lg border border-agnos-border px-2 py-1 text-sm text-agnos-dark hover:bg-gray-50"
                      aria-label="Previous month"
                    >
                      ←
                    </button>
                    <p className="text-sm font-semibold text-agnos-dark">
                      {dobViewDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDobViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="rounded-lg border border-agnos-border px-2 py-1 text-sm text-agnos-dark hover:bg-gray-50"
                      aria-label="Next month"
                    >
                      →
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-agnos-gray">
                    {DOB_WEEKDAYS.map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({
                      length: new Date(dobViewDate.getFullYear(), dobViewDate.getMonth(), 1).getDay(),
                    }).map((_, index) => (
                      <span key={`blank-${index}`} className="h-9" />
                    ))}

                    {Array.from({ length: new Date(dobViewDate.getFullYear(), dobViewDate.getMonth() + 1, 0).getDate() }).map(
                      (_, index) => {
                        const day = index + 1;
                        const date = new Date(dobViewDate.getFullYear(), dobViewDate.getMonth(), day);
                        const isoDate = toISODate(date);
                        const isSelected = formData.dateOfBirth === isoDate;
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isFuture = date > today;

                        return (
                          <button
                            key={isoDate}
                            type="button"
                            onClick={() => handleDateOfBirthSelect(date)}
                            disabled={isFuture}
                            className={`h-9 rounded-lg text-sm transition-colors ${
                              isSelected
                                ? "bg-agnos-blue text-white"
                                : isFuture
                                  ? "cursor-not-allowed text-gray-300"
                                  : "text-agnos-dark hover:bg-blue-50"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
            {shouldShowError("dateOfBirth") && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-bold text-agnos-dark">Gender *</label>
            <div className="flex flex-wrap gap-3">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleGenderSelect(option)}
                  className={`min-w-27.5 py-3 px-4 border rounded-lg text-center font-medium transition-all duration-200 hover:bg-gray-50 ${
                    formData.gender === option
                      ? "border-agnos-blue ring-1 ring-agnos-blue text-agnos-blue"
                      : "border-agnos-border text-agnos-dark"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {shouldShowError("gender") && <p className="text-red-500 text-sm">{errors.gender}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="font-bold text-agnos-dark">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +66 8X XXX XXXX"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("phone") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("phone") && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-bold text-agnos-dark">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. somchai@email.com"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("email") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("email") && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="address" className="font-bold text-agnos-dark">
              Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="House no., street, district, province, postal code"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("address") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("address") && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="preferredLanguage" className="font-bold text-agnos-dark">
              Preferred Language *
            </label>
            <input
              type="text"
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              placeholder="e.g. Thai"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("preferredLanguage") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("preferredLanguage") && <p className="text-red-500 text-sm">{errors.preferredLanguage}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="nationality" className="font-bold text-agnos-dark">
              Nationality *
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="e.g. Thai"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("nationality") ? "border-red-500" : "border-agnos-border"}`}
              required
            />
            {shouldShowError("nationality") && <p className="text-red-500 text-sm">{errors.nationality}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="emergencyContactName" className="font-bold text-agnos-dark">
              Emergency Contact Name (Optional)
            </label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleChange}
              placeholder="e.g. Suda Suksawat"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("emergencyContactName") ? "border-red-500" : "border-agnos-border"}`}
            />
            {shouldShowError("emergencyContactName") && <p className="text-red-500 text-sm">{errors.emergencyContactName}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="emergencyContactRelationship" className="font-bold text-agnos-dark">
              Emergency Contact Relationship (Optional)
            </label>
            <input
              type="text"
              id="emergencyContactRelationship"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship}
              onChange={handleChange}
              placeholder="e.g. Spouse / Parent"
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100 ${shouldShowError("emergencyContactRelationship") ? "border-red-500" : "border-agnos-border"}`}
            />
            {shouldShowError("emergencyContactRelationship") && <p className="text-red-500 text-sm">{errors.emergencyContactRelationship}</p>}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="religion" className="font-bold text-agnos-dark">
              Religion (Optional)
            </label>
            <input
              type="text"
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              placeholder="e.g. Buddhism"
              className="w-full p-4 border border-agnos-border rounded-xl focus:ring-2 focus:ring-agnos-blue focus:border-agnos-blue outline-none placeholder:text-gray-500 placeholder:opacity-100"
            />
          </div>
        </div>

        {submitMessage && (
          <p className={`text-sm font-medium ${formStatus === "submitted" ? "text-green-600" : "text-red-500"}`}>
            {submitMessage}
          </p>
        )}

        <div className="flex items-start gap-3 pt-2 text-agnos-gray">
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

        <button
          type="submit"
          className="w-full bg-agnos-blue hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 text-lg"
        >
          Submit Intake Form
        </button>
      </form>
    </div>
  );
}
