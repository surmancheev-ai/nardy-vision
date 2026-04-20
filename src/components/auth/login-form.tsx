"use client";

import { useActionState } from "react";
import { loginAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/state";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-[22px] border border-line bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Минимум 8 символов"
          className="w-full rounded-[22px] border border-line bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          required
        />
      </div>

      {state.error ? (
        <p className="rounded-[20px] border border-[#d9b7a6] bg-[#fff1ea] px-4 py-3 text-sm text-[#8d4a2d]">
          {state.error}
        </p>
      ) : null}

      <AuthSubmitButton
        idleLabel="Войти в кабинет"
        pendingLabel="Выполняем вход..."
      />
    </form>
  );
}
