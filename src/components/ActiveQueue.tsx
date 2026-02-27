import { User } from "lucide-react";

export default function ActiveQueue() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Active Queue</h2>
        <button className="text-blue-600 text-xs font-bold hover:text-blue-800">View All</button>
      </div>

      {/* Active Item */}
      <div className="bg-white p-4 rounded-xl border-l-4 border-l-blue-500 shadow-md ring-1 ring-black/5 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">Patient #9...</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-1 rounded border border-gray-200">ID: AG-482</span>
              </div>
              <p className="text-xs text-blue-500 font-medium mt-0.5 animate-pulse">Currently Typing...</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium">2m ago</span>
        </div>
      </div>

      {/* Inactive Item */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 hover:border-gray-300 cursor-pointer transition-all opacity-60 hover:opacity-100">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Patient #9...</span>
                <span className="text-[10px] text-gray-400 bg-gray-50 px-1 rounded border border-gray-100">ID: AG-481</span>
              </div>
              <p className="text-xs text-green-600 font-medium mt-0.5">Idle - Completed Form</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium">12m ago</span>
        </div>
      </div>

      {/* Queue Summary */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm italic">
        Remaining in queue (5)
      </div>
    </div>
  );
}
