"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { AuthField, AuthForm } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
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
      secondaryAction={
        <div className="relative mt-2">
          <div className="relative mt-4 mb-0">
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                O accede rápido
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-2 h-12 w-full rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            onClick={() => {
              setUser({
                id: 'mock-user-id',
                email: 'admin@guiasai.com',
                fullName: 'Profesor Demo',
                role: 'TEACHER',
              });
              router.push("/");
            }}
            type="button"
          >
            Iniciar sesión como profesor
          </Button>
        </div>
      }
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
