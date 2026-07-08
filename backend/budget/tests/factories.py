"""Petits objets factices utilises par les tests unitaires du moteur de
calcul : ils exposent la meme interface que les modeles Django
(label, amount, day_of_month/date, is_active) sans toucher la base de
donnees, ce qui garde ces tests rapides et independants de l'ORM.
"""
from dataclasses import dataclass
from datetime import date
from decimal import Decimal


@dataclass
class FakeRecurringItem:
    label: str
    amount: Decimal
    day_of_month: int
    is_active: bool = True


@dataclass
class FakeOneTimeExpense:
    label: str
    amount: Decimal
    date: date
