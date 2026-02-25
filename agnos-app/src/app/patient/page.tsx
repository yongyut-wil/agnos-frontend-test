import Header from "@/components/Header";
import PatientForm from "@/components/PatientForm";

export default function PatientPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex justify-center py-12 px-6">
        <PatientForm />
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 p-6 md:p-10 z-10">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
          {/* Submit Button connected to form via 'form' attribute */}
          <button
            type="submit"
            form="intake-form"
            className="w-full bg-agnos-blue hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 text-xl"
          >
            Next Step
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            className="uppercase tracking-widest text-agnos-gray font-bold text-sm hover:text-agnos-dark transition-colors"
          >
            Save for Later
          </button>
        </div>
      </footer>
    </div>
  );
}
