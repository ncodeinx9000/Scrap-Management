import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Recycle } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../api/axios";
const empty = {
  name: "",
  categoryId: "",
  quantity: "",
  unit: "kg",
  condition: "usable",
  location: "",
  estimatedValue: "",
  notes: "",
  imageUrl: "",
};
const field =
  "mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
export default function ScrapForm({ mode = "add" }) {
  const { id } = useParams();
  const edit = mode === "edit";
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/categories"),
      edit
        ? api.get(`/scrap/${id}`)
        : Promise.resolve({ data: { data: null } }),
    ])
      .then(([cats, itemResponse]) => {
        if (!active) return;
        setCategories(Array.isArray(cats.data.data) ? cats.data.data : []);
        const item = itemResponse.data.data;
        if (item && item.status !== "in_stock") {
          setError("This item is closed and cannot be edited.");
          return;
        }
        if (
          item &&
          user?.role !== "admin" &&
          String(item.addedBy?._id || item.addedBy) !== String(user?._id)
        ) {
          setError("You can only edit scrap items you added.");
          return;
        }
        if (item)
          setForm({
            name: item.name || "",
            categoryId: item.categoryId?._id || item.categoryId || "",
            quantity: item.quantity ?? "",
            unit: item.unit || "kg",
            condition: item.condition || "usable",
            location: item.location || "",
            estimatedValue: item.estimatedValue ?? "",
            notes: item.notes || "",
            imageUrl: item.imageUrl || "",
          });
        if (item) setImagePreview(item.imageUrl || "");
      })
      .catch((e) => {
        if (active)
          setError(
            e.response?.data?.message || "Could not load the form data.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [edit, id, user]);
  const change = (e) =>
    setForm((curr) => ({ ...curr, [e.target.name]: e.target.value }));
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller");
      e.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setImageUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);
    try {
      const response = await api.post("/upload", uploadData);
      const url = response.data.data?.url;
      if (!url) throw new Error("The server did not return an image URL");
      setForm((curr) => ({ ...curr, imageUrl: url }));
      setImagePreview(url);
    } catch (uploadError) {
      setImagePreview(form.imageUrl || "");
      toast.error(
        uploadError.response?.data?.message || "Could not upload the image",
      );
    } finally {
      setImageUploading(false);
      URL.revokeObjectURL(localPreview);
      e.target.value = "";
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      !form.categoryId ||
      !Number.isFinite(Number(form.quantity)) ||
      Number(form.quantity) <= 0 ||
      !form.unit ||
      !form.condition
    ) {
      toast.error(
        "Enter a name, category, positive quantity, unit, and condition",
      );
      return;
    }
    setSaving(true);
    const body = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      quantity: Number(form.quantity),
      unit: form.unit,
      condition: form.condition,
      location: form.location.trim(),
      estimatedValue:
        form.estimatedValue === "" ? "" : Number(form.estimatedValue),
      notes: form.notes.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    try {
      const { data } = edit
        ? await api.put(`/scrap/${id}`, body)
        : await api.post("/scrap", body);
      toast.success(edit ? "Scrap item updated" : "Scrap item added");
      navigate(`/scrap/${data.data?._id || id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not save the scrap item");
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-500">
        Loading scrap item…
      </div>
    );
  if (error)
    return (
      <div className="rounded-2xl bg-white p-10 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link
          to="/scrap"
          className="mt-4 inline-flex rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Back to scrap
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/scrap"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-700"
      >
        <ArrowLeft size={16} />
        Back to scrap
      </Link>
      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <Recycle />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-700">Inventory</p>
            <h1 className="mt-1 text-2xl font-bold">
              {edit ? "Edit scrap item" : "Add scrap item"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Record material details for your organisation.
            </p>
          </div>
        </div>
        {categories.length === 0 ? (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            Add a category before creating scrap.{" "}
            <Link to="/categories" className="font-semibold underline">
              Manage categories
            </Link>
          </div>
        ) : null}
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">
            Name
            <input
              className={field}
              name="name"
              value={form.name}
              onChange={change}
              required
              maxLength="120"
              placeholder="e.g. Steel shelving"
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <select
              className={field}
              name="categoryId"
              value={form.categoryId}
              onChange={change}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Quantity
            <input
              className={field}
              name="quantity"
              type="number"
              min="0.01"
              step="any"
              value={form.quantity}
              onChange={change}
              required
            />
          </label>
          <label className="text-sm font-medium">
            Unit
            <select
              className={field}
              name="unit"
              value={form.unit}
              onChange={change}
              required
            >
              <option value="kg">kg</option>
              <option value="pcs">pcs</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Condition
            <select
              className={field}
              name="condition"
              value={form.condition}
              onChange={change}
              required
            >
              <option value="usable">Usable</option>
              <option value="repairable">Repairable</option>
              <option value="junk">Junk</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Location
            <input
              className={field}
              name="location"
              value={form.location}
              onChange={change}
              placeholder="Warehouse A"
            />
          </label>
          <label className="text-sm font-medium">
            Estimated value
            <input
              className={field}
              name="estimatedValue"
              type="number"
              min="0"
              step="0.01"
              value={form.estimatedValue}
              onChange={change}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Notes
            <textarea
              className={`${field} min-h-24 resize-y`}
              name="notes"
              value={form.notes}
              onChange={change}
              placeholder="Add useful details"
            />
          </label>
          <div className="text-sm font-medium sm:col-span-2">
            <label className="block" htmlFor="scrap-image">
              Scrap image
            </label>
            <input
              id="scrap-image"
              className={field}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={uploadImage}
              disabled={imageUploading}
            />
            <p className="mt-1 text-xs font-normal text-gray-500">
              JPG, PNG, or WebP up to 2 MB.
              {imageUploading ? " Uploading image…" : ""}
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Scrap item preview"
                className="mt-3 h-40 w-40 rounded-xl border border-gray-200 object-cover"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <Link
              to="/scrap"
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </Link>
            <button
              disabled={saving || imageUploading || categories.length === 0}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : edit ? "Save changes" : "Add scrap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
