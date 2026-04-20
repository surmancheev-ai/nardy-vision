import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Вход"
      title="Вход в личный кабинет"
      description="Авторизация открывает доступ к истории разборов, личному кабинету, тарифу и будущим покупкам внутри одного профиля."
      footerLabel="Еще нет аккаунта?"
      footerHref="/register"
      footerLinkText="Создать аккаунт"
    >
      <div className="space-y-2">
        <h2 className="font-serif text-4xl text-foreground">С возвращением</h2>
        <p className="text-sm leading-7 text-muted">
          Войдите, чтобы продолжить работу с анализом, тарифом и сохраненной
          историей разборов.
        </p>
      </div>
      <div className="mt-8">
        <LoginForm />
      </div>
    </AuthShell>
  );
}
