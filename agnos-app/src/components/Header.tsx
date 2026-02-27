import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-agnos-blue rounded-lg flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
            A
          </div>
          {/* Logo Text */}
          <span className="text-agnos-dark font-bold text-xl sm:text-2xl tracking-tight">AGNOS</span>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
          <Link
            href="/"
            aria-label="Back to Home"
            className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold tracking-wider uppercase text-agnos-blue border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          {/* Saving Indicator */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline text-xs font-semibold text-agnos-gray tracking-widest uppercase">Saving...</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="h-1 w-full bg-gray-100">
        <div className="h-full w-1/3 bg-agnos-blue"></div>
      </div>
    </header>
  );
}
