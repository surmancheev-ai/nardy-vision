"use client";

import { useActionState } from "react";
import { registerAction } from "@/features/auth/actions";
import { initialAuthActionState } from "@/features/auth/state";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

export function RegisterForm() {
  const [state, formAction] = useActionState(
    registerAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Имя
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ваше имя"
          className="w-full rounded-[22px] border border-line bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
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

      <div className="grid gap-5 sm:grid-cols-2">
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
            autoComplete="new-password"
            placeholder="Минимум 8 символов"
            className="w-full rounded-[22px] border border-line bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Повторите пароль
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Повторите пароль"
            className="w-full rounded-[22px] border border-line bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            required
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-[20px] border border-[#d9b7a6] bg-[#fff1ea] px-4 py-3 text-sm text-[#8d4a2d]">
          {state.error}
        </p>
      ) : null}

      <AuthSubmitButton
        idleLabel="Создать аккаунт"
        pendingLabel="Создаем аккаунт..."
      />
    </form>
  );
}
