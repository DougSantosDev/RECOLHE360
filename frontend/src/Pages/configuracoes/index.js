import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function Configuracoes() {
  const navigation = useNavigation();
  const [notificacoes, setNotificacoes] = useState(true);
  const { dark, setDark } = useThemeRecolhe();
  const versaoApp = Constants.manifest?.version || '1.0.0';

  const bg = dark ? '#121212' : '#fffacd';
  const cardBg = dark ? '#1e1e1e' : '#fff';
  const textPrimary = dark ? '#e6e6e6' : '#329845';
  const textSecondary = dark ? '#d6d6d6' : '#444';

  // Simule função de alteração de senha
  const alterarSenha = () => {
    Alert.alert('Futuro', 'Em breve será possível alterar a senha pelo app!');
  };

  // Suporte/ajuda via WhatsApp
  const suporte = () => {
    Linking.openURL('https://wa.me/5511960211462?text=Olá! Preciso de suporte no Recolhe360');
  };

  // Simule leitura dos termos
  const politica = () => {
    navigation.navigate('LegalModal', { type: 'privacy' });
  };

  const termos = () => {
    navigation.navigate('LegalModal', { type: 'terms' });
  };

  // Simule envio de feedback
  const feedback = () => {
    Linking.openURL('mailto:recolhe360@suporte.com?subject=Feedback%20Recolhe360');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Text style={[styles.titulo, { color: textPrimary }]}>Configurações</Text>
        
        {/* Preferências */}
        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: dark ? '#d4cf72' : '#b9b600' }]}>Preferências</Text>
          <View style={styles.item}>
            <Text style={[styles.label, { color: textSecondary }]}>Notificações</Text>
            <Switch value={notificacoes} onValueChange={setNotificacoes} />
          </View>
          <View style={styles.item}>
            <Text style={[styles.label, { color: textSecondary }]}>Tema Escuro</Text>
            <Switch value={dark} onValueChange={setDark} />
          </View>
        </View>

        {/* Segurança */}
        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: dark ? '#d4cf72' : '#b9b600' }]}>Segurança</Text>
          <TouchableOpacity style={styles.botao} onPress={alterarSenha}>
            <Text style={styles.textoBotao}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: dark ? '#d4cf72' : '#b9b600' }]}>Ajuda & Suporte</Text>
          <TouchableOpacity style={[styles.botaoSecundario, dark && styles.botaoSecundarioDark]} onPress={suporte}>
            <Text style={styles.textoBotaoSecundario}>Falar com suporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botaoSecundario, dark && styles.botaoSecundarioDark]} onPress={feedback}>
            <Text style={styles.textoBotaoSecundario}>Enviar feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: dark ? '#d4cf72' : '#b9b600' }]}>Legal</Text>
          <TouchableOpacity style={[styles.botaoSecundario, dark && styles.botaoSecundarioDark]} onPress={politica}>
            <Text style={styles.textoBotaoSecundario}>Política de Privacidade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.botaoSecundario, dark && styles.botaoSecundarioDark]} onPress={termos}>
            <Text style={styles.textoBotaoSecundario}>Termos de Uso</Text>
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <Text style={[styles.versao, { color: dark ? '#999' : '#ccc' }]}>Versão {versaoApp}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '96%',
    borderRadius: 25,
    padding: 28,
    elevation: 4,
    marginVertical: 32,
    alignSelf: 'center'
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#329845',
    textAlign: 'center',
    marginBottom: 24,
  },
  secao: {
    marginTop: 18,
    marginBottom: 10,
  },
  secaoTitulo: {
    fontSize: 17,
    color: '#b9b600',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 17,
    color: '#444',
  },
  botao: {
    backgroundColor: '#329845',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  botaoSecundario: {
    backgroundColor: '#e9e9e9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoSecundarioDark: {
    backgroundColor: '#2c2c2c',
  },
  textoBotaoSecundario: {
    color: '#329845',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versao: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
  },
});
