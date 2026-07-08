"use client";

import { AlertTriangle, ArrowRight, Calendar, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import type { ProjectionResponse, SafeToSpendResponse } from "@/types/budget";

export default function DashboardPage() {
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendResponse | null>(null);
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<SafeToSpendResponse>("/budget/safe-to-spend/"),
      api.get<ProjectionResponse>("/budget/projection/"),
    ])
      .then(([sts, proj]) => {
        setSafeToSpend(sts);
        setProjection(proj);
      })
      .catch(() => setError("Impossible de charger votre reste a vivre pour le moment."));
  }, []);

  return (
    <AppShell>
      <>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Votre reste a vivre</h1>
          <p className="text-sm text-muted">Calcule automatiquement a partir de votre configuration.</p>
        </div>

        {error && <Alert variant="danger" title={error} />}

        {safeToSpend && (
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-muted">
              Budget quotidien disponible
            </span>
            <span className="text-5xl font-bold tracking-tight text-brand-strong md:text-6xl">
              {formatAmount(safeToSpend.daily_budget)}
              <span className="text-2xl font-semibold text-muted">/jour</span>
            </span>
            <span className="text-sm text-muted">
              {safeToSpend.has_upcoming_income && safeToSpend.next_income_date
                ? `jusqu'au ${formatDate(safeToSpend.next_income_date, true)}`
                : `estime sur les ${safeToSpend.days_remaining} prochains jours (aucun revenu recurrent configure)`}
            </span>
          </Card>
        )}

        {projection?.has_overdraft_risk && (
          <Alert variant="danger" title="Risque de decouvert detecte">
            Le solde projete devient negatif le {formatDate(projection.lowest_balance_date, true)}
            {" "}({formatAmount(projection.lowest_balance)}). Une depense fixe tombe avant une rentree
            d&apos;argent suffisante.
          </Alert>
        )}

        {projection && !projection.has_overdraft_risk && (
          <Alert variant="success" title="Aucun risque de decouvert detecte">
            Point bas projete : {formatAmount(projection.lowest_balance)} le{" "}
            {formatDate(projection.lowest_balance_date, true)}.
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/projection">
            <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-brand">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Voir la projection detaillee</p>
                  <p className="text-xs text-muted">Solde jour par jour</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </Card>
          </Link>

          <Link href="/setup">
            <Card className="flex h-full items-center justify-between gap-3 transition-colors hover:border-brand">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-brand" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Ajuster ma configuration</p>
                  <p className="text-xs text-muted">Revenus, depenses, solde</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </Card>
          </Link>
        </div>

        {projection?.overdraft_alerts && projection.overdraft_alerts.length > 0 && (
          <Card>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
              <h2 className="text-sm font-semibold">Jours a solde negatif</h2>
            </div>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {projection.overdraft_alerts.slice(0, 5).map((alert) => (
                <li key={alert.date} className="flex items-center justify-between py-2 text-sm">
                  <span>{formatDate(alert.date, true)}</span>
                  <span className="font-medium text-danger">{formatAmount(alert.balance)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Footer />
      </>
    </AppShell>
  );
}
