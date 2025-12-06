import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/Feather';

export default function Sobre() {
  const versaoApp = Constants.manifest?.version || '1.0.0';

  const abrirLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Nao foi possivel abrir o link.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* <Image source={require('../../../assets/icon.png')} style={styles.logo} /> */}

        <Text style={styles.titulo}>Sobre o RECOLHE360</Text>
        <Text style={styles.descricao}>
          O RECOLHE360 nasceu para conectar doadores e coletores, tornando o processo de reciclagem simples, rapido e sustentavel.
        </Text>

        <Text style={styles.subtitulo}>Informacoes do Aplicativo</Text>
        <View style={styles.item}>
          <Icon name="smartphone" size={18} color="#2f7a4b" />
          <Text style={styles.itemText}>Versao do app: {versaoApp}</Text>
        </View>
        <View style={styles.item}>
          <Icon name="user" size={18} color="#2f7a4b" />
          <Text style={styles.itemText}>Desenvolvido por: Douglas Santos</Text>
        </View>

        <Text style={styles.subtitulo}>Contato</Text>
        <TouchableOpacity style={styles.btn} onPress={() => abrirLink('mailto:dougsantosdev@gmail.com')}>
          <Icon name="mail" size={20} color="#fff" />
          <Text style={styles.btnText}>Enviar e-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => abrirLink('https://wa.me/5511958676601')}>
          <Icon name="phone" size={20} color="#fff" />
          <Text style={styles.btnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => abrirLink('https://github.com/DougSantosDev')}>
          <Icon name="github" size={20} color="#2f7a4b" />
          <Text style={styles.btnOutlineText}>GitHub do Desenvolvedor</Text>
        </TouchableOpacity>

        <Text style={styles.subtitulo}>Documentos</Text>
        <TouchableOpacity onPress={() => abrirLink('https://seusite.com/politica')}>
          <Text style={styles.linkText}>Politica de Privacidade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => abrirLink('https://seusite.com/termos')}>
          <Text style={styles.linkText}>Termos de Uso</Text>
        </TouchableOpacity>

        <Text style={styles.rodape}>
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
    backgroundColor: '#F3F7EE',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  logo: { width: 90, height: 90, alignSelf: 'center', marginBottom: 12 },
  titulo: { fontSize: 26, fontWeight: '700', color: '#2f7a4b', textAlign: 'center', marginBottom: 10 },
  descricao: { fontSize: 16, color: '#444', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  subtitulo: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#1b4332' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  itemText: { fontSize: 15, color: '#444' },
  btn: {
    marginTop: 12,
    backgroundColor: '#2f7a4b',
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
    borderColor: '#2f7a4b',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnOutlineText: { color: '#2f7a4b', fontSize: 15, fontWeight: '700' },
  linkText: { color: '#2f7a4b', fontSize: 15, textDecorationLine: 'underline', marginTop: 6 },
  rodape: { marginTop: 20, textAlign: 'center', color: '#777', fontSize: 13 },
});
