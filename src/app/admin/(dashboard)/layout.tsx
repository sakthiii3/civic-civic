import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { signOutAction } from "@/app/admin/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { staff } = await requireStaff();
  if (!staff) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-emerald-950/40">
      <div className="border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-300/80">
              Civic admin
            </p>
            <p className="font-semibold text-white">{staff.name}</p>
            <p className="text-xs text-emerald-200/60">
              {staff.department?.name ?? "All departments"} · {staff.role}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/admin"
              className="rounded-lg px-3 py-1.5 text-emerald-100 hover:bg-white/10"
            >
              Inbox
            </Link>
            {staff.role === "ADMIN" && (
              <Link
                href="/admin/analytics"
                className="rounded-lg px-3 py-1.5 text-emerald-100 hover:bg-white/10"
              >
                Analytics
              </Link>
            )}
            <Link
              href="/map"
              className="rounded-lg px-3 py-1.5 text-emerald-100 hover:bg-white/10"
            >
              Public map
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-emerald-100 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
