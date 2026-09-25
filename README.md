# Solvo-Zen

Solvo-Zen calcule automatiquement le **reste a vivre** projete d'un etudiant,
jour par jour, a partir de ses revenus et depenses recurrents. Pas de
saisie quotidienne : une seule configuration (revenus, depenses fixes,
solde de depart) suffit pour obtenir un budget quotidien "safe-to-spend"
fiable jusqu'a la prochaine rentree d'argent.

## Fonctionnalites

- Configuration unique des revenus et depenses recurrents (libelle,
  montant, jour du mois) et du solde de depart.
- Moteur de projection : solde jour par jour sur 30 a 45 jours.
- Detection du point bas et alerte de risque de decouvert si une
  depense tombe avant une rentree d'argent prevue.
- Budget quotidien "safe-to-spend" jusqu'a la prochaine rentree
  d'argent significative.
- Ajout optionnel d'une depense libre ponctuelle, qui recalibre
  automatiquement le budget quotidien restant.

## Stack technique

- **Backend** : Django + Django REST Framework, authentification JWT
  (djangorestframework-simplejwt), configuration via variables
  d'environnement (django-environ), isolation stricte des donnees par
  utilisateur.
- **Frontend** : Next.js (App Router) + Tailwind CSS, design
  mobile-first, icones [lucide-react](https://lucide.dev) exclusivement
  (aucun emoji dans l'interface).
- **Base de donnees** : PostgreSQL (via Docker Compose).

## Structure du projet

```
solvo/
├── docker-compose.yml
├── .env.example
├── backend/            # API Django REST Framework
│   ├── config/         # settings, urls
│   ├── accounts/        # utilisateur custom (email), JWT
│   └── budget/          # modeles, moteur de projection, endpoints
└── frontend/           # application Next.js
    └── src/
        ├── app/         # routes (accueil, login, setup, projection)
        ├── components/  # composants UI et metier
        └── lib/         # client API, auth, formatage
```

## Lancer le projet avec Docker (recommande)

1. Copier le fichier d'environnement racine :

   ```bash
   cp .env.example .env
   ```

   Editez `.env` et changez au minimum `DJANGO_SECRET_KEY` et
   `POSTGRES_PASSWORD` (et mettez a jour `DATABASE_URL` en consequence).

2. Lancer l'ensemble des services :

   ```bash
   docker compose up --build
   ```

   - Backend disponible sur http://localhost:8000
   - Frontend disponible sur http://localhost:3000
   - Les migrations Django sont appliquees automatiquement au demarrage.

3. Creer un compte via l'interface (`/register`) ou via l'API :

   ```bash
   curl -X POST http://localhost:8000/api/auth/register/ \
     -H "Content-Type: application/json" \
     -d '{"email": "etudiant@example.com", "password": "un-mot-de-passe-solide"}'
   ```

## Lancer le projet manuellement (sans Docker)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # a creer a partir des valeurs de la racine si besoin
python manage.py migrate
python manage.py runserver
```

Par defaut, sans `DATABASE_URL` defini, le backend utilise SQLite
(`db.sqlite3`), pratique pour du developpement rapide sans Postgres.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Lancer les tests backend

```bash
cd backend
source .venv/bin/activate
python -m pytest
```

La suite de tests couvre :
- l'isolation stricte des donnees entre utilisateurs (`budget/tests/test_isolation.py`),
- le moteur de projection jour par jour, y compris le clamp de fin de
  mois et la detection du point bas (`budget/tests/test_projection.py`),
- le calcul du budget quotidien "safe-to-spend" et sa recalibration
  lors de l'ajout d'une depense ponctuelle (`budget/tests/test_safe_to_spend.py`).

## API principale

| Methode | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register/` | Creation de compte |
| POST | `/api/auth/token/` | Connexion (JWT access + refresh) |
| POST | `/api/auth/token/refresh/` | Rafraichissement du token |
| GET/PUT | `/api/budget/starting-balance/` | Solde de depart |
| GET/POST/PATCH/DELETE | `/api/budget/incomes/` | Revenus recurrents |
| GET/POST/PATCH/DELETE | `/api/budget/expenses/` | Depenses fixes recurrentes |
| GET/POST/DELETE | `/api/budget/one-time-expenses/` | Depenses ponctuelles |
| GET | `/api/budget/projection/?days=35` | Solde jour par jour, point bas, alertes |
| GET | `/api/budget/safe-to-spend/` | Budget quotidien disponible |

## Securite

- Aucun secret n'est committe : `.env.example` (racine) et
  `backend/requirements.txt` ne contiennent que des valeurs de
  placeholder ou des versions figees.
- Le conteneur backend tourne avec un utilisateur non-root (`solvo`).
- Chaque endpoint filtre les donnees par utilisateur authentifie
  (JWT) ; une permission `IsOwner` agit en deuxieme barriere au niveau
  objet.
