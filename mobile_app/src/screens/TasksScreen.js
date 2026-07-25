import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tasks Board (Kanban)</Text>
      <Text style={styles.subtext}>Coming in next iteration...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151521',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#a1a1aa',
    marginTop: 8,
  }
});
