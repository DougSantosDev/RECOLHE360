// src/Pages/Doador/Agendamentos/index.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SchedulesAPI } from '../../../services/api';

const statusPT = {
  pending: 'Pendente',
  accepted: 'Confirmado',
  on_route: 'A caminho',
  collected: 'Concluido',
  canceled: 'Cancelado',
};

export default function Agendamentos() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await SchedulesAPI.mySchedules();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Agendamentos</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const materials = (item.materials || [])
            .map((m) => `${m.name} (${Number(m.pivot?.quantity_kg || 0)} kg)`)
            .join(', ');
          const dt = item.scheduled_at ? new Date(item.scheduled_at) : null;
          const dtStr = dt ? dt.toLocaleString() : 'Sem data';
          const statusCode = item.status;
          const st = statusPT[statusCode] || statusCode;
          return (
            <View style={styles.card}>
              <Text style={styles.material}>{materials || 'Materiais'}</Text>
              <Text style={styles.data}>{dtStr}</Text>
              <View style={[styles.status, getStatusStyle(statusCode)]}>
                <Text style={styles.statusTexto}>{st}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate('Reciclados')}>
            <Text style={styles.textoBotaoNovo}>+ Novo Agendamento</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const getStatusStyle = (statusCode) => {
  switch (statusCode) {
    case 'pending':
      return { backgroundColor: '#f4a261' };
    case 'accepted':
      return { backgroundColor: '#2a9d8f' };
    case 'collected':
      return { backgroundColor: '#264653' };
    case 'canceled':
      return { backgroundColor: '#7a7a7a' };
    default:
      return { backgroundColor: '#ccc' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 50, backgroundColor: '#fffacd', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#2d6a4f', marginBottom: 16 },
  card: { backgroundColor: '#ffffff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
  material: { fontSize: 16, fontWeight: 'bold', color: '#1b4332' },
  data: { fontSize: 14, color: '#555', marginVertical: 4 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  statusTexto: { color: '#fff', fontWeight: '600' },
  botaoNovo: { marginTop: 24, backgroundColor: '#40916c', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  textoBotaoNovo: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
