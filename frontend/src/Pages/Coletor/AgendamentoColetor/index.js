import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { SchedulesAPI } from '../../../services/api';
import { useThemeRecolhe } from '../../../context/ThemeContext';

export default function AgendamentosColetor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { dark } = useThemeRecolhe();

  const palette = {
    bg: dark ? '#0f1410' : '#f2fdf2',
    card: dark ? '#1b1f1b' : '#fff',
    border: dark ? '#2f3b30' : '#ccc',
    cardDone: dark ? '#1d2a1d' : '#e0ffe0',
    accent: dark ? '#7cc0ff' : '#0a84ff',
    title: dark ? '#c7f3d4' : '#329845',
    text: dark ? '#e6e6e6' : '#333',
    muted: dark ? '#9aa3a6' : '#555',
    label: dark ? '#b8e3c3' : '#1b4332',
    summaryBg: dark ? '#1f271f' : '#e8ffe0',
    summaryBorder: dark ? '#2f3b30' : '#c6e7cc',
    primary: dark ? '#2f7a4b' : '#329845',
    buttonText: '#fff',
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SchedulesAPI.myCollections();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
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

  const abrirMapa = (address, lat, lng) => {
    let url;
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (address) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }
    if (url) Linking.openURL(url);
  };

  const marcarOnRoute = async (id) => {
    try {
      await SchedulesAPI.onRoute(id);
      load();
    } catch (e) {
      Alert.alert('Erro', e.message || 'Falha ao marcar a caminho');
    }
  };

  const marcarArrived = async (id) => {
    try {
      await SchedulesAPI.arrived(id);
      load();
    } catch (e) {
      Alert.alert('Erro', e.message || 'Falha ao marcar chegada');
    }
  };

  const renderItem = ({ item }) => {
    const donor = item.donor?.name || 'Doador';
    const place = item.pickup_address_text || item.place || 'Endereco combinado';
    const dt = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Sem data';
    const materials = (item.materials || [])
      .map((m) => `${m.name} (${Number(m.pivot?.quantity_kg || 0)} kg)`).join(', ');
    const status = item.status;
    return (
      <View
        style={[
          styles.item,
          {
            backgroundColor: status === 'collected' ? palette.cardDone : palette.card,
            borderColor: status === 'arrived' ? palette.accent : palette.border,
          },
        ]}
      >
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: palette.summaryBg,
              borderColor: palette.summaryBorder,
            },
          ]}
        >
          <Feather name="home" size={16} color={palette.primary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: palette.label }]}>Endereço do doador</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>{place}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={[styles.nome, { color: palette.text }]}>{donor}</Text>
          <Text style={[styles.texto, { color: palette.muted }]}>Data: {dt}</Text>
          <Text style={[styles.subtitulo, { color: palette.text }]}>Materiais:</Text>
          <Text style={[styles.material, { color: palette.text }]}>{materials}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={[styles.botaoMapa, { borderColor: palette.primary }]}
            onPress={() => abrirMapa(place, item.pickup_lat, item.pickup_lng)}
          >
            <Feather name="map-pin" size={18} color={palette.primary} />
            <Text style={[styles.textoMapa, { color: palette.primary }]}>Mapa</Text>
          </TouchableOpacity>
          {status === 'accepted' ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: palette.primary }]} onPress={() => marcarOnRoute(item.id)}>
              <Feather name="navigation" size={20} color={palette.buttonText} />
              <Text style={[styles.textoBotao, { color: palette.buttonText }]}>A caminho</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'on_route' ? (
            <TouchableOpacity style={[styles.botao, { backgroundColor: palette.primary }]} onPress={() => marcarArrived(item.id)}>
              <Feather name="map-pin" size={20} color={palette.buttonText} />
              <Text style={[styles.textoBotao, { color: palette.buttonText }]}>Cheguei</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'arrived' ? (
            <Text style={{ color: palette.accent, fontWeight: '600' }}>Aguardando confirmação do doador</Text>
          ) : null}
          {status === 'collected' ? (
            <Text style={{ color: palette.primary, fontWeight: '700' }}>Coleta finalizada</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.titulo, { color: palette.title }]}>Minhas Coletas</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 50, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  item: { padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 1, marginBottom: 10 },
  summaryLabel: { fontSize: 12, fontWeight: '700' },
  summaryValue: { fontSize: 13, marginTop: 2 },
  info: { marginBottom: 10 },
  nome: { fontSize: 16, fontWeight: 'bold' },
  texto: { fontSize: 14 },
  subtitulo: { marginTop: 8, fontWeight: 'bold' },
  material: { fontSize: 14, marginTop: 4 },
  botao: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  textoBotao: { fontWeight: 'bold', marginLeft: 6 },
  concluido: { fontWeight: 'bold' },
  botaoMapa: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, borderWidth: 1 },
  textoMapa: { fontWeight: 'bold', marginLeft: 6 },
});
