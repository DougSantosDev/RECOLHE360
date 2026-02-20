import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { SchedulesAPI } from '../services/api';

export function useCollectorLiveTracking(schedules) {
  const schedulesRef = useRef(schedules || []);
  const sendingRef = useRef(false);

  useEffect(() => {
    schedulesRef.current = schedules || [];
  }, [schedules]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let watcher = null;

      const sendCurrentPosition = async (coords, timestamp) => {
        const onRouteSchedules = (schedulesRef.current || []).filter((item) => item.status === 'on_route');
        if (!onRouteSchedules.length || sendingRef.current) return;

        sendingRef.current = true;
        try {
          const speedMeters = Number.isFinite(coords.speed) ? coords.speed : null;
          const payload = {
            lat: coords.latitude,
            lng: coords.longitude,
            heading: Number.isFinite(coords.heading) ? coords.heading : null,
            speed_kmh: speedMeters !== null ? Math.max(0, speedMeters * 3.6) : null,
            recorded_at: new Date(timestamp || Date.now()).toISOString(),
          };

          await Promise.allSettled(
            onRouteSchedules.map((schedule) => SchedulesAPI.sendLocation(schedule.id, payload)),
          );
        } finally {
          sendingRef.current = false;
        }
      };

      const start = async () => {
        const current = await Location.getForegroundPermissionsAsync();
        let status = current.status;
        if (status !== 'granted') {
          const asked = await Location.requestForegroundPermissionsAsync();
          status = asked.status;
        }
        if (status !== 'granted' || !active) return;

        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 7000,
            distanceInterval: 15,
            mayShowUserSettingsDialog: true,
          },
          (position) => {
            if (!active) return;
            sendCurrentPosition(position.coords, position.timestamp);
          },
        );
      };

      start().catch(() => {});

      return () => {
        active = false;
        if (watcher) watcher.remove();
      };
    }, []),
  );
}
