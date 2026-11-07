import {
  createVendor,
  deleteVendor,
  listVendors,
  updateVendorMoney,
  updateVendorStatus,
} from "@/app/plan/actions";
import { PlanShell } from "@/components/planning/plan-shell";
import { VENDOR_CATEGORIES } from "@/lib/planning-presets";

const statuses = [
  "researching",
  "contacted",
  "booked",
  "paid",
  "declined",
] as const;

export default async function VendorsPage() {
  const vendors = await listVendors();
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const booked = vendors.filter((v) =>
    ["booked", "paid"].includes(v.status),
  ).length;

  return (
    <PlanShell title="Vendors" active="/plan/vendors">
      <div className="mb-6 rounded-[1.75rem] bg-[#161616] px-5 py-4">
        <p className="font-medium text-2xl">Vendor tracker</p>
        <p className="mt-1 text-sm text-[#8e8e8e]">
          {booked}/{vendors.length} booked or paid
        </p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const quoted = String(formData.get("quoted_amount") ?? "");
          const deposit = String(formData.get("deposit_amount") ?? "");
          await createVendor({
            name: String(formData.get("name") ?? ""),
            category: String(formData.get("category") ?? ""),
            contact_name:
              String(formData.get("contact_name") ?? "") || undefined,
            email: String(formData.get("email") ?? "") || undefined,
            phone: String(formData.get("phone") ?? "") || undefined,
            website: String(formData.get("website") ?? "") || undefined,
            notes: String(formData.get("notes") ?? "") || undefined,
            quoted_amount: quoted ? Number(quoted) : undefined,
            deposit_amount: deposit ? Number(deposit) : undefined,
          });
        }}
        className="mb-8 grid gap-3 rounded-[1.75rem] bg-[#161616] p-6 md:grid-cols-2"
      >
        <p className="font-medium text-2xl md:col-span-2">Add vendor</p>
        <input
          name="name"
          required
          placeholder="Name"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <select
          name="category"
          required
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        >
          {VENDOR_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          name="contact_name"
          placeholder="Contact"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="website"
          placeholder="Website"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="quoted_amount"
          type="number"
          step="0.01"
          placeholder="Quoted amount"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <input
          name="deposit_amount"
          type="number"
          step="0.01"
          placeholder="Deposit paid"
          className="rounded-2xl border border-white/10 bg-black px-3 py-2"
        />
        <textarea
          name="notes"
          placeholder="Notes"
          rows={2}
          className="rounded-2xl border border-white/10 bg-black px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          className="rounded-full bg-white px-4 py-3 text-xs uppercase tracking-[0.18em] text-black md:w-fit"
        >
          Add vendor
        </button>
      </form>

      <div className="space-y-3">
        {vendors.length === 0 ? (
          <p className="text-[#8e8e8e]">No vendors yet — add one above.</p>
        ) : null}
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="rounded-[1.75rem] bg-[#161616] px-5 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-[#8e8e8e]">
                  {vendor.category}
                  {vendor.contact_name ? ` · ${vendor.contact_name}` : ""}
                  {vendor.email ? ` · ${vendor.email}` : ""}
                  {vendor.phone ? ` · ${vendor.phone}` : ""}
                </p>
                {vendor.notes ? (
                  <p className="mt-2 text-sm text-[#8e8e8e]">{vendor.notes}</p>
                ) : null}
                {vendor.website ? (
                  <a
                    href={vendor.website}
                    className="mt-1 inline-block text-sm underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                ) : null}
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteVendor(vendor.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs uppercase tracking-[0.18em] text-[#ff453a]"
                >
                  Delete
                </button>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <form
                  key={status}
                  action={async () => {
                    "use server";
                    await updateVendorStatus(vendor.id, status);
                  }}
                >
                  <button
                    type="submit"
                    className={`px-2 py-1 text-xs uppercase tracking-[0.14em] ${
                      vendor.status === status
                        ? "rounded-full bg-white text-black"
                        : "rounded-2xl border border-white/10 bg-black"
                    }`}
                  >
                    {status}
                  </button>
                </form>
              ))}
            </div>

            <form
              action={async (formData) => {
                "use server";
                const quoted = String(formData.get("quoted_amount") ?? "");
                const deposit = String(formData.get("deposit_amount") ?? "");
                await updateVendorMoney(
                  vendor.id,
                  quoted ? Number(quoted) : null,
                  deposit ? Number(deposit) : null,
                );
              }}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <label className="text-xs uppercase tracking-[0.14em] text-[#8e8e8e]">
                Quoted
                <input
                  name="quoted_amount"
                  type="number"
                  step="0.01"
                  defaultValue={
                    vendor.quoted_amount != null
                      ? String(vendor.quoted_amount)
                      : ""
                  }
                  placeholder="0"
                  className="mt-1 block w-32 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm normal-case tracking-normal"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-[#8e8e8e]">
                Deposit
                <input
                  name="deposit_amount"
                  type="number"
                  step="0.01"
                  defaultValue={
                    vendor.deposit_amount != null
                      ? String(vendor.deposit_amount)
                      : ""
                  }
                  placeholder="0"
                  className="mt-1 block w-32 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm normal-case tracking-normal"
                />
              </label>
              <button
                type="submit"
                className="rounded-full border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.14em]"
              >
                Save money
              </button>
              <p className="text-sm text-[#8e8e8e]">
                {vendor.quoted_amount != null
                  ? `Quote ${currency.format(Number(vendor.quoted_amount))}`
                  : "No quote"}
                {vendor.deposit_amount != null
                  ? ` · Deposit ${currency.format(Number(vendor.deposit_amount))}`
                  : ""}
              </p>
            </form>
          </div>
        ))}
      </div>
    </PlanShell>
  );
}
