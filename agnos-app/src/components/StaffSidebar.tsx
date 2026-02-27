import Link from "next/link";
import { LayoutDashboard, Users, Settings } from "lucide-react";

export default function StaffSidebar() {
  return (
    <aside className="w-full lg:w-64 bg-agnos-dark text-white flex flex-col lg:h-screen lg:fixed left-0 top-0 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold">Agnos Staff</h1>
        <p className="text-xs text-gray-400 tracking-wider mt-1 uppercase">Real-time Monitoring</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 lg:py-6 px-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-white/5 hover:text-white transition-colors border-l-4 border-transparent"
        >
          <span className="font-medium">Back to Home</span>
        </Link>
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 border-l-4 border-blue-500 transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Monitor</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white transition-colors border-l-4 border-transparent">
          <Users className="w-5 h-5" />
          <span className="font-medium">Patients</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white transition-colors border-l-4 border-transparent">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </a>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 bg-black/20 hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            KH
          </div>
          <div>
            <p className="text-sm font-bold text-white">Dr. Khochapak</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
