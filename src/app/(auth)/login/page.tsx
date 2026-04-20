import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Sign in"
      title="Вход в личный кабинет"
      description="Авторизация построена на Auth.js с credentials flow. После входа пользователь получает доступ к кабинету, истории анализов и модели entitlements."
      footerLabel="Еще нет аккаунта?"
      footerHref="/register"
      footerLinkText="Создать аккаунт"
    >
      <div className="space-y-2">
        <h2 className="font-serif text-4xl text-foreground">Добро пожаловать</h2>
        <p className="text-sm leading-7 text-muted">
          Войдите, чтобы продолжить работу с аналитикой, тарифом и будущей
          историей разборов.
        </p>
      </div>
      <div className="mt-8">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
