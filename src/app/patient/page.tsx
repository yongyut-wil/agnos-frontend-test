import Header from "@/components/Header";
import PatientForm from "@/components/PatientForm";

export default function PatientPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="grow flex justify-center py-10 md:py-12 px-4 md:px-6">
        <PatientForm />
      </main>
    </div>
  );
}
