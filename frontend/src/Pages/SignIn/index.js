import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useUser } from '../../context/UsarContext';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function SignIn({ navigation, route }) {
  const { signIn, tipo: tipoCtx } = useUser();
  const tipo = route?.params?.tipo ?? tipoCtx; // 'coletor' | 'doador' | undefined
  const { dark } = useThemeRecolhe();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    try {
      setLoading(true);
      await signIn({ email: email.trim(), password, tipo });
    } catch (e) {
      Alert.alert('Erro', e.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: dark ? '#0f1410' : '#329845' }]}>
        <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
          <Text style={[styles.message, { color: '#fff' }]}>Bem-vindo(a)</Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          style={[
            styles.containerForm,
            {
              backgroundColor: dark ? '#1b1f1b' : '#fffacd',
            },
          ]}
        >
          <Text style={[styles.title, { color: dark ? '#e6e6e6' : '#222' }]}>E-mail</Text>
          <TextInput
            placeholder="Digite seu e-mail..."
            style={[
              styles.input,
              {
                borderBottomColor: dark ? '#3c4a3c' : '#888',
                color: dark ? '#e6e6e6' : '#000',
              },
            ]}
            placeholderTextColor={dark ? '#9aa3a6' : '#666'}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.title, { color: dark ? '#e6e6e6' : '#222' }]}>Senha</Text>
          <TextInput
            placeholder="Sua senha"
            style={[
              styles.input,
              {
                borderBottomColor: dark ? '#3c4a3c' : '#888',
                color: dark ? '#e6e6e6' : '#000',
              },
            ]}
            placeholderTextColor={dark ? '#9aa3a6' : '#666'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: dark ? '#2f7a4b' : '#329845' },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonRegister} onPress={() => navigation.navigate('SignUp', { tipo })} disabled={loading}>
            <Text style={[styles.registerText, { color: dark ? '#dcdcdc' : '#444' }]}>
              Não possui uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerHeader: { marginTop: '14%', marginBottom: '8%', paddingStart: '5%' },
  message: { fontSize: 28, fontWeight: 'bold' },
  containerForm: {
    flex: 1,
    paddingStart: '5%',
    paddingEnd: '5%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 32,
  },
  title: { fontSize: 20, marginTop: 28 },
  input: { borderBottomWidth: 1, height: 40, marginBottom: 12, fontSize: 16, paddingHorizontal: 4 },
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
  registerText: {},
});
