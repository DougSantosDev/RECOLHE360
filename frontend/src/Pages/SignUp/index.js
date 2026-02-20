import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useUser } from '../../context/UsarContext';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function SignUp({ navigation, route }) {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, tipo: tipoCtx, setTipo, updateAddress } = useUser();
  const { dark } = useThemeRecolhe();

  const tipoParam = route?.params?.tipo;
  const tipo = tipoParam ?? tipoCtx ?? 'doador';
  const role = tipo === 'coletor' ? 'collector' : 'donor';

  const palette = {
    bg: dark ? '#0f1410' : '#329845',
    formBg: dark ? '#1b1f1b' : '#fffacd',
    text: dark ? '#e6e6e6' : '#222',
    inputBorder: dark ? '#3c4a3c' : '#888',
    placeholder: dark ? '#9aa3a6' : '#666',
    button: dark ? '#2f7a4b' : '#329845',
    buttonText: '#fff',
    link: dark ? '#9be7b0' : '#1a6b1a',
  };

  const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const openLegal = (type) => {
    navigation.navigate('LegalModal', { type });
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    setTelefone(digits);
  };

  const phoneMasked = useMemo(() => {
    if (!telefone) return '';
    if (telefone.length <= 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return telefone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  }, [telefone]);

  const handleCepChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    setCep(digits);
  };

  const cepMasked = useMemo(() => {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{0,3})/, '$1-$2').trim();
  }, [cep]);

  const handleRegister = async () => {
    if (!nome.trim() || !sobrenome.trim() || !rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim() || !cep.trim() || !telefone.trim() || !email.trim() || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    if (estado.trim().length !== 2) {
      Alert.alert('Erro', 'Informe a sigla do estado (Ex.: SP).');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Erro', 'Digite um e-mail valido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'A confirmação de senha não confere.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Atencao', 'Voce precisa aceitar os Termos de Uso e a Politica de Privacidade.');
      return;
    }

    const fullName = `${nome.trim()} ${sobrenome.trim()}`.trim();
    const formattedAddress = `${rua.trim()}, ${numero.trim()} - ${bairro.trim()}, ${cidade.trim()} - ${estado.trim().toUpperCase()}, ${cepMasked}`;

    try {
      setLoading(true);

      await register({
        name: fullName,
        email: email.trim(),
        password,
        role,
        phone: telefone.trim(),
        address: formattedAddress,
        accepted_terms_at: new Date().toISOString(),
      });
      await updateAddress({
        phone: telefone.trim(),
        address_street: rua.trim(),
        address_number: numero.trim(),
        address_neighborhood: bairro.trim(),
        address_city: cidade.trim(),
        address_state: estado.trim().toUpperCase(),
        address_zip: cep.trim(),
      });

      setTipo(tipo);
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');

      setNome('');
      setSobrenome('');
      setRua('');
      setNumero('');
      setBairro('');
      setCidade('');
      setEstado('');
      setCep('');
      setTelefone('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);
    } catch (error) {
      console.log(error);
      const emailError = error?.status === 422 ? error?.data?.errors?.email?.[0] : null;
      if (emailError) {
        Alert.alert('Erro', 'Email ja cadastrado.');
        return;
      }
      Alert.alert('Erro', error.message || 'Erro ao cadastrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraHeight={220}
      extraScrollHeight={210}
    >
      <View style={styles.container}>
          <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
            <Text style={[styles.message, { color: '#fff' }]}>Crie sua Conta</Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>
              Perfil selecionado: {tipo === 'coletor' ? 'Coletor' : 'Doador'}
            </Text>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            style={[
              styles.containerForm,
              {
                backgroundColor: palette.formBg,
              },
            ]}
          >
            <Text style={[styles.title, { color: palette.text }]}>Nome</Text>
            <TextInput
              placeholder="Nome completo..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              autoCapitalize="words"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={[styles.title, { color: palette.text }]}>Sobrenome</Text>
            <TextInput
              placeholder="Sobrenome..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              autoCapitalize="words"
              value={sobrenome}
              onChangeText={setSobrenome}
            />

            <Text style={[styles.title, { color: palette.text }]}>Rua</Text>
            <TextInput
              placeholder="Nome da rua..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              autoCapitalize="words"
              value={rua}
              onChangeText={setRua}
            />

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>Número</Text>
                <TextInput
                  placeholder="123"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text },
                  ]}
                  keyboardType="numeric"
                  value={numero}
                  onChangeText={setNumero}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>Bairro</Text>
                <TextInput
                  placeholder="Bairro..."
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text },
                  ]}
                  autoCapitalize="words"
                  value={bairro}
                  onChangeText={setBairro}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>Cidade</Text>
                <TextInput
                  placeholder="Cidade..."
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text },
                  ]}
                  autoCapitalize="words"
                  value={cidade}
                  onChangeText={setCidade}
                />
              </View>
              <View style={styles.rowItemSmall}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>UF</Text>
                <TextInput
                  placeholder="SP"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text, textTransform: 'uppercase' },
                  ]}
                  maxLength={2}
                  autoCapitalize="characters"
                  value={estado}
                  onChangeText={(value) => setEstado(value.toUpperCase())}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>CEP</Text>
                <TextInput
                  placeholder="00000-000"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text },
                  ]}
                  keyboardType="numeric"
                  value={cepMasked}
                  onChangeText={handleCepChange}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.smallLabel, { color: palette.text }]}>Telefone</Text>
                <TextInput
                  placeholder="(11) 9****-****"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    styles.input,
                    { borderBottomColor: palette.inputBorder, color: palette.text },
                  ]}
                  keyboardType="phone-pad"
                  value={phoneMasked}
                  onChangeText={formatPhone}
                />
              </View>
            </View>

            <Text style={[styles.title, { color: palette.text }]}>E-mail</Text>
            <TextInput
              placeholder="Digite um e-mail..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={[styles.title, { color: palette.text }]}>Senha</Text>
            <TextInput
              placeholder="Digite uma senha (minimo 6 caracteres)..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={[styles.title, { color: palette.text }]}>Confirmar senha</Text>
            <TextInput
              placeholder="Repita a mesma senha..."
              placeholderTextColor={palette.placeholder}
              style={[
                styles.input,
                { borderBottomColor: palette.inputBorder, color: palette.text },
              ]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setAcceptTerms((prev) => !prev)}
                style={[
                  styles.checkbox,
                  { borderColor: palette.button },
                  acceptTerms && { backgroundColor: palette.button },
                ]}
              >
                {acceptTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </TouchableOpacity>
              <Text style={[styles.termsText, { color: palette.text }]}>
                Li e aceito os{' '}
                <Text style={[styles.link, { color: palette.link }]} onPress={() => openLegal('terms')}>
                  Termos de Uso
                </Text>{' '}
                e a{' '}
                <Text style={[styles.link, { color: palette.link }]} onPress={() => openLegal('privacy')}>
                  Politica de Privacidade
                </Text>.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: palette.button }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonRegister}
              onPress={() => navigation.navigate('SignIn', { tipo })}
              disabled={loading}
            >
              <Text style={[styles.registerText, { color: palette.text }]}>
                Ja possui uma conta? Faca login
              </Text>
            </TouchableOpacity>
          </Animatable.View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerHeader: { marginTop: '14%', marginBottom: '8%', paddingStart: '5%' },
  message: { fontSize: 28, fontWeight: 'bold' },
  containerForm: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: '5%',
    paddingEnd: '5%',
    paddingBottom: 40,
  },
  title: { fontSize: 20, marginTop: 28 },
  input: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 16,
    paddingHorizontal: 5,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxMark: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  termsText: { flex: 1, fontSize: 14, lineHeight: 20 },
  link: { textDecorationLine: 'underline', fontWeight: '700' },
  button: {
    width: '100%',
    borderRadius: 4,
    paddingVertical: 12,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold', color: '#fff', fontSize: 18 },
  buttonRegister: { marginTop: 14, alignSelf: 'center' },
  registerText: { color: '#444' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowItem: { flex: 1 },
  rowItemSmall: { width: 70 },
  smallLabel: { fontSize: 13, marginTop: 20, marginBottom: 4 },
});
