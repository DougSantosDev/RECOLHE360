import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function Sobre() {
  const navigation = useNavigation();
  const { dark } = useThemeRecolhe();
  const versaoApp = Constants.manifest?.version || '1.0.0';

  const palette = {
    bg: dark ? '#0f1410' : '#F3F7EE',
    card: dark ? '#1b1f1b' : '#fff',
    title: dark ? '#c7f3d4' : '#2f7a4b',
    text: dark ? '#e6e6e6' : '#444',
    muted: dark ? '#9aa3a6' : '#777',
    primary: dark ? '#2f7a4b' : '#2f7a4b',
    outline: dark ? '#2f7a4b' : '#2f7a4b',
  };

  const abrirLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Nao foi possivel abrir o link.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        {/* <Image source={require('../../../assets/icon.png')} style={styles.logo} /> */}

        <Text style={[styles.titulo, { color: palette.title }]}>Sobre o RECOLHE360</Text>
        <Text style={[styles.descricao, { color: palette.text }]}>
          O RECOLHE360 nasceu para conectar doadores e coletores, tornando o processo de reciclagem simples, rapido e sustentavel.
        </Text>

        <Text style={[styles.subtitulo, { color: palette.title }]}>Informacoes do Aplicativo</Text>
        <View style={styles.item}>
          <Icon name="smartphone" size={18} color={palette.primary} />
          <Text style={[styles.itemText, { color: palette.text }]}>Versao do app: {versaoApp}</Text>
        </View>
        <View style={styles.item}>
          <Icon name="user" size={18} color={palette.primary} />
          <Text style={[styles.itemText, { color: palette.text }]}>Desenvolvido por: Douglas Santos</Text>
        </View>

        <Text style={[styles.subtitulo, { color: palette.title }]}>Contato</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: palette.primary }]} onPress={() => abrirLink('mailto:dougsantosdev@gmail.com')}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.btnText}>Enviar e-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: palette.primary }]} onPress={() => abrirLink('https://wa.me/5511960211462')}>
          <Icon name="phone" size={20} color="#fff" />
          <Text style={styles.btnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { borderColor: palette.outline }]} onPress={() => abrirLink('https://github.com/DougSantosDev')}>
          <Icon name="github" size={20} color={palette.outline} />
          <Text style={[styles.btnOutlineText, { color: palette.outline }]}>GitHub do Desenvolvedor</Text>
        </TouchableOpacity>

        <Text style={[styles.subtitulo, { color: palette.title }]}>Documentos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LegalModal', { type: 'privacy' })}>
          <Text style={[styles.linkText, { color: palette.primary }]}>Politica de Privacidade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LegalModal', { type: 'terms' })}>
          <Text style={[styles.linkText, { color: palette.primary }]}>Termos de Uso</Text>
        </TouchableOpacity>

        <Text style={[styles.rodape, { color: palette.muted }]}>
          © {new Date().getFullYear()} RECOLHE360{'\n'}
          Todos os direitos reservados.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  logo: { width: 90, height: 90, alignSelf: 'center', marginBottom: 12 },
  titulo: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  descricao: { fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  subtitulo: { marginTop: 12, fontSize: 16, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  itemText: { fontSize: 15 },
  btn: {
    marginTop: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOutline: {
    marginTop: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnOutlineText: { fontSize: 15, fontWeight: '700' },
  linkText: { fontSize: 15, textDecorationLine: 'underline', marginTop: 6 },
  rodape: { marginTop: 20, textAlign: 'center', fontSize: 13 },
});
