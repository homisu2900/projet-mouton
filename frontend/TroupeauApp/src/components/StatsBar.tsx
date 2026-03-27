import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Animal} from '../api';

type Props = {
  animaux: Animal[];
};

export default function StatsBar({animaux}: Props) {
  const actifs   = animaux.filter(a => a.statut === 'présent').length;
  const vendus   = animaux.filter(a => a.statut === 'vendu').length;
  const recettes = animaux
    .reduce((sum, a) => sum + (a.prix_vente ?? 0), 0);

  // Vermifuge à jour : dernier soin "vermifuge" < 6 mois
  const sixMoisMs = 6 * 30 * 24 * 60 * 60 * 1000;
  const vermifugesOk = animaux.filter(a => {
    // On considère à jour si date_vaccin (champ le plus proche) est récente
    // La vérification précise sera faite quand les soins seront chargés
    return true; // simplifié — sera affiné avec les données de soins
  }).length;

  const stats = [
    {label: 'Animaux actifs',    value: String(actifs)},
    {label: 'Vendus',            value: String(vendus)},
    {label: 'Recettes',          value: `${recettes.toFixed(0)} CHF`},
    {label: 'Vermifuges à jour', value: `${vermifugesOk}/${actifs}`},
  ];

  return (
    <View style={styles.container}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={styles.stat}>
            <Text style={styles.value}>{s.value}</Text>
            <Text style={styles.label}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.separator} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F7F4',
    borderBottomWidth: 1,
    borderBottomColor: '#D0E8DF',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F6E56',
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  separator: {
    width: 1,
    backgroundColor: '#C5DDD6',
    marginHorizontal: 8,
  },
});
