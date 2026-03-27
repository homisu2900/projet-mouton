from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection

router = APIRouter()


# --- Modèle de données ---

class SoinIn(BaseModel):
    animal_id: int              # obligatoire : à quel animal appartient ce soin
    type:      Optional[str]   = None   # 'vermifuge', 'tonte', 'onglons', 'vaccin', ...
    date:      Optional[str]   = None   # YYYY-MM-DD
    notes:     Optional[str]   = None


# --- Routes ---

@router.get("/soins/{animal_id}")
def soins_par_animal(animal_id: int):
    """Retourne tous les soins d'un animal, du plus récent au plus ancien."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM soins WHERE animal_id = ? ORDER BY date DESC",
        (animal_id,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


@router.post("/soins", status_code=201)
def ajouter_soin(soin: SoinIn):
    """Ajoute un soin pour un animal et retourne le soin créé."""
    conn = get_connection()
    # Vérifie que l'animal existe
    animal = conn.execute("SELECT id FROM animaux WHERE id = ?", (soin.animal_id,)).fetchone()
    if animal is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")

    cursor = conn.execute(
        "INSERT INTO soins (animal_id, type, date, notes) VALUES (?, ?, ?, ?)",
        (soin.animal_id, soin.type, soin.date, soin.notes)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM soins WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)


@router.delete("/soins/{soin_id}", status_code=204)
def supprimer_soin(soin_id: int):
    """Supprime un soin. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    existing = conn.execute("SELECT id FROM soins WHERE id = ?", (soin_id,)).fetchone()
    if existing is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Soin introuvable")
    conn.execute("DELETE FROM soins WHERE id = ?", (soin_id,))
    conn.commit()
    conn.close()
