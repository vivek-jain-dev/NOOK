"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [orderQuery, setOrderQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadAccounts() {
    const [accountResponse, orderResponse] = await Promise.all([
      fetch("/api/admin/accounts"),
      fetch("/api/admin/orders"),
    ]);
    const [accountResult, orderResult] = await Promise.all([
      accountResponse.json(),
      orderResponse.json(),
    ]);

    if (accountResponse.status === 401 || orderResponse.status === 401) {
      setAuthenticated(false);
      return;
    }
    if (!accountResponse.ok) throw new Error(accountResult.error || "Unable to load accounts.");
    if (!orderResponse.ok) throw new Error(orderResult.error || "Unable to load orders.");

    setAuthenticated(true);
    setAccounts(accountResult.data);
    setOrders(orderResult.data);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/accounts"),
      fetch("/api/admin/orders"),
    ])
      .then(async ([accountResponse, orderResponse]) => {
        const [accountResult, orderResult] = await Promise.all([
          accountResponse.json(),
          orderResponse.json(),
        ]);
        if (accountResponse.status === 401 || orderResponse.status === 401) return;
        if (!accountResponse.ok) throw new Error(accountResult.error || "Unable to load accounts.");
        if (!orderResponse.ok) throw new Error(orderResult.error || "Unable to load orders.");
        setAuthenticated(true);
        setAccounts(accountResult.data);
        setOrders(orderResult.data);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      await loadAccounts();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    const response = await fetch("/api/admin/session", { method: "DELETE" });
    if (!response.ok) {
      setError("Unable to sign out. Please try again.");
      return;
    }
    setAuthenticated(false);
    setAccounts([]);
    setOrders([]);
  }

  async function refreshData() {
    setRefreshing(true);
    setError("");
    try {
      await loadAccounts();
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setRefreshing(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = orderQuery.trim().toLowerCase();
    if (!query) return true;
    return [
      order.id,
      order.account.name,
      order.account.email,
      order.phone,
      order.address,
      order.status,
      order.paymentMethod,
      order.paymentStatus,
      ...order.items.flatMap((item) => [item.name, item.sku]),
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
  const orderRevenue = orders.reduce(
    (sum, order) => sum + (order.paymentStatus === "PAID" || order.paymentStatus === "DEMO_PAID" || order.paymentStatus === "COD_PENDING" ? order.total : 0),
    0,
  );

  return (
    <main className="page-enter mx-auto min-h-[68vh] max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      {loading ? (
        <p className="py-16 text-center text-sm text-[#777c74]">Loading admin portal…</p>
      ) : authenticated ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">Nook & Co. / Admin workspace</p>
              <h1 className="mt-2 font-serif text-4xl tracking-[-0.04em] text-[#293029]">Store overview</h1>
              <p className="mt-2 text-sm text-[#777c74]">Orders, customers, and fulfilment at a glance.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-[#dcdcd4] px-4 py-2.5 text-sm text-[#4c554b] transition hover:bg-white disabled:opacity-60" disabled={refreshing} onClick={refreshData} type="button">
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              <button className="rounded-full bg-[#35483a] px-5 py-2.5 text-sm text-white transition hover:bg-[#26372b]" onClick={handleLogout} type="button">Sign out</button>
            </div>
          </div>
          {error && <p className="mt-5 rounded-xl bg-[#fbf2ef] px-4 py-3 text-sm text-[#874f43]" role="alert">{error}</p>}

          <section aria-label="Store statistics" className="mt-8 grid gap-3 sm:grid-cols-3">
            <StatCard label="Orders placed" value={orders.length} detail="All-time orders" />
            <StatCard label="Customers" value={accounts.length} detail="Registered accounts" />
            <StatCard label="Order value" value={formatPrice(orderRevenue)} detail="Includes COD and paid orders" />
          </section>

          <div className="mt-8 flex gap-2 border-b border-[#e6e5de]">
            <button aria-selected={activeTab === "orders"} className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === "orders" ? "text-[#35483a] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#526b57]" : "text-[#81857c] hover:text-[#35483a]"}`} onClick={() => setActiveTab("orders")} role="tab" type="button">
              Orders <span className="ml-1 rounded-full bg-[#edf0e9] px-2 py-0.5 text-[11px]">{orders.length}</span>
            </button>
            <button aria-selected={activeTab === "customers"} className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === "customers" ? "text-[#35483a] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#526b57]" : "text-[#81857c] hover:text-[#35483a]"}`} onClick={() => setActiveTab("customers")} role="tab" type="button">
              Customers <span className="ml-1 rounded-full bg-[#edf0e9] px-2 py-0.5 text-[11px]">{accounts.length}</span>
            </button>
          </div>

          {activeTab === "orders" ? (
            <section className="mt-5" aria-label="Orders">
              <label className="mb-4 block max-w-md">
                <span className="sr-only">Search orders</span>
                <input className="w-full rounded-xl border border-[#e5e4dd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#81927e] focus:ring-2 focus:ring-[#81927e]/15" onChange={(event) => setOrderQuery(event.target.value)} placeholder="Search order, customer, item, or address…" type="search" value={orderQuery} />
              </label>
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d9d9d0] bg-white/60 px-6 py-14 text-center">
                  <p className="font-serif text-2xl text-[#30372f]">{orders.length ? "No orders match your search." : "Your first order will appear here."}</p>
                  <p className="mt-2 text-sm text-[#777c74]">{orders.length ? "Try another order number, customer, or product." : "Order information, delivery details, and payment status will be saved here."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <OrderCard index={index} key={order.id} order={order} />
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section aria-label="Customer accounts" className="mt-5 overflow-hidden rounded-2xl border border-[#e9e8e1] bg-white">
              {accounts.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-[#777c74]">No accounts have been created yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-[#f7f6f2] text-xs uppercase tracking-wide text-[#74796f]">
                      <tr><th className="px-5 py-4 font-medium">Name</th><th className="px-5 py-4 font-medium">Email</th><th className="px-5 py-4 font-medium">Joined</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeede7]">
                      {accounts.map((account) => (
                        <tr className="transition-colors hover:bg-[#fbfaf7]" key={account.id}>
                          <td className="px-5 py-4 font-medium text-[#30372f]">{account.name}</td>
                          <td className="px-5 py-4 text-[#62675f]">{account.email}</td>
                          <td className="px-5 py-4 text-[#777c74]">{formatDate(account.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        <section className="motion-rise mx-auto max-w-md rounded-3xl border border-[#e9e8e1] bg-white p-6 shadow-[0_18px_55px_rgba(41,53,45,0.07)] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">Nook & Co. / Admin</p>
          <h1 className="mt-3 font-serif text-3xl tracking-[-0.04em] text-[#293029]">Staff sign in</h1>
          <p className="mt-2 text-sm leading-6 text-[#777c74]">Use the admin email and password configured on the server.</p>
          <form className="mt-6" onSubmit={handleLogin}>
            <label className="block text-xs font-medium text-[#62675f]">
              Email
              <input autoComplete="username" className="mt-2 w-full rounded-xl border border-[#e5e4dd] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#81927e]" name="email" required type="email" />
            </label>
            <label className="mt-4 block text-xs font-medium text-[#62675f]">
              Password
              <input autoComplete="current-password" className="mt-2 w-full rounded-xl border border-[#e5e4dd] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#81927e]" name="password" required type="password" />
            </label>
            {error && <p className="mt-4 rounded-xl bg-[#fbf2ef] px-4 py-3 text-sm text-[#874f43]" role="alert">{error}</p>}
            <button className="mt-6 w-full rounded-full bg-[#35483a] px-5 py-3.5 text-sm font-medium text-white hover:bg-[#26372b] disabled:opacity-60" disabled={submitting} type="submit">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      )}
      {error && authenticated && <p className="mt-4 text-sm text-[#874f43]" role="alert">{error}</p>}
    </main>
  );
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatCard({ label, value, detail }) {
  return (
    <article className="motion-rise rounded-2xl border border-[#e9e8e1] bg-white p-5 shadow-[0_8px_28px_rgba(41,53,45,0.035)]">
      <p className="text-xs font-medium text-[#777c74]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#29352d]">{value}</p>
      <p className="mt-1 text-[11px] text-[#92958e]">{detail}</p>
    </article>
  );
}

function OrderCard({ order, index }) {
  const isPaid = order.paymentStatus === "PAID" || order.paymentStatus === "DEMO_PAID";
  const paymentLabel = order.paymentMethod === "COD"
    ? "Cash on delivery"
    : order.paymentMethod === "UPI" ? "UPI" : "Card";

  return (
    <article className="motion-rise overflow-hidden rounded-2xl border border-[#e9e8e1] bg-white shadow-[0_8px_28px_rgba(41,53,45,0.035)]" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eeede7] bg-[#fbfaf7] px-5 py-4 sm:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#85897f]">Order</p>
          <h2 className="mt-1 break-all text-sm font-semibold text-[#30372f]">{order.id}</h2>
          <p className="mt-1 text-xs text-[#777c74]">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${isPaid ? "bg-[#eaf2e9] text-[#416447]" : "bg-[#f8f0e2] text-[#88682d]"}`}>
          {order.paymentStatus === "DEMO_PAID" ? "Demo payment" : isPaid ? "Paid" : order.paymentStatus.replaceAll("_", " ")}
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_1.2fr_auto]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#92958e]">Customer</p>
          <p className="mt-2 text-sm font-medium text-[#30372f]">{order.account.name}</p>
          <a className="mt-1 block break-all text-xs text-[#526b57] hover:underline" href={`mailto:${order.account.email}`}>{order.account.email}</a>
          <a className="mt-1 block text-xs text-[#62675f] hover:text-[#526b57]" href={`tel:${order.phone}`}>{order.phone}</a>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#92958e]">Delivery address</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4c554b]">{order.address}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#92958e]">Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</p>
          <ul className="mt-2 space-y-2">
            {order.items.map((item) => (
              <li className="flex justify-between gap-3 text-xs" key={item.id}>
                <span className="min-w-0 text-[#4c554b]">{item.name}<span className="text-[#92958e]"> × {item.quantity}</span><span className="mt-0.5 block text-[10px] text-[#92958e]">SKU {item.sku}</span></span>
                <span className="shrink-0 font-medium text-[#30372f]">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[#eeede7] pt-4 sm:col-span-2 lg:col-span-1 lg:items-end lg:border-0 lg:pt-0">
          <div className="lg:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#92958e]">Payment</p>
            <p className="mt-2 text-sm font-medium text-[#30372f]">{paymentLabel}</p>
            <p className="mt-1 text-[11px] text-[#777c74]">{order.status.replaceAll("_", " ")}</p>
          </div>
          <p className="text-lg font-semibold tracking-[-0.03em] text-[#29352d]">{formatPrice(order.total)}</p>
        </div>
      </div>
    </article>
  );
}
