from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes_animaux import router as animaux_router
from routes_soins import router as soins_router


# Lifespan : code exécuté au démarrage (avant) et à l'arrêt (après) du serveur
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()   # Crée les tables SQLite si elles n'existent pas
    yield       # Le serveur tourne ici
    # (rien à nettoyer à l'arrêt pour l'instant)


# Création de l'application FastAPI
app = FastAPI(
    title="API Troupeau Nez Noir du Valais",
    description="Backend de gestion du troupeau familial",
    version="0.1.0",
    lifespan=lifespan,
)

# Configuration CORS — permet aux frontends (PC et mobile) d'appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production si nécessaire
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Routes de base ---

@app.get("/")
def root():
    """Page d'accueil de l'API."""
    return {"message": "API Troupeau Nez Noir du Valais — opérationnelle"}


@app.get("/health")
def health():
    """Vérification que le serveur fonctionne (utilisé par Render)."""
    return {"status": "ok"}


# --- Enregistrement des routes ---
app.include_router(animaux_router)
app.include_router(soins_router)
