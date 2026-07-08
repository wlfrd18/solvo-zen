"use client";

import { Wallet } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Field";
import { api } from "@/lib/api";
import type { StartingBalance } from "@/types/budget";

export function StartingBalanceCard({ onUpdated }: { onUpdated?: () => void }) {
  const [balance, setBalance] = useState<StartingBalance | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<StartingBalance>("/budget/starting-balance/").then((data) => {
      setBalance(data);
      setAmount(data.amount);
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await api.put<StartingBalance>("/budget/starting-balance/", { amount });
      setBalance(updated);
      setSaved(true);
      onUpdated?.();
    } catch {
      setError("Impossible d'enregistrer le solde.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold">Solde de départ</h2>
          <p className="text-sm text-muted">
            Le solde actuel de votre compte. Il sert de base à toute la projection.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Montant (EUR)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={submitting || balance === null}>
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>

      {error && (
        <div className="mt-3">
          <Alert variant="danger" title={error} />
        </div>
      )}
      {saved && !error && (
        <p className="mt-3 text-xs text-positive">Solde mis à jour.</p>
      )}
      {balance && (
        <p className="mt-3 text-xs text-muted">
          Dernière mise à jour : {new Date(balance.updated_at).toLocaleString("fr-FR")}
        </p>
      )}
    </Card>
  );
}
