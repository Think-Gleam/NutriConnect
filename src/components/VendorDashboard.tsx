// Vendor-facing form to log surplus nutritious food available for CHC pickup.
import { useState, type FormEvent } from "react";
import type { FoodCategory } from "../services/inventory";
import { useSurplusInventory } from "../hooks/useSurplusInventory";

const CATEGORIES: FoodCategory[] = ["Protein", "Veggie", "Fruit", "Grain"];

function defaultExpiry(): string {
  const d = new Date(Date.now() + 1000 * 60 * 60 * 24);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export function VendorDashboard() {
  const { addItem } = useSurplusInventory();
  const [vendorName, setVendorName] = useState("");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("Veggie");
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState(defaultExpiry());
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!vendorName.trim() || !itemName.trim() || quantity <= 0) return;
    await addItem({
      vendorName: vendorName.trim(),
      itemName: itemName.trim(),
      category,
      quantity,
      expiryTime: new Date(expiry).toISOString(),
    });
    setItemName("");
    setQuantity(1);
    setExpiry(defaultExpiry());
    setSubmittedAt(Date.now());
  }

  return (
    <section
      id="vendor"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Vendor Dashboard
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          Log surplus nutritious food
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Postings are routed to nearby Community Health Centers to combat malnutrition.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Vendor Name">
          <input
            required
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            placeholder="Green Valley Grocers"
            className="input"
          />
        </Field>
        <Field label="Item Name">
          <input
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Fresh spinach bundles"
            className="input"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity (kg)">
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Expiry Time" className="sm:col-span-2">
          <input
            type="datetime-local"
            required
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="input"
          />
        </Field>
        <div className="sm:col-span-2 flex items-center justify-between gap-3">
          {submittedAt && (
            <p className="text-sm text-emerald-700">
              ✓ Posted successfully — visible to nearby CHCs.
            </p>
          )}
          <button
            type="submit"
            className="ml-auto inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            Post surplus
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: rgb(5 150 105);
          box-shadow: 0 0 0 3px rgb(16 185 129 / 0.15);
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
