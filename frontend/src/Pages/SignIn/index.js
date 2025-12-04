import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useUser } from '../../context/UsarContext';

export default function SignIn({ navigation, route }) {
  const { signIn, tipo: tipoCtx } = useUser();
  const tipo = route?.params?.tipo ?? tipoCtx; // 'coletor' | 'doador' | undefined

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
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" delay={500} style={styles.containerHeader}>
        <Text style={styles.message}>Bem-vindo(a)</Text>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" style={styles.containerForm}>
        <Text style={styles.title}>E-mail</Text>
        <TextInput
          placeholder="Digite seu e-mail..."
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.title}>Senha</Text>
        <TextInput
          placeholder="Sua senha"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Acessar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonRegister}
          onPress={() => navigation.navigate('SignUp', { tipo })}
          disabled={loading}
        >
          <Text style={styles.registerText}>Não possui uma conta? Cadastre-se</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#329845' },
  containerHeader: { marginTop: '14%', marginBottom: '8%', paddingStart: '5%' },
  message: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  containerForm: {
    flex: 1,
    backgroundColor: '#fffacd',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingStart: '5%',
    paddingEnd: '5%',
  },
  title: { fontSize: 20, marginTop: 28 },
  input: { borderBottomWidth: 1, height: 40, marginBottom: 12, fontSize: 16 },
  button: {
    backgroundColor: '#329845',
    width: '100%',
    borderRadius: 4,
    paddingVertical: 8,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontWeight: 'bold', color: '#fff', fontSize: 18 },
  buttonRegister: { marginTop: 14, alignSelf: 'center' },
  registerText: { color: '#444' },
});
