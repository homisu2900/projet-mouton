from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection, get_cursor

router = APIRouter()


# --- Modèle de données ---
# Décrit les champs acceptés lors d'une création ou modification d'animal.
# Tous les champs sont optionnels : on peut créer un animal avec juste son nom,
# et compléter les autres informations plus tard.

class AnimalIn(BaseModel):
    nom:            Optional[str]   = None
    sexe:           Optional[str]   = None   # 'M' ou 'F'
    statut:         Optional[str]   = None   # 'présent', 'vendu', 'mort'
    date_naissance: Optional[str]   = None   # YYYY-MM-DD
    boucle:         Optional[str]   = None
    genotype:       Optional[str]   = None
    mere:           Optional[int]   = None   # id de la mère
    pere:           Optional[int]   = None   # id du père
    prix_achat:     Optional[float] = None
    prix_vente:     Optional[float] = None
    acheteur:       Optional[str]   = None
    date_vente:     Optional[str]   = None   # YYYY-MM-DD
    signes:         Optional[str]   = None
    date_onglons:   Optional[str]   = None   # YYYY-MM-DD
    date_vaccin:    Optional[str]   = None   # YYYY-MM-DD
    poids_dernier:  Optional[float] = None


# --- Routes ---

@router.get("/animaux")
def liste_animaux():
    """Retourne la liste de tous les animaux du troupeau."""
    conn = get_connection()
    cur = get_cursor(conn)
    cur.execute("SELECT * FROM animaux")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(row) for row in rows]


@router.get("/animaux/{animal_id}")
def get_animal(animal_id: int):
    """Retourne la fiche d'un animal par son id. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    cur = get_cursor(conn)
    cur.execute("SELECT * FROM animaux WHERE id = %s", (animal_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Animal introuvable")
    return dict(row)


@router.post("/animaux", status_code=201)
def creer_animal(animal: AnimalIn):
    """Crée un nouvel animal et retourne sa fiche complète avec son id."""
    conn = get_connection()
    cur = get_cursor(conn)
    cur.execute(
        """INSERT INTO animaux
           (nom, sexe, statut, date_naissance, boucle, genotype,
            mere, pere, prix_achat, prix_vente, acheteur, date_vente,
            signes, date_onglons, date_vaccin, poids_dernier)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
           RETURNING *""",
        (animal.nom, animal.sexe, animal.statut, animal.date_naissance,
         animal.boucle, animal.genotype, animal.mere, animal.pere,
         animal.prix_achat, animal.prix_vente, animal.acheteur, animal.date_vente,
         animal.signes, animal.date_onglons, animal.date_vaccin, animal.poids_dernier)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@router.put("/animaux/{animal_id}")
def modifier_animal(animal_id: int, animal: AnimalIn):
    """
    Modifie un animal existant.
    Seuls les champs fournis dans le corps de la requête sont mis à jour.
    """
    conn = get_connection()
    cur = get_cursor(conn)
    # Vérifie que l'animal existe
    cur.execute("SELECT id FROM animaux WHERE id = %s", (animal_id,))
    existing = cur.fetchone()
    if existing is None:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")

    # Construit dynamiquement la liste des champs à mettre à jour.
    # exclude_unset=True : on ne touche QUE les champs envoyés dans la requête,
    # les autres restent inchangés en base.
    data = animal.model_dump(exclude_unset=True)
    if not data:
        cur.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Aucun champ à modifier")
    champs = ", ".join(f"{k} = %s" for k in data)
    valeurs = list(data.values()) + [animal_id]

    cur.execute(f"UPDATE animaux SET {champs} WHERE id = %s RETURNING *", valeurs)
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@router.delete("/animaux/{animal_id}", status_code=204)
def supprimer_animal(animal_id: int):
    """Supprime un animal. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    cur = get_cursor(conn)
    cur.execute("SELECT id FROM animaux WHERE id = %s", (animal_id,))
    existing = cur.fetchone()
    if existing is None:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")
    cur.execute("DELETE FROM animaux WHERE id = %s", (animal_id,))
    conn.commit()
    cur.close()
    conn.close()
