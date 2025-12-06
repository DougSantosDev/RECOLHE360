import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeRecolhe } from '../../../context/ThemeContext';

const noticias = [
  {
    id: '1',
    titulo: 'Brasil bate recorde de reciclagem de alumínio',
    descricao: 'Mais de 98% das latinhas foram recicladas em 2024, colocando o país como líder mundial.',
    imagem: require('../../../../assets/image/lata.jpeg'),
  },
  {
    id: '2',
    titulo: 'Coleta seletiva cresce nas periferias',
    descricao: 'Iniciativas comunitárias têm ampliado a conscientização sobre descarte correto.',
    imagem: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  },
  {
    id: '3',
    titulo: 'Reciclagem reduz emissão de CO₂',
    descricao: 'Estudo aponta que reciclar papel e plástico evita a liberação de toneladas de gases poluentes.',
    imagem: 'https://cdn-icons-png.flaticon.com/512/3063/3063829.png',
  },
];

const dicas = [
  {
    id: 'plastico',
    titulo: 'Plástico',
    passos: [
      'Lave potes e garrafas para remover resíduos.',
      'Esvazie e amasse garrafas PET para reduzir volume.',
      'Tampas podem ir junto, mas leve-as soltas para facilitar a triagem.',
    ],
  },
  {
    id: 'vidro',
    titulo: 'Vidro',
    passos: [
      'Enxágue frascos e retire tampas metálicas.',
      'Embale pedaços quebrados para evitar acidentes.',
      'Vidros planos nem sempre são aceitos: confirme no ponto de coleta.',
    ],
  },
  {
    id: 'papel',
    titulo: 'Papel e papelão',
    passos: [
      'Mantenha-os secos.',
      'Retire grampos e fitas adesivas sempre que possível.',
      'Dobre caixas grandes para ocupar menos espaço.',
    ],
  },
  {
    id: 'metal',
    titulo: 'Metais',
    passos: [
      'Lave latas para tirar restos de alimentos.',
      'Achate latas para otimizar espaço.',
      'Aerosóis apenas se estiverem totalmente vazios.',
    ],
  },
  {
    id: 'eletronico',
    titulo: 'Eletrônicos',
    passos: [
      'Leve celulares, pilhas e baterias a ecopontos.',
      'Apague dados pessoais de celulares e notebooks.',
      'Cabos e carregadores também são recicláveis em pontos de e-lixo.',
    ],
  },
  {
    id: 'oleo',
    titulo: 'Óleo de cozinha',
    passos: [
      'Espere esfriar e armazene em garrafa PET.',
      'Nunca jogue na pia.',
      'Entregue em postos de coleta ou programas de biodiesel.',
    ],
  },
];

export default function Noticias() {
  const navigation = useNavigation();
  const { dark } = useThemeRecolhe();

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#ffffff',
      text: dark ? '#e7e7e7' : '#2d6a4f',
      muted: dark ? '#9aa3a6' : '#4c6e54',
      card: dark ? '#1c221c' : '#f9f9f9',
      highlight: dark ? '#1f2c23' : '#e8f7ee',
      border: dark ? '#2f3b30' : '#d8f3dc',
      button: dark ? '#66d49f' : '#40916c',
    }),
    [dark],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.bg }]}>
      <Text style={[styles.titulo, { color: palette.text }]}>Tudo sobre ♻️</Text>
      <Text style={[styles.subTitulo, { color: palette.muted }]}>Notícias e dicas práticas para reciclar melhor</Text>

      <View style={[styles.destaque, { backgroundColor: palette.highlight }]}>
        <Image
          source={typeof noticias[0].imagem === 'number' ? noticias[0].imagem : { uri: noticias[0].imagem }}
          style={styles.imagemDestaque}
        />
        <View style={styles.textoDestaque}>
          <Text style={[styles.tituloDestaque, { color: palette.text }]}>{noticias[0].titulo}</Text>
          <Text style={[styles.descricaoDestaque, { color: palette.muted }]}>{noticias[0].descricao}</Text>
          <TouchableOpacity style={[styles.botao, { backgroundColor: palette.button }]} onPress={() => navigation.navigate('NoticiasDetalhes', noticias[0])}>
            <Text style={styles.textoBotao}>Ler mais</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.subtituloNoticias, { color: palette.text }]}>Outras notícias</Text>
      {noticias.slice(1).map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: palette.card }]}>
          <Image source={typeof item.imagem === 'number' ? item.imagem : { uri: item.imagem }} style={styles.imagemMini} />
          <View style={styles.info}>
            <Text style={[styles.tituloMini, { color: palette.text }]}>{item.titulo}</Text>
            <Text style={[styles.descricaoMini, { color: palette.muted }]}>{item.descricao}</Text>
            <TouchableOpacity style={[styles.botaoMini, { backgroundColor: palette.button }]} onPress={() => navigation.navigate('NoticiasDetalhes', item)}>
              <Text style={styles.textoBotao}>Ver mais</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={[styles.subtituloNoticias, { color: palette.text }]}>Dicas rápidas de reciclagem</Text>
      {dicas.map((dica) => (
        <View key={dica.id} style={[styles.dicaCard, { backgroundColor: palette.highlight, borderColor: palette.border }]}>
          <Text style={[styles.dicaTitulo, { color: palette.text }]}>{dica.titulo}</Text>
          {dica.passos.map((passo, index) => (
            <Text key={index.toString()} style={[styles.dicaItem, { color: palette.muted }]}>
              {`- ${passo}`}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subTitulo: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  destaque: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  imagemDestaque: {
    width: '100%',
    height: 200,
  },
  textoDestaque: {
    padding: 16,
  },
  tituloDestaque: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  descricaoDestaque: {
    fontSize: 15,
    marginBottom: 10,
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  subtituloNoticias: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    elevation: 1,
  },
  imagemMini: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  tituloMini: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descricaoMini: {
    fontSize: 13,
    marginVertical: 4,
  },
  botaoMini: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dicaCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  dicaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  dicaItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});
