import sqlite3

# Chemin vers le fichier de base de données SQLite
# (créé automatiquement s'il n'existe pas)
DB_PATH = "troupeau.db"


def get_connection():
    """
    Ouvre et retourne une connexion à la base de données.
    row_factory permet de lire les résultats comme des dictionnaires
    (ex: animal["nom"] plutôt que animal[1]).
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Crée les tables si elles n'existent pas encore.
    Appelée automatiquement au démarrage du serveur.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # --- Table animaux ---
    # Contient tous les moutons du troupeau
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS animaux (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            nom           TEXT,
            sexe          TEXT,        -- 'M' ou 'F'
            statut        TEXT,        -- 'présent', 'vendu', 'mort'
            date_naissance TEXT,       -- format YYYY-MM-DD
            boucle        TEXT,        -- numéro de boucle officiel
            genotype      TEXT,        -- ex: 'ARR/ARR'
            mere          INTEGER,     -- id de la mère (référence vers animaux.id)
            pere          INTEGER,     -- id du père  (référence vers animaux.id)
            prix_achat    REAL,
            prix_vente    REAL,
            acheteur      TEXT,
            date_vente    TEXT,        -- format YYYY-MM-DD
            signes        TEXT,        -- remarques / signes particuliers
            date_onglons  TEXT,        -- date de la dernière taille des onglons (YYYY-MM-DD)
            date_vaccin   TEXT,        -- date du dernier vaccin (YYYY-MM-DD)
            poids_dernier REAL         -- poids en kg à la dernière pesée
        )
    """)

    # --- Table soins ---
    # Historique des soins par animal (vermifuge, tonte, etc.)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS soins (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            animal_id  INTEGER NOT NULL,  -- animal concerné
            type       TEXT,              -- 'vermifuge', 'tonte', ...
            date       TEXT,              -- format YYYY-MM-DD
            notes      TEXT,
            FOREIGN KEY (animal_id) REFERENCES animaux(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Base de données initialisée.")
