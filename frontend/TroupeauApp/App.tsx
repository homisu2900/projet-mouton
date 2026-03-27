import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import TroupeauScreen from './src/screens/TroupeauScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <TroupeauScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
