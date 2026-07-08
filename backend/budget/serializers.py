from rest_framework import serializers

from .models import FixedExpense, IncomeSource, OneTimeExpense, StartingBalance


class StartingBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartingBalance
        fields = ["id", "amount", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class IncomeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeSource
        fields = [
            "id", "label", "amount", "day_of_month", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FixedExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedExpense
        fields = [
            "id", "label", "amount", "day_of_month", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class OneTimeExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OneTimeExpense
        fields = ["id", "label", "amount", "date", "created_at"]
        read_only_fields = ["id", "created_at"]


class DayEventSerializer(serializers.Serializer):
    label = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    kind = serializers.CharField()


class ProjectionDaySerializer(serializers.Serializer):
    date = serializers.DateField()
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    events = DayEventSerializer(many=True)


class OverdraftAlertSerializer(serializers.Serializer):
    date = serializers.DateField()
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    triggered_by = serializers.ListField(child=serializers.CharField())


class ProjectionResponseSerializer(serializers.Serializer):
    days = ProjectionDaySerializer(many=True)
    lowest_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    lowest_balance_date = serializers.DateField()
    has_overdraft_risk = serializers.BooleanField()
    overdraft_alerts = OverdraftAlertSerializer(many=True)


class SafeToSpendResponseSerializer(serializers.Serializer):
    daily_budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    next_income_date = serializers.DateField(allow_null=True)
    days_remaining = serializers.IntegerField()
    balance_before_next_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    has_upcoming_income = serializers.BooleanField()
