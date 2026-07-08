from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    FixedExpenseViewSet,
    IncomeSourceViewSet,
    OneTimeExpenseViewSet,
    ProjectionView,
    SafeToSpendView,
    StartingBalanceView,
)

router = DefaultRouter()
router.register("incomes", IncomeSourceViewSet, basename="income")
router.register("expenses", FixedExpenseViewSet, basename="expense")
router.register("one-time-expenses", OneTimeExpenseViewSet, basename="one-time-expense")

urlpatterns = [
    path("starting-balance/", StartingBalanceView.as_view(), name="starting-balance"),
    path("projection/", ProjectionView.as_view(), name="projection"),
    path("safe-to-spend/", SafeToSpendView.as_view(), name="safe-to-spend"),
    path("", include(router.urls)),
]
