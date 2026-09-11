export type MatchStatsRow = Record<string, number>;

export type WeaknessResult = {
  key: string;
  title: string;
  ratio: number; // 0-1
  previousRatio: number | null;
  trend: 'up' | 'down' | 'stable' | 'new';
  exercises: string[];
};

type RatioDef = {
  key: string;
  title: string;
  success: string; // column name for successes
  total: (s: MatchStatsRow) => number; // total attempts
  threshold: number; // below this ratio => flagged as weakness
  exercises: string[];
};

const OUTFIELD_RATIOS: RatioDef[] = [
  {
    key: 'passes',
    title: 'Précision des passes',
    success: 'passes_reussies',
    total: (s) => (s.passes_reussies || 0) + (s.passes_ratees || 0),
    threshold: 0.65,
    exercises: [
      'Exercice de passes en carré à 2 touches maximum, 15 min',
      'Passes sous pression à un joueur qui presse, par séries de 10',
      'Travail de la passe extérieure/intérieure du pied sur cible fixe',
    ],
  },
  {
    key: 'dribbles',
    title: 'Réussite des dribbles',
    success: 'dribbles_reussis',
    total: (s) => (s.dribbles_reussis || 0) + (s.dribbles_rates || 0),
    threshold: 0.5,
    exercises: [
      "Slalom entre plots avec conduite de balle, en variant les appuis",
      'Dribble 1 contre 1 face à un défenseur, avec changement de rythme',
      'Travail des feintes de corps (une seule feinte, exécutée à pleine vitesse)',
    ],
  },
  {
    key: 'tirs',
    title: 'Précision des tirs',
    success: 'tirs_cadres',
    total: (s) => (s.tirs_cadres || 0) + (s.tirs_non_cadres || 0),
    threshold: 0.5,
    exercises: [
      'Séries de 10 frappes sur cage divisée en zones, viser les coins',
      'Frappes après contrôle orienté, à vitesse de match',
      'Travail de la frappe en une touche sur centre',
    ],
  },
];

const DEFENDER_RATIOS: RatioDef[] = [
  {
    key: 'tacles',
    title: 'Réussite des tacles',
    success: 'tacles_reussis',
    total: (s) => (s.tacles_reussis || 0) + (s.tacles_rates || 0),
    threshold: 0.6,
    exercises: [
      'Travail du tacle glissé au bon timing, sur ballon roulant',
      'Duels défensifs 1 contre 1 avec consigne de ne pas se jeter en premier',
      'Exercice de couverture défensive avant l’intervention',
    ],
  },
  {
    key: 'duels_aeriens',
    title: 'Duels aériens',
    success: 'duels_aeriens_gagnes',
    total: (s) => (s.duels_aeriens_gagnes || 0) + (s.duels_aeriens_perdus || 0),
    threshold: 0.55,
    exercises: [
      'Travail du timing de saut sur centres répétés',
      'Duels aériens avec opposition, en insistant sur le placement du corps',
      'Renforcement de la détente (musculation légère + pliométrie)',
    ],
  },
  {
    key: 'degagements',
    title: 'Dégagements',
    success: 'degagements_reussis',
    total: (s) => (s.degagements_reussis || 0) + (s.degagements_rates || 0),
    threshold: 0.65,
    exercises: [
      "Dégagements sous pression d'un attaquant qui presse",
      'Travail du dégagement en une touche, pied fort et pied faible',
      "Répétition de sorties de balle propres avant le dégagement d'urgence",
    ],
  },
];

const GOALKEEPER_RATIOS: RatioDef[] = [
  {
    key: 'degagements_gk',
    title: 'Dégagements au pied',
    success: 'degagements_reussis',
    total: (s) => (s.degagements_reussis || 0) + (s.degagements_rates || 0),
    threshold: 0.65,
    exercises: [
      'Relances longues précises sur cible, pied fort et pied faible',
      'Dégagements sous pression après une passe en retrait rapide',
      'Travail du contrôle orienté avant relance',
    ],
  },
  {
    key: 'passes_gk',
    title: 'Relance courte/moyenne',
    success: 'passes_reussies',
    total: (s) => (s.passes_reussies || 0) + (s.passes_ratees || 0),
    threshold: 0.7,
    exercises: [
      'Relance à un défenseur qui se démarque en mouvement',
      'Travail de la passe rasante précise sur petite distance',
      'Prise de décision rapide : relance courte vs dégagement long',
    ],
  },
];

export function ratiosForPosition(position: string | null): RatioDef[] {
  if (position === 'Gardien') return GOALKEEPER_RATIOS;
  if (position === 'Défenseur') return DEFENDER_RATIOS;
  return OUTFIELD_RATIOS;
}

function computeRatio(def: RatioDef, stats: MatchStatsRow): number | null {
  const total = def.total(stats);
  if (total === 0) return null;
  return (stats[def.success] || 0) / total;
}

function sumStats(rows: MatchStatsRow[]): MatchStatsRow {
  const result: MatchStatsRow = {};
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      result[key] = (result[key] || 0) + (row[key] || 0);
    }
  }
  return result;
}

export function analyzeWeaknesses(
  position: string | null,
  recentMatchStats: MatchStatsRow[],
  previousMatchStats: MatchStatsRow[]
): WeaknessResult[] {
  const defs = ratiosForPosition(position);
  const recentSum = sumStats(recentMatchStats);
  const previousSum = sumStats(previousMatchStats);

  const results: WeaknessResult[] = [];

  for (const def of defs) {
    const ratio = computeRatio(def, recentSum);
    if (ratio === null || ratio >= def.threshold) continue;

    const previousRatio = computeRatio(def, previousSum);
    let trend: WeaknessResult['trend'] = 'new';
    if (previousRatio !== null) {
      if (ratio > previousRatio + 0.03) trend = 'up';
      else if (ratio < previousRatio - 0.03) trend = 'down';
      else trend = 'stable';
    }

    results.push({
      key: def.key,
      title: def.title,
      ratio,
      previousRatio,
      trend,
      exercises: def.exercises,
    });
  }

  return results;
}
