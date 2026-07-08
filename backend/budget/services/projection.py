"""Moteur de projection du solde jour par jour.

C'est le coeur de calcul de Solvo : a partir d'un solde de depart et
des revenus/depenses recurrents (+ depenses ponctuelles), on simule
l'evolution du solde jour apres jour sur un horizon donne, sans que
l'utilisateur ait besoin de saisir quoi que ce soit au quotidien.
"""
import calendar
from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable, List, Optional


@dataclass
class DayEvent:
    label: str
    amount: Decimal  # signe : positif pour un revenu, negatif pour une depense
    kind: str  # "income" | "fixed_expense" | "one_time_expense"


@dataclass
class ProjectionDay:
    date: date
    balance: Decimal
    events: List[DayEvent] = field(default_factory=list)


@dataclass
class ProjectionResult:
    days: List[ProjectionDay]
    lowest_balance: Decimal
    lowest_balance_date: date
    has_overdraft_risk: bool
    overdraft_alerts: List[dict]


def _occurs_on(day_of_month: int, target: date) -> bool:
    """Un element recurrent programme au jour `day_of_month` tombe-t-il sur `target` ?

    Les mois plus courts que `day_of_month` sont geres par un clamp sur
    le dernier jour du mois : un loyer programme le 31 tombera donc le
    28 (ou 29) fevrier plutot que d'etre saute ce mois-la.
    """
    last_day_of_target_month = calendar.monthrange(target.year, target.month)[1]
    effective_day = min(day_of_month, last_day_of_target_month)
    return target.day == effective_day


def compute_projection(
    starting_balance: Decimal,
    incomes: Iterable,
    fixed_expenses: Iterable,
    one_time_expenses: Iterable,
    start_date: Optional[date] = None,
    horizon_days: int = 35,
) -> ProjectionResult:
    """Calcule le solde jour par jour sur `horizon_days` jours a partir de `start_date`.

    Hypothese cle : `starting_balance` est le solde tel qu'il est a
    l'instant present, et les evenements programmes pour aujourd'hui
    n'ont pas encore ete appliques. Le jour 0 (aujourd'hui) applique
    donc lui aussi les revenus/depenses du jour, en plus des jours
    suivants.
    """
    if start_date is None:
        start_date = date.today()
    if horizon_days < 1:
        raise ValueError("horizon_days doit etre >= 1")

    active_incomes = [i for i in incomes if i.is_active]
    active_expenses = [e for e in fixed_expenses if e.is_active]

    one_time_by_date = {}
    for ote in one_time_expenses:
        one_time_by_date.setdefault(ote.date, []).append(ote)

    balance = starting_balance
    days: List[ProjectionDay] = []
    lowest_balance = balance
    lowest_balance_date = start_date

    for offset in range(horizon_days):
        current_date = start_date + timedelta(days=offset)
        events: List[DayEvent] = []

        for income in active_incomes:
            if _occurs_on(income.day_of_month, current_date):
                balance += income.amount
                events.append(DayEvent(income.label, income.amount, "income"))

        for expense in active_expenses:
            if _occurs_on(expense.day_of_month, current_date):
                balance -= expense.amount
                events.append(DayEvent(expense.label, -expense.amount, "fixed_expense"))

        for ote in one_time_by_date.get(current_date, []):
            balance -= ote.amount
            events.append(DayEvent(ote.label, -ote.amount, "one_time_expense"))

        days.append(ProjectionDay(date=current_date, balance=balance, events=events))

        if balance < lowest_balance:
            lowest_balance = balance
            lowest_balance_date = current_date

    # Alerte : une depense fait passer le solde sous zero avant une rentree
    # d'argent prevue. On remonte chaque jour concerne pour que le
    # frontend puisse pointer precisement la ou ca coince.
    overdraft_alerts = [
        {
            "date": day.date,
            "balance": day.balance,
            "triggered_by": [e.label for e in day.events if e.amount < 0],
        }
        for day in days
        if day.balance < 0
    ]

    return ProjectionResult(
        days=days,
        lowest_balance=lowest_balance,
        lowest_balance_date=lowest_balance_date,
        has_overdraft_risk=lowest_balance < 0,
        overdraft_alerts=overdraft_alerts,
    )
