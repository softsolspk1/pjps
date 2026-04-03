import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold font-serif">PJPS Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Logged in as {session.user.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 transition">
            Dashboard
          </Link>
          <Link href="/admin/articles" className="block px-4 py-2 hover:bg-slate-700 rounded transition">
            Articles & Articles CMS
          </Link>
          <Link href="/admin/issues" className="block px-4 py-2 hover:bg-slate-700 rounded transition">
            Volumes / Issues
          </Link>
          <Link href="/admin/users" className="block px-4 py-2 hover:bg-slate-700 rounded transition">
            User Roles
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link href="/api/auth/signout" className="block w-full text-center px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm">
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
