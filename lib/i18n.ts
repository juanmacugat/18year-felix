export type Lang = 'en' | 'es' | 'fr' | 'de';

export interface Translations {
  // ── Nav / Hero ─────────────────────────────────────────────────────────────
  hero_title:           string;
  hero_badge:           string;
  hero_subtitle:        string;
  hero_unlocking:       string;
  hero_started:         string;
  hero_stat_portfolio:  string;
  hero_stat_invested:   string;
  hero_stat_pnl:        string;
  hero_stat_btc:        string;
  hero_journey_pct:     (pct: string) => string;
  hero_unlocks_in:      string;
  hero_yrs:             string;
  hero_mo:              string;
  hero_d:               string;
  hero_explore:         string;
  hero_year_label:      string;
  hero_year_of:         string;
  // ── Journey scroll section ─────────────────────────────────────────────────
  journey_section:      string;
  journey_age:          (n: number) => string;
  journey_base_proj:    string;
  journey_pct:          (pct: number) => string;
  milestone_0:          string;
  milestone_1:          string;
  milestone_2:          string;
  milestone_3:          string;
  milestone_4:          string;
  milestone_5:          string;
  milestone_6:          string;
  milestone_7:          string;
  // ── Final overlay ──────────────────────────────────────────────────────────
  final_date:           string;
  final_title_pre:      string;
  final_title_post:     string;
  final_subtitle:       string;
  final_at18:           string;
  // ── Closing letter ─────────────────────────────────────────────────────────
  closing_body:         string;
  closing_from:         string;
  // ── Scenario cards ─────────────────────────────────────────────────────────
  scenario_base_badge:  string;
  scenario_btc_label:   string;
  scenario_tap_hint:    string;
  scenario_tap_dismiss: string;
  bear_label:           string;
  base_label:           string;
  bull_label:           string;
  bear_headline:        string;
  bear_body:            string;
  base_headline:        string;
  base_body:            string;
  bull_headline:        string;
  bull_body:            string;
  // ── Footer ─────────────────────────────────────────────────────────────────
  footer:               string;
  // ── Passcode lockscreen ────────────────────────────────────────────────────
  lock_title:           string;
}

// ── English ───────────────────────────────────────────────────────────────────

const en: Translations = {
  hero_title:           'For Félix',
  hero_badge:           'Born Into Bitcoin',
  hero_subtitle:        '18 years of Bitcoin DCA',
  hero_unlocking:       'Unlocking',
  hero_started:         'Started',
  hero_stat_portfolio:  'Portfolio Value',
  hero_stat_invested:   'Total Invested',
  hero_stat_pnl:        'P&L',
  hero_stat_btc:        'BTC Held',
  hero_journey_pct:     (pct) => `${pct}% of journey`,
  hero_unlocks_in:      'Unlocks in',
  hero_yrs:             'yrs',
  hero_mo:              'mo',
  hero_d:               'd',
  hero_explore:         'Explore the journey',
  hero_year_label:      'Year',
  hero_year_of:         'of 18',

  journey_section:      'The Journey',
  journey_age:          (n) => `Age ${n} ${n === 1 ? 'year' : 'years'} old`,
  journey_base_proj:    'base estimate · 35% avg annual growth',
  journey_pct:          (pct) => `${Math.round(pct * 100)}% of journey`,
  milestone_0:          'The journey begins',
  milestone_1:          'First sats in the pocket',
  milestone_2:          'Learning to walk and hodl',
  milestone_3:          'School days: the stack grows quietly',
  milestone_4:          'Double digits, growing up and stacking up',
  milestone_5:          'Teenager with a serious head start',
  milestone_6:          'Almost 18...',
  milestone_7:          'Any day now...',

  final_date:           'May 29, 2044',
  final_title_pre:      'Félix turns ',
  final_title_post:     '',
  final_subtitle:       'The gift unlocks.',
  final_at18:           'At 18, Félix could have',
  closing_body:         'Since the week you were born, your uncle and aunt, Juan and Ani, saved for you. Every week. This page has been counting from day one. The rest is yours.',
  closing_from:         '— Juan & Ani, May 2026',

  scenario_base_badge:  'Base Case',
  scenario_btc_label:   'BTC price in 2044',
  scenario_tap_hint:    'tap for context',
  scenario_tap_dismiss: '↑ tap to dismiss',
  bear_label:           'Bear',
  base_label:           'Base',
  bull_label:           'Bull',

  bear_headline: "Below Bitcoin's historical floor",
  bear_body:     "15% CAGR is more pessimistic than any long-term BTC window on record; even investors who bought at the 2017 peak earned ~20% CAGR over the following 7 years. Reaching this scenario requires decades of stagnation: prolonged regulatory crackdowns, no new institutional adoption, and Bitcoin capped as a niche asset. Historically unlikely, but it's the honest worst case.",
  base_headline: "Aligned with BTC's maturing growth",
  base_body:     "35% roughly matches what a disciplined DCA investor has earned over any rolling 8-year window in Bitcoin's history (2015–2023 DCA CAGR sits around 40%). As the market matures and volatility compresses, cycle gains slow, but 35% reflects a world where Bitcoin steadily consolidates its digital gold role. The most historically grounded of the three.",
  bull_headline: 'Early-cycle territory: aggressive but not impossible',
  bull_body:     "60% mirrors Bitcoin's DCA returns during the 2015–2020 window (~65% CAGR). Sustaining it through 2044 would require a major new adoption wave: sovereign wealth funds, central-bank reserves, or Bitcoin becoming the settlement layer of global finance. Over an 18-year horizon that ends in 2044, it's less far-fetched than it sounds today.",

  footer: 'Félixfolio · For Félix · Unlocking May 29, 2044',
  lock_title: 'Enter Passcode',
};

