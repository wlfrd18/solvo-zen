"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { OneTimeExpenseForm } from "@/components/budget/OneTimeExpenseForm";
import { api } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import type { ProjectionResponse, SafeToSpendResponse } from "@/types/budget";

export default function ProjectionPage() {
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    Promise.all([
      api.get<ProjectionResponse>("/budget/projection/"),
      api.get<SafeToSpendResponse>("/budget/safe-to-spend/"),
    ])
      .then(([proj, sts]) => {
        setProjection(proj);
        setSafeToSpend(sts);
      })
      .catch(() => setError("Impossible de charger la projection."));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projection</h1>
          <p className="text-sm text-muted">Solde estime jour par jour sur les prochaines semaines.</p>
        </div>

        {error && <Alert variant="danger" title={error} />}

        {safeToSpend && (
          <Card className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Budget quotidien recalibre
            </span>
            <span className="text-2xl font-bold text-brand-strong">
              {formatAmount(safeToSpend.daily_budget)}/jour
            </span>
            <span className="text-xs text-muted">
              {safeToSpend.has_upcoming_income && safeToSpend.next_income_date
                ? `${safeToSpend.days_remaining} jours restants jusqu'au ${formatDate(safeToSpend.next_income_date, true)}`
                : `estimation sur ${safeToSpend.days_remaining} jours, aucun revenu recurrent configure`}
            </span>
          </Card>
        )}

        <OneTimeExpenseForm onAdded={refresh} />

        {projection && (
          <Card className="p-0">
            <ul className="flex flex-col divide-y divide-border">
              {projection.days.map((day) => {
                const isLowest = day.date === projection.lowest_balance_date;
                const isNegative = Number(day.balance) < 0;
                return (
                  <li
                    key={day.date}
                    className={`flex flex-col gap-1 px-5 py-3 ${isLowest ? "bg-warning/10" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{formatDate(day.date)}</span>
                      <span
                        className={`text-sm font-semibold ${
                          isNegative ? "text-danger" : "text-foreground"
                        }`}
                      >
                        {formatAmount(day.balance)}
                      </span>
                    </div>
                    {isLowest && (
                      <span className="text-xs font-medium text-warning">Point bas de la periode</span>
                    )}
                    {day.events.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {day.events.map((event, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                              event.kind === "income"
                                ? "border-positive/30 text-positive"
                                : "border-danger/30 text-danger"
                            }`}
                          >
                            {event.kind === "income" ? (
                              <TrendingUp className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <TrendingDown className="h-3 w-3" aria-hidden="true" />
                            )}
                            {event.label} ({formatAmount(event.amount)})
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
