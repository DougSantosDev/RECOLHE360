import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
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

  const concluir = async (scheduleId) => {
    try {
      await SchedulesAPI.updateStatus(scheduleId, 'collected');
      Alert.alert('Sucesso', 'Agendamento marcado como concluído!');
      load();
    } catch (e) {
      Alert.alert('Erro', e.message || 'Falha ao concluir');
    }
  };

  const renderItem = ({ item }) => {
    const donor = item.donor?.name || 'Doador';
    const place = item.place || 'Endereço combinado';
    const dt = item.scheduled_at ? new Date(item.scheduled_at).toLocaleString() : 'Sem data';
    const materials = (item.materials || [])
      .map((m) => `${m.name} (${Number(m.pivot?.quantity_kg || 0)} kg)`).join(', ');
    const concluido = item.status === 'collected';
    return (
      <View style={[styles.item, concluido && styles.itemConcluido]}>
        <View style={styles.info}>
          <Text style={styles.nome}>{donor}</Text>
          <Text style={styles.texto}>{place}</Text>
          <Text style={styles.texto}>Data: {dt}</Text>
          <Text style={styles.subtitulo}>Materiais:</Text>
          <Text style={styles.material}>{materials}</Text>
        </View>
        {!concluido ? (
          <TouchableOpacity style={styles.botao} onPress={() => concluir(item.id)}>
            <Feather name="check" size={20} color="#fff" />
            <Text style={styles.textoBotao}>Concluir</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.concluido}>Concluído</Text>
        )}
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
  itemConcluido: { backgroundColor: '#e0ffe0', borderColor: '#329845' },
  info: { marginBottom: 10 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  texto: { fontSize: 14, color: '#555' },
  subtitulo: { marginTop: 8, fontWeight: 'bold', color: '#444' },
  material: { fontSize: 14, color: '#444', marginTop: 4 },
  botao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#329845', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  textoBotao: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
  concluido: { color: '#329845', fontWeight: 'bold' },
});

