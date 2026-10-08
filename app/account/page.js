"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [mode, setMode] = useState("register");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    fetch("/api/accounts/session")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        setAccount(result.data);
      })
      .catch((error) => console.error("Unable to check customer session:", error));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    const formData = new FormData(form);

    try {
      const response = await fetch(mode === "register" ? "/api/accounts" : "/api/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to continue.");
      setAccount(result.data);
      setStatus({ type: "success", message: mode === "register" ? "Your account is ready. Welcome to Nook & Co.!" : "You are signed in." });
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
        window.location.assign(returnTo);
      } else {
        form.reset();
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function signOut() {
    const response = await fetch("/api/accounts/session", { method: "DELETE" });
    if (!response.ok) {
      setStatus({ type: "error", message: "Unable to sign out. Please try again." });
      return;
    }
    setAccount(null);
    setStatus({ type: "success", message: "You are signed out." });
  }

  return (
    <main className="mx-auto grid min-h-[68vh] max-w-[1320px] items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_0.85fr] lg:px-8 lg:py-16">
      <section className="lg:pl-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8978]">A little more you</p>
        <h1 className="mt-3 max-w-lg font-serif text-4xl leading-tight tracking-[-0.04em] text-[#293029] sm:text-5xl">Make yourself at home.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-[#70756d]">Sign in or create an account to enjoy a more personal Nook & Co. experience and place your orders.</p>
      </section>

      <section className="w-full rounded-3xl border border-[#e9e8e1] bg-white p-5 shadow-[0_18px_55px_rgba(41,53,45,0.07)] sm:p-8 lg:justify-self-end">
        {account ? (
          <>
            <h2 className="font-serif text-2xl text-[#293029]">Welcome, {account.name}</h2>
            <p className="mt-2 text-sm text-[#777c74]">{account.email}</p>
            <Link className="mt-6 block rounded-full bg-[#35483a] px-5 py-3.5 text-center text-sm font-medium text-white hover:bg-[#26372b]" href="/cart">Go to your shopping bag</Link>
            <button className="mt-4 w-full text-sm text-[#526b57] hover:underline" onClick={signOut} type="button">Sign out</button>
          </>
        ) : (
          <>
            <div className="flex gap-6 border-b border-[#eeede7]">
              <button className={`pb-3 text-sm font-medium ${mode === "register" ? "border-b-2 border-[#526b57] text-[#35483a]" : "text-[#85897f]"}`} onClick={() => { setMode("register"); setStatus({ type: "", message: "" }); }} type="button">Create account</button>
              <button className={`pb-3 text-sm font-medium ${mode === "login" ? "border-b-2 border-[#526b57] text-[#35483a]" : "text-[#85897f]"}`} onClick={() => { setMode("login"); setStatus({ type: "", message: "" }); }} type="button">Sign in</button>
            </div>
            <h2 className="mt-5 font-serif text-2xl text-[#293029]">{mode === "register" ? "Create your account" : "Welcome back"}</h2>
            <p className="mt-1 text-sm text-[#777c74]">{mode === "register" ? "Your password is securely encrypted." : "Sign in to continue shopping."}</p>
            <form className="mt-5" onSubmit={handleSubmit}>
              {mode === "register" && (
                <label className="block text-xs font-medium text-[#62675f]">
                  Full name
                  <input autoComplete="name" className="mt-2 w-full rounded-xl border border-[#e5e4dd] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#81927e]" maxLength={80} minLength={2} name="name" placeholder="Your name" required />
                </label>
              )}
              <label className="mt-4 block text-xs font-medium text-[#62675f]">
                Email address
                <input autoComplete="email" className="mt-2 w-full rounded-xl border border-[#e5e4dd] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#81927e]" maxLength={254} name="email" placeholder="you@example.com" required type="email" />
              </label>
              <label className="mt-4 block text-xs font-medium text-[#62675f]">
                Password
                <input autoComplete={mode === "register" ? "new-password" : "current-password"} className="mt-2 w-full rounded-xl border border-[#e5e4dd] bg-[#fcfbf8] px-4 py-3 text-sm outline-none focus:border-[#81927e]" maxLength={128} minLength={mode === "register" ? 10 : 1} name="password" placeholder={mode === "register" ? "At least 10 characters" : "Your password"} required type="password" />
              </label>
              {status.message && <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${status.type === "success" ? "bg-[#eef4ec] text-[#405e43]" : "bg-[#fbf2ef] text-[#874f43]"}`} role="status">{status.message}</p>}
              <button className="mt-6 w-full rounded-full bg-[#35483a] px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#26372b] disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
            </form>
            <p className="mt-5 text-center text-xs text-[#777c74]">Looking for the staff portal? <Link className="font-medium text-[#526b57] hover:underline" href="/admin">Admin sign in</Link></p>
          </>
        )}
        {!account && status.message && status.type === "success" && <p className="sr-only" role="status">{status.message}</p>}
      </section>
    </main>
  );
}
