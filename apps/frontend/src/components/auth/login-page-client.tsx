"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth/auth-form";
import { useAuthSession } from "@/hooks/use-auth-session";
import { loginUser } from "@/services/auth.api";
import { useSessionStore } from "@/store/session.store";

export function LoginPageClient() {
  const router = useRouter();
  const { user, hydrated, loading } = useAuthSession();
  const setUser = useSessionStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !loading && user) {
      router.replace("/");
    }
  }, [hydrated, loading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await loginUser({ email, password });
      setUser(response.user);
      router.replace("/");
    } catch (caughtError) {
      const axiosError = caughtError as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ??
          "No fue posible iniciar sesion.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Bienvenido de nuevo"
      description="Accede a tu espacio privado para generar, revisar y exportar guias pedagogicas."
      submitLabel="Iniciar sesion"
      footerLabel="Aun no tienes cuenta?"
      footerHref="/register"
      footerLinkText="Crear cuenta"
      onSubmit={handleSubmit}
      loading={submitting}
      error={error}
    >
      <AuthField
        id="email"
        label="Correo"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />
      <AuthField
        id="password"
        label="Contrasena"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />
    </AuthForm>
  );
}
