import StaffDashboard from "@/components/StaffDashboard";

export default function StaffPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-agnos-dark rounded-md flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-xl font-bold text-agnos-dark">Staff Portal</h1>
        </div>
      </header>
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pb-10">
        <StaffDashboard />
      </main>
    </div>
  );
}
