import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Animal} from '../api';

type Props = {
  animal: Animal;
  selected: boolean;
  onPress: () => void;
};

function calcAge(dateNaissance: string | null): string {
  if (!dateNaissance) {return '—';}
  const naissance = new Date(dateNaissance);
  const now = new Date();
  const mois = (now.getFullYear() - naissance.getFullYear()) * 12
    + now.getMonth() - naissance.getMonth();
  if (mois < 24) {return `${mois} mois`;}
  return `${Math.floor(mois / 12)} ans`;
}

function initiales(nom: string | null): string {
  if (!nom) {return '?';}
  return nom
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Vérifie si un soin est en retard (> 6 mois)
function soinsEnRetard(animal: Animal): boolean {
  const sixMoisMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const maintenant = Date.now();
  const retardOnglons =
    animal.date_onglons
      ? maintenant - new Date(animal.date_onglons).getTime() > sixMoisMs
      : true;
  const retardVaccin =
    animal.date_vaccin
      ? maintenant - new Date(animal.date_vaccin).getTime() > sixMoisMs
      : true;
  return retardOnglons || retardVaccin;
}

export default function AnimalItem({animal, selected, onPress}: Props) {
  const enRetard = soinsEnRetard(animal);
  const sexeLabel = animal.sexe === 'M' ? 'Mâle' : animal.sexe === 'F' ? 'Femelle' : '—';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, selected && styles.selected]}>
      {/* Trait vert à gauche si sélectionné */}
      {selected && <View style={styles.selectedBar} />}

      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initiales(animal.nom)}</Text>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.nom}>{animal.nom ?? '—'}</Text>
          {enRetard && <View style={styles.alertDot} />}
        </View>
        <Text style={styles.detail}>
          {sexeLabel} · {calcAge(animal.date_naissance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    backgroundColor: '#FFFFFF',
  },
  selected: {
    backgroundColor: '#F3F3F3',
  },
  selectedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1D9E75',
    borderRadius: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D9E75',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E07B10',
  },
  detail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
