"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Patient } from "@/types/patient";
import { Activity } from "lucide-react";

type StaffPatientStatus = "idle" | "typing" | "submitted";

type RealtimePayload = Partial<Patient> & {
  lastUpdated?: string;
};

export default function StaffDashboard() {
  const socket = useSocket();
  const [patientData, setPatientData] = useState<RealtimePayload | null>(null);
  const [patientStatus, setPatientStatus] = useState<StaffPatientStatus>("idle");
  const [activityTick, setActivityTick] = useState(0);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:staff");

    socket.on("patient:update", (newData: RealtimePayload) => {
      setPatientData(newData);
      setPatientStatus((prev) => (prev === "submitted" ? prev : "typing"));
      setActivityTick((prev) => prev + 1);
    });

    socket.on("patient:status", ({ status }: { status: StaffPatientStatus }) => {
      setPatientStatus(status);
      setActivityTick((prev) => prev + 1);
    });

    socket.on("patient:submit", (newData: RealtimePayload) => {
      setPatientData(newData);
      setPatientStatus("submitted");
      setActivityTick((prev) => prev + 1);
    });

    return () => {
      socket.off("patient:update");
      socket.off("patient:status");
      socket.off("patient:submit");
    };
  }, [socket]);

  useEffect(() => {
    if (patientStatus === "submitted") return;

    const timeoutId = setTimeout(() => {
      setPatientStatus("idle");
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [activityTick, patientStatus]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  let age: string | number = "--";
  if (patientData?.dateOfBirth) {
    const birthDate = new Date(patientData.dateOfBirth);
    const ageDifMs = currentTime.getTime() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const displayName = patientData
    ? [patientData.firstName, patientData.middleName, patientData.lastName].filter(Boolean).join(" ")
    : "...";

  const getStatusLabel = () => {
    if (patientStatus === "submitted") return "Submitted";
    if (patientStatus === "typing") return "Filling form";
    return "Idle";
  };

  const getStatusClasses = () => {
    if (patientStatus === "submitted") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (patientStatus === "typing") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const fieldRows = [
    { label: "First Name", value: patientData?.firstName },
    { label: "Middle Name", value: patientData?.middleName },
    { label: "Last Name", value: patientData?.lastName },
    { label: "Date of Birth", value: patientData?.dateOfBirth },
    { label: "Gender", value: patientData?.gender },
    { label: "Phone", value: patientData?.phone },
    { label: "Email", value: patientData?.email },
    { label: "Address", value: patientData?.address },
    { label: "Preferred Language", value: patientData?.preferredLanguage },
    { label: "Nationality", value: patientData?.nationality },
    { label: "Emergency Contact Name", value: patientData?.emergencyContact?.name },
    {
      label: "Emergency Contact Relationship",
      value: patientData?.emergencyContact?.relationship,
    },
    { label: "Religion", value: patientData?.religion },
  ];

  if (!patientData) {
    return (
       <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center min-h-125">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Waiting for connection...</h3>
        <p className="text-gray-500 max-w-xs mt-2">The live session will start automatically when a patient begins the intake process.</p>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col min-h-150">
      <div className="p-6 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Live Patient Intake</h2>
          <p className="text-sm text-gray-500 mt-1">Data updates instantly as the patient types.</p>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wide inline-flex items-center gap-2 ${getStatusClasses()}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {getStatusLabel()}
        </span>
      </div>

      <div className="p-6 md:p-8 grow space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Name</p>
            <p className="text-xl font-bold text-agnos-dark wrap-break-word">{displayName || "--"}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Age</p>
            <p className="text-xl font-bold text-agnos-dark">{age}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Updated</p>
            <p className="text-base font-semibold text-agnos-dark">
              {patientData.lastUpdated ? new Date(patientData.lastUpdated).toLocaleTimeString() : "--"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Current Form Fields</h3>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            {fieldRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] border-b border-gray-100 last:border-b-0"
              >
                <div className="px-4 py-3 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                  {row.label}
                </div>
                <div className="px-4 py-3 text-sm text-gray-800 wrap-break-word">{row.value || "--"}</div>
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] border-t border-gray-100">
              <div className="px-4 py-3 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                Submission State
              </div>
              <div className="px-4 py-3 text-sm font-semibold text-agnos-dark">{getStatusLabel()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
