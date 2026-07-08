"use client";

import { LucideIcon, PlusCircle, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Field";
import { api, ApiError } from "@/lib/api";
import { formatAmount } from "@/lib/format";

export interface RecurringItem {
  id: number;
  label: string;
  amount: string;
  day_of_month: number;
  is_active: boolean;
}

interface RecurringItemsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  apiPath: string;
  addButtonLabel: string;
  emptyMessage: string;
  amountAccent: "positive" | "danger";
}

export function RecurringItemsCard({
  title,
  description,
  icon: Icon,
  apiPath,
  addButtonLabel,
  emptyMessage,
  amountAccent,
}: RecurringItemsCardProps) {
  const [items, setItems] = useState<RecurringItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<RecurringItem[]>(apiPath)
      .then(setItems)
      .catch(() => setError("Impossible de charger les donnees."));
  }, [apiPath]);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.post<RecurringItem>(apiPath, {
        label,
        amount,
        day_of_month: Number(dayOfMonth),
      });
      setItems((prev) => [...(prev ?? []), created]);
      setLabel("");
      setAmount("");
      setDayOfMonth("1");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? "Verifiez les valeurs saisies." : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const previous = items;
    setItems((prev) => (prev ?? []).filter((item) => item.id !== id));
    try {
      await api.delete(`${apiPath}${id}/`);
    } catch {
      setItems(previous ?? null);
      setError("Suppression impossible.");
    }
  }

  async function handleToggleActive(item: RecurringItem) {
    const nextActive = !item.is_active;
    setItems((prev) =>
      (prev ?? []).map((i) => (i.id === item.id ? { ...i, is_active: nextActive } : i))
    );
    try {
      await api.patch(`${apiPath}${item.id}/`, { is_active: nextActive });
    } catch {
      setItems((prev) =>
        (prev ?? []).map((i) => (i.id === item.id ? { ...i, is_active: item.is_active } : i))
      );
      setError("Mise a jour impossible.");
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 text-brand" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted">{description}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setShowForm((v) => !v)} aria-label={addButtonLabel}>
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      {error && (
        <div className="mt-4">
          <Alert variant="danger" title={error} />
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border p-4">
          <div className="col-span-2">
            <Input label="Libelle" value={label} onChange={(e) => setLabel(e.target.value)} required />
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
          <Input
            label="Jour du mois"
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            required
          />
          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Ajout..." : addButtonLabel}
            </Button>
          </div>
        </form>
      )}

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {items === null && <li className="py-3 text-sm text-muted">Chargement...</li>}
        {items !== null && items.length === 0 && (
          <li className="py-3 text-sm text-muted">{emptyMessage}</li>
        )}
        {items?.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <button
              onClick={() => handleToggleActive(item)}
              className="flex flex-1 items-center gap-3 text-left"
              title={item.is_active ? "Cliquer pour desactiver" : "Cliquer pour reactiver"}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  item.is_active ? "bg-positive" : "bg-muted/40"
                }`}
                aria-hidden="true"
              />
              <span className={`text-sm font-medium ${item.is_active ? "" : "text-muted line-through"}`}>
                {item.label}
              </span>
              <span className="text-xs text-muted">le {item.day_of_month}</span>
            </button>
            <span
              className={`text-sm font-semibold ${
                amountAccent === "positive" ? "text-positive" : "text-danger"
              } ${item.is_active ? "" : "opacity-40"}`}
            >
              {amountAccent === "positive" ? "+" : "-"}
              {formatAmount(item.amount)}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              aria-label={`Supprimer ${item.label}`}
              className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
