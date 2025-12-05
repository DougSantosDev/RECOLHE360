import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SchedulesAPI } from '../../../services/api';

export default function RotasColetor() {
  const [tab, setTab] = useState('pending'); // 'pending' | 'accepted'
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
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
  };

  useEffect(() => { load(); }, []);

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
      alert(e.message || 'Falha ao atualizar para a caminho');
    }
  };

  const collected = async (id) => {
    try {
      await SchedulesAPI.collected(id);
      load();
    } catch (e) {
      alert(e.message || 'Falha ao concluir coleta');
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
    const place = item.pickup_address_text || item.place || 'Endereco combinado';
    const dt = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Sem data';
    const acceptedByMe = !!item.collector_id;
    return (
      <View style={[styles.item, acceptedByMe && styles.itemConfirmado]}>
        <Text style={styles.endereco}>{place}</Text>
        <Text style={styles.dataHora}>Data: {dt}</Text>
        <Text style={styles.dataHora}>Doador: {donor}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          <TouchableOpacity style={styles.botaoSec} onPress={() => abrirMapa(place, item.pickup_lat, item.pickup_lng)}>
            <Feather name="map-pin" size={18} color="#329845" />
            <Text style={styles.textoBotaoSec}>Mapa</Text>
          </TouchableOpacity>
          {tab === 'pending' ? (
            <TouchableOpacity style={styles.botao} onPress={() => accept(item.id)}>
              <Feather name="check-circle" size={20} color="#fff" />
              <Text style={styles.textoBotao}>Aceitar</Text>
            </TouchableOpacity>
          ) : (
            <>
              {item.status === 'accepted' ? (
                <TouchableOpacity style={styles.botao} onPress={() => onRoute(item.id)}>
                  <Feather name="navigation" size={20} color="#fff" />
                  <Text style={styles.textoBotao}>A caminho</Text>
                </TouchableOpacity>
              ) : null}
              {item.status === 'on_route' ? (
                <TouchableOpacity style={styles.botao} onPress={() => collected(item.id)}>
                  <Feather name="check" size={20} color="#fff" />
                  <Text style={styles.textoBotao}>Concluir</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      </View>
    );
  };

  const data = tab === 'pending' ? pending : accepted;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Rotas de Coleta</Text>

      <View style={styles.filtros}>
        <TouchableOpacity style={[styles.filtroBotao, tab==='pending' && styles.filtroAtivo]} onPress={() => setTab('pending')}>
          <Text>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBotao, tab==='accepted' && styles.filtroAtivo]} onPress={() => setTab('accepted')}>
          <Text>Aceitas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>Nenhuma rota.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2fdf2', paddingVertical: 50, padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#329845' },
  filtros: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  filtroBotao: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginHorizontal: 5, backgroundColor: '#eee' },
  filtroAtivo: { backgroundColor: '#c0efc0' },
  item: { backgroundColor: '#ffffff', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#ccc', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  itemConfirmado: { backgroundColor: '#e6ffe6', borderColor: '#329845' },
  endereco: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  dataHora: { fontSize: 14, color: '#666', marginBottom: 8 },
  botao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#329845', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  textoBotao: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  botaoSec: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#329845' },
  textoBotaoSec: { color: '#329845', fontWeight: 'bold', marginLeft: 6 },
});
