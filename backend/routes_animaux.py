from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection

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
    rows = conn.execute("SELECT * FROM animaux").fetchall()
    conn.close()
    return [dict(row) for row in rows]


@router.get("/animaux/{animal_id}")
def get_animal(animal_id: int):
    """Retourne la fiche d'un animal par son id. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    row = conn.execute("SELECT * FROM animaux WHERE id = ?", (animal_id,)).fetchone()
    conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="Animal introuvable")
    return dict(row)


@router.post("/animaux", status_code=201)
def creer_animal(animal: AnimalIn):
    """Crée un nouvel animal et retourne sa fiche complète avec son id."""
    conn = get_connection()
    cursor = conn.execute(
        """INSERT INTO animaux
           (nom, sexe, statut, date_naissance, boucle, genotype,
            mere, pere, prix_achat, prix_vente, acheteur, date_vente,
            signes, date_onglons, date_vaccin, poids_dernier)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (animal.nom, animal.sexe, animal.statut, animal.date_naissance,
         animal.boucle, animal.genotype, animal.mere, animal.pere,
         animal.prix_achat, animal.prix_vente, animal.acheteur, animal.date_vente,
         animal.signes, animal.date_onglons, animal.date_vaccin, animal.poids_dernier)
    )
    conn.commit()
    new_id = cursor.lastrowid
    row = conn.execute("SELECT * FROM animaux WHERE id = ?", (new_id,)).fetchone()
    conn.close()
    return dict(row)


@router.put("/animaux/{animal_id}")
def modifier_animal(animal_id: int, animal: AnimalIn):
    """
    Modifie un animal existant.
    Seuls les champs fournis dans le corps de la requête sont mis à jour.
    """
    conn = get_connection()
    # Vérifie que l'animal existe
    existing = conn.execute("SELECT id FROM animaux WHERE id = ?", (animal_id,)).fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")

    # Construit dynamiquement la liste des champs à mettre à jour.
    # exclude_unset=True : on ne touche QUE les champs envoyés dans la requête,
    # les autres restent inchangés en base.
    data = animal.model_dump(exclude_unset=True)
    if not data:
        conn.close()
        raise HTTPException(status_code=400, detail="Aucun champ à modifier")
    champs = ", ".join(f"{k} = ?" for k in data)
    valeurs = list(data.values()) + [animal_id]

    conn.execute(f"UPDATE animaux SET {champs} WHERE id = ?", valeurs)
    conn.commit()
    row = conn.execute("SELECT * FROM animaux WHERE id = ?", (animal_id,)).fetchone()
    conn.close()
    return dict(row)


@router.delete("/animaux/{animal_id}", status_code=204)
def supprimer_animal(animal_id: int):
    """Supprime un animal. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    existing = conn.execute("SELECT id FROM animaux WHERE id = ?", (animal_id,)).fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")
    conn.execute("DELETE FROM animaux WHERE id = ?", (animal_id,))
    conn.commit()
    conn.close()
