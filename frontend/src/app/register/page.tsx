"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Field";
import { ApiError } from "@/lib/api";
import { login, register } from "@/lib/auth";

function extractErrorMessage(err: unknown): string {
  if (err instanceof ApiError && err.data && typeof err.data === "object") {
    const data = err.data as Record<string, unknown>;
    const firstField = Object.values(data)[0];
    if (Array.isArray(firstField) && typeof firstField[0] === "string") {
      return firstField[0];
    }
  }
  return "Impossible de creer le compte. Verifiez les informations saisies.";
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password });
      await login(email, password);
      router.replace("/setup");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Wallet className="h-8 w-8 text-brand" aria-hidden="true" />
          <h1 className="text-xl font-semibold tracking-tight">Solvo</h1>
          <p className="text-sm text-muted">Creez votre compte pour demarrer.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert variant="danger" title={error} />}
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Creation..." : "Creer mon compte"}
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-sm text-muted">
          Deja un compte ?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
