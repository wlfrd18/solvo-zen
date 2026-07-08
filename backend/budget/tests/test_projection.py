from datetime import date
from decimal import Decimal

from budget.services.projection import compute_projection

from .factories import FakeOneTimeExpense, FakeRecurringItem


def test_projection_applies_income_and_expense_on_the_right_days():
    start_date = date(2026, 7, 1)
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=5)
    expense = FakeRecurringItem(label="Loyer", amount=Decimal("300"), day_of_month=10)

    result = compute_projection(
        starting_balance=Decimal("100"),
        incomes=[income],
        fixed_expenses=[expense],
        one_time_expenses=[],
        start_date=start_date,
        horizon_days=15,
    )

    balances_by_date = {day.date: day.balance for day in result.days}

    assert balances_by_date[date(2026, 7, 1)] == Decimal("100")
    assert balances_by_date[date(2026, 7, 4)] == Decimal("100")
    assert balances_by_date[date(2026, 7, 5)] == Decimal("600")
    assert balances_by_date[date(2026, 7, 9)] == Decimal("600")
    assert balances_by_date[date(2026, 7, 10)] == Decimal("300")
    assert balances_by_date[date(2026, 7, 15)] == Decimal("300")


def test_projection_lowest_balance_is_detected():
    start_date = date(2026, 7, 1)
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=5)
    expense = FakeRecurringItem(label="Loyer", amount=Decimal("300"), day_of_month=10)

    result = compute_projection(
        starting_balance=Decimal("100"),
        incomes=[income],
        fixed_expenses=[expense],
        one_time_expenses=[],
        start_date=start_date,
        horizon_days=15,
    )

    assert result.lowest_balance == Decimal("100")
    assert result.lowest_balance_date == date(2026, 7, 1)


def test_projection_flags_overdraft_when_expense_precedes_income():
    start_date = date(2026, 7, 1)
    # Le loyer tombe le 3, la bourse seulement le 20 : le solde passe
    # sous zero et doit declencher une alerte de decouvert.
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=20)
    expense = FakeRecurringItem(label="Loyer", amount=Decimal("300"), day_of_month=3)

    result = compute_projection(
        starting_balance=Decimal("100"),
        incomes=[income],
        fixed_expenses=[expense],
        one_time_expenses=[],
        start_date=start_date,
        horizon_days=25,
    )

    assert result.has_overdraft_risk is True
    assert any(alert["date"] == date(2026, 7, 3) for alert in result.overdraft_alerts)
    assert result.lowest_balance == Decimal("-200")


def test_projection_clamps_day_of_month_on_short_months():
    # Fevrier 2026 (non bissextile) n'a que 28 jours : un element
    # programme le 31 doit se declencher le 28.
    start_date = date(2026, 2, 1)
    expense = FakeRecurringItem(label="Abonnement", amount=Decimal("10"), day_of_month=31)

    result = compute_projection(
        starting_balance=Decimal("100"),
        incomes=[],
        fixed_expenses=[expense],
        one_time_expenses=[],
        start_date=start_date,
        horizon_days=28,
    )

    balances_by_date = {day.date: day.balance for day in result.days}
    assert balances_by_date[date(2026, 2, 28)] == Decimal("90")


def test_projection_applies_one_time_expense_on_exact_date():
    start_date = date(2026, 7, 1)
    one_time = FakeOneTimeExpense(label="Reparation velo", amount=Decimal("45"), date=date(2026, 7, 6))

    result = compute_projection(
        starting_balance=Decimal("200"),
        incomes=[],
        fixed_expenses=[],
        one_time_expenses=[one_time],
        start_date=start_date,
        horizon_days=10,
    )

    balances_by_date = {day.date: day.balance for day in result.days}
    assert balances_by_date[date(2026, 7, 5)] == Decimal("200")
    assert balances_by_date[date(2026, 7, 6)] == Decimal("155")


def test_projection_ignores_inactive_recurring_items():
    start_date = date(2026, 7, 1)
    inactive_income = FakeRecurringItem(
        label="Ancien job", amount=Decimal("1000"), day_of_month=5, is_active=False
    )

    result = compute_projection(
        starting_balance=Decimal("50"),
        incomes=[inactive_income],
        fixed_expenses=[],
        one_time_expenses=[],
        start_date=start_date,
        horizon_days=10,
    )

    assert all(day.balance == Decimal("50") for day in result.days)
