"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
