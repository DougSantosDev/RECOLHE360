import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useThemeRecolhe } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UsarContext';
import { SchedulesAPI } from '../../../services/api';

const screenWidth = Dimensions.get('window').width;

const STATUS_LABEL = {
  pending: 'Pendente',
  accepted: 'Aceita',
  on_route: 'A caminho',
  arrived: 'Chegou',
  collected: 'Concluída',
  canceled: 'Cancelada',
};

const ACTIVE_STATUSES = ['pending', 'accepted', 'on_route', 'arrived'];

function sumMaterials(schedule) {
  if (!schedule?.materials) return 0;
  return schedule.materials.reduce((acc, mat) => {
    const qty = Number(mat.pivot?.quantity_kg ?? mat.quantity_kg ?? mat.quantityKg ?? 0);
    return acc + (Number.isFinite(qty) ? qty : 0);
  }, 0);
}

export default function HomeDoador() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { dark } = useThemeRecolhe();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const palette = useMemo(
    () => ({
      bg: dark ? '#0f1410' : '#F4F8F4',
      card: dark ? '#1b1f1b' : '#ffffff',
      text: dark ? '#e6e6e6' : '#1b4332',
      muted: dark ? '#9aa3a6' : '#4c6e54',
      primary: dark ? '#2f7a4b' : '#2d6a4f',
      secondary: dark ? '#66d49f' : '#40916c',
      chartBg: dark ? '#1b1f1b' : '#f2fdf2',
      badgeBg: dark ? '#202822' : '#e6f0e8',
      badgeText: dark ? '#c7f3d4' : '#2d6a4f',
    }),
    [dark],
  );

  const progress = useRef(new Animated.Value(0)).current;

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const result = await SchedulesAPI.mySchedules();
      setSchedules(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const totalKg = useMemo(() => schedules.reduce((sum, sched) => sum + sumMaterials(sched), 0), [schedules]);
  const collectedCount = useMemo(() => schedules.filter((s) => s.status === 'collected').length, [schedules]);
  const co2Saved = useMemo(() => Number((totalKg * 0.7).toFixed(1)), [totalKg]);

  const upcomingSchedules = useMemo(() => {
    const relevant = schedules.filter((s) => ACTIVE_STATUSES.includes(s.status || ''));
    return relevant.sort((a, b) => new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0));
  }, [schedules]);

  const nextSchedule = upcomingSchedules[0];

  const lastSchedules = useMemo(() => {
    return [...schedules]
      .sort((a, b) => new Date(b.scheduled_at || 0) - new Date(a.scheduled_at || 0))
      .slice(0, 3);
  }, [schedules]);

  const chartSeries = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const label = day
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '')
        .replace(/\b\w/g, (t) => t.toUpperCase());
      days.push({ label, iso: day.toISOString().slice(0, 10) });
    }
    const data = days.map(({ iso }) => {
      const val = schedules
        .filter((sched) => (sched.scheduled_at || '').slice(0, 10) === iso)
        .reduce((sum, sched) => sum + sumMaterials(sched), 0);
      return Number(val.toFixed(1));
    });
    return { labels: days.map((d) => d.label), data };
  }, [schedules]);

  const progressPercent = totalKg > 0 ? Math.min(totalKg / 30, 1) : 0;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercent,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const roleLabel = useMemo(() => {
    if (user?.role === 'collector') return 'Coletor';
    if (user?.role === 'donor') return 'Doador';
    return 'Usuário';
  }, [user]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <ScrollView
        contentContainerStyle={[styles.container]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSchedules} tintColor={palette.primary} />}
      >
        <View style={styles.headerWrapper}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerKicker, { color: palette.muted }]}>{roleLabel}</Text>
            <Text style={[styles.welcomeText, { color: palette.text }]}>
              Olá, {user?.name?.split(' ')[0] || 'Doador'}
            </Text>
            <Text style={[styles.welcomeSub, { color: palette.muted }]}>
              Acompanhe seu impacto e continue transformando resíduos em oportunidades.
            </Text>
          </View>
          <View style={[styles.levelPill, { backgroundColor: palette.primary }]}>
            <Icon name="award" size={16} color="#fff" />
            <Text style={styles.levelText}>Eco nível 3</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Total reciclado</Text>
            <Text style={[styles.summaryValue, { color: palette.primary }]}>{totalKg.toFixed(1)} kg</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>Coletas feitas</Text>
            <Text style={[styles.summaryValue, { color: palette.primary }]}>{schedules.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.summaryLabel, { color: palette.muted }]}>CO₂ evitado</Text>
            <Text style={[styles.summaryValue, { color: palette.primary }]}>{co2Saved} kg</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <Text style={[styles.cardTitle, { color: palette.secondary }]}>Seu impacto</Text>
          <Text style={[styles.impactText, { color: palette.text }]}>
            Você já reciclou <Text style={[styles.bold, { color: palette.primary }]}>{totalKg.toFixed(1)} kg</Text> neste mês.
          </Text>
          <View style={[styles.progressBar, { backgroundColor: dark ? '#2a342a' : '#d8f3dc' }]}>
            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: palette.secondary }]} />
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: palette.muted }]}>Meta do mês: 30 kg</Text>
            <Text style={[styles.metaPercent, { color: palette.primary }]}>{Math.round(progressPercent * 100)}% concluído</Text>
          </View>
        </View>

        <View style={[styles.card, { paddingBottom: 10, backgroundColor: palette.card }]}>
          <Text style={[styles.cardTitle, { color: palette.secondary }]}>Evolução semanal</Text>
          <Text style={[styles.cardSubtitle, { color: palette.muted }]}>
            Veja como você contribuiu com o RECOLHE360 nos últimos 7 dias.
          </Text>
          <LineChart
            data={{
              labels: chartSeries.labels,
              datasets: [
                {
                  data: chartSeries.data,
                  color: (opacity = 1) => `rgba(82, 183, 136, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 60}
            height={170}
            chartConfig={{
              backgroundColor: palette.chartBg,
              backgroundGradientFrom: palette.chartBg,
              backgroundGradientTo: palette.chartBg,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(52, 102, 67, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(76, 110, 84, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#52b788' },
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.flexCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.cardTitle, { color: palette.secondary }]}>Dica do dia</Text>
            <Text style={[styles.tipText, { color: palette.text }]}>
              1 tonelada de papel reciclado pode salvar até{' '}
              <Text style={[styles.bold, { color: palette.primary }]}>20 árvores</Text>. Continue separando seus resíduos!
            </Text>
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('NoticiasTabDoador')}>
              <Text style={[styles.linkButtonText, { color: palette.primary }]}>Ver mais dicas</Text>
              <Icon name="arrow-right" size={14} color={palette.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.flexCard, { backgroundColor: palette.card }]}>
            <Text style={[styles.cardTitle, { color: palette.secondary }]}>Atalhos rápidos</Text>
            <TouchableOpacity style={[styles.shortcutButton, { backgroundColor: palette.primary }]} onPress={() => navigation.navigate('RecicladosTabDoador')}>
              <Icon name="plus-circle" size={16} color="#fff" />
              <Text style={styles.shortcutText}>Agendar coleta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.shortcutButton, { backgroundColor: palette.secondary }]} onPress={() => navigation.navigate('AgendamentosTabDoador')}>
              <Icon name="calendar" size={16} color="#fff" />
              <Text style={styles.shortcutText}>Meus agendamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <Text style={[styles.cardTitle, { color: palette.secondary }]}>Próxima coleta</Text>
          {nextSchedule ? (
            <>
              <Text style={[styles.coletaText, { color: palette.text }]}>
                Confirmada para{' '}
                <Text style={[styles.bold, { color: palette.primary }]}>
                  {new Date(nextSchedule.scheduled_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(nextSchedule.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Text>
              <Text style={[styles.coletaText, { color: palette.muted }]}>
                {nextSchedule.materials
                  ?.map((m) => `${m.name || m.tipo} (${m.pivot?.quantity_kg ?? m.quantity_kg ?? '?'} kg)`)
                  .join(', ')}
              </Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: palette.primary }]} onPress={() => navigation.navigate('AgendamentosTabDoador')}>
                <Icon name="calendar" size={18} color="#fff" />
                <Text style={styles.buttonText}>Ver detalhes</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: palette.muted }}>Você ainda não possui coletas agendadas.</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <Text style={[styles.cardTitle, { color: palette.secondary }]}>Últimas coletas</Text>
          {lastSchedules.length === 0 ? (
            <Text style={{ color: palette.muted }}>Ainda não há histórico para exibir.</Text>
          ) : (
            lastSchedules.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyAddress, { color: palette.text }]}>
                    {item.place || item.pickup_address_text || 'Endereço informado'}
                  </Text>
                  <Text style={[styles.historyLine, { color: palette.muted }]}>
                    {new Date(item.scheduled_at).toLocaleDateString('pt-BR')} -{' '}
                    {new Date(item.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={[styles.historyLine, { color: palette.muted }]}>
                    Materiais:{' '}
                    {item.materials
                      ?.map((m) => `${m.name || m.tipo} (${m.pivot?.quantity_kg ?? m.quantity_kg ?? '?'} kg)`)
                      .join(', ')}
                  </Text>
                </View>
                <View style={[styles.statusPillSmall, { backgroundColor: dark ? '#243224' : '#e9f5e9' }]}>
                  <Text style={[styles.statusPillSmallText, { color: palette.primary }]}>
                    {STATUS_LABEL[item.status] || item.status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={[styles.bigButton, { backgroundColor: palette.primary }]} onPress={() => navigation.navigate('RecicladosTabDoador')}>
          <Icon name="plus-circle" size={20} color="#fff" />
          <Text style={styles.bigButtonText}>Agendar nova coleta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  headerWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10, marginBottom: 18 },
  headerKicker: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  welcomeText: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  welcomeSub: { fontSize: 13, maxWidth: '80%' },
  levelPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  levelText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, marginHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  summaryLabel: { fontSize: 11, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  card: { borderRadius: 16, padding: 18, width: '100%', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  cardSubtitle: { fontSize: 13, marginBottom: 8 },
  impactText: { fontSize: 15, marginBottom: 10 },
  progressBar: { height: 10, borderRadius: 10, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', width: '0%' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 13 },
  metaPercent: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  flexCard: { flex: 1 },
  tipText: { fontSize: 14, marginBottom: 10 },
  linkButton: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  linkButtonText: { fontSize: 13, fontWeight: '600' },
  shortcutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, marginTop: 6, gap: 6 },
  shortcutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  coletaText: { fontSize: 15, marginBottom: 10 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, marginTop: 4, gap: 6 },
  buttonText: { color: '#fff', fontWeight: '600' },
  bigButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, marginTop: 4, marginBottom: 24, width: '100%', gap: 8 },
  bigButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  bold: { fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', marginTop: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' },
  historyAddress: { fontSize: 14, fontWeight: '600' },
  historyLine: { fontSize: 12, marginTop: 2 },
  statusPillSmall: { alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  statusPillSmallText: { fontSize: 11, fontWeight: '600' },
});
