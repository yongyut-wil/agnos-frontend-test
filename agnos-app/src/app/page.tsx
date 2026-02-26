export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            Realtime Patient Intake System
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">Agnos Frontend Test</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            A responsive two-interface application: patient data entry form and staff real-time monitoring dashboard.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <a
            href="/patient"
            className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Patient Interface</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Open Patient Form</h2>
            <p className="mt-3 text-slate-600">
              Fill out personal details with live validation and websocket synchronization.
            </p>
          </a>

          <a
            href="/staff"
            className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Staff Interface</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Open Staff Dashboard</h2>
            <p className="mt-3 text-slate-600">
              Monitor every field in real time and track patient status: idle, filling form, or submitted.
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
