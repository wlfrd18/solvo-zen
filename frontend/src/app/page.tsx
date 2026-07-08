"use client";

import { AlertTriangle, ArrowRight, Calendar, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatAmount, formatDate } from "@/lib/format";
import type { ProjectionResponse, SafeToSpendResponse } from "@/types/budget";

// lucide-react 1.23.0 ne fournit plus d'icones de marque (Github/Linkedin retirees).
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function HomePage() {
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

      <footer className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-4 text-xs text-muted sm:flex-row sm:justify-center sm:gap-4">
        <span>Solvo — un projet de Wilfried Guele</span>
        <div className="flex items-center gap-3">
          <a
            href="https://www.github.com/wlfrd18"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/wilfried-guele-5a456a190/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        </div>
      </footer>
      </>
    </AppShell>
  );
}
