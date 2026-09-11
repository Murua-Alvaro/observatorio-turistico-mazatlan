import { airport, busiestRoads, cruises, data, hotel } from '../data/model';
import type { ObservatoryYear } from './export';

export function changePct(current: number, previous: number) {
  return previous ? ((current / previous) - 1) * 100 : 0;
}

export function airportIntelligence(year: ObservatoryYear) {
  const current = airport.filter((d: any) => d.periodo.startsWith(String(year)));
  const previous = airport.filter((d: any) => d.periodo.startsWith(String(year - 1))).slice(0, current.length);
  const total = current.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const previousTotal = previous.reduce((s: number, d: any) => s + d.pasajeros_totales_mes_actual, 0);
  const international = current.reduce((s: number, d: any) => s + d.pasajeros_internacionales_mes_actual, 0);
  const domestic = current.reduce((s: number, d: any) => s + d.pasajeros_nacionales_mes_actual, 0);
  const positiveMonths = current.filter((d: any) => d.yoy_total_pct > 0).length;
  const peak = [...current].sort((a: any, b: any) => b.pasajeros_totales_mes_actual - a.pasajeros_totales_mes_actual)[0];
  const trough = [...current].sort((a: any, b: any) => a.pasajeros_totales_mes_actual - b.pasajeros_totales_mes_actual)[0];
  const latest = current.at(-1);
  const previousLatest = current.at(-2);
  return {
    current,
    previous,
    total,
    previousTotal,
    yoy: changePct(total, previousTotal),
    international,
    domestic,
    internationalShare: total ? international / total * 100 : 0,
    domesticShare: total ? domestic / total * 100 : 0,
    positiveMonths,
    totalMonths: current.length,
    peak,
    trough,
    latest,
    previousLatest,
    recentTurnPositive: Boolean(latest && previousLatest && latest.yoy_total_pct > 0 && previousLatest.yoy_total_pct > 0),
  };
}

export function hotelIntelligence(year: ObservatoryYear) {
  const current = hotel.filter((d: any) => d.periodo.startsWith(String(year)));
  const latest = current.at(-1);
  const sameCutPrevious = latest ? hotel.find((d: any) => d.periodo === `${year - 1}-${latest.periodo.slice(5)}`) : null;
  const capacityGrowth = latest && sameCutPrevious ? changePct(latest.cuartos_disponibles_promedio_diario, sameCutPrevious.cuartos_disponibles_promedio_diario) : null;
  const occupiedGrowth = latest && sameCutPrevious ? changePct(latest.cuartos_ocupados, sameCutPrevious.cuartos_ocupados) : null;
  const occupancyDelta = latest && sameCutPrevious ? latest.ocupacion_pct - sameCutPrevious.ocupacion_pct : null;
  return {
    current,
    latest,
    sameCutPrevious,
    capacityGrowth,
    occupiedGrowth,
    occupancyDelta,
    absorptionSpread: capacityGrowth !== null && occupiedGrowth !== null ? occupiedGrowth - capacityGrowth : null,
  };
}

export function cruiseIntelligence(year: ObservatoryYear) {
  const current = cruises.filter((d: any) => d.periodo.startsWith(String(year)));
  const latest = current.at(-1);
  const sameCutPrevious = latest ? cruises.find((d: any) => d.periodo === `${year - 1}-${latest.periodo.slice(5)}`) : null;
  const passengerGrowth = latest && sameCutPrevious ? changePct(latest.pasajeros_acumulado_actual, sameCutPrevious.pasajeros_acumulado_actual) : null;
  const arrivalGrowth = latest && sameCutPrevious ? changePct(latest.arribos_acumulado_actual, sameCutPrevious.arribos_acumulado_actual) : null;
  const paxPerArrival = latest?.arribos_acumulado_actual ? latest.pasajeros_acumulado_actual / latest.arribos_acumulado_actual : null;
  const previousPaxPerArrival = sameCutPrevious?.arribos_acumulado_actual ? sameCutPrevious.pasajeros_acumulado_actual / sameCutPrevious.arribos_acumulado_actual : null;
  return {
    current,
    latest,
    sameCutPrevious,
    passengerGrowth,
    arrivalGrowth,
    paxPerArrival,
    previousPaxPerArrival,
    intensityGrowth: paxPerArrival !== null && previousPaxPerArrival !== null ? changePct(paxPerArrival, previousPaxPerArrival) : null,
  };
}

export function marketIntelligence(year: ObservatoryYear) {
  const countries = data.nationality.countries
    .filter((d: any) => Number(d.anio) === year)
    .sort((a: any, b: any) => b.valor_entradas - a.valor_entradas);
  const monthly = data.nationality.monthly.filter((d: any) => Number(d.anio) === year);
  const total = countries.reduce((s: number, d: any) => s + d.valor_entradas, 0);
  const top2 = countries.slice(0, 2).reduce((s: number, d: any) => s + d.valor_entradas, 0);
  const top5 = countries.slice(0, 5).reduce((s: number, d: any) => s + d.valor_entradas, 0);
  const hhi = total ? countries.reduce((s: number, d: any) => s + Math.pow(d.valor_entradas / total * 100, 2), 0) : 0;
  return {
    countries,
    monthly,
    total,
    top2Share: total ? top2 / total * 100 : 0,
    top5Share: total ? top5 / total * 100 : 0,
    hhi,
    leader: countries[0],
    second: countries[1],
  };
}

export function roadIntelligence() {
  const roads = [...busiestRoads];
  const max = roads[0]?.tdpa ?? 0;
  const median = data.kpis.roadMedianTdpa ?? 0;
  return {
    roads,
    max,
    median,
    concentrationRatio: median ? max / median : 0,
  };
}

export function relativeIntensity(values: number[]) {
  const valid = values.filter((v) => Number.isFinite(v));
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return values.map((v) => max === min ? 0.5 : (v - min) / (max - min));
}
