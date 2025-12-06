import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { MaterialsAPI } from '../../../services/api';
import { useThemeRecolhe } from '../../../context/ThemeContext';

const imageByName = (name) => {
  const n = String(name || '').toLowerCase();
  try {
    if (n.includes('paper') || n.includes('papel')) return require('../../../../assets/image/papel.png');
    if (n.includes('plastic') || n.includes('plasti') || n.includes('plás') || n.includes('plastico')) {
      return require('../../../../assets/image/plastico.png');
    }
    if (n.includes('glass') || n.includes('vidro')) return require('../../../../assets/image/vidro.png');
    if (n.includes('metal') || n.includes('alum')) return require('../../../../assets/image/metal.png');
    if (n.includes('elect') || n.includes('eletr')) return require('../../../../assets/image/eletronicos.png');
    return require('../../../../assets/image/papel.png');
  } catch {
    return undefined;
  }
};

export default function RecicladosDoador({ navigation }) {
  const { dark } = useThemeRecolhe();
  const [materiais, setMateriais] = useState([]);
  const { width } = useWindowDimensions();
  const route = useRoute();

  const CARD_WIDTH = (width - 56) / 2;

  const palette = {
    bg: dark ? '#0f1410' : '#fffacd',
    card: dark ? '#1c221c' : '#fff',
    cardBorder: dark ? '#2d3a2d' : '#e6e6e6',
    title: dark ? '#c7f3d4' : '#329845',
    text: dark ? '#e7e7e7' : '#217a31',
    inputBg: dark ? '#1f271f' : '#fffacd',
    inputBorder: dark ? '#3a473a' : '#bdbdbd',
    tagBg: dark ? '#2a2f24' : '#fffdc2',
    tagText: dark ? '#dcdcdc' : '#b9b900',
    tagSelectedBg: dark ? '#2f7a4b' : '#329845',
    tagSelectedText: '#fff',
    buttonBg: dark ? '#2f7a4b' : '#329845',
    buttonText: '#fff',
    shadow: '#329845',
  };

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
      style={[
        styles.card,
        {
          width: CARD_WIDTH,
          backgroundColor: palette.card,
          borderColor: item.selecionado ? palette.title : palette.cardBorder,
          shadowColor: palette.shadow,
        },
        item.selecionado && styles.cardSelecionado,
      ]}
      activeOpacity={0.9}
      onPress={() => alternarSelecionado(item.id)}
    >
      {item.imagem ? <Image source={item.imagem} style={styles.imagem} resizeMode="contain" /> : null}
      <Text style={[styles.nome, { color: palette.text }]}>{item.nome}</Text>
      {item.selecionado && (
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.inputBg, borderColor: palette.inputBorder, color: palette.text },
          ]}
          placeholder="Quantidade (kg)"
          placeholderTextColor={dark ? '#9aa3a6' : '#666'}
          keyboardType="numeric"
          value={item.quantidade}
          onChangeText={(texto) => atualizarQuantidade(item.id, texto)}
          maxLength={6}
        />
      )}
      <Text
        style={[
          styles.tag,
          {
            backgroundColor: item.selecionado ? palette.tagSelectedBg : palette.tagBg,
            color: item.selecionado ? palette.tagSelectedText : palette.tagText,
          },
        ]}
      >
        {item.selecionado ? 'Selecionado' : 'Toque para selecionar'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
    >
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        <Text style={[styles.titulo, { color: palette.title }]}>Escolha o material e informe a quantidade:</Text>
        <FlatList
          data={materiais}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.linha}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        />

        <TouchableOpacity style={[styles.botaoAgendar, { backgroundColor: palette.buttonBg }]} onPress={confirmarAgendamento}>
          <Text style={[styles.textoBotao, { color: palette.buttonText }]}>Confirmar Agendamento</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  titulo: { fontSize: 21, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  linha: { justifyContent: 'space-between', marginBottom: 16 },
  card: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.7,
    marginHorizontal: 4,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
  },
  cardSelecionado: { elevation: 5, transform: [{ scale: 1.045 }] },
  imagem: { width: 62, height: 62, marginBottom: 8 },
  nome: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  input: { width: '96%', borderWidth: 1, borderRadius: 8, padding: 7, marginTop: 7, marginBottom: 3, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  tag: { marginTop: 8, fontSize: 13, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 2 },
  tagSelecionado: {},
  botaoAgendar: { padding: 17, borderRadius: 13, alignItems: 'center', marginTop: 8, position: 'absolute', bottom: 28, left: 24, right: 24, elevation: 2 },
  textoBotao: { fontWeight: 'bold', fontSize: 17, letterSpacing: 0.2 },
});