// ── Spanish ───────────────────────────────────────────────────────────────────

const es: Translations = {
  hero_title:           'Para Félix',
  hero_badge:           'Nacido con Bitcoin',
  hero_subtitle:        '18 años de DCA en Bitcoin',
  hero_unlocking:       'Se desbloquea el',
  hero_started:         'Empezó el',
  hero_stat_portfolio:  'Valor del portfolio',
  hero_stat_invested:   'Total invertido',
  hero_stat_pnl:        'Ganancias',
  hero_stat_btc:        'BTC acumulado',
  hero_journey_pct:     (pct) => `${pct}% del camino`,
  hero_unlocks_in:      'Se desbloquea en',
  hero_yrs:             'años',
  hero_mo:              'mes',
  hero_d:               'd',
  hero_explore:         'Explorar el camino',
  hero_year_label:      'Año',
  hero_year_of:         'de 18',

  journey_section:      'El camino',
  journey_age:          (n) => `${n} ${n === 1 ? 'año' : 'años'} de edad`,
  journey_base_proj:    'estimación base · 35% crecimiento anual',
  journey_pct:          (pct) => `${Math.round(pct * 100)}% del camino`,
  milestone_0:          'El camino comienza',
  milestone_1:          'Primeros satoshis en el bolsillo',
  milestone_2:          'Aprendiendo a caminar y a hodlear',
  milestone_3:          'Días de escuela: el stack crece en silencio',
  milestone_4:          'Dos dígitos, creciendo y acumulando',
  milestone_5:          'Adolescente con mucha ventaja',
  milestone_6:          'Casi 18...',
  milestone_7:          'Ya casi...',

  final_date:           '29 de mayo de 2044',
  final_title_pre:      'Félix cumple ',
  final_title_post:     '',
  final_subtitle:       'El regalo se desbloquea.',
  final_at18:           'A los 18, Félix podría tener',
  closing_body:         'Desde la semana en que naciste, tus tíos Juan y Ani ahorraron para ti. Cada semana. Esta página lo ha registrado desde el primer día. Lo que queda es tuyo.',
  closing_from:         '— Juan y Ani, mayo de 2026',

  scenario_base_badge:  'Caso base',
  scenario_btc_label:   'Precio BTC en 2044',
  scenario_tap_hint:    'toca para más info',
  scenario_tap_dismiss: '↑ toca para cerrar',
  bear_label:           'Bear',
  base_label:           'Base',
  bull_label:           'Bull',

  bear_headline: 'Por debajo del suelo histórico de Bitcoin',
  bear_body:     'Un 15% de CAGR es más pesimista que cualquier período largo en la historia de BTC; incluso los inversores que compraron en el pico de 2017 obtuvieron ~20% de CAGR en los 7 años siguientes. Este escenario requiere décadas de estancamiento: restricciones regulatorias sostenidas, cero nueva adopción institucional y Bitcoin limitado a un activo de nicho. Históricamente improbable, pero es el peor caso honesto.',
  base_headline: 'Alineado con el crecimiento maduro de BTC',
  base_body:     'El 35% se aproxima a lo que un inversor DCA disciplinado ha obtenido en cualquier ventana de 8 años en la historia de Bitcoin (el CAGR DCA 2015–2023 ronda el 40%). A medida que el mercado madura y la volatilidad se comprime, las ganancias por ciclo se reducen, pero el 35% refleja un mundo donde Bitcoin consolida su rol de oro digital. El más fundamentado históricamente de los tres.',
  bull_headline: 'Territorio de ciclo temprano: agresivo pero no imposible',
  bull_body:     'El 60% refleja los retornos DCA de Bitcoin durante la ventana 2015–2020 (~65% CAGR). Mantenerlo hasta 2044 requeriría una gran ola de adopción: fondos soberanos, reservas de bancos centrales, o Bitcoin como capa de liquidación de las finanzas globales. En un horizonte de 18 años que termina en 2044, es menos descabellado de lo que suena hoy.',

  footer: 'Félixfolio · Para Félix · Se desbloquea el 29 de mayo de 2044',
  lock_title: 'Introducir código',
};

