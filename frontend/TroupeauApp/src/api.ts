import {API_BASE_URL} from './config';

// --- Types ---

export type Animal = {
  id: number;
  nom: string | null;
  sexe: string | null;         // 'M' ou 'F'
  statut: string | null;       // 'présent', 'vendu', 'mort'
  date_naissance: string | null;
  boucle: string | null;
  genotype: string | null;
  mere: number | null;
  pere: number | null;
  prix_achat: number | null;
  prix_vente: number | null;
  acheteur: string | null;
  date_vente: string | null;
  signes: string | null;
  date_onglons: string | null;
  date_vaccin: string | null;
  poids_dernier: number | null;
};

export type Soin = {
  id: number;
  animal_id: number;
  type: string | null;
  date: string | null;
  notes: string | null;
};

// --- Fonctions d'appel à l'API ---

export async function getAnimaux(): Promise<Animal[]> {
  const res = await fetch(`${API_BASE_URL}/animaux`);
  if (!res.ok) {throw new Error('Erreur lors du chargement des animaux');}
  return res.json();
}

export async function getAnimal(id: number): Promise<Animal> {
  const res = await fetch(`${API_BASE_URL}/animaux/${id}`);
  if (!res.ok) {throw new Error('Animal introuvable');}
  return res.json();
}

export async function getSoins(animalId: number): Promise<Soin[]> {
  const res = await fetch(`${API_BASE_URL}/soins/${animalId}`);
  if (!res.ok) {throw new Error('Erreur lors du chargement des soins');}
  return res.json();
}

// Omit<Animal, 'id'> = type Animal sans le champ id (l'id est attribué par la BDD)
export type AnimalInput = Omit<Animal, 'id'>;

export async function creerAnimal(data: Partial<AnimalInput>): Promise<Animal> {
  const res = await fetch(`${API_BASE_URL}/animaux`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data),
  });
  if (!res.ok) {throw new Error('Erreur lors de la création de l\'animal');}
  return res.json();
}
