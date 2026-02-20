// src/Pages/Doador/Agendamentos/index.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SchedulesAPI } from '../../../services/api';
import { useThemeRecolhe } from '../../../context/ThemeContext';

const statusPT = {
  pending: 'Pendente',
  accepted: 'Confirmado',
  arrived: 'Chegou',
  on_route: 'A caminho',
  collected: 'Concluído',
  canceled: 'Cancelado',
};

export default function Agendamentos() {
  const navigation = useNavigation();
  const { dark } = useThemeRecolhe();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const palette = {
    bg: dark ? '#0f1410' : '#fffacd',
    card: dark ? '#1b1f1b' : '#ffffff',
    title: dark ? '#c7f3d4' : '#2d6a4f',
    text: dark ? '#e6e6e6' : '#1b4332',
    muted: dark ? '#9aa3a6' : '#555',
    primary: dark ? '#2f7a4b' : '#40916c',
    accent: dark ? '#7cc0ff' : '#0a84ff',
    border: dark ? '#2f3b30' : '#e0e0e0',
  };

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

  const getStatusStyle = (statusCode) => {
    const base = { backgroundColor: palette.muted, color: '#fff' };
    switch (statusCode) {
      case 'pending':
        return { backgroundColor: '#f4a261', color: '#fff' };
      case 'accepted':
        return { backgroundColor: '#2a9d8f', color: '#fff' };
      case 'on_route':
        return { backgroundColor: dark ? '#3c5a73' : '#264653', color: '#fff' };
      case 'arrived':
        return { backgroundColor: palette.accent, color: '#fff' };
      case 'collected':
        return { backgroundColor: palette.primary, color: '#fff' };
      case 'canceled':
        return { backgroundColor: dark ? '#555' : '#7a7a7a', color: '#fff' };
      default:
        return base;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.titulo, { color: palette.title }]}>Meus Agendamentos</Text>

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
          const isArrived = statusCode === 'arrived';
          const isOnRoute = statusCode === 'on_route';
          const canTrack = ['accepted', 'on_route', 'arrived'].includes(statusCode) && !!item.collector_id;
          const statusStyle = getStatusStyle(statusCode);
          return (
            <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Text style={[styles.material, { color: palette.text }]}>{materials || 'Materiais'}</Text>
              <Text style={[styles.data, { color: palette.muted }]}>{dtStr}</Text>
              <View style={[styles.status, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusTexto, { color: statusStyle.color }]}>{st}</Text>
              </View>
              {isOnRoute ? (
                <Text style={[styles.infoBanner, { color: palette.accent }]}>O coletor está a caminho.</Text>
              ) : null}
              {isArrived ? (
                <>
                  <Text style={[styles.infoBanner, { color: palette.accent }]}>O coletor chegou ao local.</Text>
                  <TouchableOpacity
                    style={[styles.botaoConfirmar, { backgroundColor: palette.primary }]}
                    onPress={async () => {
                      try {
                        const updated = await SchedulesAPI.confirmCollection(item.id);
                        setItems((prev) => prev.map((it) => (it.id === item.id ? updated.schedule || updated : it)));
                        Alert.alert('Sucesso', 'Coleta confirmada.');
                      } catch (e) {
                        Alert.alert('Erro', e.message || 'Falha ao confirmar coleta');
                      }
                    }}
                  >
                    <Text style={styles.textoConfirmar}>Confirmar coleta</Text>
                  </TouchableOpacity>
                </>
              ) : null}
              {canTrack ? (
                <TouchableOpacity
                  style={[styles.botaoRota, { borderColor: palette.primary }]}
                  onPress={() => navigation.navigate('TrackColeta', { scheduleId: item.id })}
                >
                  <Text style={[styles.textoBotaoRota, { color: palette.primary }]}>Acompanhar rota do coletor</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            style={[styles.botaoNovo, { backgroundColor: palette.primary }]}
            onPress={() => navigation.navigate('RecicladosTabDoador')}
          >
            <Text style={styles.textoBotaoNovo}>+ Novo Agendamento</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 50, padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2, borderWidth: 1 },
  material: { fontSize: 16, fontWeight: 'bold' },
  data: { fontSize: 14, marginVertical: 4 },
  status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  statusTexto: { color: '#fff', fontWeight: '600' },
  botaoNovo: { marginTop: 24, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  textoBotaoNovo: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoBanner: { marginTop: 8, fontWeight: '600' },
  botaoConfirmar: { marginTop: 8, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  textoConfirmar: { color: '#fff', fontWeight: '700' },
  botaoRota: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  textoBotaoRota: {
    fontWeight: '700',
  },
});
