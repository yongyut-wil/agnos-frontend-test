"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Patient } from "@/types/patient";
import { MessageSquare, MoreHorizontal, Activity } from "lucide-react";

export default function StaffDashboard() {
  const socket = useSocket();
  // We use Partial<Patient> because the form might be incomplete during typing
  const [patientData, setPatientData] = useState<Partial<Patient> | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Use a stable 'now' timestamp to calculate age, avoiding impure Date.now() during render
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:staff");

    let typingTimeout: NodeJS.Timeout;

    socket.on("patient:update", (newData: Partial<Patient>) => {
      setPatientData(newData);
      setIsTyping(true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => setIsTyping(false), 1000);
    });

    return () => {
      socket.off("patient:update");
    };
  }, [socket]);

  let age: string | number = "--";
  if (patientData?.dateOfBirth) {
    const birthDate = new Date(patientData.dateOfBirth);
    const ageDifMs = now - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Helper to get display name
  const displayName = patientData
    ? [patientData.firstName, patientData.middleName, patientData.lastName].filter(Boolean).join(" ")
    : "...";

  if (!patientData) {
    return (
       <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm h-full flex flex-col items-center justify-center text-center min-h-[500px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Waiting for connection...</h3>
        <p className="text-gray-500 max-w-xs mt-2">The live session will start automatically when a patient begins the intake process.</p>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Live Session Data</h2>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200 uppercase tracking-wide">Connected</span>
      </div>

      <div className="p-8 flex-grow">
        {/* Patient Info Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Patient Name</span>
                <h1 className="text-3xl font-bold text-agnos-dark break-words">{displayName || "..."}</h1>
                {isTyping && <span className="text-xs text-blue-500 font-medium animate-pulse mt-1 block">User is typing...</span>}
            </div>

            <div className="md:text-center">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Age</span>
                <p className="text-3xl font-bold text-agnos-dark">{age}</p>
            </div>

            <div className="md:text-right">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Gender</span>
                <p className="text-3xl font-bold text-agnos-dark capitalize">{patientData.gender || "--"}</p>
            </div>
        </div>

        {/* Content Area (Simulating Symptoms/Notes) */}
        <div>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-4">Current Intake Data</span>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-lg leading-relaxed text-gray-700 min-h-[200px]">
                {/* Visualizing the form data as a sentence or summary */}
                {displayName || patientData.dateOfBirth || patientData.gender ? (
                    <p>
                        Patient <span className="font-bold text-gray-900">{displayName}</span>
                        {patientData.dateOfBirth && <span>, born on <span className="font-bold text-gray-900">{patientData.dateOfBirth}</span></span>}
                        {patientData.gender && <span>, identifies as <span className="font-bold text-gray-900">{patientData.gender}</span></span>}.
                        <br/><br/>
                        <span className="italic text-gray-400 text-base">Waiting for further input...</span>
                    </p>
                ) : (
                     <span className="italic text-gray-400">No data entered yet...</span>
                )}
            </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-100 flex items-center gap-4">
        <button className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-sm uppercase tracking-wider">
            Intervene
        </button>
        <button className="w-14 h-14 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <MessageSquare className="w-6 h-6" />
        </button>
        <button className="w-14 h-14 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
