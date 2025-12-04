import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert, useWindowDimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialsAPI } from '../../../services/api';

const imageByName = (name) => {
  const n = String(name || '').toLowerCase();
  try {
    if (n.includes('paper') || n.includes('papel')) return require('../../../../assets/image/papel.png');
    if (n.includes('plastic') || n.includes('plasti')) return require('../../../../assets/image/plastico.png');
    if (n.includes('glass') || n.includes('vidro')) return require('../../../../assets/image/vidro.png');
    if (n.includes('metal') || n.includes('alum')) return require('../../../../assets/image/metal.png');
    if (n.includes('elect') || n.includes('eletr')) return require('../../../../assets/image/eletronicos.png');
    return require('../../../../assets/image/papel.png');
  } catch {
    return undefined;
  }
};

export default function RecicladosDoador({ navigation }) {
  const [materiais, setMateriais] = useState([]);
  const { width } = useWindowDimensions();
  const route = useRoute();

  const CARD_WIDTH = (width - 56) / 2;

  useEffect(() => {
    (async () => {
      try {
        const items = await MaterialsAPI.list();
        // Remove duplicados pelo id do backend
        const seen = new Set();
        const mapped = [];
        items.forEach((m) => {
          if (seen.has(m.id)) return;
          seen.add(m.id);
          mapped.push({
            id: String(m.id),
            backendId: m.id,
            nome: m.name,
            imagem: imageByName(m.name),
            selecionado: false,
            quantidade: '',
          });
        });
        setMateriais(mapped);
      } catch (e) {
        // fallback simples
        setMateriais([
          { id: '1', backendId: 1, nome: 'Paper', imagem: imageByName('Paper'), selecionado: false, quantidade: '' },
          { id: '2', backendId: 2, nome: 'Plastic', imagem: imageByName('Plastic'), selecionado: false, quantidade: '' },
          { id: '3', backendId: 3, nome: 'Glass', imagem: imageByName('Glass'), selecionado: false, quantidade: '' },
          { id: '4', backendId: 4, nome: 'Metal', imagem: imageByName('Metal'), selecionado: false, quantidade: '' },
          { id: '5', backendId: 5, nome: 'Electronics', imagem: imageByName('Electronics'), selecionado: false, quantidade: '' },
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    const clearFlag = route?.params?.clear || route?.params?.params?.clear;
    if (clearFlag) {
      setMateriais((prev) =>
        prev.map((item) => ({ ...item, selecionado: false, quantidade: '' })),
      );
      // limpa flags para evitar reaplicar
      navigation.setParams({ clear: false, params: { clear: false } });
    }
  }, [route?.params, navigation]);

  const alternarSelecionado = (id) => {
    setMateriais((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, selecionado: !item.selecionado, quantidade: !item.selecionado ? '' : item.quantidade }
          : item,
      ),
    );
  };

  const atualizarQuantidade = (id, valor) => {
    setMateriais((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantidade: valor.replace(/[^0-9.]/g, '') } : item)),
    );
  };

  const confirmarAgendamento = () => {
    const selecionados = materiais.filter((item) => item.selecionado);
    if (selecionados.length === 0) {
      Alert.alert('Atencao', 'Selecione pelo menos um material.');
      return;
    }
    if (selecionados.some((item) => !item.quantidade || Number(item.quantidade) <= 0)) {
      Alert.alert('Atencao', 'Preencha a quantidade (kg) de cada material selecionado.');
      return;
    }
    navigation.navigate('NovoAgendamento', { materiais: selecionados });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: CARD_WIDTH }, item.selecionado && styles.cardSelecionado]}
      activeOpacity={0.9}
      onPress={() => alternarSelecionado(item.id)}
    >
      {item.imagem ? <Image source={item.imagem} style={styles.imagem} resizeMode="contain" /> : null}
      <Text style={styles.nome}>{item.nome}</Text>
      {item.selecionado && (
        <TextInput
          style={styles.input}
          placeholder="Quantidade (kg)"
          keyboardType="numeric"
          value={item.quantidade}
          onChangeText={(texto) => atualizarQuantidade(item.id, texto)}
          maxLength={6}
        />
      )}
      <Text style={[styles.tag, item.selecionado && styles.tagSelecionado]}>
        {item.selecionado ? 'Selecionado' : 'Toque para selecionar'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escolha o material e informe a quantidade:</Text>
      <FlatList
        data={materiais}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.linha}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.botaoAgendar} onPress={confirmarAgendamento}>
        <Text style={styles.textoBotao}>Confirmar Agendamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffacd', paddingHorizontal: 16, paddingTop: 32 },
  titulo: { fontSize: 21, fontWeight: 'bold', color: '#329845', marginBottom: 12, textAlign: 'center' },
  linha: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.7,
    borderColor: '#e6e6e6',
    elevation: 2,
    shadowColor: '#329845',
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    marginHorizontal: 4,
  },
  cardSelecionado: { borderColor: '#329845', shadowOpacity: 0.16, backgroundColor: '#e8ffe0', elevation: 5, transform: [{ scale: 1.045 }] },
  imagem: { width: 62, height: 62, marginBottom: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#217a31', textAlign: 'center', marginBottom: 6 },
  input: { width: '96%', borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 8, backgroundColor: '#fffacd', padding: 7, marginTop: 7, marginBottom: 3, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#222' },
  tag: { marginTop: 8, fontSize: 13, color: '#b9b900', fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#fffdc2', marginBottom: 2 },
  tagSelecionado: { color: '#fff', backgroundColor: '#329845' },
  botaoAgendar: { backgroundColor: '#329845', padding: 17, borderRadius: 13, alignItems: 'center', marginTop: 8, position: 'absolute', bottom: 28, left: 24, right: 24, elevation: 2 },
  textoBotao: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.2 },
});
