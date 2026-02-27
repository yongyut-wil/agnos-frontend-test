import StaffSidebar from "@/components/StaffSidebar";
import StaffMetrics from "@/components/StaffMetrics";
import ActiveQueue from "@/components/ActiveQueue";
import StaffDashboard from "@/components/StaffDashboard";
import { Bell } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen font-sans">
      <StaffSidebar />

      <main className="lg:ml-64 flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-2xl font-bold text-agnos-dark">Patient Monitoring</h1>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live System Connected
            </span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6">
            <span className="text-gray-500 font-medium text-sm">Live realtime patient intake stream</span>
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <StaffMetrics />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 h-auto xl:h-[calc(100vh-280px)] min-h-140">
          <div className="lg:col-span-1">
            <ActiveQueue />
          </div>

          <div className="lg:col-span-2 h-full">
            <StaffDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
