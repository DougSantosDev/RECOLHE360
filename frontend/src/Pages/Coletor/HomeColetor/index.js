import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useThemeRecolhe } from '../../../context/ThemeContext';
import { useUser } from '../../../context/UsarContext';
import { SchedulesAPI } from '../../../services/api';

export default function HomeColetor() {
  const navigation = useNavigation();
  const { dark } = useThemeRecolhe();
  const [online, setOnline] = useState(true);
  const { user, setColetasConfirmadas } = useUser();
  const [stats, setStats] = useState({ available: 0, accepted: 0, completed: 0 });
  const [nextPickup, setNextPickup] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = useMemo(() => user?.name?.split(' ')[0] || 'Coletor', [user]);
  const roleLabel = useMemo(() => {
    if (user?.role === 'donor') return 'Doador';
    if (user?.role === 'collector') return 'Coletor';
    return 'Usuário';
  }, [user]);

  const palette = {
    bg: dark ? '#0f1410' : '#f2fdf2',
    card: dark ? '#1b1f1b' : '#ffffff',
    title: dark ? '#b7f7c2' : '#40916c',
    header: dark ? '#c7f3d4' : '#2d6a4f',
    text: dark ? '#e7e7e7' : '#333',
    muted: dark ? '#9aa3a6' : '#6c757d',
    primary: dark ? '#66d49f' : '#40916c',
    progressBg: dark ? '#264031' : '#d8f3dc',
    progressFill: dark ? '#66d49f' : '#52b788',
    buttonText: '#fff',
  };

  const formatDate = (iso) => {
    if (!iso) return 'Sem data definida';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return 'Sem data definida';
    return dt.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const labelStatus = (status) => {
    const map = {
      pending: 'Disponível',
      accepted: 'Aceita',
      on_route: 'A caminho',
      arrived: 'Aguardando doador',
      collected: 'Concluída',
      canceled: 'Cancelada',
    };
    return map[status] || 'Coleta';
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const pendResponse = await SchedulesAPI.list('pending');
      const availableList = pendResponse?.data || pendResponse || [];
      const mineResponse = await SchedulesAPI.myCollections();
      const myList = Array.isArray(mineResponse) ? mineResponse : mineResponse?.data || [];

      const completed = myList.filter((item) => item.status === 'collected');
      const accepted = myList.filter((item) =>
        ['accepted', 'on_route', 'arrived'].includes(item.status),
      );

      const merged = [
        ...availableList.map((item) => ({ ...item, source: 'pending' })),
        ...myList.map((item) => ({ ...item, source: 'my' })),
      ].sort((a, b) => {
        const da = new Date(a.scheduled_at || a.updated_at || 0).getTime();
        const db = new Date(b.scheduled_at || b.updated_at || 0).getTime();
        return da - db;
      });

      setNextPickup(merged.find((item) => item.status !== 'collected') || null);

      setRecent(
        myList
          .slice()
          .sort((a, b) => new Date(b.updated_at || b.scheduled_at || 0) - new Date(a.updated_at || a.scheduled_at || 0))
          .slice(0, 5),
      );

      setStats({
        available: availableList.length,
        accepted: accepted.length,
        completed: completed.length,
      });
      setColetasConfirmadas(completed.length);
    } catch (error) {
      console.warn('Falha ao atualizar HomeColetor', error);
    } finally {
      setLoading(false);
    }
  }, [setColetasConfirmadas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }, [fetchData]),
  );

  const handleVerColetasDisponiveis = () => navigation.navigate('RotasTabColetor');
  const handleVerAgendamentos = () => navigation.navigate('AgendamentosTabColetor');

  const summaryData = [
    { icon: 'inbox', label: 'Coletas disponíveis', value: stats.available },
    { icon: 'check-square', label: 'Coletas aceitas', value: stats.accepted },
    { icon: 'check-circle', label: 'Coletas concluídas', value: stats.completed },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.bg }]}
      contentContainerStyle={{ paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerKicker, { color: palette.header }]}>{roleLabel}</Text>
          <Text style={[styles.headerTitle, { color: palette.header }]}>
            Bem-vindo, {firstName}!
          </Text>
          <Text style={[styles.headerSubtitle, { color: palette.muted }]}>
            Veja coletas, impacto e comece o dia de trabalho.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.statusPill, { backgroundColor: online ? palette.primary : '#444' }]}
          onPress={() => setOnline((prev) => !prev)}
        >
          <View style={[styles.statusDot, { backgroundColor: online ? '#3cff7a' : '#999' }]} />
          <Text style={styles.statusText}>{online ? 'Online' : 'Offline'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.cardTitle, { color: palette.title }]}>Resumo do dia</Text>
        {loading ? (
          <ActivityIndicator color={palette.primary} style={{ marginVertical: 16 }} />
        ) : (
          <>
            <View style={styles.summaryRow}>
              {summaryData.map((item) => (
                <View key={item.label} style={styles.summaryItem}>
                  <Icon name={item.icon} size={20} color={palette.primary} />
                  <Text style={[styles.summaryNumber, { color: palette.text }]}>{item.value}</Text>
                  <Text style={[styles.summaryLabel, { color: palette.muted }]}>{item.label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.chipButton, { borderColor: palette.primary }]}
              onPress={handleVerColetasDisponiveis}
            >
              <Icon name="map-pin" size={16} color={palette.primary} />
              <Text style={[styles.chipText, { color: palette.primary }]}>Ver coletas disponíveis</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.cardTitle, { color: palette.title }]}>Seu impacto</Text>
        <Text style={[styles.impactText, { color: palette.text }]}>
          Você já reciclou <Text style={[styles.bold, { color: palette.title }]}>{stats.completed} coletas</Text> este mês.
        </Text>
        <View style={[styles.progressBar, { backgroundColor: palette.progressBg }]}>
          <View style={[styles.progressFill, { backgroundColor: palette.progressFill, width: `${Math.min((stats.completed / 30) * 100, 100)}%` }]} />
        </View>
        <Text style={[styles.meta, { color: palette.muted }]}>
          Meta mensal: 30 coletas · Falta pouco!
        </Text>
      </View>

      {nextPickup && (
        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: palette.title }]}>Próxima coleta</Text>
              <Text style={[styles.smallMuted, { color: palette.muted }]}>
                {formatDate(nextPickup.scheduled_at)}
              </Text>
            </View>
            <View style={styles.badge}>
              <Icon name="clock" size={14} color={palette.primary} />
              <Text style={[styles.badgeText, { color: palette.primary }]}>{labelStatus(nextPickup.status)}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Icon name="map-pin" size={18} color={palette.primary} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.addressTitle, { color: palette.text }]}>
                {nextPickup.donor?.name || 'Doador'}
              </Text>
              <Text style={[styles.addressText, { color: palette.muted }]}>
                {nextPickup.pickup_address_text || nextPickup.place || 'Endereço combinado'}
              </Text>
            </View>
          </View>

          <View style={styles.materialRow}>
            <Icon name="box" size={18} color={palette.primary} />
            <Text style={[styles.agendamentoTexto, { color: palette.text }]}>
              {(nextPickup.materials || [])
                .map((m) => `${m.name || m.tipo} (${Number(m.pivot?.quantity_kg || m.peso || 0)} kg)`)
                .join(', ')}
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: palette.primary }]}
              onPress={handleVerAgendamentos}
            >
              <Icon name="calendar" size={16} color={palette.primary} />
              <Text style={[styles.secondaryButtonText, { color: palette.primary }]}>Ver todos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: palette.primary }]}
              onPress={handleVerColetasDisponiveis}
            >
              <Icon name="navigation" size={18} color={palette.buttonText} />
              <Text style={[styles.primaryButtonText, { color: palette.buttonText }]}>Iniciar coleta</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.cardTitle, { color: palette.title }]}>Últimas coletas</Text>
        {loading ? (
          <ActivityIndicator color={palette.primary} style={{ marginVertical: 16 }} />
        ) : recent.length === 0 ? (
          <Text style={{ textAlign: 'center', color: palette.muted }}>Nenhuma coleta ainda.</Text>
        ) : (
          recent.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyAddress, { color: palette.text }]}>
                  {item.pickup_address_text || item.place}
                </Text>
                <Text style={[styles.historyLine, { color: palette.muted }]}>
                  {formatDate(item.scheduled_at)}
                </Text>
                <Text style={[styles.historyLine, { color: palette.muted }]}>
                  Materiais:{' '}
                  {(item.materials || [])
                    .map((m) => `${m.name} (${Number(m.pivot?.quantity_kg || 0)} kg)`)
                    .join(', ')}
                </Text>
              </View>
              <View style={styles.statusPillSmall}>
                <Text style={styles.statusPillSmallText}>{labelStatus(item.status)}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.buttonFull, { backgroundColor: palette.primary }]}
          onPress={handleVerAgendamentos}
        >
          <Icon name="clipboard" size={18} color={palette.buttonText} />
          <Text style={[styles.buttonFullText, { color: palette.buttonText }]}>Abrir tela de agendamentos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerKicker: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  chipButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  impactText: {
    fontSize: 15,
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  meta: {
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallMuted: {
    fontSize: 13,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#e8ffe0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'flex-start',
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    marginTop: 2,
  },
  materialRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    gap: 8,
  },
  agendamentoTexto: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyItem: {
    flexDirection: 'row',
    marginTop: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  historyAddress: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyLine: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPillSmall: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#e9f5e9',
  },
  statusPillSmallText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  buttonFull: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonFullText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
