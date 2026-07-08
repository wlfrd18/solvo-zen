from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class StartingBalance(models.Model):
    """Solde de depart de l'utilisateur, base de tout calcul de projection.

    Un seul enregistrement par utilisateur : il represente le solde
    "actuel" tel que l'utilisateur l'a renseigne pour la derniere fois.
    La projection part toujours de ce solde a la date du jour.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="starting_balance",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Solde de {self.user_id} : {self.amount}"


class RecurringItemBase(models.Model):
    """Base commune aux revenus et depenses fixes recurrents mensuels."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    day_of_month = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(31)]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["day_of_month"]

    def __str__(self):
        return f"{self.label} ({self.amount}, jour {self.day_of_month})"


class IncomeSource(RecurringItemBase):
    """Revenu recurrent mensuel (bourse, salaire, aide au logement...)."""


class FixedExpense(RecurringItemBase):
    """Depense fixe recurrente mensuelle (loyer, abonnement...)."""


class OneTimeExpense(models.Model):
    """Depense libre ponctuelle, saisie a la volee par l'utilisateur.

    Ajouter une entree ici recalibre automatiquement le budget
    quotidien "safe-to-spend" puisque le moteur de projection en
    tient compte a la date indiquee.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    label = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return f"{self.label} ({self.amount}, {self.date})"
