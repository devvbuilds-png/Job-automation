"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/find", label: "Find & Apply" },
  { href: "/track", label: "Track" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center gap-6 px-6">
        <span className="text-sm font-semibold tracking-tight text-zinc-800">
          Job Tracker
        </span>
        <nav className="flex gap-0.5">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                pathname.startsWith(href)
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
