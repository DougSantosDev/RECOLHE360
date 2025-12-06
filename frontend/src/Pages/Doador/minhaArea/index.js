import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Feather';

import { useUser } from '../../../context/UsarContext';
import { useThemeRecolhe } from '../../../context/ThemeContext';

export default function MinhaArea() {
  const { user, updateAddress } = useUser();
  const { dark } = useThemeRecolhe();
  const [editMode, setEditMode] = useState(false);

  const [telefone, setTelefone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address_street || '');
  const [number, setNumber] = useState(user?.address_number || '');
  const [neighborhood, setNeighborhood] = useState(user?.address_neighborhood || '');
  const [city, setCity] = useState(user?.address_city || '');
  const [state, setState] = useState(user?.address_state || '');
  const [zip, setZip] = useState(user?.address_zip || '');

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#F3F7EE',
      card: dark ? '#1b1f1b' : '#FFFFFF',
      text: dark ? '#E6E6E6' : '#111827',
      muted: dark ? '#9aa3a6' : '#6B7280',
      primary: '#2F7A4B',
      border: dark ? '#2f3b30' : '#EDF2E6',
      inputBg: dark ? '#1f271f' : '#FAFAFA',
    }),
    [dark],
  );

  const handlePhoneChange = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);
    setTelefone(digits);
  };

  const handleZipChange = (value) => {
    const digits = (value || '').replace(/\D/g, '').slice(0, 8);
    setZip(digits);
  };

  const phoneMasked = useMemo(() => {
    const digits = (telefone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  }, [telefone]);

  const cepMasked = useMemo(() => {
    const digits = (zip || '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/(\d{5})(\d{0,3})/, '$1-$2').trim();
  }, [zip]);

  const formatAddress = () =>
    [
      street && street.trim(),
      number && `, ${number}`.trim(),
      neighborhood && ` - ${neighborhood}`.trim(),
      city && `, ${city}`.trim(),
      state && ` - ${state.toUpperCase()}`.trim(),
      cepMasked && `, ${cepMasked}`.trim(),
    ]
      .filter(Boolean)
      .join('');

  const resetFields = () => {
    setTelefone(user?.phone || '');
    setStreet(user?.address_street || '');
    setNumber(user?.address_number || '');
    setNeighborhood(user?.address_neighborhood || '');
    setCity(user?.address_city || '');
    setState(user?.address_state || '');
    setZip(user?.address_zip || '');
  };

  const handleSalvar = async () => {
    try {
      await updateAddress({
        phone: telefone || null,
        address_street: street || null,
        address_number: number || null,
        address_neighborhood: neighborhood || null,
        address_city: city || null,
        address_state: state?.toUpperCase() || null,
        address_zip: zip || null,
      });
      setEditMode(false);
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
    } catch (err) {
      Alert.alert('Erro', err?.message || 'Não foi possível atualizar os dados.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraHeight={140}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: palette.text }]}>Minha área</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Revise seus dados e endereço para facilitar as coletas.
        </Text>

        <View style={[styles.card, { backgroundColor: palette.card, shadowColor: dark ? '#000' : palette.primary }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>Dados pessoais</Text>

          {editMode ? (
            <>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.inputBg }]}>
                <Icon name="user" size={18} color={palette.muted} />
                <Text style={[styles.inputReadOnly, { color: palette.text }]}>{user?.name || 'Sem nome'}</Text>
              </View>

              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.inputBg }]}>
                <Icon name="mail" size={18} color={palette.muted} />
                <Text style={[styles.inputReadOnly, { color: palette.text }]}>{user?.email}</Text>
              </View>

              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.inputBg }]}>
                <Icon name="phone" size={18} color={palette.muted} />
                <TextInput
                  style={[styles.input, { color: palette.text }]}
                  placeholder="Telefone"
                  placeholderTextColor={palette.muted}
                  keyboardType="phone-pad"
                  value={phoneMasked}
                  onChangeText={handlePhoneChange}
                />
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="user" label="Nome" value={user?.name} color={palette} />
              <InfoRow icon="mail" label="E-mail" value={user?.email} color={palette} />
              <InfoRow icon="phone" label="Telefone" value={phoneMasked || 'Não informado'} color={palette} />
            </>
          )}

          <Text style={[styles.sectionTitle, { color: palette.text, marginTop: 18 }]}>Endereço</Text>

          {editMode ? (
            <>
              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.inputBg }]}>
                <Icon name="map-pin" size={18} color={palette.muted} />
                <TextInput
                  style={[styles.input, { color: palette.text }]}
                  placeholder="Rua"
                  placeholderTextColor={palette.muted}
                  value={street}
                  onChangeText={setStreet}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={[styles.smallLabel, { color: palette.muted }]}>Número</Text>
                  <TextInput
                    style={[styles.inputInline, { color: palette.text, backgroundColor: palette.inputBg, borderColor: palette.border }]}
                    placeholder="Nº"
                    placeholderTextColor={palette.muted}
                    keyboardType="numeric"
                    value={number}
                    onChangeText={setNumber}
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={[styles.smallLabel, { color: palette.muted }]}>Bairro</Text>
                  <TextInput
                    style={[styles.inputInline, { color: palette.text, backgroundColor: palette.inputBg, borderColor: palette.border }]}
                    placeholder="Bairro"
                    placeholderTextColor={palette.muted}
                    value={neighborhood}
                    onChangeText={setNeighborhood}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.rowItem, { flex: 1 }]}>
                  <Text style={[styles.smallLabel, { color: palette.muted }]}>Cidade</Text>
                  <TextInput
                    style={[styles.inputInline, { color: palette.text, backgroundColor: palette.inputBg, borderColor: palette.border }]}
                    placeholder="Cidade"
                    placeholderTextColor={palette.muted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={styles.rowItemSmall}>
                  <Text style={[styles.smallLabel, { color: palette.muted }]}>UF</Text>
                  <TextInput
                    style={[styles.inputInline, { color: palette.text, backgroundColor: palette.inputBg, borderColor: palette.border, textTransform: 'uppercase' }]}
                    placeholder="SP"
                    maxLength={2}
                    placeholderTextColor={palette.muted}
                    value={state}
                    onChangeText={(value) => setState(value.toUpperCase())}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={[styles.inputWrapper, { borderColor: palette.border, backgroundColor: palette.inputBg }]}>
                <Icon name="mail" size={18} color={palette.muted} />
                <TextInput
                  style={[styles.input, { color: palette.text }]}
                  placeholder="CEP"
                  placeholderTextColor={palette.muted}
                  keyboardType="numeric"
                  value={cepMasked}
                  onChangeText={handleZipChange}
                />
              </View>

              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: palette.primary }]} onPress={handleSalvar}>
                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetFields();
                  setEditMode(false);
                }}
              >
                <Text style={[styles.cancelButtonText, { color: '#d32f2f' }]}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <InfoRow icon="home" label="Endereço" value={formatAddress() || 'Não informado'} color={palette} />
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: palette.primary, marginTop: 18 }]}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.primaryButtonText}>Editar dados</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, color }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: color.border }]}>
      <Icon name={icon} size={18} color={color.primary} />
      <View style={styles.infoTextBox}>
        <Text style={[styles.infoLabel, { color: color.muted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: color.text }]}>{value || 'Não informado'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoTextBox: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    marginTop: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  inputReadOnly: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  rowItem: {
    flex: 1,
  },
  rowItemSmall: {
    width: 70,
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  inputInline: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
