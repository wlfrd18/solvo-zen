from datetime import date
from decimal import Decimal

from budget.services.safe_to_spend import compute_safe_to_spend

from .factories import FakeOneTimeExpense, FakeRecurringItem


def test_safe_to_spend_basic_formula_with_no_fixed_expenses():
    start_date = date(2026, 7, 1)
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=6)

    result = compute_safe_to_spend(
        starting_balance=Decimal("250"),
        incomes=[income],
        fixed_expenses=[],
        one_time_expenses=[],
        start_date=start_date,
    )

    assert result.next_income_date == date(2026, 7, 6)
    assert result.days_remaining == 5
    assert result.balance_before_next_income == Decimal("250")
    assert result.daily_budget == Decimal("50")
    assert result.has_upcoming_income is True


def test_safe_to_spend_subtracts_fixed_expenses_before_next_income():
    start_date = date(2026, 7, 1)
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=6)
    expense = FakeRecurringItem(label="Abonnement", amount=Decimal("50"), day_of_month=3)

    result = compute_safe_to_spend(
        starting_balance=Decimal("250"),
        incomes=[income],
        fixed_expenses=[expense],
        one_time_expenses=[],
        start_date=start_date,
    )

    assert result.balance_before_next_income == Decimal("200")
    assert result.daily_budget == Decimal("40")


def test_safe_to_spend_falls_back_when_no_income_configured():
    start_date = date(2026, 7, 1)

    result = compute_safe_to_spend(
        starting_balance=Decimal("350"),
        incomes=[],
        fixed_expenses=[],
        one_time_expenses=[],
        start_date=start_date,
        fallback_horizon_days=35,
    )

    assert result.has_upcoming_income is False
    assert result.next_income_date is None
    assert result.days_remaining == 35
    assert result.daily_budget == Decimal("10")


def test_adding_one_time_expense_recalibrates_daily_budget():
    start_date = date(2026, 7, 1)
    income = FakeRecurringItem(label="Bourse", amount=Decimal("500"), day_of_month=11)

    before = compute_safe_to_spend(
        starting_balance=Decimal("300"),
        incomes=[income],
        fixed_expenses=[],
        one_time_expenses=[],
        start_date=start_date,
    )

    one_time_expense = FakeOneTimeExpense(
        label="Reparation velo", amount=Decimal("100"), date=date(2026, 7, 3)
    )
    after = compute_safe_to_spend(
        starting_balance=Decimal("300"),
        incomes=[income],
        fixed_expenses=[],
        one_time_expenses=[one_time_expense],
        start_date=start_date,
    )

    assert before.daily_budget == Decimal("30")
    assert after.daily_budget == Decimal("20")
    assert after.daily_budget < before.daily_budget
