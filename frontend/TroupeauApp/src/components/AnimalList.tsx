import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Animal} from '../api';
import AnimalItem from './AnimalItem';

type Props = {
  animaux: Animal[];
  selectedId: number | null;
  onSelect: (animal: Animal) => void;
};

export default function AnimalList({animaux, selectedId, onSelect}: Props) {
  return (
    <ScrollView style={styles.container}>
      {animaux.map(animal => (
        <AnimalItem
          key={animal.id}
          animal={animal}
          selected={animal.id === selectedId}
          onPress={() => onSelect(animal)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 340,
    borderRightWidth: 1,
    borderRightColor: '#DDEEE8',
    backgroundColor: '#FFFFFF',
  },
});
