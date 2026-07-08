from django.contrib import admin

from .models import FixedExpense, IncomeSource, OneTimeExpense, StartingBalance

admin.site.register(StartingBalance)
admin.site.register(IncomeSource)
admin.site.register(FixedExpense)
admin.site.register(OneTimeExpense)
