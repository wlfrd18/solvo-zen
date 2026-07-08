"""Calcul du budget quotidien "safe-to-spend".

Ce module reutilise volontairement `compute_projection` plutot que de
recalculer une somme independante : la balance projetee la veille de
la prochaine rentree d'argent nette deja tous les revenus/depenses
recurrents et ponctuels. Ajouter une depense libre ponctuelle (feature
5 du cahier des charges) modifie cette balance projetee et recalibre
donc automatiquement le budget quotidien des jours restants, sans
logique de calcul dupliquee.
"""
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable, List, Optional

from .projection import compute_projection, _occurs_on

# Fenetre de recherche de la prochaine rentree d'argent : un peu plus de
# deux mois, largement suffisant pour retrouver n'importe quel jour du
# mois meme en tenant compte des mois courts.
NEXT_INCOME_SEARCH_LIMIT_DAYS = 62


@dataclass
class SafeToSpendResult:
    daily_budget: Decimal
    next_income_date: Optional[date]
    days_remaining: int
    balance_before_next_income: Decimal
    has_upcoming_income: bool


def _find_next_income_date(
    incomes: List, start_date: date, search_limit_days: int = NEXT_INCOME_SEARCH_LIMIT_DAYS
) -> Optional[date]:
    active_incomes = [i for i in incomes if i.is_active]
    if not active_incomes:
        return None
    for offset in range(1, search_limit_days + 1):
        candidate = start_date + timedelta(days=offset)
        if any(_occurs_on(i.day_of_month, candidate) for i in active_incomes):
            return candidate
    return None


def compute_safe_to_spend(
    starting_balance: Decimal,
    incomes: Iterable,
    fixed_expenses: Iterable,
    one_time_expenses: Iterable,
    start_date: Optional[date] = None,
    fallback_horizon_days: int = 35,
) -> SafeToSpendResult:
    """(solde + revenus a venir - depenses a venir) / jours restants.

    La fenetre s'arrete la veille de la prochaine rentree d'argent
    recurrente. S'il n'y a aucun revenu configure, on retombe sur
    `fallback_horizon_days` pour donner malgre tout un ordre de
    grandeur (has_upcoming_income=False signale ce cas au frontend).
    """
    if start_date is None:
        start_date = date.today()

    incomes = list(incomes)
    fixed_expenses = list(fixed_expenses)
    one_time_expenses = list(one_time_expenses)

    next_income_date = _find_next_income_date(incomes, start_date)

    if next_income_date is None:
        days_remaining = fallback_horizon_days
        horizon_days = fallback_horizon_days
    else:
        days_remaining = (next_income_date - start_date).days
        horizon_days = days_remaining  # projette jusqu'a la veille de la rentree

    projection = compute_projection(
        starting_balance=starting_balance,
        incomes=incomes,
        fixed_expenses=fixed_expenses,
        one_time_expenses=one_time_expenses,
        start_date=start_date,
        horizon_days=horizon_days,
    )

    balance_before_next_income = projection.days[-1].balance
    daily_budget = balance_before_next_income / days_remaining

    return SafeToSpendResult(
        daily_budget=daily_budget,
        next_income_date=next_income_date,
        days_remaining=days_remaining,
        balance_before_next_income=balance_before_next_income,
        has_upcoming_income=next_income_date is not None,
    )
