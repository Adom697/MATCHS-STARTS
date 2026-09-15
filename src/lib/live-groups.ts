export type LiveButton = { type: string; label: string; tone?: 'positive' | 'negative' };
export type ButtonGroup = { title: string; buttons: LiveButton[] };

export const MIDFIELD_ATTACK_GROUPS: ButtonGroup[] = [
  {
    title: 'Passes',
    buttons: [
      { type: 'passe_reussie', label: 'Passe réussie', tone: 'positive' },
      { type: 'passe_ratee', label: 'Passe ratée', tone: 'negative' },
      { type: 'passe_decisive', label: 'Passe décisive', tone: 'positive' },
    ],
  },
  {
    title: 'Dribbles',
    buttons: [
      { type: 'dribble_reussi', label: 'Dribble réussi', tone: 'positive' },
      { type: 'dribble_rate', label: 'Dribble raté', tone: 'negative' },
    ],
  },
  {
    title: 'Tirs',
    buttons: [
      { type: 'tir_cadre', label: 'Tir cadré', tone: 'positive' },
      { type: 'tir_non_cadre', label: 'Tir non cadré', tone: 'negative' },
      { type: 'but', label: 'BUT !', tone: 'positive' },
    ],
  },
  {
    title: 'Ballon perdu / récupéré',
    buttons: [
      { type: 'ballon_perdu', label: 'Ballon perdu', tone: 'negative' },
      { type: 'ballon_recupere', label: 'Ballon récupéré', tone: 'positive' },
    ],
  },
  {
    title: 'Discipline',
    buttons: [
      { type: 'faute_commise', label: 'Faute commise', tone: 'negative' },
      { type: 'faute_subie', label: 'Faute subie', tone: 'positive' },
      { type: 'carton_jaune', label: 'Carton jaune reçu', tone: 'negative' },
      { type: 'carton_rouge', label: 'Carton rouge reçu', tone: 'negative' },
    ],
  },
];

export const DEFENDER_GROUPS: ButtonGroup[] = [
  {
    title: 'Défense',
    buttons: [
      { type: 'tacle_reussi', label: 'Tacle réussi', tone: 'positive' },
      { type: 'tacle_rate', label: 'Tacle raté', tone: 'negative' },
      { type: 'interception', label: 'Interception', tone: 'positive' },
      { type: 'duel_aerien_gagne', label: 'Duel aérien gagné', tone: 'positive' },
      { type: 'duel_aerien_perdu', label: 'Duel aérien perdu', tone: 'negative' },
      { type: 'degagement_reussi', label: 'Dégagement réussi', tone: 'positive' },
      { type: 'degagement_rate', label: 'Dégagement raté', tone: 'negative' },
    ],
  },
  {
    title: 'Relance',
    buttons: [
      { type: 'passe_reussie', label: 'Passe réussie', tone: 'positive' },
      { type: 'passe_ratee', label: 'Passe ratée', tone: 'negative' },
      { type: 'dribble_reussi', label: 'Dribble réussi', tone: 'positive' },
      { type: 'ballon_perdu', label: 'Ballon perdu', tone: 'negative' },
    ],
  },
  {
    title: 'Discipline',
    buttons: [
      { type: 'faute_commise', label: 'Faute commise', tone: 'negative' },
      { type: 'faute_subie', label: 'Faute subie', tone: 'positive' },
      { type: 'carton_jaune', label: 'Carton jaune reçu', tone: 'negative' },
      { type: 'carton_rouge', label: 'Carton rouge reçu', tone: 'negative' },
    ],
  },
];

export const GOALKEEPER_GROUPS: ButtonGroup[] = [
  {
    title: 'Arrêts',
    buttons: [
      { type: 'arret', label: 'Arrêt', tone: 'positive' },
      { type: 'but_encaisse', label: 'But encaissé', tone: 'negative' },
      { type: 'penalty_arrete', label: 'Penalty arrêté', tone: 'positive' },
    ],
  },
  {
    title: 'Jeu au pied',
    buttons: [
      { type: 'passe_reussie', label: 'Passe réussie', tone: 'positive' },
      { type: 'passe_ratee', label: 'Passe ratée', tone: 'negative' },
      { type: 'degagement_reussi', label: 'Dégagement réussi', tone: 'positive' },
      { type: 'degagement_rate', label: 'Dégagement raté', tone: 'negative' },
    ],
  },
  {
    title: 'Sorties',
    buttons: [{ type: 'sortie_aerienne_reussie', label: 'Sortie aérienne réussie', tone: 'positive' }],
  },
  {
    title: 'Discipline',
    buttons: [
      { type: 'faute_commise', label: 'Faute commise', tone: 'negative' },
      { type: 'faute_subie', label: 'Faute subie', tone: 'positive' },
      { type: 'carton_jaune', label: 'Carton jaune reçu', tone: 'negative' },
      { type: 'carton_rouge', label: 'Carton rouge reçu', tone: 'negative' },
    ],
  },
];

export function groupsForPosition(position: string | null): ButtonGroup[] {
  if (position === 'Gardien') return GOALKEEPER_GROUPS;
  if (position === 'Défenseur') return DEFENDER_GROUPS;
  return MIDFIELD_ATTACK_GROUPS;
}
