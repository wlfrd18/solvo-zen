from django.conf import settings
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FixedExpense, IncomeSource, OneTimeExpense, StartingBalance
from .permissions import IsOwner
from .serializers import (
    FixedExpenseSerializer,
    IncomeSourceSerializer,
    OneTimeExpenseSerializer,
    ProjectionResponseSerializer,
    SafeToSpendResponseSerializer,
    StartingBalanceSerializer,
)
from .services.projection import compute_projection
from .services.safe_to_spend import compute_safe_to_spend


class UserScopedModelViewSet(viewsets.ModelViewSet):
    """Isolation stricte : chaque utilisateur ne voit et ne modifie que ses propres objets."""

    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return self.queryset.model.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeSourceViewSet(UserScopedModelViewSet):
    queryset = IncomeSource.objects.all()
    serializer_class = IncomeSourceSerializer


class FixedExpenseViewSet(UserScopedModelViewSet):
    queryset = FixedExpense.objects.all()
    serializer_class = FixedExpenseSerializer


class OneTimeExpenseViewSet(UserScopedModelViewSet):
    queryset = OneTimeExpense.objects.all()
    serializer_class = OneTimeExpenseSerializer


class StartingBalanceView(generics.RetrieveUpdateAPIView):
    """Solde de depart : un seul objet par utilisateur, cree a la volee au premier acces."""

    serializer_class = StartingBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = StartingBalance.objects.get_or_create(
            user=self.request.user, defaults={"amount": 0}
        )
        return obj


def _resolve_horizon_days(request) -> int:
    default_days = settings.PROJECTION_DEFAULT_HORIZON_DAYS
    raw_value = request.query_params.get("days")
    if raw_value is None:
        return default_days
    try:
        days = int(raw_value)
    except (TypeError, ValueError):
        return default_days
    return max(
        settings.PROJECTION_MIN_HORIZON_DAYS,
        min(days, settings.PROJECTION_MAX_HORIZON_DAYS),
    )


class ProjectionView(APIView):
    """Renvoie le solde jour par jour, le point bas et les alertes de decouvert."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        starting_balance = StartingBalance.objects.filter(user=user).first()
        amount = starting_balance.amount if starting_balance else 0

        result = compute_projection(
            starting_balance=amount,
            incomes=IncomeSource.objects.filter(user=user),
            fixed_expenses=FixedExpense.objects.filter(user=user),
            one_time_expenses=OneTimeExpense.objects.filter(user=user),
            horizon_days=_resolve_horizon_days(request),
        )
        payload = {
            "days": [
                {
                    "date": day.date,
                    "balance": day.balance,
                    "events": [
                        {"label": e.label, "amount": e.amount, "kind": e.kind}
                        for e in day.events
                    ],
                }
                for day in result.days
            ],
            "lowest_balance": result.lowest_balance,
            "lowest_balance_date": result.lowest_balance_date,
            "has_overdraft_risk": result.has_overdraft_risk,
            "overdraft_alerts": result.overdraft_alerts,
        }
        return Response(ProjectionResponseSerializer(payload).data)


class SafeToSpendView(APIView):
    """Renvoie le budget quotidien "safe-to-spend" jusqu'a la prochaine rentree d'argent."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        starting_balance = StartingBalance.objects.filter(user=user).first()
        amount = starting_balance.amount if starting_balance else 0

        result = compute_safe_to_spend(
            starting_balance=amount,
            incomes=IncomeSource.objects.filter(user=user),
            fixed_expenses=FixedExpense.objects.filter(user=user),
            one_time_expenses=OneTimeExpense.objects.filter(user=user),
            fallback_horizon_days=settings.PROJECTION_DEFAULT_HORIZON_DAYS,
        )
        payload = {
            "daily_budget": result.daily_budget,
            "next_income_date": result.next_income_date,
            "days_remaining": result.days_remaining,
            "balance_before_next_income": result.balance_before_next_income,
            "has_upcoming_income": result.has_upcoming_income,
        }
        return Response(SafeToSpendResponseSerializer(payload).data)
