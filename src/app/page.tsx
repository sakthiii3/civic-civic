import Link from "next/link";

const features = [
  {
    title: "Report in seconds",
    text: "Photo, GPS location, short description — routed automatically to the right department.",
  },
  {
    title: "Live city map",
    text: "See reported issues on an interactive map. Hotspots help prioritize public works.",
  },
  {
    title: "Track every step",
    text: "Follow confirmation, acknowledgment, work in progress, and resolution with a simple reference code.",
  },
  {
    title: "Built for scale",
    text: "APIs and a resilient data layer ready for high traffic and future integrations.",
  },
];

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col">
      <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 md:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
        <div className="relative mx-auto max-w-6xl">
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Crowdsourced civic reporting{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              that closes the loop
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-emerald-100/85">
            Citizens capture real-world problems; departments receive structured,
            geotagged work orders with routing, analytics, and accountability —
            aligned with the <strong>Clean &amp; Green Technology</strong> theme.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-6 py-3.5 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-300"
            >
              Report an issue
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Open live map
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center rounded-xl border border-transparent px-6 py-3.5 text-base font-medium text-emerald-200/90 underline-offset-4 hover:underline"
            >
              Track existing report
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/20 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:border-emerald-400/30"
            >
              <h2 className="text-lg font-semibold text-white">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-900/50 to-teal-950/50 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-white">For municipal staff</h2>
          <p className="mt-3 max-w-2xl text-emerald-100/85">
            Filter by category, ward, status, and priority. Reassign departments,
            publish citizen-visible updates, and export insights on response
            times — demo admin:{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-emerald-200">
              admin@jharkhand.gov.in
            </code>{" "}
            /{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-emerald-200">
              admin123
            </code>
            .
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-flex rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Staff portal →
          </Link>
        </div>
      </section>

      <footer className="mt-auto border-t border-white/10 px-4 py-8 text-center text-xs text-emerald-200/60 sm:px-6">
        Prototype for civic engagement — swap SQLite for PostgreSQL in production.
      </footer>
    </main>
  );
}
