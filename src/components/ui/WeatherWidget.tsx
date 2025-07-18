import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

type WeatherWidgetProps = {
  renderTips?: (params: {
    weatherCode: number;
    temperature: number;
    city: string;
    icon: React.ReactNode;
    airQuality: string;
    allergyRisks: string[]; // << nouveau champ
  }) => React.ReactNode;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ renderTips }) => {
  const [weather, setWeather] = useState<{
    location: string;
    temperature: number;
    weatherCode: number;
    airQuality: string;
    allergyRisks: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWeatherIcon = (code: number): React.ReactNode => {
    if (code === 0) return <Sun className="text-accent-500" />;
    if ([1, 2, 3].includes(code)) return <Cloud className="text-neutral-400" />;
    if ([45, 48].includes(code)) return <CloudFog className="text-neutral-400" />;
    if ([51, 53, 55, 56, 57, 61, 63, 65].includes(code))
      return <CloudRain className="text-secondary-500" />;
    if ([71, 73, 75].includes(code)) return <CloudSnow className="text-secondary-300" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className="text-warning-500" />;
    return <Sun className="text-accent-500" />;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Météo
        const meteoRes = await fetch('/.netlify/functions/meteo');
        const meteoData = await meteoRes.json();

let airQuality = 'Indisponible';
try {
  const airRes = await fetch(`https://api.airvisual.com/v2/nearest_city?key=17c1f31a-4a2e-4104-bf9e-3ad4349c3f39`);
  if (!airRes.ok) throw new Error('API AirVisual rate limited');

  const airData = await airRes.json();
  const aqi = airData?.data?.current?.pollution?.aqius;

  if (typeof aqi === 'number') {
    if (aqi <= 50) airQuality = 'Bonne';
    else if (aqi <= 100) airQuality = 'Modérée.';
    else if (aqi <= 150) airQuality = 'Acceptable.';
    else if (aqi <= 200) airQuality = 'Mauvaise pour les personnes sensibles.';
    else if (aqi <= 300) airQuality = 'Mauvaise.';
    else airQuality = 'Très mauvaise.';
  }
} catch (error) {
  console.warn('Qualité de l’air indisponible :', error);
}


        // Pollens
        const pollenRes = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=45.766&longitude=4.8795&hourly=birch_pollen,grass_pollen,mugwort_pollen,ragweed_pollen');
        const pollenData = await pollenRes.json();
const now = new Date();
const hours = pollenData.hourly?.time || [];
const nowIndex = hours.findIndex((h: string) => {
  return new Date(h).getHours() === now.getHours();
}) || 0;


        const allergens: { [key: string]: string } = {
          grass_pollen: 'de graminées',
          birch_pollen: 'de pollen de bouleau',
          mugwort_pollen: 'd\'armoise',
          ragweed_pollen: 'd\'ambroisie',
        };

const allergyRisksRaw = Object.entries(allergens)
  .map(([key, label]) => {
    const value = pollenData.hourly?.[key]?.[nowIndex];
    return { label, value };
  })
  .filter(a => typeof a.value === 'number');

const allergyRisks = allergyRisksRaw
  .filter(({ value }) => value > 80)
  .map(({ label, value }) => {
    const niveau =
      value > 200 ? 'très élevé.' : 'élevé.';
    return `Taux ${label.toLowerCase()} ${niveau}`;
  });

if (allergyRisks.length === 0) {
  allergyRisks.push('Rien de préoccupant actuellement.');
}




        setWeather({
          location: 'Villeurbanne',
          temperature: Math.round(meteoData.current_weather.temperature),
          weatherCode: meteoData.current_weather.weathercode,
          airQuality: airQuality,
          allergyRisks: allergyRisks,
        });

        setError(null);
      } catch (err) {
        console.error('Erreur récupération données météo / qualité air / pollens:', err);
        setError('Impossible de charger les données météo.');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex items-center text-sm text-neutral-500 animate-pulse">
        <Cloud size={16} className="mr-1" />
        <span>Chargement météo...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center text-sm text-error-500">
        <span>{error}</span>
      </div>
    );

  if (!weather) return null;

  return (
    <>
      {renderTips &&
        renderTips({
          weatherCode: weather.weatherCode,
          temperature: weather.temperature,
          city: weather.location,
          icon: getWeatherIcon(weather.weatherCode),
          airQuality: weather.airQuality,
          allergyRisks: weather.allergyRisks,
        })}
    </>
  );
};

export default WeatherWidget;
