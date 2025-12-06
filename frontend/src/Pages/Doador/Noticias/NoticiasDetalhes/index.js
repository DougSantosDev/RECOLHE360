import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeRecolhe } from '../../../../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const imageSize = screenWidth * 0.8;

export default function NoticiasDetalhes({ route }) {
  const { titulo, descricao, imagem } = route.params;
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#f2fdf6',
      card: dark ? '#1c221c' : '#d8f3dc',
      text: dark ? '#e7e7e7' : '#1b4332',
      muted: dark ? '#b8c1b9' : '#444',
      accent: dark ? '#66d49f' : '#40916c',
    }),
    [dark],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={styles.imagemContainer}>
        {imagem && (
          <Image source={typeof imagem === 'number' ? imagem : { uri: imagem }} style={styles.imagem} resizeMode="cover" />
        )}
      </View>

      <View style={styles.conteudo}>
        <Text style={[styles.data, { color: palette.muted }]}>Publicado em 24 de junho de 2025</Text>
        <Text style={[styles.titulo, { color: palette.text }]}>{titulo}</Text>
        <Text style={[styles.subtitulo, { color: palette.accent }]}>Um passo a mais rumo à sustentabilidade</Text>
        <Text style={[styles.descricao, { color: palette.muted }]}>{descricao}</Text>

        <View style={[styles.extraBox, { backgroundColor: palette.card }]}>
          <Feather name="info" size={18} color={palette.accent} />
          <Text style={[styles.extra, { color: palette.text }]}>
            Reciclar ajuda a reduzir os impactos ambientais, economiza recursos naturais e gera renda para cooperativas.
          </Text>
        </View>

        <Text style={[styles.final, { color: palette.muted }]}>
          Continue acompanhando o RECOLHE360 para mais notícias e dicas de reciclagem que fazem diferença.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagemContainer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  imagem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
  },
  conteudo: {
    padding: 20,
    alignItems: 'center',
  },
  data: {
    fontSize: 13,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  descricao: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 20,
  },
  extraBox: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  extra: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  final: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
});
