import type { DictKey, Locale } from './i18n';
import { getDictionary } from './i18n';

export type LiveButtonDef = { type: string; labelKey: DictKey; tone?: 'positive' | 'negative' };
export type ButtonGroupDef = { titleKey: DictKey; buttons: LiveButtonDef[] };

export type LiveButton = { type: string; label: string; tone?: 'positive' | 'negative' };
export type ButtonGroup = { title: string; buttons: LiveButton[] };

const MIDFIELD_ATTACK_GROUPS_DEF: ButtonGroupDef[] = [
  {
    titleKey: 'grp_passes',
    buttons: [
      { type: 'passe_reussie', labelKey: 'btn_pass_success', tone: 'positive' },
      { type: 'passe_ratee', labelKey: 'btn_pass_fail', tone: 'negative' },
      { type: 'passe_decisive', labelKey: 'btn_pass_key', tone: 'positive' },
    ],
  },
  {
    titleKey: 'grp_dribbles',
    buttons: [
      { type: 'dribble_reussi', labelKey: 'btn_dribble_success', tone: 'positive' },
      { type: 'dribble_rate', labelKey: 'btn_dribble_fail', tone: 'negative' },
    ],
  },
  {
    titleKey: 'grp_shots',
    buttons: [
      { type: 'tir_cadre', labelKey: 'btn_shot_on', tone: 'positive' },
      { type: 'tir_non_cadre', labelKey: 'btn_shot_off', tone: 'negative' },
      { type: 'but', labelKey: 'btn_goal', tone: 'positive' },
    ],
  },
  {
    titleKey: 'grp_loose_ball',
    buttons: [
      { type: 'ballon_perdu', labelKey: 'btn_ball_lost', tone: 'negative' },
      { type: 'ballon_recupere', labelKey: 'btn_ball_won', tone: 'positive' },
    ],
  },
  {
    titleKey: 'grp_discipline',
    buttons: [
      { type: 'faute_commise', labelKey: 'btn_foul_committed', tone: 'negative' },
      { type: 'faute_subie', labelKey: 'btn_foul_suffered', tone: 'positive' },
      { type: 'carton_jaune', labelKey: 'btn_yellow', tone: 'negative' },
      { type: 'carton_rouge', labelKey: 'btn_red', tone: 'negative' },
    ],
  },
];

const DEFENDER_GROUPS_DEF: ButtonGroupDef[] = [
  {
    titleKey: 'grp_defense',
    buttons: [
      { type: 'tacle_reussi', labelKey: 'btn_tackle_success', tone: 'positive' },
      { type: 'tacle_rate', labelKey: 'btn_tackle_fail', tone: 'negative' },
      { type: 'interception', labelKey: 'btn_interception', tone: 'positive' },
      { type: 'duel_aerien_gagne', labelKey: 'btn_aerial_won', tone: 'positive' },
      { type: 'duel_aerien_perdu', labelKey: 'btn_aerial_lost', tone: 'negative' },
      { type: 'degagement_reussi', labelKey: 'btn_clearance_success', tone: 'positive' },
      { type: 'degagement_rate', labelKey: 'btn_clearance_fail', tone: 'negative' },
    ],
  },
  {
    titleKey: 'grp_buildup',
    buttons: [
      { type: 'passe_reussie', labelKey: 'btn_pass_success', tone: 'positive' },
      { type: 'passe_ratee', labelKey: 'btn_pass_fail', tone: 'negative' },
      { type: 'dribble_reussi', labelKey: 'btn_dribble_success', tone: 'positive' },
      { type: 'ballon_perdu', labelKey: 'btn_ball_lost', tone: 'negative' },
    ],
  },
  {
    titleKey: 'grp_discipline',
    buttons: [
      { type: 'faute_commise', labelKey: 'btn_foul_committed', tone: 'negative' },
      { type: 'faute_subie', labelKey: 'btn_foul_suffered', tone: 'positive' },
      { type: 'carton_jaune', labelKey: 'btn_yellow', tone: 'negative' },
      { type: 'carton_rouge', labelKey: 'btn_red', tone: 'negative' },
    ],
  },
];

const GOALKEEPER_GROUPS_DEF: ButtonGroupDef[] = [
  {
    titleKey: 'grp_saves',
    buttons: [
      { type: 'arret', labelKey: 'btn_save', tone: 'positive' },
      { type: 'but_encaisse', labelKey: 'btn_goal_conceded', tone: 'negative' },
      { type: 'penalty_arrete', labelKey: 'btn_penalty_saved', tone: 'positive' },
    ],
  },
  {
    titleKey: 'grp_footwork',
    buttons: [
      { type: 'passe_reussie', labelKey: 'btn_pass_success', tone: 'positive' },
      { type: 'passe_ratee', labelKey: 'btn_pass_fail', tone: 'negative' },
      { type: 'degagement_reussi', labelKey: 'btn_clearance_success', tone: 'positive' },
      { type: 'degagement_rate', labelKey: 'btn_clearance_fail', tone: 'negative' },
    ],
  },
  {
    titleKey: 'grp_claims',
    buttons: [{ type: 'sortie_aerienne_reussie', labelKey: 'btn_claim', tone: 'positive' }],
  },
  {
    titleKey: 'grp_discipline',
    buttons: [
      { type: 'faute_commise', labelKey: 'btn_foul_committed', tone: 'negative' },
      { type: 'faute_subie', labelKey: 'btn_foul_suffered', tone: 'positive' },
      { type: 'carton_jaune', labelKey: 'btn_yellow', tone: 'negative' },
      { type: 'carton_rouge', labelKey: 'btn_red', tone: 'negative' },
    ],
  },
];

function defsForPosition(position: string | null): ButtonGroupDef[] {
  if (position === 'Gardien') return GOALKEEPER_GROUPS_DEF;
  if (position === 'Défenseur') return DEFENDER_GROUPS_DEF;
  return MIDFIELD_ATTACK_GROUPS_DEF;
}

export function groupsForPosition(position: string | null, locale: Locale = 'fr'): ButtonGroup[] {
  const dict = getDictionary(locale);
  return defsForPosition(position).map((g) => ({
    title: dict[g.titleKey],
    buttons: g.buttons.map((b) => ({ type: b.type, label: dict[b.labelKey], tone: b.tone })),
  }));
}
