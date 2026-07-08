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
            Renseignez vos revenus et depenses recurrents une seule fois : Solvo se charge du reste.
          </p>
        </div>

        <StartingBalanceCard />

        <RecurringItemsCard
          title="Revenus recurrents"
          description="Bourse, salaire, aide au logement..."
          icon={TrendingUp}
          apiPath="/budget/incomes/"
          addButtonLabel="Ajouter un revenu"
          emptyMessage="Aucun revenu recurrent configure pour le moment."
          amountAccent="positive"
        />

        <RecurringItemsCard
          title="Depenses fixes recurrentes"
          description="Loyer, abonnements, assurances..."
          icon={TrendingDown}
          apiPath="/budget/expenses/"
          addButtonLabel="Ajouter une depense"
          emptyMessage="Aucune depense fixe configuree pour le moment."
          amountAccent="danger"
        />
      </div>
    </AppShell>
  );
}
