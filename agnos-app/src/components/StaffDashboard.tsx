"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { PatientData } from "@/types/patient";

export default function StaffDashboard() {
  const socket = useSocket();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:staff");

    socket.on("patient:update", (newData: PatientData) => {
      setPatientData((prevData) => {
        if (prevData) {
          const changes: Record<string, boolean> = {};
          if (newData.fullName !== prevData.fullName) changes.fullName = true;
          if (newData.dateOfBirth !== prevData.dateOfBirth) changes.dateOfBirth = true;
          if (newData.gender !== prevData.gender) changes.gender = true;

          if (Object.keys(changes).length > 0) {
            setHighlightedFields(changes);
            setTimeout(() => setHighlightedFields({}), 2000);
          }
        }
        return newData;
      });
      setLastUpdated(new Date());
    });

    return () => {
      socket.off("patient:update");
    };
  }, [socket]);

  if (!patientData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-400 font-medium text-lg border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        Waiting for patient input...
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl shadow-gray-100 rounded-2xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-agnos-dark">Live Patient Data</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Live Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-6 rounded-xl border transition-all duration-500 hover:shadow-md ${highlightedFields.fullName ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white'}`}>
          <label className="text-xs font-bold text-agnos-gray uppercase tracking-wider mb-2 block">Full Name</label>
          <p className="text-2xl font-semibold text-agnos-dark break-words">{patientData.fullName || <span className="text-gray-300 italic">Empty</span>}</p>
        </div>

        <div className={`p-6 rounded-xl border transition-all duration-500 hover:shadow-md ${highlightedFields.dateOfBirth ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white'}`}>
          <label className="text-xs font-bold text-agnos-gray uppercase tracking-wider mb-2 block">Date of Birth</label>
          <p className="text-2xl font-semibold text-agnos-dark">{patientData.dateOfBirth || <span className="text-gray-300 italic">Not set</span>}</p>
        </div>

        <div className={`p-6 rounded-xl border transition-all duration-500 hover:shadow-md ${highlightedFields.gender ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white'}`}>
          <label className="text-xs font-bold text-agnos-gray uppercase tracking-wider mb-2 block">Gender</label>
          <p className="text-2xl font-semibold text-agnos-dark capitalize">{patientData.gender || <span className="text-gray-300 italic">Not selected</span>}</p>
        </div>

         <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
          <label className="text-xs font-bold text-agnos-gray uppercase tracking-wider mb-2 block">Last Update Received</label>
          <p className="text-lg font-mono text-agnos-blue mt-1">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
