"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { RecurringItemsCard } from "@/components/budget/RecurringItemsCard";
import { StartingBalanceCard } from "@/components/budget/StartingBalanceCard";

export default function SetupPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Configuration</h1>
          <p className="text-sm text-muted">
            Renseignez vos revenus et dépenses récurrents une seule fois : Solvo se charge du reste.
          </p>
        </div>

        <StartingBalanceCard />

        <RecurringItemsCard
          title="Revenus récurrents"
          description="Salaire, allocations, aide au logement..."
          icon={TrendingUp}
          apiPath="/budget/incomes/"
          addButtonLabel="Ajouter un revenu"
          emptyMessage="Aucun revenu récurrent configuré pour le moment."
          amountAccent="positive"
        />

        <RecurringItemsCard
          title="Dépenses fixes récurrentes"
          description="Loyer, abonnements, assurances..."
          icon={TrendingDown}
          apiPath="/budget/expenses/"
          addButtonLabel="Ajouter une dépense"
          emptyMessage="Aucune dépense fixe configurée pour le moment."
          amountAccent="danger"
        />
      </div>
    </AppShell>
  );
}
