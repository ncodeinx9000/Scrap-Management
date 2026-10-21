import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  Recycle,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
const CURRENT_YEAR = new Date().getFullYear();
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold sm:text-xl"
        >
          <span className="rounded-xl bg-emerald-600 p-2 text-white">
            <Recycle size={19} />
          </span>
          Circuloop
        </Link>
        <nav className="flex items-center gap-2 sm:gap-5">
          <a
            href="#features"
            className="hidden text-sm text-slate-600 sm:block"
          >
            Features
          </a>
          <Link to="/login" className="text-sm font-semibold">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white sm:px-4"
          >
            Get started
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6">
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <Recycle size={14} /> A smarter way to manage materials
            </div>
            <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Give every scrap a{" "}
              <span className="text-emerald-600">next chapter.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Keep your organisation’s reusable materials visible, organised,
              and moving toward their next useful life.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-200"
              >
                Create your workspace <ArrowRight size={17} />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border bg-white px-5 py-3 font-semibold"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={17} className="text-emerald-600" />
              Built for teams that care about what comes next
            </p>
          </div>
          <div className="rounded-[2rem] bg-emerald-100 p-6 md:p-10">
            <div className="rounded-3xl bg-white p-5 shadow-xl">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <p className="text-sm font-semibold">Materials overview</p>
                  <p className="text-xs text-slate-500">
                    Your organisation at a glance
                  </p>
                </div>
                <span className="text-xs text-emerald-700">● Sample preview</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-4">
                <div className="rounded-xl border p-3">
                  <Boxes className="text-emerald-600" />
                  <p className="mt-2 text-xs text-slate-500">Items in stock</p>
                  <b className="text-lg">1,284</b>
                </div>
                <div className="rounded-xl border p-3">
                  <BarChart3 className="text-emerald-600" />
                  <p className="mt-2 text-xs text-slate-500">Recovered value</p>
                  <b className="text-lg">₹8,420</b>
                </div>
              </div>
              {[
                ["Steel shelving", "12 pcs", "72%"],
                ["Office chairs", "8 pcs", "48%"],
                ["LED fixtures", "35 pcs", "83%"],
              ].map(([n, q, w]) => (
                <div
                  key={n}
                  className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <span className="h-9 w-9 rounded-lg bg-emerald-400" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{n}</span>
                      <span className="text-slate-500">{q}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: w }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="features"
          className="grid gap-4 border-t py-12 md:grid-cols-3"
        >
          {[
            [
              <Boxes key="inventory" />,
              "One clear inventory",
              "Find what you have, where it is, and what condition it is in.",
            ],
            [
              <Recycle key="outcomes" />,
              "Track every outcome",
              "Follow items from storage through sale, recycling, donation, or disposal.",
            ],
            [
              <ShieldCheck key="teams" />,
              "Bring your team along",
              "Give staff a simple way to add materials and keep records current.",
            ],
          ].map(([icon, title, body]) => (
            <article key={title} className="rounded-2xl border bg-white p-6">
              <span className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-700">
                {icon}
              </span>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t py-6 text-center text-xs text-slate-500">
        © {CURRENT_YEAR} Circuloop · Make more from what you have.
      </footer>
    </div>
  );
}

