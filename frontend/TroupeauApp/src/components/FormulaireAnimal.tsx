/**
 * FormulaireAnimal
 *
 * IMPORTANT — react-native-windows : le composant <Modal> avec transparent=true
 * provoque un gel de l'interface dès qu'un TextInput reçoit le focus
 * (conflit entre la couche native du Modal et le système de focus Windows).
 * Solution : remplacer Modal par une View en position absolue rendue
 * directement dans l'arbre de composants, sans couche native séparée.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {creerAnimal, AnimalInput} from '../api';

type Props = {
  visible: boolean;
  onFermer: () => void;
  onCreer: () => void;
};

const VIDE: Partial<AnimalInput> = {
  nom: '',
  sexe: '',
  statut: 'présent',
  date_naissance: '',
  boucle: '',
  genotype: '',
  mere: undefined,
  pere: undefined,
  prix_achat: undefined,
  prix_vente: undefined,
  acheteur: '',
  date_vente: '',
  signes: '',
  date_onglons: '',
  date_vaccin: '',
  poids_dernier: undefined,
};

// --- Sous-composants ---

type ChampProps = {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  aide?: string;
  numerique?: boolean;
};

function Champ({label, valeur, onChange, placeholder, multiline, aide, numerique}: ChampProps) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      {aide ? <Text style={styles.aide}>{aide}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={valeur}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor="#AAA"
        multiline={multiline ?? false}
        // Props importantes pour react-native-windows :
        keyboardType={numerique ? 'numeric' : 'default'}
        returnKeyType={multiline ? 'default' : 'next'}
        blurOnSubmit={!multiline}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

type BoutonChoixProps = {
  label: string;
  options: {valeur: string; texte: string}[];
  valeur: string;
  onChange: (v: string) => void;
};

function BoutonChoix({label, options, valeur, onChange}: BoutonChoixProps) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choixRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.valeur}
            style={[styles.choixBtn, valeur === opt.valeur && styles.choixBtnActif]}
            onPress={() => onChange(opt.valeur)}>
            <Text style={[styles.choixBtnTexte, valeur === opt.valeur && styles.choixBtnTexteActif]}>
              {opt.texte}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- Formulaire ---

export default function FormulaireAnimal({visible, onFermer, onCreer}: Props) {
  const [form, setForm] = useState<Partial<AnimalInput>>(VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Rendu conditionnel : on ne monte rien quand le formulaire est fermé
  // (évite tout impact sur les performances et le focus quand invisible)
  if (!visible) {return null;}

  function set(champ: keyof AnimalInput, valeur: string) {
    setForm(prev => ({...prev, [champ]: valeur === '' ? null : valeur}));
  }

  function setNum(champ: keyof AnimalInput, valeur: string) {
    const n = parseFloat(valeur.replace(',', '.'));
    setForm(prev => ({...prev, [champ]: valeur === '' ? null : isNaN(n) ? null : n}));
  }

  function setInt(champ: keyof AnimalInput, valeur: string) {
    const n = parseInt(valeur, 10);
    setForm(prev => ({...prev, [champ]: valeur === '' ? null : isNaN(n) ? null : n}));
  }

  function reinitialiser() {
    setForm(VIDE);
    setErreur(null);
  }

  async function handleEnvoyer() {
    if (!form.nom || form.nom.trim() === '') {
      setErreur('Le nom est obligatoire.');
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      await creerAnimal(form);
      reinitialiser();
      onCreer();
      onFermer();
    } catch {
      setErreur("Impossible de créer l'animal. Vérifiez la connexion au serveur.");
    } finally {
      setEnvoi(false);
    }
  }

  function handleFermer() {
    reinitialiser();
    onFermer();
  }

  return (
    // Overlay plein écran en position absolue — remplace <Modal>
    <View style={styles.overlay}>
      {/* Fond semi-transparent cliquable pour fermer */}
      <TouchableOpacity style={styles.fond} onPress={handleFermer} activeOpacity={1} />

      {/* Fenêtre du formulaire */}
      <View style={styles.fenetre}>
        {/* En-tête */}
        <View style={styles.entete}>
          <Text style={styles.titre}>Nouvel animal</Text>
          <TouchableOpacity onPress={handleFermer} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.fermerX}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Corps scrollable */}
        <ScrollView
          style={styles.corps}
          contentContainerStyle={styles.corpsContenu}
          keyboardShouldPersistTaps="handled">

          <Text style={styles.section}>Identité</Text>

          <Champ
            label="Nom *"
            valeur={form.nom ?? ''}
            onChange={v => set('nom', v)}
            placeholder="Ex : Flora"
          />

          <BoutonChoix
            label="Sexe"
            options={[
              {valeur: 'F', texte: 'Femelle'},
              {valeur: 'M', texte: 'Mâle'},
            ]}
            valeur={form.sexe ?? ''}
            onChange={v => set('sexe', v)}
          />

          <BoutonChoix
            label="Statut"
            options={[
              {valeur: 'présent', texte: 'Présent'},
              {valeur: 'vendu',   texte: 'Vendu'},
              {valeur: 'mort',    texte: 'Mort'},
            ]}
            valeur={form.statut ?? ''}
            onChange={v => set('statut', v)}
          />

          <Champ
            label="Date de naissance"
            valeur={form.date_naissance ?? ''}
            onChange={v => set('date_naissance', v)}
            placeholder="AAAA-MM-JJ"
            aide="Format : 2022-03-15"
          />

          <Champ
            label="Numéro de boucle"
            valeur={form.boucle ?? ''}
            onChange={v => set('boucle', v)}
            placeholder="Ex : FR 74 12345"
          />

          <Champ
            label="Génotype"
            valeur={form.genotype ?? ''}
            onChange={v => set('genotype', v)}
            placeholder="Ex : ARR/ARR"
          />

          <Text style={styles.section}>Filiation</Text>

          <Champ
            label="ID de la mère"
            valeur={form.mere != null ? String(form.mere) : ''}
            onChange={v => setInt('mere', v)}
            placeholder="Numéro de la mère dans la liste"
            aide="Laisser vide si inconnu"
            numerique
          />

          <Champ
            label="ID du père"
            valeur={form.pere != null ? String(form.pere) : ''}
            onChange={v => setInt('pere', v)}
            placeholder="Numéro du père dans la liste"
            aide="Laisser vide si inconnu"
            numerique
          />

          <Text style={styles.section}>Derniers soins</Text>

          <Champ
            label="Date taille des onglons"
            valeur={form.date_onglons ?? ''}
            onChange={v => set('date_onglons', v)}
            placeholder="AAAA-MM-JJ"
          />

          <Champ
            label="Date dernier vaccin"
            valeur={form.date_vaccin ?? ''}
            onChange={v => set('date_vaccin', v)}
            placeholder="AAAA-MM-JJ"
          />

          <Text style={styles.section}>Poids</Text>

          <Champ
            label="Dernier poids connu (kg)"
            valeur={form.poids_dernier != null ? String(form.poids_dernier) : ''}
            onChange={v => setNum('poids_dernier', v)}
            placeholder="Ex : 68.5"
            numerique
          />

          <Text style={styles.section}>Vente (si vendu)</Text>

          <Champ
            label="Prix d'achat (CHF)"
            valeur={form.prix_achat != null ? String(form.prix_achat) : ''}
            onChange={v => setNum('prix_achat', v)}
            placeholder="Ex : 450"
            numerique
          />

          <Champ
            label="Prix de vente (CHF)"
            valeur={form.prix_vente != null ? String(form.prix_vente) : ''}
            onChange={v => setNum('prix_vente', v)}
            placeholder="Ex : 600"
            numerique
          />

          <Champ
            label="Acheteur"
            valeur={form.acheteur ?? ''}
            onChange={v => set('acheteur', v)}
            placeholder="Nom de l'acheteur"
          />

          <Champ
            label="Date de vente"
            valeur={form.date_vente ?? ''}
            onChange={v => set('date_vente', v)}
            placeholder="AAAA-MM-JJ"
          />

          <Text style={styles.section}>Remarques</Text>

          <Champ
            label="Signes particuliers"
            valeur={form.signes ?? ''}
            onChange={v => set('signes', v)}
            placeholder="Tache blanche, boiterie, caractère…"
            multiline
          />

          {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
        </ScrollView>

        {/* Pied de page */}
        <View style={styles.piedDePage}>
          <TouchableOpacity style={styles.btnAnnuler} onPress={handleFermer}>
            <Text style={styles.btnAnnulerTexte}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnEnregistrer, envoi && styles.btnDesactive]}
            onPress={handleEnvoyer}
            disabled={envoi}>
            {envoi
              ? <ActivityIndicator color="#FFF" size="small" />
              : <Text style={styles.btnEnregistrerTexte}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay plein écran — position absolute couvre toute la zone parente
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  // Fond semi-transparent (couche séparée pour capturer les clics en dehors)
  fond: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  fenetre: {
    width: 520,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    // Ombre pour détacher visuellement du fond
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 101,
  },
  entete: {
    backgroundColor: '#0F6E56',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titre: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  fermerX: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  corps: {
    flex: 1,
  },
  corpsContenu: {
    padding: 24,
    gap: 4,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F6E56',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8EDE7',
    paddingBottom: 4,
  },
  champ: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  aide: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  choixRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choixBtn: {
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
  },
  choixBtnActif: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  choixBtnTexte: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  choixBtnTexteActif: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  erreur: {
    color: '#C0392B',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  piedDePage: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
  },
  btnAnnuler: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CFCFCF',
  },
  btnAnnulerTexte: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  btnEnregistrer: {
    backgroundColor: '#1D9E75',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center',
  },
  btnDesactive: {
    opacity: 0.6,
  },
  btnEnregistrerTexte: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
