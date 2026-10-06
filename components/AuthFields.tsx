"use client";

// Email and password fields shared by Sign up and Log in
import { useState } from "react";

const inputClass =
  "w-full rounded-card-sm border-2 border-transparent bg-surface px-4 text-body text-text " +
  "focus:border-primary focus:outline-none";

export function EmailField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor="email" className="block font-medium">
        Email
      </label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 ${inputClass}`}
      />
    </div>
  );
}

export function PasswordField({
  value,
  onChange,
  isNew,
}: {
  value: string;
  onChange: (v: string) => void;
  isNew: boolean; // true on Sign up, false on Log in
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label htmlFor="password" className="block font-medium">
        Password
      </label>
      <div className="relative mt-2">
        <input
          id="password"
          type={show ? "text" : "password"}
          autoComplete={isNew ? "new-password" : "current-password"}
          required
          minLength={isNew ? 8 : undefined}
          aria-describedby={isNew ? "password-help" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-20`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 rounded-card-sm px-4 text-helper font-medium text-primary"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {isNew && (
        <p id="password-help" className="mt-2 text-helper text-text-muted">
          At least 8 characters.
        </p>
      )}
    </div>
  );
}

// Main teal button. White text only on teal (CLAUDE.md colour rule).
export function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-card bg-primary px-6 font-semibold text-white disabled:bg-surface disabled:text-text-muted"
    >
      {busy ? "Just a moment..." : label}
    </button>
  );
}

// Short, human error message
export function FormMessage({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="rounded-card-sm border-l-4 border-gentle bg-surface px-4 py-3">
      {text}
    </p>
  );
}
