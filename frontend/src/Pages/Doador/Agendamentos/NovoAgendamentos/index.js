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
  Platform,
} from 'react-native';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { SchedulesAPI } from '../../../../services/api';
import { useUser } from '../../../../context/UsarContext';
import { useThemeRecolhe } from '../../../../context/ThemeContext';

export default function NovoAgendamento() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useUser();
  const { dark } = useThemeRecolhe();
  const { materiais } = route.params || { materiais: [] };

  const [place, setPlace] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [loading, setLoading] = useState(false);

  const palette = {
    bg: dark ? '#0f1410' : '#F8F9F2',
    card: dark ? '#1b1f1b' : '#fff',
    text: dark ? '#e6e6e6' : '#1b4332',
    muted: dark ? '#9aa3a6' : '#55616d',
    primary: '#2f7a4b',
    border: dark ? '#2f3b30' : '#dfe4dc',
    inputBg: dark ? '#1f271f' : '#fafafa',
    inputBorder: dark ? '#394239' : '#bdbdbd',
    placeholder: dark ? '#9aa3a6' : '#666',
  };

  const enderecoPerfil = user
    ? `${user.address_street || ''} ${user.address_number || ''} ${user.address_neighborhood || ''} ${user.address_city || ''} ${user.address_state || ''} ${user.address_zip || ''}`.trim()
    : '';

  const formatDate = (d) => (d ? d.toLocaleDateString('pt-BR') : 'Ex: 12/12/2025');
  const formatTime = (d) =>
    d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Ex: 14:00';

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date || new Date(),
      mode: 'date',
      is24Hour: true,
      display: Platform.OS === 'android' ? 'calendar' : 'default',
      onChange: (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        setDate(selectedDate || date);
      },
    });
  };

  const openTimePicker = () => {
    DateTimePickerAndroid.open({
      value: time || new Date(),
      mode: 'time',
      is24Hour: true,
      display: Platform.OS === 'android' ? 'clock' : 'default',
      onChange: (event, selectedTime) => {
        if (event.type === 'dismissed') return;
        setTime(selectedTime || time);
      },
    });
  };

  const confirmarEnvio = async () => {
    if (!useProfileAddress && !place.trim()) {
      Alert.alert('Atenção', 'Informe o local da coleta.');
      return;
    }
    if (useProfileAddress && !enderecoPerfil) {
      Alert.alert('Atenção', 'Complete seu endereço em Minha Conta antes de usar "Meu endereço".');
      return;
    }
    if (!date || !time) {
      Alert.alert('Atenção', 'Escolha a data e a hora da coleta.');
      return;
    }
    const dt = new Date(date);
    dt.setHours(time.getHours());
    dt.setMinutes(time.getMinutes());
    dt.setSeconds(0, 0);
    if (isNaN(dt.getTime())) {
      Alert.alert('Atenção', 'Data ou hora inválidas.');
      return;
    }
    if (materiais.some((m) => !m.quantidade || Number(m.quantidade) <= 0)) {
      Alert.alert('Atenção', 'Preencha a quantidade de todos os materiais selecionados.');
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
            params: { screen: 'RecicladosTabDoador', params: { clear: true } },
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
    <View style={[styles.materialCard, { borderColor: palette.border }]}>
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
        <Text style={[styles.nome, { color: palette.text }]}>{item.nome}</Text>
        <Text style={[styles.quantidade, { color: palette.muted }]}>{item.quantidade} kg</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: palette.bg }]}
      contentContainerStyle={{ paddingBottom: 48 }}
      enableOnAndroid
      extraHeight={140}
      extraScrollHeight={120}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: palette.primary }]}>Detalhes do Agendamento</Text>
      <Text style={[styles.subtitle, { color: palette.muted }]}>
        Confirme local, data e materiais para o coletor.
      </Text>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Local da coleta *</Text>

        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[
              styles.choice,
              {
                borderColor: palette.border,
                backgroundColor: palette.card,
              },
              useProfileAddress && { borderColor: palette.primary, backgroundColor: dark ? '#1f271f' : '#e8ffe0' },
            ]}
            onPress={() => setUseProfileAddress(true)}
          >
            <View style={styles.choiceHeader}>
              <Icon name="home" size={18} color={useProfileAddress ? palette.primary : '#4b5563'} />
              <Text
                style={[
                  styles.choiceTitle,
                  useProfileAddress && styles.choiceTitleActive,
                  useProfileAddress && { color: palette.primary },
                ]}
              >
                Meu endereço
              </Text>
            </View>
            <Text style={[styles.choiceDesc, { color: palette.muted }]}>
              {enderecoPerfil || 'Complete seu endereço em Minha Conta.'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choice,
              {
                borderColor: palette.border,
                backgroundColor: palette.card,
              },
              !useProfileAddress && { borderColor: palette.primary, backgroundColor: dark ? '#1f271f' : '#e8ffe0' },
            ]}
            onPress={() => setUseProfileAddress(false)}
          >
            <View style={styles.choiceHeader}>
              <Icon name="map-pin" size={18} color={!useProfileAddress ? palette.primary : '#4b5563'} />
              <Text
                style={[
                  styles.choiceTitle,
                  !useProfileAddress && styles.choiceTitleActive,
                  !useProfileAddress && { color: palette.primary },
                ]}
              >
                Outro local
              </Text>
            </View>
            <Text style={[styles.choiceDesc, { color: palette.muted }]}>
              Digite um endereço de retirada diferente.
            </Text>
          </TouchableOpacity>
        </View>

        {!useProfileAddress && (
          <TextInput
            style={[
              styles.input,
              {
                borderColor: palette.inputBorder,
                color: palette.text,
                backgroundColor: palette.inputBg,
              },
            ]}
            placeholder="Rua, número, bairro..."
            placeholderTextColor={palette.placeholder}
            value={place}
            onChangeText={setPlace}
          />
        )}
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Data e hora *</Text>

        <TouchableOpacity
          style={[
            styles.inputWithIcon,
            { borderColor: palette.inputBorder, backgroundColor: palette.inputBg },
          ]}
          onPress={openDatePicker}
        >
          <Icon name="calendar" size={18} color={palette.muted} />
          <Text style={[styles.inputFakeText, { color: palette.text }]}>{formatDate(date)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.inputWithIcon,
            { marginTop: 8, borderColor: palette.inputBorder, backgroundColor: palette.inputBg },
          ]}
          onPress={openTimePicker}
        >
          <Icon name="clock" size={18} color={palette.muted} />
          <Text style={[styles.inputFakeText, { color: palette.text }]}>{formatTime(time)}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Observações (opcional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.inputMultiline,
            { borderColor: palette.inputBorder, backgroundColor: palette.inputBg, color: palette.text },
          ]}
          placeholder="Ex.: Portaria, bloco B, deixar na guarita..."
          placeholderTextColor={palette.placeholder}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Materiais</Text>
        <FlatList
          data={materiais}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingTop: 8 }}
        />
      </View>

      <TouchableOpacity style={[styles.cta, { backgroundColor: palette.primary }]} onPress={confirmarEnvio} disabled={loading}>
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
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
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
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  inputFakeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  choiceRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  choiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  choiceTitle: { fontWeight: '700', fontSize: 14 },
  choiceTitleActive: { color: '#1b4332' },
  choiceDesc: { fontSize: 13, lineHeight: 18 },
  materialCard: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
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
  },
  quantidade: {
    fontSize: 14,
    marginTop: 4,
  },
  cta: {
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
