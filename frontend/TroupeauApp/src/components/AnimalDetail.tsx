import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Animal, Soin} from '../api';

type Props = {
  animal: Animal;
  soins: Soin[];
  onModifier: () => void;
  onAjouterSoin: () => void;
  onSupprimer: () => void;
};

function formatDate(iso: string | null): string {
  if (!iso) {return '—';}
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function soinEnRetard(date: string | null): boolean {
  if (!date) {return true;}
  const sixMoisMs = 6 * 30 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(date).getTime() > sixMoisMs;
}

type InfoCellProps = {label: string; value: string};
function InfoCell({label, value}: InfoCellProps) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={styles.infoCellValue}>{value}</Text>
    </View>
  );
}

type SoinCellProps = {label: string; date: string | null};
function SoinCell({label, date}: SoinCellProps) {
  const retard = soinEnRetard(date);
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoCellLabel}>{label}</Text>
      <Text style={[styles.infoCellValue, retard && styles.retard]}>
        {date ? formatDate(date) : 'Non renseigné'}
      </Text>
    </View>
  );
}

export default function AnimalDetail({
  animal,
  soins,
  onModifier,
  onAjouterSoin,
  onSupprimer,
}: Props) {
  const sexeLabel =
    animal.sexe === 'M' ? 'Mâle' : animal.sexe === 'F' ? 'Femelle' : '—';
  const neLe =
    animal.sexe === 'M' ? `Né le ${formatDate(animal.date_naissance)}`
    : `Née le ${formatDate(animal.date_naissance)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ---- En-tête de la fiche ---- */}
      <View style={styles.ficheHeader}>
        <Text style={styles.animalNom}>{animal.nom ?? '—'}</Text>

        {/* Ligne 1 : sexe · date de naissance, date alignée à droite */}
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>{sexeLabel}</Text>
          <Text style={styles.headerText}>{neLe}</Text>
        </View>

        {/* Ligne 2 : numéro de boucle seul */}
        <Text style={styles.boucle}>
          {animal.boucle ? `Boucle ${animal.boucle}` : 'Boucle non renseignée'}
        </Text>
      </View>

      {/* ---- Section Informations ---- */}
      <Text style={styles.sectionTitle}>Informations</Text>
      <View style={styles.grid}>
        <InfoCell label="Génotype"   value={animal.genotype   ?? '—'} />
        <InfoCell label="Statut"     value={animal.statut     ?? '—'} />
        <InfoCell label="Poids"      value={animal.poids_dernier != null ? `${animal.poids_dernier} kg` : '—'} />
        <InfoCell label="Prix achat" value={animal.prix_achat != null ? `${animal.prix_achat} CHF` : '—'} />
      </View>

      {/* ---- Section Derniers soins ---- */}
      <Text style={styles.sectionTitle}>Derniers soins</Text>
      <View style={styles.grid}>
        <SoinCell label="Vermifuge"  date={
          soins.find(s => s.type === 'vermifuge')?.date ?? null
        } />
        <SoinCell label="Tonte"      date={
          soins.find(s => s.type === 'tonte')?.date ?? null
        } />
        <SoinCell label="Onglons"    date={animal.date_onglons} />
        <SoinCell label="Vaccin"     date={animal.date_vaccin}  />
      </View>

      {/* ---- Historique des soins ---- */}
      {soins.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Historique</Text>
          {soins.slice(0, 5).map(soin => (
            <View key={soin.id} style={styles.soinRow}>
              <Text style={styles.soinType}>{soin.type ?? '—'}</Text>
              <Text style={styles.soinDate}>{formatDate(soin.date)}</Text>
              {soin.notes ? (
                <Text style={styles.soinNotes}>{soin.notes}</Text>
              ) : null}
            </View>
          ))}
        </>
      )}

      {/* ---- Boutons d'action ---- */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnModifier} onPress={onModifier}>
          <Text style={styles.btnModifierText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSoin} onPress={onAjouterSoin}>
          <Text style={styles.btnSoinText}>+ Ajouter un soin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSupprimer} onPress={onSupprimer}>
          <Text style={styles.btnSupprimerText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 24,
  },
  ficheHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  animalNom: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerText: {
    fontSize: 15,
    color: '#444',
  },
  boucle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6E56',
    marginBottom: 10,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  infoCell: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  infoCellLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  infoCellValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  retard: {
    color: '#BA7517',
  },
  soinRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  soinType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    width: 90,
    textTransform: 'capitalize',
  },
  soinDate: {
    fontSize: 14,
    color: '#555',
  },
  soinNotes: {
    fontSize: 13,
    color: '#888',
    flex: 1,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  btnModifier: {
    backgroundColor: '#1D9E75',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnModifierText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  btnSoin: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1D9E75',
  },
  btnSoinText: {
    color: '#1D9E75',
    fontSize: 15,
    fontWeight: '600',
  },
  btnSupprimer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C0392B',
  },
  btnSupprimerText: {
    color: '#C0392B',
    fontSize: 15,
    fontWeight: '600',
  },
});
