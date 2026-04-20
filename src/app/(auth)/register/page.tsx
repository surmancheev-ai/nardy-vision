import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Create account"
      title="Регистрация в платформе"
      description="При создании аккаунта мы сразу подготавливаем пользовательскую сущность и базовую Free-подписку, чтобы кабинет, лимиты и биллинг работали как единая система."
      footerLabel="Уже есть аккаунт?"
      footerHref="/login"
      footerLinkText="Войти"
    >
      <div className="space-y-2">
        <h2 className="font-serif text-4xl text-foreground">Начать с MVP-основы</h2>
        <p className="text-sm leading-7 text-muted">
          Создайте аккаунт, чтобы позже связать анализы, разовые покупки и
          подписку внутри одного профиля.
        </p>
      </div>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </AuthShell>
  );
}
