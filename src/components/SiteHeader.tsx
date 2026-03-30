import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/report", label: "Report issue" },
  { href: "/map", label: "Live map" },
  { href: "/track", label: "Track report" },
  { href: "/admin/login", label: "Staff login" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/15 bg-emerald-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold text-emerald-950 shadow-lg shadow-emerald-900/30">
            JH
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Civic Connect</p>
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/90">
              Jharkhand — Clean &amp; Green
            </p>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-emerald-100/90 transition hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
