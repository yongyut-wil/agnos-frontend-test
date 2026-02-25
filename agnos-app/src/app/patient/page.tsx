import Header from "@/components/Header";
import PatientForm from "@/components/PatientForm";

export default function PatientPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex justify-center w-full">
        <PatientForm />
      </main>
    </div>
  );
}