// ── French ────────────────────────────────────────────────────────────────────

const fr: Translations = {
  hero_title:           'Pour Félix',
  hero_badge:           'Né dans le Bitcoin',
  hero_subtitle:        '18 ans de DCA Bitcoin',
  hero_unlocking:       'Déblocage le',
  hero_started:         'Démarré le',
  hero_stat_portfolio:  'Valeur du portefeuille',
  hero_stat_invested:   'Total investi',
  hero_stat_pnl:        'P&G',
  hero_stat_btc:        'BTC détenu',
  hero_journey_pct:     (pct) => `${pct}% du parcours`,
  hero_unlocks_in:      'Déblocage dans',
  hero_yrs:             'ans',
  hero_mo:              'mois',
  hero_d:               'j',
  hero_explore:         'Explorer le parcours',
  hero_year_label:      'Année',
  hero_year_of:         'sur 18',

  journey_section:      'Le parcours',
  journey_age:          (n) => `${n} ${n <= 1 ? 'an' : 'ans'}`,
  journey_base_proj:    'estimation de base · 35% croissance annuelle',
  journey_pct:          (pct) => `${Math.round(pct * 100)}% du parcours`,
  milestone_0:          'Le voyage commence',
  milestone_1:          'Premiers satoshis en poche',
  milestone_2:          'Apprendre à marcher et à hodler',
  milestone_3:          "Jours d'école : le stack grandit en silence",
  milestone_4:          "Deux chiffres, grandir et empiler",
  milestone_5:          "Adolescent avec une belle longueur d'avance",
  milestone_6:          'Presque 18...',
  milestone_7:          'Plus que quelques jours...',

  final_date:           '29 mai 2044',
  final_title_pre:      'Félix a ',
  final_title_post:     ' ans',
  final_subtitle:       'Le cadeau se débloque.',
  final_at18:           'À 18 ans, Félix pourrait avoir',
  closing_body:         "Depuis la semaine de ta naissance, ton oncle et ta tante, Juan et Ani, ont mis de côté pour toi. Chaque semaine. Cette page comptait depuis le premier jour. Le reste t'appartient.",
  closing_from:         '— Juan & Ani, mai 2026',

  scenario_base_badge:  'Cas de base',
  scenario_btc_label:   'Prix BTC en 2044',
  scenario_tap_hint:    'cliquer pour en savoir plus',
  scenario_tap_dismiss: '↑ cliquer pour fermer',
  bear_label:           'Bear',
  base_label:           'Base',
  bull_label:           'Bull',

  bear_headline: 'En dessous du plancher historique de Bitcoin',
  bear_body:     "Un CAGR de 15% est plus pessimiste que n'importe quelle fenêtre long terme de BTC ; même les investisseurs ayant acheté au sommet de 2017 ont obtenu ~20% de CAGR sur les 7 années suivantes. Ce scénario exige des décennies de stagnation : réglementations sévères, zéro adoption institutionnelle et Bitcoin limité à une niche. Historiquement peu probable, mais c'est le pire cas honnête.",
  base_headline: 'Aligné sur la croissance mature de BTC',
  base_body:     "35% correspond approximativement à ce qu'un investisseur DCA discipliné a gagné sur n'importe quelle fenêtre de 8 ans dans l'histoire de Bitcoin (le CAGR DCA 2015–2023 tourne autour de 40%). À mesure que le marché mûrit et que la volatilité se comprime, les gains par cycle ralentissent, mais 35% reflète un monde où Bitcoin consolide son rôle d'or numérique. Le plus ancré historiquement des trois.",
  bull_headline: 'Territoire de début de cycle : ambitieux mais pas impossible',
  bull_body:     "60% reflète les rendements DCA de Bitcoin sur la fenêtre 2015–2020 (~65% CAGR). Le maintenir jusqu'en 2044 nécessiterait une grande vague d'adoption : fonds souverains, réserves de banques centrales ou Bitcoin comme couche de règlement de la finance mondiale. Sur un horizon de 18 ans se terminant en 2044, c'est moins farfelu qu'il n'y paraît.",

  footer: 'Félixfolio · Pour Félix · Déblocage le 29 mai 2044',
  lock_title: 'Saisir le code',
};

