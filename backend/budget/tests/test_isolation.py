from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from budget.models import FixedExpense, IncomeSource, OneTimeExpense, StartingBalance

User = get_user_model()

pytestmark = pytest.mark.django_db


def make_authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def user_a():
    return User.objects.create_user(email="alice@example.com", password="s0lidPassw0rd!")


@pytest.fixture
def user_b():
    return User.objects.create_user(email="bob@example.com", password="s0lidPassw0rd!")


def test_income_list_only_returns_own_data(user_a, user_b):
    IncomeSource.objects.create(user=user_a, label="Bourse", amount=Decimal("450"), day_of_month=5)
    IncomeSource.objects.create(user=user_b, label="Alternance", amount=Decimal("900"), day_of_month=1)

    client_a = make_authenticated_client(user_a)
    response = client_a.get("/api/budget/incomes/")

    assert response.status_code == 200
    labels = [item["label"] for item in response.data]
    assert labels == ["Bourse"]


def test_user_cannot_retrieve_another_users_expense(user_a, user_b):
    expense_b = FixedExpense.objects.create(
        user=user_b, label="Loyer", amount=Decimal("500"), day_of_month=1
    )

    client_a = make_authenticated_client(user_a)
    response = client_a.get(f"/api/budget/expenses/{expense_b.id}/")

    assert response.status_code == 404


def test_user_cannot_update_or_delete_another_users_expense(user_a, user_b):
    expense_b = FixedExpense.objects.create(
        user=user_b, label="Loyer", amount=Decimal("500"), day_of_month=1
    )

    client_a = make_authenticated_client(user_a)

    patch_response = client_a.patch(
        f"/api/budget/expenses/{expense_b.id}/", {"amount": "1"}, format="json"
    )
    delete_response = client_a.delete(f"/api/budget/expenses/{expense_b.id}/")

    assert patch_response.status_code == 404
    assert delete_response.status_code == 404
    expense_b.refresh_from_db()
    assert expense_b.amount == Decimal("500")


def test_one_time_expense_creation_is_scoped_to_the_authenticated_user(user_a, user_b):
    client_a = make_authenticated_client(user_a)
    response = client_a.post(
        "/api/budget/one-time-expenses/",
        {"label": "Sortie", "amount": "30", "date": "2026-07-15"},
        format="json",
    )

    assert response.status_code == 201
    created = OneTimeExpense.objects.get(id=response.data["id"])
    assert created.user_id == user_a.id
    assert not OneTimeExpense.objects.filter(user=user_b).exists()


def test_starting_balance_is_isolated_per_user(user_a, user_b):
    StartingBalance.objects.create(user=user_a, amount=Decimal("100"))
    StartingBalance.objects.create(user=user_b, amount=Decimal("999"))

    client_a = make_authenticated_client(user_a)
    response = client_a.get("/api/budget/starting-balance/")

    assert response.status_code == 200
    assert Decimal(response.data["amount"]) == Decimal("100")


def test_updating_starting_balance_does_not_affect_other_user(user_a, user_b):
    StartingBalance.objects.create(user=user_a, amount=Decimal("100"))
    StartingBalance.objects.create(user=user_b, amount=Decimal("999"))

    client_a = make_authenticated_client(user_a)
    response = client_a.put(
        "/api/budget/starting-balance/", {"amount": "42"}, format="json"
    )

    assert response.status_code == 200
    balance_b = StartingBalance.objects.get(user=user_b)
    assert balance_b.amount == Decimal("999")


def test_projection_endpoint_uses_only_the_authenticated_users_data(user_a, user_b):
    StartingBalance.objects.create(user=user_a, amount=Decimal("100"))
    IncomeSource.objects.create(user=user_b, label="Alternance", amount=Decimal("9000"), day_of_month=5)

    client_a = make_authenticated_client(user_a)
    response = client_a.get("/api/budget/projection/?days=30")

    assert response.status_code == 200
    balances = [Decimal(day["balance"]) for day in response.data["days"]]
    assert all(balance == Decimal("100") for balance in balances)


def test_unauthenticated_requests_are_rejected():
    client = APIClient()
    response = client.get("/api/budget/incomes/")

    assert response.status_code == 401
