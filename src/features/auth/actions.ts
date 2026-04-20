"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/features/auth/validators";
import type { AuthActionState } from "@/features/auth/state";
import {
  registerUser,
  UserAlreadyExistsError,
} from "@/server/use-cases/auth/register-user";

function extractLoginInput(formData: FormData): LoginInput {
  return {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

function extractRegisterInput(formData: FormData): RegisterInput {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedCredentials = loginSchema.safeParse(extractLoginInput(formData));

  if (!parsedCredentials.success) {
    return {
      error: parsedCredentials.error.issues[0]?.message ?? "Проверьте форму входа.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: "/dashboard",
    });

    return {
      error: null,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Неверный email или пароль."
            : "Не удалось выполнить вход. Попробуйте снова.",
      };
    }

    throw error;
  }
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedRegistration = registerSchema.safeParse(
    extractRegisterInput(formData),
  );

  if (!parsedRegistration.success) {
    return {
      error:
        parsedRegistration.error.issues[0]?.message ??
        "Проверьте форму регистрации.",
    };
  }

  try {
    await registerUser(parsedRegistration.data);
    await signIn("credentials", {
      email: parsedRegistration.data.email,
      password: parsedRegistration.data.password,
      redirectTo: "/dashboard",
    });

    return {
      error: null,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof UserAlreadyExistsError) {
      return {
        error: error.message,
      };
    }

    if (error instanceof AuthError) {
      return {
        error: "Аккаунт создан, но автоматический вход не удался.",
      };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