// ── German ────────────────────────────────────────────────────────────────────

const de: Translations = {
  hero_title:           'Für Félix',
  hero_badge:           'In Bitcoin hineingeboren',
  hero_subtitle:        '18 Jahre Bitcoin-DCA',
  hero_unlocking:       'Freischaltung am',
  hero_started:         'Gestartet am',
  hero_stat_portfolio:  'Portfoliowert',
  hero_stat_invested:   'Gesamt investiert',
  hero_stat_pnl:        'G&V',
  hero_stat_btc:        'BTC gehalten',
  hero_journey_pct:     (pct) => `${pct}% der Reise`,
  hero_unlocks_in:      'Freischaltung in',
  hero_yrs:             'J',
  hero_mo:              'M',
  hero_d:               'T',
  hero_explore:         'Die Reise erkunden',
  hero_year_label:      'Jahr',
  hero_year_of:         'von 18',

  journey_section:      'Die Reise',
  journey_age:          (n) => `${n} ${n === 1 ? 'Jahr' : 'Jahre'} alt`,
  journey_base_proj:    'Basisschätzung · 35% jährl. Wachstum',
  journey_pct:          (pct) => `${Math.round(pct * 100)}% der Reise`,
  milestone_0:          'Die Reise beginnt',
  milestone_1:          'Erste Sats in der Tasche',
  milestone_2:          'Laufen lernen und hodln',
  milestone_3:          'Schulzeit: der Stack wächst leise',
  milestone_4:          'Zweistellig, aufwachsen und aufstocken',
  milestone_5:          'Teenager mit echtem Vorsprung',
  milestone_6:          'Fast 18...',
  milestone_7:          'Jeden Moment...',

  final_date:           '29. Mai 2044',
  final_title_pre:      'Félix wird ',
  final_title_post:     '',
  final_subtitle:       'Das Geschenk wird freigeschaltet.',
  final_at18:           'Mit 18 könnte Félix haben',
  closing_body:         'Seit der Woche, in der du geboren wurdest, haben dein Onkel und deine Tante, Juan und Ani, für dich gespart. Jede Woche. Diese Seite hat es vom ersten Tag an gezählt. Was nun kommt, gehört dir.',
  closing_from:         '— Juan & Ani, Mai 2026',

  scenario_base_badge:  'Basisszenario',
  scenario_btc_label:   'BTC-Preis 2044',
  scenario_tap_hint:    'Tippen für Kontext',
  scenario_tap_dismiss: '↑ Tippen zum Schließen',
  bear_label:           'Bear',
  base_label:           'Base',
  bull_label:           'Bull',

  bear_headline: 'Unterhalb der historischen Untergrenze von Bitcoin',
  bear_body:     'Ein CAGR von 15% ist pessimistischer als jedes langfristige BTC-Fenster in der Geschichte; selbst Investoren, die am 2017er-Höchststand kauften, erzielten ~20% CAGR über die folgenden 7 Jahre. Dieses Szenario erfordert jahrzehntelange Stagnation: anhaltende regulatorische Einschränkungen, keine neue institutionelle Akzeptanz und Bitcoin als Nischenanlage. Historisch unwahrscheinlich, aber der ehrliche Worst Case.',
  base_headline: 'Ausgerichtet auf das reifende Wachstum von BTC',
  base_body:     'Ein CAGR von 35% entspricht in etwa dem, was ein disziplinierter DCA-Investor in jedem rollierenden 8-Jahres-Fenster der Bitcoin-Geschichte verdient hat (der DCA-CAGR 2015–2023 liegt bei rund 40%). Mit der Reifung des Marktes und abnehmender Volatilität verlangsamen sich die Zyklusgewinne, aber 35% spiegelt eine Welt wider, in der Bitcoin seine Rolle als digitales Gold festigt. Das historisch fundierteste der drei Szenarien.',
  bull_headline: 'Frühe Zykluszone: ehrgeizig, aber nicht unmöglich',
  bull_body:     '60% spiegelt die DCA-Renditen von Bitcoin im Fenster 2015–2020 (~65% CAGR) wider. Dies bis 2044 aufrechtzuerhalten würde eine große neue Adoptionswelle erfordern: Staatsfonds, Zentralbankreserven oder Bitcoin als Abrechnungsschicht der globalen Finanzen. Über einen 18-jährigen Horizont bis 2044 ist das weniger abwegig, als es heute klingt.',

  footer: 'Félixfolio · Für Félix · Freischaltung am 29. Mai 2044',
  lock_title: 'Code eingeben',
};

export const TRANSLATIONS: Record<Lang, Translations> = { en, es, fr, de };
