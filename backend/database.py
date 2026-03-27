import os
import psycopg2
import psycopg2.extras

# L'URL de connexion à la base PostgreSQL est fournie par la variable
# d'environnement DATABASE_URL (définie sur Render et sur Neon).
# Format : postgresql://utilisateur:motdepasse@hôte/nomdelabase
DATABASE_URL = os.environ["DATABASE_URL"]


def get_connection():
    """
    Ouvre et retourne une connexion à la base de données PostgreSQL.
    """
    return psycopg2.connect(DATABASE_URL)


def get_cursor(conn):
    """
    Retourne un curseur qui renvoie les résultats comme des dictionnaires.
    Équivalent de row_factory = sqlite3.Row : on peut écrire animal["nom"].
    """
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    """
    Crée les tables si elles n'existent pas encore.
    Appelée automatiquement au démarrage du serveur.
    """
    conn = get_connection()
    cur = get_cursor(conn)

    # --- Table animaux ---
    # Contient tous les moutons du troupeau
    cur.execute("""
        CREATE TABLE IF NOT EXISTS animaux (
            id             SERIAL PRIMARY KEY,
            nom            TEXT,
            sexe           TEXT,        -- 'M' ou 'F'
            statut         TEXT,        -- 'présent', 'vendu', 'mort'
            date_naissance TEXT,        -- format YYYY-MM-DD
            boucle         TEXT,        -- numéro de boucle officiel
            genotype       TEXT,        -- ex: 'ARR/ARR'
            mere           INTEGER,     -- id de la mère (référence vers animaux.id)
            pere           INTEGER,     -- id du père  (référence vers animaux.id)
            prix_achat     REAL,
            prix_vente     REAL,
            acheteur       TEXT,
            date_vente     TEXT,        -- format YYYY-MM-DD
            signes         TEXT,        -- remarques / signes particuliers
            date_onglons   TEXT,        -- date de la dernière taille des onglons (YYYY-MM-DD)
            date_vaccin    TEXT,        -- date du dernier vaccin (YYYY-MM-DD)
            poids_dernier  REAL         -- poids en kg à la dernière pesée
        )
    """)

    # --- Table soins ---
    # Historique des soins par animal (vermifuge, tonte, etc.)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS soins (
            id        SERIAL PRIMARY KEY,
            animal_id INTEGER NOT NULL,  -- animal concerné
            type      TEXT,              -- 'vermifuge', 'tonte', ...
            date      TEXT,              -- format YYYY-MM-DD
            notes     TEXT,
            FOREIGN KEY (animal_id) REFERENCES animaux(id)
        )
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("Base de données initialisée.")
