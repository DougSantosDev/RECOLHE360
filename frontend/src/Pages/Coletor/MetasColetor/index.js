import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ProgressBarAndroid,
  ProgressViewIOS,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import { useUser } from '../../../context/UsarContext';
import Feather from 'react-native-vector-icons/Feather';
import { useThemeRecolhe } from '../../../context/ThemeContext';
import { SchedulesAPI } from '../../../services/api';

export default function MetasColetor() {
  const { coletasConfirmadas, setColetasConfirmadas } = useUser();
  const { dark } = useThemeRecolhe();

  const [stats, setStats] = useState({
    total: 0,
    collected: coletasConfirmadas || 0,
    monthCollected: 0,
    accepted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const baseGoal = 10;
  const nivel = stats.collected || 0;
  const max = useMemo(() => {
    if (nivel === 0) return baseGoal;
    const blocks = Math.ceil(nivel / baseGoal);
    return Math.max(baseGoal, blocks * baseGoal);
  }, [nivel]);
  const progresso = Math.min(nivel / max, 1);

  const palette = {
    bg: dark ? '#0f1410' : '#f2fdf2',
    card: dark ? '#1b1f1b' : '#ffffff',
    title: dark ? '#c7f3d4' : '#329845',
    text: dark ? '#e6e6e6' : '#555',
    primary: dark ? '#2f7a4b' : '#329845',
    track: dark ? '#2a2f2a' : '#ccc',
  };

  const carregarDados = useCallback(async () => {
    try {
      setError(null);
      const response = await SchedulesAPI.myCollections();
      const lista = Array.isArray(response) ? response : response?.data || [];

      const total = lista.length;
      const collectedList = lista.filter((item) => item.status === 'collected');
      const collected = collectedList.length;
      const acceptedStatuses = ['accepted', 'on_route', 'arrived'];
      const accepted = lista.filter((item) => acceptedStatuses.includes(item.status)).length;

      const agora = new Date();
      const monthCollected = collectedList.filter((item) => {
        const referencia = item.updated_at || item.scheduled_at;
        if (!referencia) return false;
        const data = new Date(referencia);
        if (Number.isNaN(data.getTime())) return false;
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
      }).length;

      setStats({ total, collected, monthCollected, accepted });
      setColetasConfirmadas(collected);
    } catch (err) {
      setError(err.message || 'Erro ao carregar metas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setColetasConfirmadas]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const getNivelTexto = () => {
    if (nivel === 0) return 'Iniciante';
    if (nivel < 5) return 'Confiável';
    if (nivel < 10) return 'Experiente';
    return 'Mestre da Reciclagem';
  };

  const getCorNivel = () => {
    if (nivel === 0) return dark ? '#888' : '#999';
    if (nivel < 5) return '#6BA368';
    if (nivel < 10) return '#377B44';
    return '#FFD700';
  };

  const getIconeNivel = () => {
    if (nivel === 0) return <Feather name="user" size={50} color={getCorNivel()} />;
    if (nivel < 5) return <Feather name="star" size={50} color={getCorNivel()} />;
    if (nivel < 10) return <Feather name="award" size={50} color={getCorNivel()} />;
    return <Feather name="shield" size={50} color={getCorNivel()} />;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.bg }]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={[styles.loadingText, { color: palette.text }]}>Carregando suas metas...</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.titulo, { color: palette.title }]}>Suas Metas</Text>

        <View style={styles.seloContainer}>
          {getIconeNivel()}
          <Text style={[styles.nivel, { color: getCorNivel() }]}>{getNivelTexto()}</Text>
        </View>

        <Text style={[styles.contador, { color: palette.text }]}>
          Coletas concluídas: {nivel} / {max}
        </Text>

        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progresso}
            color={getCorNivel()}
            style={styles.barra}
          />
        ) : (
          <ProgressViewIOS
            progress={progresso}
            trackTintColor={palette.track}
            progressTintColor={getCorNivel()}
            style={styles.barra}
          />
        )}

        <Text style={[styles.textoMeta, { color: palette.text }]}>
          Faça mais coletas para alcançar o próximo nível e mostrar seu impacto na reciclagem!
        </Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: dark ? '#121512' : '#f7f7f7' }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Concluídas</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.collected}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: dark ? '#121512' : '#f7f7f7' }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Este mês</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.monthCollected}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: dark ? '#121512' : '#f7f7f7' }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Em andamento</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {Math.max(stats.accepted - stats.collected, 0)}
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: dark ? '#121512' : '#f7f7f7' }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Total atribuídas</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>{stats.total}</Text>
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={[styles.caption, { color: palette.muted }]}>
            Puxe para baixo caso queira atualizar os números agora.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    margin: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  seloContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  nivel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  contador: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  barra: {
    height: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  textoMeta: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flexBasis: '48%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  errorText: {
    color: '#ff7676',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
