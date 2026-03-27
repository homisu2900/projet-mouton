import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

type Tab = 'Troupeau' | 'Généalogie' | 'Soins' | 'Finances';
const TABS: Tab[] = ['Troupeau', 'Généalogie', 'Soins', 'Finances'];

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onAjouter: () => void;
};

export default function Header({activeTab, onTabChange, onAjouter}: Props) {
  return (
    <View style={styles.container}>
      {/* Titre à gauche */}
      <Text style={styles.title}>Nez Noir du Valais</Text>

      {/* Onglets centrés */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton Ajouter à droite */}
      <TouchableOpacity style={styles.addButton} onPress={onAjouter}>
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F6E56',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addButtonInner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
