import { Calendar, Gauge, Repeat, Wallet } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: Repeat,
    title: "Configuration unique",
    description: "Renseignez une seule fois vos revenus et dépenses récurrents.",
  },
  {
    icon: Calendar,
    title: "Projection automatique",
    description: "Votre solde est projeté jour par jour, sans que vous ayez à y penser.",
  },
  {
    icon: Gauge,
    title: "Safe-to-spend en temps réel",
    description: "Un montant disponible recalculé automatiquement à chaque changement.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background px-4 pb-10 pt-8 md:px-8 md:pt-14">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <header className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-brand" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">Solvo</span>
        </header>

        <section className="mt-12 flex flex-col items-center gap-4 text-center md:mt-16">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Sachez exactement combien vous pouvez dépenser aujourd&apos;hui, sans y penser.
          </h1>
          <p className="max-w-xl text-sm text-muted md:text-base">
            Solvo calcule automatiquement votre reste à vivre à partir de vos revenus et
            dépenses récurrents, jour après jour.
          </p>
          <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              Se connecter
            </Link>
          </div>
        </section>

        <section className="mt-16 md:mt-20">
          <Card>
            <h2 className="text-base font-semibold">Le problème du reste à vivre au quotidien</h2>
            <p className="mt-2 text-sm text-muted">
              Salaire, allocations, aide au logement : les revenus tombent à des dates
              différentes chaque mois. Entre ces échéances et les dépenses fixes qui
              suivent leur propre calendrier, il est difficile de savoir combien il reste
              vraiment à dépenser sans risquer le découvert.
            </p>
          </Card>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex flex-col gap-3">
              <Icon className="h-5 w-5 text-brand" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
            </Card>
          ))}
        </section>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <Footer />
      </div>
    </div>
  );
}
