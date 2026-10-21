import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeOff, Recycle } from "lucide-react";
import { loginUser } from "../features/auth/authSlice";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !form.password) {
      toast.error("Enter a valid email and password");
      return;
    }
    setBusy(true);
    try {
      const user = await dispatch(loginUser(form)).unwrap();
      toast.success("Welcome back");
      navigate(user.role === "admin" ? "/dashboard" : "/scrap");
    } catch (error) {
      toast.error(error);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid min-h-screen bg-gray-50 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-emerald-700 p-12 text-white md:flex">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Recycle />
          Circuloop
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            Welcome back
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Good things happen when nothing goes to waste.
          </h1>
          <p className="mt-4 text-emerald-100">
            Sign in to see what your team can make possible.
          </p>
        </div>
        <p className="text-xs text-emerald-200">
          Responsible materials management, made simple.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"
        >
          <Link to="/" className="flex items-center gap-2 font-bold md:hidden">
            <Recycle className="text-emerald-600" />
            Circuloop
          </Link>
          <h2 className="mt-6 text-2xl font-bold">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your details to continue.
          </p>
          <label className="mt-7 block text-sm font-medium">
            Email address
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={change}
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@company.com"
            />
          </label>
          <label className="mt-5 block text-sm font-medium">
            Password
            <div className="relative mt-2">
              <input
                required
                type={show ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={change}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Your password"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3.5 text-gray-500"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button
            disabled={busy}
            className="mt-7 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-6 text-center text-sm text-gray-500">
            New to Circuloop?{" "}
            <Link className="font-semibold text-emerald-700" to="/register">
              Create an organisation
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
