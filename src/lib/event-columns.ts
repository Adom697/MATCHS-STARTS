export const EVENT_TO_COLUMN: Record<string, string> = {
  // Communs à tous les postes
  touche: 'touches',
  passe_reussie: 'passes_reussies',
  passe_ratee: 'passes_ratees',
  passe_decisive: 'passes_decisives',
  ballon_perdu: 'ballons_perdus',
  ballon_recupere: 'ballons_recuperes',
  faute_commise: 'fautes_commises',
  faute_subie: 'fautes_subies',
  carton_jaune: 'cartons_jaunes',
  carton_rouge: 'cartons_rouges',

  // Milieux / Attaquants
  dribble_reussi: 'dribbles_reussis',
  dribble_rate: 'dribbles_rates',
  tir_cadre: 'tirs_cadres',
  tir_non_cadre: 'tirs_non_cadres',
  but: 'buts',

  // Défenseurs
  tacle_reussi: 'tacles_reussis',
  tacle_rate: 'tacles_rates',
  interception: 'interceptions',
  duel_aerien_gagne: 'duels_aeriens_gagnes',
  duel_aerien_perdu: 'duels_aeriens_perdus',
  degagement_reussi: 'degagements_reussis',
  degagement_rate: 'degagements_rates',

  // Gardiens de but
  arret: 'arrets',
  but_encaisse: 'buts_encaisses',
  sortie_aerienne_reussie: 'sorties_aeriennes_reussies',
  penalty_arrete: 'penalties_arretes',
};
