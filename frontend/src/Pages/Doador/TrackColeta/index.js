import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Feather from 'react-native-vector-icons/Feather';
import { SchedulesAPI } from '../../../services/api';
import { useThemeRecolhe } from '../../../context/ThemeContext';

export default function TrackColeta({ route }) {
  const { dark } = useThemeRecolhe();
  const scheduleId = route?.params?.scheduleId;
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(null);
  const [error, setError] = useState('');

  const palette = {
    bg: dark ? '#0f1410' : '#f2fdf2',
    card: dark ? '#1b1f1b' : '#ffffff',
    text: dark ? '#e6e6e6' : '#1b4332',
    muted: dark ? '#9aa3a6' : '#5f6b66',
    primary: dark ? '#66d49f' : '#2f7a4b',
    accent: dark ? '#7cc0ff' : '#0a84ff',
    danger: '#ef4444',
  };

  const loadTrack = useCallback(async () => {
    if (!scheduleId) return;
    try {
      const data = await SchedulesAPI.track(scheduleId);
      setTrack(data);
      setError('');
    } catch (e) {
      setError(e?.message || 'Falha ao carregar rastreamento');
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const run = async () => {
      if (!mounted) return;
      await loadTrack();
    };

    run();
    const interval = setInterval(run, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [loadTrack]);

  const points = useMemo(() => {
    const list = track?.locations || [];
    return list
      .map((item) => ({
        latitude: Number(item.lat),
        longitude: Number(item.lng),
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }, [track]);

  const routePoints = useMemo(() => {
    const list = track?.route?.points || [];
    return list
      .map((item) => ({
        latitude: Number(item.lat),
        longitude: Number(item.lng),
      }))
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  }, [track]);

  const latest = track?.latest_location
    ? {
        latitude: Number(track.latest_location.lat),
        longitude: Number(track.latest_location.lng),
      }
    : points[points.length - 1];

  const destination =
    Number.isFinite(Number(track?.schedule?.pickup_lat)) && Number.isFinite(Number(track?.schedule?.pickup_lng))
      ? {
          latitude: Number(track.schedule.pickup_lat),
          longitude: Number(track.schedule.pickup_lng),
        }
      : null;

  const distanceKm = track?.route?.distance_km ?? track?.distance_km;
  const etaMinutes = track?.route?.eta_minutes ?? track?.eta_minutes;
  const routeProvider = track?.route?.provider || 'straight_line';

  const initialRegion = useMemo(() => {
    const base = latest || destination || { latitude: -23.55052, longitude: -46.633308 };
    return {
      latitude: base.latitude,
      longitude: base.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [latest, destination]);

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.infoCard, { backgroundColor: palette.card }]}>
        <Text style={[styles.title, { color: palette.text }]}>Acompanhar coleta</Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Status: {track?.schedule?.status || 'aguardando'}
        </Text>
        {track?.collector?.name ? (
          <Text style={[styles.subtitle, { color: palette.muted }]}>Coletor: {track.collector.name}</Text>
        ) : null}
        {distanceKm !== null && distanceKm !== undefined ? (
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            Distancia: {distanceKm} km
          </Text>
        ) : null}
        {etaMinutes !== null && etaMinutes !== undefined ? (
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            ETA aproximado: {etaMinutes} min
          </Text>
        ) : null}
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Rota: {routeProvider === 'google' ? 'Google Directions' : routeProvider === 'osrm' ? 'OSRM' : 'Linha reta'}
        </Text>

        <TouchableOpacity style={[styles.refreshButton, { borderColor: palette.primary }]} onPress={loadTrack}>
          <Feather name="refresh-cw" size={15} color={palette.primary} />
          <Text style={[styles.refreshText, { color: palette.primary }]}>Atualizar agora</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={{ color: palette.muted, marginTop: 10 }}>Carregando localizacao...</Text>
        </View>
      ) : !latest && !destination ? (
        <View style={[styles.empty, { backgroundColor: palette.card }]}>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Sem coordenadas ainda</Text>
          <Text style={[styles.emptyText, { color: palette.muted }]}>
            Assim que o coletor iniciar a rota, o mapa sera atualizado.
          </Text>
          {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}
        </View>
      ) : (
        <MapView style={styles.map} initialRegion={initialRegion}>
          {points.length > 1 ? (
            <Polyline coordinates={points} strokeColor={palette.accent} strokeWidth={4} />
          ) : null}

          {routePoints.length > 1 ? (
            <Polyline
              coordinates={routePoints}
              strokeColor={palette.primary}
              strokeWidth={4}
            />
          ) : null}

          {routePoints.length <= 1 && latest && destination ? (
            <Polyline
              coordinates={[latest, destination]}
              strokeColor={palette.primary}
              strokeWidth={3}
              lineDashPattern={[8, 8]}
            />
          ) : null}

          {destination ? (
            <Marker coordinate={destination} title="Destino" description={track?.schedule?.pickup_address_text || ''} />
          ) : null}

          {latest ? (
            <Marker coordinate={latest} title="Coletor" pinColor={palette.accent} />
          ) : null}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  infoCard: {
    margin: 14,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  refreshButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshText: { fontWeight: '600' },
  map: { flex: 1, marginHorizontal: 14, marginBottom: 14, borderRadius: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    margin: 14,
    borderRadius: 12,
    padding: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyText: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  error: { marginTop: 10, fontWeight: '600' },
});
