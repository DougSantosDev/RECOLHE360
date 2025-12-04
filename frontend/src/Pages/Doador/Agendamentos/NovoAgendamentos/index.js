import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { SchedulesAPI } from '../../../../services/api';

export default function NovoAgendamento() {
  const route = useRoute();
  const navigation = useNavigation();
  const { materiais } = route.params || { materiais: [] };
  const [place, setPlace] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmarEnvio = async () => {
    if (!place.trim()) {
      Alert.alert('Atencao', 'Informe o local da coleta.');
      return;
    }
    const dt = new Date(dataHora || '');
    if (!dataHora || isNaN(dt.getTime())) {
      Alert.alert('Atencao', 'Informe data e hora validas (ex: 2025-12-05 14:00).');
      return;
    }

    if (materiais.some((m) => !m.quantidade || Number(m.quantidade) <= 0)) {
      Alert.alert('Atencao', 'Preencha a quantidade de todos os materiais selecionados.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        place: place.trim(),
        scheduled_at: dt.toISOString(),
        notes: observacoes.trim() || null,
        materials: materiais.map((m) => ({
          id: m.backendId || Number(m.id),
          quantity_kg: Number(m.quantidade),
        })),
      };
      await SchedulesAPI.create(payload);
      Alert.alert('Sucesso!', 'Seu agendamento foi enviado com sucesso!');
      // Volta para a aba de Reciclados e limpa selecao
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AppDoadorStack',
          params: {
            screen: 'HomeDrawerDoador',
            params: {
              screen: 'RecicladosTabDoador',
              params: { clear: true },
            },
          },
        })
      );
    } catch (e) {
      Alert.alert('Erro', e.message || 'Falha ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={
          typeof item.imagem === 'number'
            ? item.imagem
            : typeof item.imagem === 'string'
              ? { uri: item.imagem }
              : item.imagem
        }
        style={styles.imagem}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.quantidade}>{item.quantidade} kg</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>Detalhes do Agendamento</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Local da coleta *</Text>
        <TextInput
          style={styles.input}
          placeholder="Rua, numero, bairro..."
          value={place}
          onChangeText={setPlace}
        />

        <Text style={styles.label}>Data e hora *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2025-12-05 14:00"
          value={dataHora}
          onChangeText={setDataHora}
        />

        <Text style={styles.label}>Observacoes (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Instrucoes extras para o coletor"
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />
      </View>

      <FlatList
        data={materiais}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.botao} onPress={confirmarEnvio} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" />
            <Text style={styles.textoBotao}>Enviar Agendamento</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    backgroundColor: '#fffacd',
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    color: '#1b4332',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    color: '#222',
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: 'top',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  imagem: {
    width: 50,
    height: 50,
    marginRight: 16,
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4332',
  },
  quantidade: {
    fontSize: 14,
    color: '#4c6e54',
    marginTop: 4,
  },
  botao: {
    backgroundColor: '#40916c',
    paddingVertical: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
