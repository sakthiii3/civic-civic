import { ReportForm } from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Report a civic issue</h1>
      <p className="mt-2 max-w-2xl text-emerald-100/85">
        Your report is routed by category to sanitation, public works, power, or
        parks. Add a clear photo when safe to do so.
      </p>
      <div className="mt-8">
        <ReportForm />
      </div>
    </main>
  );
}
