import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useThemeRecolhe } from '../../context/ThemeContext';

export default function Welcome() {
  const navigation = useNavigation();
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#329845',
      card: dark ? '#1b1f1b' : '#fffacd',
      text: dark ? '#e5e5e5' : '#333',
      muted: dark ? '#b5b5b5' : '#666',
      button: '#2f7a4b',
    }),
    [dark],
  );

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
        <Text style={[styles.paragraph, { color: palette.muted }]}>Faça o login para começar</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: palette.button }]} onPress={() => navigation.navigate('Escolha')}>
          <Text style={styles.buttonText}>Acessar</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLogo: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: 150,
  },
  containerForm: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 25,
    paddingHorizontal: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  paragraph: {
    marginTop: 95,
    fontSize: 15,
  },
  button: {
    position: 'absolute',
    borderRadius: 50,
    paddingVertical: 8,
    width: '60%',
    alignSelf: 'center',
    bottom: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
