# CONTEXT.md — Gestion de troupeau Nez Noir du Valais

## Projet
Application de gestion de troupeau de moutons (race Nez Noir du Valais).
Usage strictement personnel et familial.
Développée avec l'assistance de Claude Code et Claude Cowork.

## Public cible
Membres de la famille, principalement des personnes dans la soixantaine peu à l'aise avec le numérique.
Priorité absolue à la simplicité et l'intuitivité de l'interface.

## Architecture choisie
Architecture client-serveur avec synchronisation en temps réel entre les appareils.

```
[Application PC Windows]
          |
          | internet
          |
    [Serveur cloud gratuit]  <-- Base de données centrale
          |
          | internet
          |
 [Application mobile]
```

- Le serveur cloud héberge le backend et la base de données.
- Les deux frontends (PC et mobile) se synchronisent via ce serveur.
- Toutes les données sont centralisées : une modification sur un appareil
  est immédiatement visible sur l'autre.

## Stack technique

- **Backend** : Python + FastAPI
- **Base de données** : SQLite
- **Hébergement cloud** : Render (gratuit, tier personnel)
- **Frontend PC Windows** : React Native for Windows
- **Frontend mobile** : React Native (Android prioritaire — Xiaomi, Huawei, etc.)

### Notes
- SQLite retenu car usage strictement séquentiel (un appareil à la fois) et volume faible (35 animaux max)
- Render retenu pour sa simplicité de prise en main pour un débutant
- React Native permet une seule base de code pour Android et PC Windows
- Distribution Android par fichier `.apk` (installation directe) — certains appareils Huawei n'ont pas accès au Google Play Store

## Contraintes
- Coût : zéro (solutions gratuites uniquement)
- Développeur : débutant complet, accompagné par Claude
- Stockage du projet : local sur PC Windows
- Interface : très simple, grands éléments, lisible pour des non-techniciens

## Fonctionnalités prévues
Issues du prototype existant (troupeau.html) :

- Gestion des animaux (ajout, modification, suppression)
- Fiche individuelle par animal (nom, sexe, statut, date de naissance, numéro de boucle, génotype)
- Filiation / généalogie (père, mère, enfants)
- Suivi des soins (vermifuge, tonte, taille des onglons, vaccin)
- Suivi du poids (date et poids à la dernière pesée)
- Gestion des ventes (prix, acheteur, date)
- Statistiques globales du troupeau
- Filtres et recherche

## Fonctionnalités futures (à planifier)
- Connecteurs et intégrations MCP (à définir selon les besoins)

## État actuel

### Prototype de référence
- Fichier : `troupeau.html`
  - Application web monopage (HTML + CSS + JavaScript)
  - Données stockées localement dans le navigateur (localStorage)
  - Pas de synchronisation entre appareils
  - Sert de référence pour les fonctionnalités et le design

### Backend (en cours)
- Dossier : `backend/`
- Environnement Python 3.14.3 dans `backend/venv/`
- Dépendances installées : FastAPI 0.135.2, Uvicorn 0.42.0
- Fichier `backend/main.py` : serveur FastAPI minimal opérationnel
  - `GET /` → message de bienvenue
  - `GET /health` → vérification d'état (requis par Render)
  - Middleware CORS activé
- Fichier `backend/requirements.txt` : liste des dépendances (pour Render)
- Fichier `backend/database.py` : initialisation de la base de données SQLite
  - Table `animaux` : id, nom, sexe, statut, date_naissance, boucle, genotype, mere, pere, prix_achat, prix_vente, acheteur, date_vente, signes, date_onglons, date_vaccin, poids_dernier
  - Table `soins` : id, animal_id, type, date, notes
  - Tables créées automatiquement au démarrage si elles n'existent pas
- Fichier `backend/troupeau.db` : base de données SQLite (créée au premier démarrage)
- Fichier `backend/routes_animaux.py` : routes CRUD pour les animaux
  - `GET  /animaux`         → liste de tous les animaux
  - `GET  /animaux/{id}`    → fiche d'un animal (404 si absent)
  - `POST /animaux`         → créer un animal (retourne la fiche créée)
  - `PUT  /animaux/{id}`    → modifier un animal (seuls les champs envoyés sont mis à jour)
  - `DELETE /animaux/{id}`  → supprimer un animal (404 si absent)
- Fichier `backend/routes_soins.py` : routes pour les soins
  - `GET    /soins/{animal_id}` → soins d'un animal (du plus récent au plus ancien)
  - `POST   /soins`             → ajouter un soin
  - `DELETE /soins/{id}`        → supprimer un soin (404 si absent)
- Fichier `render.yaml` (racine du projet) : configuration de déploiement Render
  - `rootDir: backend`
  - `buildCommand: pip install -r requirements.txt`
  - `startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT`
  - `PYTHON_VERSION: 3.13.0` (Render ne supporte pas encore Python 3.14)
- ⚠️ SQLite éphémère sur Render tier gratuit : la base est réinitialisée à chaque redémarrage
- **Prochaines étapes backend** :
  - Créer un dépôt Git et déployer sur Render
  - Planifier la persistance des données (Render Persistent Disk ou migration PostgreSQL)

### Frontend (en cours)
- Dossier : `frontend/TroupeauApp/`
- React Native 0.82.0 + react-native-windows 0.82.3
- Projet Visual Studio généré dans `frontend/TroupeauApp/windows/`
- Fichier `src/config.ts` : URL du backend (variable d'environnement `API_URL`, défaut `http://localhost:8000`)
- Fichier `src/api.ts` : fonctions fetch (`getAnimaux`, `getAnimal`, `getSoins`) + types TypeScript
- Composants :
  - `src/components/Header.tsx` : barre verte #0F6E56, onglets, bouton "+ Ajouter"
  - `src/components/StatsBar.tsx` : 4 statistiques globales (actifs, vendus, recettes, vermifuges)
  - `src/components/AnimalList.tsx` : liste gauche scrollable (340px)
  - `src/components/AnimalItem.tsx` : avatar circulaire, nom, sexe+âge, point orange si soin en retard
  - `src/components/AnimalDetail.tsx` : fiche détaillée, grilles soins, boutons Modifier/Ajouter/Supprimer
- Écran principal : `src/screens/TroupeauScreen.tsx`
- Metro bundler vérifié : démarre sans erreur sur `http://localhost:8081`
- **Pour lancer l'app Windows** (nécessite VS 2022 avec workload "Développement Desktop en C++") :
  ```
  cd frontend/TroupeauApp
  npx @react-native-community/cli run-windows
  ```
- **Prochaines étapes frontend** :
  - Implémenter les formulaires (ajout/modification d'animal, ajout de soin)
  - Implémenter les autres onglets (Généalogie, Soins, Finances)
