import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Регистрация"
      title="Создание аккаунта"
      description="После регистрации пользователь сразу получает профиль и базовый доступ, чтобы кабинет, лимиты и покупки работали как единая система."
      footerLabel="Уже есть аккаунт?"
      footerHref="/login"
      footerLinkText="Войти"
    >
      <div className="space-y-2">
        <h2 className="font-serif text-4xl text-foreground">Начать работу</h2>
        <p className="text-sm leading-7 text-muted">
          Создайте аккаунт, чтобы связать анализы, разовые покупки и подписку
          внутри одного профиля.
        </p>
      </div>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
