<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RouteDirectionsService
{
    public function getRoute(float $originLat, float $originLng, float $destLat, float $destLng): ?array
    {
        $provider = strtolower((string) config('services.routing.provider', 'osrm'));

        if ($provider === 'google') {
            $google = $this->googleDirections($originLat, $originLng, $destLat, $destLng);
            if ($google) {
                return $google;
            }
        }

        return $this->osrmDirections($originLat, $originLng, $destLat, $destLng);
    }

    private function osrmDirections(float $originLat, float $originLng, float $destLat, float $destLng): ?array
    {
        $baseUrl = rtrim((string) config('services.routing.osrm_base_url', 'https://router.project-osrm.org'), '/');
        $profile = (string) config('services.routing.osrm_profile', 'driving');
        $url = sprintf(
            '%s/route/v1/%s/%F,%F;%F,%F',
            $baseUrl,
            $profile,
            $originLng,
            $originLat,
            $destLng,
            $destLat
        );

        try {
            $response = Http::timeout(4)->get($url, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'steps' => 'false',
            ]);

            if (!$response->ok()) {
                return null;
            }

            $route = $response->json('routes.0');
            if (!$route) {
                return null;
            }

            $coords = $route['geometry']['coordinates'] ?? [];
            $points = [];
            foreach ($coords as $coord) {
                if (!is_array($coord) || count($coord) < 2) {
                    continue;
                }
                $points[] = [
                    'lat' => (float) $coord[1],
                    'lng' => (float) $coord[0],
                ];
            }

            return [
                'provider' => 'osrm',
                'distance_km' => round(((float) ($route['distance'] ?? 0)) / 1000, 2),
                'eta_minutes' => (int) ceil(((float) ($route['duration'] ?? 0)) / 60),
                'points' => $points,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function googleDirections(float $originLat, float $originLng, float $destLat, float $destLng): ?array
    {
        $apiKey = (string) config('services.routing.google_maps_api_key');
        if (!$apiKey) {
            return null;
        }

        try {
            $response = Http::timeout(4)->get('https://maps.googleapis.com/maps/api/directions/json', [
                'origin' => sprintf('%F,%F', $originLat, $originLng),
                'destination' => sprintf('%F,%F', $destLat, $destLng),
                'mode' => 'driving',
                'key' => $apiKey,
            ]);

            if (!$response->ok()) {
                return null;
            }

            $json = $response->json();
            if (($json['status'] ?? '') !== 'OK') {
                return null;
            }

            $route = $json['routes'][0] ?? null;
            $leg = $route['legs'][0] ?? null;
            if (!$route || !$leg) {
                return null;
            }

            $encoded = (string) ($route['overview_polyline']['points'] ?? '');
            $points = $this->decodeGooglePolyline($encoded);

            return [
                'provider' => 'google',
                'distance_km' => round(((float) ($leg['distance']['value'] ?? 0)) / 1000, 2),
                'eta_minutes' => (int) ceil(((float) ($leg['duration']['value'] ?? 0)) / 60),
                'points' => $points,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function decodeGooglePolyline(string $encoded): array
    {
        if ($encoded === '') {
            return [];
        }

        $points = [];
        $index = 0;
        $lat = 0;
        $lng = 0;
        $length = strlen($encoded);

        while ($index < $length) {
            $result = 0;
            $shift = 0;
            do {
                $b = ord($encoded[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20 && $index < $length);
            $lat += (($result & 1) ? ~($result >> 1) : ($result >> 1));

            $result = 0;
            $shift = 0;
            do {
                $b = ord($encoded[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20 && $index < $length);
            $lng += (($result & 1) ? ~($result >> 1) : ($result >> 1));

            $points[] = [
                'lat' => $lat / 1e5,
                'lng' => $lng / 1e5,
            ];
        }

        return $points;
    }
}
