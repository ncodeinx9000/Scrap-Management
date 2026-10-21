import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Recycle } from "lucide-react";
import api from "../api/axios";
const initial = {
  orgName: "",
  orgEmail: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  adminName: "",
  adminEmail: "",
  password: "",
  confirmPassword: "",
};
const field =
  "mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const next = (e) => {
    e.preventDefault();
    if (
      !form.orgName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.orgEmail) ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.zipcode.trim() ||
      !form.country.trim()
    ) {
      toast.error("Complete all organisation fields with a valid email");
      return;
    }
    setStep(2);
  };
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.adminName.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail) ||
      form.password.length < 8 ||
      form.confirmPassword !== form.password
    ) {
      toast.error(
        form.password.length < 8
          ? "Password must be at least 8 characters"
          : form.confirmPassword !== form.password
            ? "Passwords do not match"
            : "Complete all fields with a valid email",
      );
      return;
    }
    setBusy(true);
    try {
      await api.post("/organisations/register", {
        organisation: {
          name: form.orgName,
          email: form.orgEmail,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zipcode: form.zipcode,
            country: form.country,
          },
        },
        admin: {
          name: form.adminName,
          email: form.adminEmail,
          password: form.password,
        },
      });
      toast.success("Organisation created. You can now sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not create the organisation",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <Recycle className="text-emerald-600" />
          Circuloop
        </Link>
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Create your workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            {step === 1
              ? "Tell us about your organisation"
              : "Set up your admin account"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Step {step} of 2 ·{" "}
            {step === 1 ? "Organisation details" : "Administrator details"}
          </p>
          <div className="mt-5 h-1.5 rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full bg-emerald-500 transition-all ${step === 1 ? "w-1/2" : "w-full"}`}
            />
          </div>
          {step === 1 ? (
            <form onSubmit={next} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  Organisation name
                  <input
                    className={field}
                    name="orgName"
                    value={form.orgName}
                    onChange={change}
                    required
                    placeholder="Acme Manufacturing"
                  />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Organisation email
                  <input
                    className={field}
                    name="orgEmail"
                    type="email"
                    value={form.orgEmail}
                    onChange={change}
                    required
                    placeholder="hello@company.com"
                  />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Street address
                  <input
                    className={field}
                    name="street"
                    value={form.street}
                    onChange={change}
                    required
                    placeholder="123 Greenway Road"
                  />
                </label>
                <label className="text-sm font-medium">
                  City
                  <input
                    className={field}
                    name="city"
                    value={form.city}
                    onChange={change}
                    required
                  />
                </label>
                <label className="text-sm font-medium">
                  State / Province
                  <input
                    className={field}
                    name="state"
                    value={form.state}
                    onChange={change}
                    required
                  />
                </label>
                <label className="text-sm font-medium">
                  ZIP / Postal code
                  <input
                    className={field}
                    name="zipcode"
                    value={form.zipcode}
                    onChange={change}
                    required
                  />
                </label>
                <label className="text-sm font-medium">
                  Country
                  <input
                    className={field}
                    name="country"
                    value={form.country}
                    onChange={change}
                    required
                  />
                </label>
              </div>
              <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white">
                Continue <ArrowRight size={17} />
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  Your name
                  <input
                    className={field}
                    name="adminName"
                    autoComplete="name"
                    value={form.adminName}
                    onChange={change}
                    required
                    placeholder="Alex Morgan"
                  />
                </label>
                <label className="text-sm font-medium sm:col-span-2">
                  Admin email
                  <input
                    className={field}
                    name="adminEmail"
                    type="email"
                    autoComplete="email"
                    value={form.adminEmail}
                    onChange={change}
                    required
                    placeholder="alex@company.com"
                  />
                </label>
                <label className="text-sm font-medium">
                  Password
                  <div className="relative">
                    <input
                      className={`${field} pr-12`}
                      name="password"
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
                      minLength="8"
                      value={form.password}
                      onChange={change}
                      required
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-4 text-gray-500"
                      aria-label={show ? "Hide password" : "Show password"}
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                <label className="text-sm font-medium">
                  Confirm password
                  <input
                    className={field}
                    name="confirmPassword"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={change}
                    required
                    placeholder="Enter password again"
                  />
                </label>
              </div>
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 font-semibold disabled:opacity-50"
                >
                  <ArrowLeft size={17} />
                  Back
                </button>
                <button
                  disabled={busy}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {busy ? "Creating workspace…" : "Create workspace"}
                </button>
              </div>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
