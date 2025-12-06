import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UsarContext';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function Escolha() {
  const navigation = useNavigation();
  const { setTipo } = useUser();
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#329845',
      card: dark ? '#1b1f1b' : '#fffacd',
      text: dark ? '#e5e5e5' : '#333',
      muted: dark ? '#b5b5b5' : '#555',
      button: '#2f7a4b',
      buttonAlt: '#25633a',
    }),
    [dark],
  );

  const goTo = (role) => {
    setTipo(role);
    navigation.navigate('SignIn', { tipo: role });
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={styles.containerLogo}>
        <Animatable.Image
          animation="flipInY"
          source={require('../../../assets/image/download.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Animatable.View delay={600} animation="fadeInUp" style={[styles.containerForm, { backgroundColor: palette.card }]}>
        <Text style={[styles.title, { color: palette.text }]}>Bem-vindo</Text>
        <Text style={[styles.title, { color: palette.text }]}>RECOLHE360</Text>
        <Text style={[styles.paragraph, { color: palette.muted }]}>Escolha uma opção para continuar</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: palette.button }]} onPress={() => goTo('coletor')}>
          <Text style={styles.buttonText}>Sou Coletor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: palette.buttonAlt, marginTop: 15 }]} onPress={() => goTo('doador')}>
          <Text style={styles.buttonText}>Sou Doador</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  containerLogo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: 200,
  },
  containerForm: {
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    borderRadius: 50,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
