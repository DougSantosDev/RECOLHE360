import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { SchedulesAPI } from '../../../services/api';
import { useThemeRecolhe } from '../../../context/ThemeContext';

export default function RotasColetor() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(false);
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#f2fdf2',
      card: dark ? '#1b1f1b' : '#ffffff',
      border: dark ? '#2f3b30' : '#ccc',
      cardAccepted: dark ? '#1d2a1d' : '#e6ffe6',
      title: dark ? '#c7f3d4' : '#329845',
      text: dark ? '#e6e6e6' : '#333',
      muted: dark ? '#9aa3a6' : '#666',
      primary: dark ? '#2f7a4b' : '#329845',
      accent: dark ? '#7cc0ff' : '#0a84ff',
      summaryBg: dark ? '#1f271f' : '#e8ffe0',
      summaryBorder: dark ? '#2f3b30' : '#c6e7cc',
      chipBg: dark ? '#262a23' : '#eeeeee',
      chipText: dark ? '#dcdcdc' : '#333',
      buttonText: '#fff',
    }),
    [dark],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const pend = await SchedulesAPI.list('pending');
      const mine = await SchedulesAPI.myCollections();
      setPending(pend?.data || pend || []);
      setAccepted(Array.isArray(mine) ? mine : []);
    } catch (e) {
      setPending([]);
      setAccepted([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }, [load]),
  );

  const accept = async (id) => {
    try {
      await SchedulesAPI.accept(id);
      load();
    } catch (e) {
      alert(e.message || 'Falha ao aceitar');
    }
  };

  const onRoute = async (id) => {
    try {
      await SchedulesAPI.onRoute(id);
      load();
    } catch (e) {
      alert(e.message || 'Falha ao marcar a caminho');
    }
  };

  const arrived = async (id) => {
    try {
      await SchedulesAPI.arrived(id);
      load();
    } catch (e) {
      alert(e.message || 'Falha ao marcar chegada');
    }
  };

  const abrirMapa = (address, lat, lng) => {
    let url;
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (address) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }) => {
    const donor = item.donor?.name || 'Doador';
    const place = item.pickup_address_text || item.place || 'Endereço combinado';
    const dt = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Sem data';
    const acceptedByMe = !!item.collector_id;

    return (
      <View
        style={[
          styles.item,
          {
            backgroundColor: acceptedByMe ? palette.cardAccepted : palette.card,
            borderColor: acceptedByMe ? palette.primary : palette.border,
            shadowColor: dark ? '#000' : '#000',
          },
        ]}
      >
        <View style={[styles.summaryCard, { backgroundColor: palette.summaryBg, borderColor: palette.summaryBorder }]}>
          <Feather name="home" size={16} color={palette.primary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: palette.primary }]}>Endereço do doador</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{place}</Text>
          </View>
        </View>

        <Text style={[styles.dataHora, { color: palette.muted }]}>Data: {dt}</Text>
        <Text style={[styles.dataHora, { color: palette.muted }]}>Doador: {donor}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <TouchableOpacity style={[styles.botaoSec, { borderColor: palette.primary }]} onPress={() => abrirMapa(place, item.pickup_lat, item.pickup_lng)}>
            <Feather name="map-pin" size={18} color={palette.primary} />
            <Text style={[styles.textoBotaoSec, { color: palette.primary }]}>Mapa</Text>
          </TouchableOpacity>

          {tab === 'pending' ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: palette.primary }]} onPress={() => accept(item.id)}>
              <Feather name="check-circle" size={20} color={palette.buttonText} />
              <Text style={[styles.textoBotao, { color: palette.buttonText }]}>Aceitar</Text>
            </TouchableOpacity>
          ) : (
            <>
              {item.status === 'accepted' ? (
                <TouchableOpacity style={[styles.botao, { backgroundColor: palette.primary }]} onPress={() => onRoute(item.id)}>
                  <Feather name="navigation" size={20} color={palette.buttonText} />
                  <Text style={[styles.textoBotao, { color: palette.buttonText }]}>A caminho</Text>
                </TouchableOpacity>
              ) : null}
              {item.status === 'on_route' ? (
                <TouchableOpacity style={[styles.botao, { backgroundColor: palette.primary }]} onPress={() => arrived(item.id)}>
                  <Feather name="map-pin" size={20} color={palette.buttonText} />
                  <Text style={[styles.textoBotao, { color: palette.buttonText }]}>Cheguei</Text>
                </TouchableOpacity>
              ) : null}
              {item.status === 'arrived' ? (
                <Text style={{ color: palette.accent, fontWeight: '600', marginTop: 4 }}>Aguardando confirmação do doador...</Text>
              ) : null}
            </>
          )}
        </View>
      </View>
    );
  };

  const data = tab === 'pending' ? pending : accepted;

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.titulo, { color: palette.title }]}>Rotas de Coleta</Text>

      <View style={styles.filtros}>
        <TouchableOpacity
          style={[styles.filtroBotao, { backgroundColor: tab === 'pending' ? palette.primary : palette.chipBg }]}
          onPress={() => setTab('pending')}
        >
          <Text style={{ color: tab === 'pending' ? palette.buttonText : palette.chipText }}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filtroBotao, { backgroundColor: tab === 'accepted' ? palette.primary : palette.chipBg }]}
          onPress={() => setTab('accepted')}
        >
          <Text style={{ color: tab === 'accepted' ? palette.buttonText : palette.chipText }}>Aceitas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30, color: palette.muted }}>Nenhuma rota.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 50, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  filtros: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, gap: 8 },
  filtroBotao: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  item: { padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 8 },
  summaryLabel: { fontSize: 12, fontWeight: '700' },
  summaryValue: { fontSize: 13, marginTop: 2 },
  dataHora: { fontSize: 14, marginBottom: 8 },
  botao: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  textoBotao: { fontWeight: 'bold', marginLeft: 6 },
  botaoSec: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, borderWidth: 1 },
  textoBotaoSec: { fontWeight: 'bold', marginLeft: 6 },
});
