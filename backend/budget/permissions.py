from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Garantit qu'un utilisateur ne peut acceder qu'a ses propres objets.

    Les querysets sont deja filtres par utilisateur dans les vues ;
    cette permission est une deuxieme barriere au niveau objet.
    """

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
