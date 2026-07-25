import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

// Mock FastAPI Endpoint
const API_URL = 'http://10.0.2.2:8000'; // Standard Android emulator localhost alias

export default function DashboardScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from your FastAPI backend
    // fetch(`${API_URL}/projects`).then(res => res.json()).then(...)
    
    // Mocking data to demonstrate FSM state display
    setTimeout(() => {
      setProjects([
        { id: 1, name: 'Smart IoT Hub', workflow_state: 'Prototyping (Code)' },
        { id: 2, name: 'PCB Rev 2', workflow_state: 'Design (KiCad)' },
        { id: 3, name: 'Documentation', workflow_state: 'Ideation' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const renderProject = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{item.workflow_state}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Active Projects</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" />
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProject}
          contentContainerStyle={{ gap: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151521',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e1e2d',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366f1',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
