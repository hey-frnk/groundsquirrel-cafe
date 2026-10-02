"use client";

import { useId, useState } from "react";

/**
 * "Your country isn't on the list?" — a small form that puts someone on the
 * shipping waitlist.
 *
 * The site is a static export with no mail server, so the form posts to
 * Web3Forms, which forwards each entry as an email to hello@thegroundsquirrel.cafe.
 * Its access key is public by design (it can only ever send to that one
 * address) and is set as NEXT_PUBLIC_WAITLIST_ACCESS_KEY. Until it is set, the
 * button opens a prefilled email instead, so the waitlist works either way.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WAITLIST_ACCESS_KEY;
const INBOX = "hello@thegroundsquirrel.cafe";

type Status = "idle" | "sending" | "done" | "error";

export default function Waitlist({
  product,
  compact = false,
}: {
  /** Named in the email, so the list shows what someone was hoping to buy. */
  product?: string;
  compact?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const country = String(form.get("country") ?? "").trim();
    const subject = `Shipping waitlist: ${country}`;

    if (!ACCESS_KEY) {
      const body = `Name: ${name}\nEmail: ${email}\nCountry: ${country}${
        product ? `\nProduct: ${product}` : ""
      }`;
      window.location.href = `mailto:${INBOX}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      setStatus("done");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject,
          from_name: "Ground Squirrel Shop",
          name,
          email,
          country,
          product: product ?? "",
          // Honeypot: real visitors never see or fill this field.
          botcheck: form.get("botcheck") ? true : "",
        }),
      });
      const result = await response.json().catch(() => null);
      setStatus(response.ok && result?.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const text = compact ? "text-xs" : "text-sm";
  const field =
    "w-full rounded-lg border border-ink/20 bg-paper px-3 py-2.5 text-sm focus:border-rose focus:outline-none";

  return (
    <div className={text}>
      <p className="leading-relaxed text-graphite/80">
        Your country isn&rsquo;t on the list?{" "}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-form`}
          className="text-ink underline decoration-rose underline-offset-4 transition-colors hover:text-rose"
        >
          Join the waitlist
        </button>{" "}
        and I&rsquo;ll let you know as soon as I can ship to your country again.
      </p>

      {open && (
        <div id={`${id}-form`} className="mt-4">
          {status === "done" ? (
            <p className="rounded-xl border border-ink/10 bg-ivory/25 px-4 py-3 text-ink">
              {ACCESS_KEY
                ? "Thank you, you're on the list. I'll be in touch."
                : "Your email program should open now. Just press send."}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label htmlFor={`${id}-name`} className="sr-only">
                  Name
                </label>
                <input
                  id={`${id}-name`}
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Name"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email"
                  className={field}
                />
              </div>
              <div>
                <label htmlFor={`${id}-country`} className="sr-only">
                  Country
                </label>
                <input
                  id={`${id}-country`}
                  name="country"
                  required
                  autoComplete="country-name"
                  placeholder="Country"
                  className={field}
                />
              </div>
              <input
                type="checkbox"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn btn-outline w-full disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Put me on the waitlist"}
              </button>
              {status === "error" && (
                <p className="text-rose">
                  That didn&rsquo;t go through. Please try again or write to{" "}
                  <a href={`mailto:${INBOX}`} className="underline">
                    {INBOX}
                  </a>
                  .
                </p>
              )}
              <p className="text-[0.7rem] leading-relaxed text-graphite/60">
                Only used to tell you when shipping opens. See the{" "}
                <a href="/datenschutz/" className="underline">
                  privacy policy
                </a>
                .
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
