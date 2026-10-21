import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
const input =
  "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export default function Users() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [added, setAdded] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
      !form.password
    ) {
      toast.error("Enter a name, valid email, and password");
      return;
    }
    setSaving(true);
    setAdded("");
    try {
      const { data } = await api.post("/users", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      const name = data.data?.name || form.name.trim();
      setAdded(name);
      setForm({ name: "", email: "", password: "" });
      toast.success(`${name} was added as staff`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not add staff member");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-medium text-emerald-700">Team access</p>
        <h1 className="mt-1 text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add staff members to your organisation.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,.9fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <UserPlus size={20} />
            </span>
            <div>
              <h2 className="font-semibold">Add staff</h2>
              <p className="text-sm text-gray-500">
                Create a staff login for your organisation.
              </p>
            </div>
          </div>
          {added && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <strong>{added} was added successfully.</strong> They can now sign
              in with their email and password.
            </div>
          )}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Name
              <input
                className={input}
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={change}
                required
                placeholder="Jordan Lee"
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                className={input}
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={change}
                required
                placeholder="jordan@company.com"
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <div className="relative">
                <input
                  className={`${input} pr-12`}
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={change}
                  required
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-4 text-gray-500"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            <button
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Adding staff…" : "Add staff member"}
            </button>
          </form>
        </section>
        <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Staff list</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            A staff directory is coming soon. You can add staff accounts here in
            the meantime.
          </p>
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Access note</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Staff can view categories and add scrap. They can edit their own
              in-stock items.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
