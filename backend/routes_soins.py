from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_connection, get_cursor

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
    cur = get_cursor(conn)
    cur.execute(
        "SELECT * FROM soins WHERE animal_id = %s ORDER BY date DESC",
        (animal_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(row) for row in rows]


@router.post("/soins", status_code=201)
def ajouter_soin(soin: SoinIn):
    """Ajoute un soin pour un animal et retourne le soin créé."""
    conn = get_connection()
    cur = get_cursor(conn)
    # Vérifie que l'animal existe
    cur.execute("SELECT id FROM animaux WHERE id = %s", (soin.animal_id,))
    animal = cur.fetchone()
    if animal is None:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Animal introuvable")

    cur.execute(
        "INSERT INTO soins (animal_id, type, date, notes) VALUES (%s, %s, %s, %s) RETURNING *",
        (soin.animal_id, soin.type, soin.date, soin.notes)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return dict(row)


@router.delete("/soins/{soin_id}", status_code=204)
def supprimer_soin(soin_id: int):
    """Supprime un soin. Erreur 404 s'il n'existe pas."""
    conn = get_connection()
    cur = get_cursor(conn)
    cur.execute("SELECT id FROM soins WHERE id = %s", (soin_id,))
    existing = cur.fetchone()
    if existing is None:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Soin introuvable")
    cur.execute("DELETE FROM soins WHERE id = %s", (soin_id,))
    conn.commit()
    cur.close()
    conn.close()
