import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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

  const renderItem = ({ item }) => {
    const donor = item.donor?.name || 'Doador';
    const place = item.place || 'Endereço combinado';
    const dt = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Sem data';
    const acceptedByMe = !!item.collector_id;
    return (
      <View style={[styles.item, acceptedByMe && styles.itemConfirmado]}>
        <Text style={styles.endereco}>{place}</Text>
        <Text style={styles.dataHora}>Data: {dt}</Text>
        <Text style={styles.dataHora}>Doador: {donor}</Text>
        {tab === 'pending' ? (
          <TouchableOpacity style={styles.botao} onPress={() => accept(item.id)}>
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.textoBotao}>Aceitar</Text>
          </TouchableOpacity>
        ) : null}
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
});

