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
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { SchedulesAPI } from '../../../../services/api';
import { useUser } from '../../../../context/UsarContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function NovoAgendamento() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { materiais } = route.params || { materiais: [] };
  const [place, setPlace] = useState('');
  const [dataStr, setDataStr] = useState('');
  const [horaStr, setHoraStr] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [loading, setLoading] = useState(false);

  const buildDate = (dateInput, timeInput) => {
    const trimmedDate = (dateInput || '').trim();
    const trimmedTime = (timeInput || '').trim();
    if (!trimmedDate || !trimmedTime) return null;

    // Suporta dd/mm/aaaa ou aaaa-mm-dd
    let isoDate = trimmedDate;
    const slashMatch = trimmedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashMatch) {
      const [_, d, m, y] = slashMatch;
      isoDate = `${y}-${m}-${d}`;
    }

    const final = new Date(`${isoDate}T${trimmedTime}:00`);
    if (isNaN(final.getTime())) return null;
    return final;
  };

  const confirmarEnvio = async () => {
    if (!useProfileAddress && !place.trim()) {
      Alert.alert('Atencao', 'Informe o local da coleta.');
      return;
    }
    const dt = buildDate(dataStr, horaStr);
    if (!dt) {
      Alert.alert('Atencao', 'Informe data e hora válidas (ex: 12/12/2025 e 14:00).');
      return;
    }

    if (materiais.some((m) => !m.quantidade || Number(m.quantidade) <= 0)) {
      Alert.alert('Atencao', 'Preencha a quantidade de todos os materiais selecionados.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        scheduled_at: dt.toISOString(),
        notes: observacoes.trim() || null,
        use_profile_address: useProfileAddress,
        pickup_address_text: useProfileAddress ? null : place.trim(),
        materials: materiais.map((m) => ({
          id: m.backendId || Number(m.id),
          quantity_kg: Number(m.quantidade),
        })),
      };
      await SchedulesAPI.create(payload);
      Alert.alert('Sucesso!', 'Seu agendamento foi enviado com sucesso!');
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
    <View style={styles.materialCard}>
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

  const enderecoPerfil = user
    ? `${user.address_street || ''} ${user.address_number || ''} ${user.address_neighborhood || ''} ${user.address_city || ''} ${user.address_state || ''} ${user.address_zip || ''}`.trim()
    : '';

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      enableOnAndroid
      extraHeight={140}
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Detalhes do Agendamento</Text>
      <Text style={styles.subtitle}>Confirme local, data e materiais para o coletor.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Local da coleta *</Text>

        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choice, useProfileAddress && styles.choiceActive]}
            onPress={() => setUseProfileAddress(true)}
          >
            <View style={styles.choiceHeader}>
              <Icon name="home" size={18} color={useProfileAddress ? '#2f7a4b' : '#4b5563'} />
              <Text style={[styles.choiceTitle, useProfileAddress && styles.choiceTitleActive]}>Meu endereço</Text>
            </View>
            <Text style={styles.choiceDesc}>
              {enderecoPerfil || 'Complete seu endereço em Minha Conta.'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choice, !useProfileAddress && styles.choiceActive]}
            onPress={() => setUseProfileAddress(false)}
          >
            <View style={styles.choiceHeader}>
              <Icon name="map-pin" size={18} color={!useProfileAddress ? '#2f7a4b' : '#4b5563'} />
              <Text style={[styles.choiceTitle, !useProfileAddress && styles.choiceTitleActive]}>Outro local</Text>
            </View>
            <Text style={styles.choiceDesc}>Digite um endereço de retirada diferente.</Text>
          </TouchableOpacity>
        </View>

        {!useProfileAddress && (
          <TextInput
            style={styles.input}
            placeholder="Rua, número, bairro..."
            value={place}
            onChangeText={setPlace}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Data e hora *</Text>
        <View style={styles.inputWithIcon}>
          <Icon name="calendar" size={18} color="#4b5563" />
          <TextInput
            style={styles.inputNoBorder}
            placeholder="Ex: 12/12/2025"
            value={dataStr}
            onChangeText={setDataStr}
          />
        </View>
        <View style={[styles.inputWithIcon, { marginTop: 8 }]}>
          <Icon name="clock" size={18} color="#4b5563" />
          <TextInput
            style={styles.inputNoBorder}
            placeholder="Ex: 14:00"
            value={horaStr}
            onChangeText={setHoraStr}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Ex.: Portaria, bloco B, deixar na guarita..."
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Materiais</Text>
        <FlatList
          data={materiais}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingTop: 8 }}
        />
      </View>

      <TouchableOpacity style={styles.cta} onPress={confirmarEnvio} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" />
            <Text style={styles.ctaText}>Enviar Agendamento</Text>
          </>
        )}
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 32,
    backgroundColor: '#F8F9F2',
    paddingHorizontal: 18,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#2f7a4b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#55616d', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1b4332' },
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    color: '#222',
    marginTop: 10,
    fontSize: 16,
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  inputNoBorder: { flex: 1, marginLeft: 8, fontSize: 16, color: '#222' },
  choiceRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  choice: { flex: 1, borderWidth: 1, borderColor: '#dfe4dc', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  choiceActive: { borderColor: '#2f7a4b', backgroundColor: '#e8ffe0' },
  choiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  choiceTitle: { fontWeight: '700', color: '#4b5563', fontSize: 14 },
  choiceTitleActive: { color: '#1b4332' },
  choiceDesc: { color: '#555', fontSize: 13, lineHeight: 18 },
  materialCard: {
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eef2ea',
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
    fontWeight: '700',
    color: '#1b4332',
  },
  quantidade: {
    fontSize: 14,
    color: '#4c6e54',
    marginTop: 4,
  },
  cta: {
    backgroundColor: '#2f7a4b',
    paddingVertical: 18,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
