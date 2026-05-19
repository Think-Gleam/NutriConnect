import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold text-slate-900">NutriConnect</p>
            <p className="text-[11px] uppercase tracking-wider text-emerald-700">
              SDG 3 · Good Health
            </p>
          </div>
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <a href="#vendor" className="hover:text-emerald-700">Vendor</a>
          <a href="#map" className="hover:text-emerald-700">Health Centers</a>
          <a href="#impact" className="hover:text-emerald-700">Impact</a>
        </nav>
      </div>
    </header>
  );
}
