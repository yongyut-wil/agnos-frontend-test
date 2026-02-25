import StaffSidebar from "@/components/StaffSidebar";
import StaffMetrics from "@/components/StaffMetrics";
import ActiveQueue from "@/components/ActiveQueue";
import StaffDashboard from "@/components/StaffDashboard";
import { Bell } from "lucide-react";

export default function StaffPage() {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <StaffSidebar />

      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-agnos-dark">Patient Monitoring</h1>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live System Connected
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-gray-500 font-medium text-sm">Monday, Oct 23rd • 09:42 AM</span>
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Metrics Row */}
        <StaffMetrics />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Active Queue Column */}
          <div className="lg:col-span-1">
            <ActiveQueue />
          </div>

          {/* Live Session Column */}
          <div className="lg:col-span-2 h-full">
            <StaffDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
