import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SchedulesAPI } from '../../../services/api';

export default function AgendamentosColetor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await SchedulesAPI.myCollections();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      <View style={[styles.item, status === 'arrived' && styles.itemChegada, status === 'collected' && styles.itemConcluido]}>
        <View style={styles.info}>
          <Text style={styles.nome}>{donor}</Text>
          <Text style={styles.texto}>{place}</Text>
          <Text style={styles.texto}>Data: {dt}</Text>
          <Text style={styles.subtitulo}>Materiais:</Text>
          <Text style={styles.material}>{materials}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity style={styles.botaoMapa} onPress={() => abrirMapa(place, item.pickup_lat, item.pickup_lng)}>
            <Feather name="map-pin" size={18} color="#329845" />
            <Text style={styles.textoMapa}>Mapa</Text>
          </TouchableOpacity>
          {status === 'accepted' ? (
            <TouchableOpacity style={styles.botao} onPress={() => marcarOnRoute(item.id)}>
              <Feather name="navigation" size={20} color="#fff" />
              <Text style={styles.textoBotao}>A caminho</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'on_route' ? (
            <TouchableOpacity style={styles.botao} onPress={() => marcarArrived(item.id)}>
              <Feather name="map-pin" size={20} color="#fff" />
              <Text style={styles.textoBotao}>Cheguei</Text>
            </TouchableOpacity>
          ) : null}
          {status === 'arrived' ? (
            <Text style={{ color: '#0a84ff', fontWeight: '600' }}>Aguardando confirmação do doador</Text>
          ) : null}
          {status === 'collected' ? (
            <Text style={{ color: '#329845', fontWeight: '700' }}>Coleta finalizada</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Coletas</Text>
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
  container: { flex: 1, paddingVertical: 50, backgroundColor: '#f2fdf2', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#329845', marginBottom: 20, textAlign: 'center' },
  item: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
  itemChegada: { borderColor: '#0a84ff' },
  itemConcluido: { backgroundColor: '#e0ffe0', borderColor: '#329845' },
  info: { marginBottom: 10 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  texto: { fontSize: 14, color: '#555' },
  subtitulo: { marginTop: 8, fontWeight: 'bold', color: '#444' },
  material: { fontSize: 14, color: '#444', marginTop: 4 },
  botao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#329845', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  textoBotao: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  concluido: { color: '#329845', fontWeight: 'bold' },
  botaoMapa: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#329845' },
  textoMapa: { color: '#329845', fontWeight: 'bold', marginLeft: 6 },
});
