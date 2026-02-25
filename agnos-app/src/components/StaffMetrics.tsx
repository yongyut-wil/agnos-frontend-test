import { ArrowUpRight } from "lucide-react";

export default function StaffMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Today */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Today</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-agnos-dark">42</span>
          <span className="text-green-500 text-sm font-bold mb-1 flex items-center">
            <ArrowUpRight className="w-4 h-4" /> +12% vs avg
          </span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Active Sessions</h3>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-agnos-dark">08</span>
          <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></span>
        </div>
      </div>

      {/* Avg Wait Time */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Wait Time</h3>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold text-agnos-dark">4.2</span>
          <span className="text-gray-400 text-lg font-medium mb-1">min</span>
        </div>
      </div>

      {/* Urgent Interventions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-red-500 relative">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Urgent Interventions</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-red-500">02</span>
          <span className="text-red-500 text-xs font-bold mb-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            Action Required
          </span>
        </div>
      </div>
    </div>
  );
}
