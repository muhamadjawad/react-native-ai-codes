// App.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AIResponseGenerator from './src/components/AIResponseGenerator';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <AIResponseGenerator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
