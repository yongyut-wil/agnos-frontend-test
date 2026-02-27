import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-agnos-blue rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            A
          </div>
          {/* Logo Text */}
          <span className="text-agnos-dark font-bold text-2xl tracking-tight">AGNOS</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold tracking-wider uppercase text-agnos-blue border border-blue-100 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Back to Home
          </Link>

          {/* Saving Indicator */}
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-agnos-gray tracking-widest uppercase">Saving...</span>
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
