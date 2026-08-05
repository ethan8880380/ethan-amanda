import {
  createVendor,
  deleteVendor,
  listVendors,
  seedVendorPresets,
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border border-[#e4ddd4] bg-white px-5 py-4">
        <div>
          <p className="font-serif text-2xl">Vendor tracker</p>
          <p className="mt-1 text-sm text-[#6f6258]">
            {booked}/{vendors.length} booked or paid
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await seedVendorPresets();
          }}
        >
          <button
            type="submit"
            className="border border-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em]"
          >
            Load vendor stubs
          </button>
        </form>
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
        className="mb-8 grid gap-3 border border-[#e4ddd4] bg-white p-6 md:grid-cols-2"
      >
        <p className="font-serif text-2xl md:col-span-2">Add vendor</p>
        <input
          name="name"
          required
          placeholder="Name"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <select
          name="category"
          required
          className="border border-[#d9d0c5] px-3 py-2"
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
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="website"
          placeholder="Website"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="quoted_amount"
          type="number"
          step="0.01"
          placeholder="Quoted amount"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <input
          name="deposit_amount"
          type="number"
          step="0.01"
          placeholder="Deposit paid"
          className="border border-[#d9d0c5] px-3 py-2"
        />
        <textarea
          name="notes"
          placeholder="Notes"
          rows={2}
          className="border border-[#d9d0c5] px-3 py-2 md:col-span-2"
        />
        <button
          type="submit"
          className="bg-[#1c1714] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f7f3ee] md:w-fit"
        >
          Add vendor
        </button>
      </form>

      <div className="space-y-3">
        {vendors.length === 0 ? (
          <p className="text-[#6f6258]">
            No vendors yet — load stubs for the usual categories.
          </p>
        ) : null}
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="border border-[#e4ddd4] bg-white px-5 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-[#6f6258]">
                  {vendor.category}
                  {vendor.contact_name ? ` · ${vendor.contact_name}` : ""}
                  {vendor.email ? ` · ${vendor.email}` : ""}
                  {vendor.phone ? ` · ${vendor.phone}` : ""}
                </p>
                {vendor.notes ? (
                  <p className="mt-2 text-sm text-[#6f6258]">{vendor.notes}</p>
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
                  className="text-xs uppercase tracking-[0.18em] text-red-700"
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
                        ? "bg-[#1c1714] text-white"
                        : "border border-[#d9d0c5]"
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
              <label className="text-xs uppercase tracking-[0.14em] text-[#6f6258]">
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
                  className="mt-1 block w-32 border border-[#d9d0c5] px-3 py-2 text-sm normal-case tracking-normal"
                />
              </label>
              <label className="text-xs uppercase tracking-[0.14em] text-[#6f6258]">
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
                  className="mt-1 block w-32 border border-[#d9d0c5] px-3 py-2 text-sm normal-case tracking-normal"
                />
              </label>
              <button
                type="submit"
                className="border border-[#1c1714] px-3 py-2 text-xs uppercase tracking-[0.14em]"
              >
                Save money
              </button>
              <p className="text-sm text-[#6f6258]">
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
