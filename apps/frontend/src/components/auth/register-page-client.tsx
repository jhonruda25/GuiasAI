"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth/auth-form";
import { useAuthSession } from "@/hooks/use-auth-session";
import { registerUser } from "@/services/auth.api";
import { useSessionStore } from "@/store/session.store";

export function RegisterPageClient() {
  const router = useRouter();
  const { user, hydrated, loading } = useAuthSession();
  const setUser = useSessionStore((state) => state.setUser);
  const [fullName, setFullName] = useState("");
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
      const response = await registerUser({ fullName, email, password });
      setUser(response.user);
      router.replace("/");
    } catch (caughtError) {
      const axiosError = caughtError as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ??
          "No fue posible crear la cuenta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      title="Crea tu cuenta docente"
      description="Configura una sesion segura para que cada guia quede vinculada a tu historial y a tus revisiones."
      submitLabel="Crear cuenta"
      footerLabel="Ya tienes cuenta?"
      footerHref="/login"
      footerLinkText="Iniciar sesion"
      onSubmit={handleSubmit}
      loading={submitting}
      error={error}
    >
      <AuthField
        id="fullName"
        label="Nombre completo"
        autoComplete="name"
        value={fullName}
        onChange={setFullName}
      />
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
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
      />
    </AuthForm>
  );
}
