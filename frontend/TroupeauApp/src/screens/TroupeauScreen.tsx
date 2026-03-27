import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import AnimalList from '../components/AnimalList';
import AnimalDetail from '../components/AnimalDetail';
import FormulaireAnimal from '../components/FormulaireAnimal';
import {Animal, Soin, getAnimaux, getSoins} from '../api';

type Tab = 'Troupeau' | 'Généalogie' | 'Soins' | 'Finances';

export default function TroupeauScreen() {
  const [activeTab, setActiveTab]       = useState<Tab>('Troupeau');
  const [animaux, setAnimaux]           = useState<Animal[]>([]);
  const [selected, setSelected]         = useState<Animal | null>(null);
  const [soins, setSoins]               = useState<Soin[]>([]);
  const [chargement, setChargement]     = useState(true);
  const [erreur, setErreur]             = useState<string | null>(null);
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  // Charge (ou recharge) la liste des animaux depuis l'API
  const chargerAnimaux = useCallback(() => {
    getAnimaux()
      .then(data => {
        setAnimaux(data);
        if (data.length > 0 && !selected) {setSelected(data[0]);}
        setChargement(false);
      })
      .catch(() => {
        setErreur('Impossible de contacter le serveur.\nVérifiez que le backend est démarré.');
        setChargement(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chargement initial des animaux
  useEffect(() => {
    chargerAnimaux();
  }, [chargerAnimaux]);

  // Chargement des soins quand l'animal sélectionné change
  useEffect(() => {
    if (!selected) {setSoins([]); return;}
    getSoins(selected.id)
      .then(setSoins)
      .catch(() => setSoins([]));
  }, [selected]);

  const handleSelect = useCallback((animal: Animal) => {
    setSelected(animal);
  }, []);

  // --- Écran de chargement ---
  if (chargement) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0F6E56" />
        <Text style={styles.loadingText}>Chargement du troupeau…</Text>
      </View>
    );
  }

  // --- Écran d'erreur ---
  if (erreur) {
    return (
      <View style={styles.centered}>
        <Text style={styles.erreurText}>{erreur}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* En-tête */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAjouter={() => setFormulaireVisible(true)}
      />

      {/* Barre de statistiques */}
      <StatsBar animaux={animaux} />

      {/* Corps principal */}
      <View style={styles.body}>
        {/* Colonne gauche : liste des animaux */}
        <AnimalList
          animaux={animaux}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
        />

        {/* Colonne droite : détail de l'animal sélectionné */}
        {selected ? (
          <AnimalDetail
            animal={selected}
            soins={soins}
            onModifier={() => {/* TODO */}}
            onAjouterSoin={() => {/* TODO */}}
            onSupprimer={() => {/* TODO */}}
          />
        ) : (
          <View style={styles.vide}>
            <Text style={styles.videText}>
              Sélectionnez un animal dans la liste.
            </Text>
          </View>
        )}
      </View>
      {/* Formulaire d'ajout d'animal */}
      <FormulaireAnimal
        visible={formulaireVisible}
        onFermer={() => setFormulaireVisible(false)}
        onCreer={chargerAnimaux}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FAFAFA',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  erreurText: {
    fontSize: 16,
    color: '#C0392B',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 26,
  },
  vide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videText: {
    fontSize: 16,
    color: '#888',
  },
});
