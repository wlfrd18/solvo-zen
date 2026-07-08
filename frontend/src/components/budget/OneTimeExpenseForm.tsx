"use client";

import { PlusCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Field";
import { api } from "@/lib/api";
import type { OneTimeExpense } from "@/types/budget";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function OneTimeExpenseForm({ onAdded }: { onAdded: (expense: OneTimeExpense) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const created = await api.post<OneTimeExpense>("/budget/one-time-expenses/", {
        label,
        amount,
        date,
      });
      onAdded(created);
      setLabel("");
      setAmount("");
      setDate(today());
      setOpen(false);
    } catch {
      setError("Impossible d'ajouter cette dépense.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        Ajouter une dépense ponctuelle
      </Button>
    );
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Dépense libre ponctuelle</h2>
      <p className="text-sm text-muted">
        Optionnel : recalibre automatiquement votre budget quotidien jusqu&apos;à la prochaine rentrée
        d&apos;argent.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Libellé" value={label} onChange={(e) => setLabel(e.target.value)} required />
        </div>
        <Input
          label="Montant (EUR)"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        {error && (
          <div className="col-span-2">
            <Alert variant="danger" title={error} />
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
