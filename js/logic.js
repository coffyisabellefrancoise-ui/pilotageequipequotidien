// ─── Pure business logic — testable in Node.js and browser ───────────────────
// Usage in browser : functions exposed as globals (window.ratioFor, etc.)
// Usage in Node.js : const { ratioFor, colorR, rankAgents, ... } = require('./js/logic.js')

(function (root) {

  var UCOLS = ['FO', 'LTE', 'PS', 'PC', 'OBA'];

  var UINFO = {
    fo:  { label: 'FTTH (FO)',    icon: '🔵', color: '#3b82f6', U: 'FO'  },
    lte: { label: 'LTE',         icon: '📶', color: '#a855f7', U: 'LTE' },
    ps:  { label: 'Pack Simple', icon: '📦', color: '#f97316', U: 'PS'  },
    pc:  { label: 'Pack Crédit', icon: '💳', color: '#14b8a6', U: 'PC'  },
    oba: { label: 'OBA',         icon: '⭐', color: '#eab308', U: 'OBA' },
  };

  var CAUSES = [
    { id: 'motivation',    icon: '😴', label: 'Manque de motivation',           desc: 'Démotivation, désengagement'       },
    { id: 'produit',       icon: '📚', label: 'Maîtrise produit insuffisante',  desc: 'Offres mal connues'                },
    { id: 'zone',          icon: '🗺️', label: 'Zone / terrain difficile',       desc: 'Secteur peu dense'                 },
    { id: 'prospection',   icon: '📞', label: 'Problème de prospection',        desc: 'Faible nombre de contacts'         },
    { id: 'accompagnement',icon: '🤝', label: "Manque d'accompagnement",        desc: 'Pas de suivi individualisé'        },
    { id: 'objectifs',     icon: '📋', label: 'Objectifs mal compris',          desc: 'Confusion sur les priorités'       },
    { id: 'absence',       icon: '🏥', label: 'Absence / problème personnel',   desc: 'Maladie, événement familial'       },
    { id: 'technique',     icon: '🛠️', label: 'Problème technique / outils',   desc: 'Difficultés avec les outils'       },
  ];

  var ACTIONS = [
    { id: 'a1',  causes: ['motivation'],     icon: '😴', label: 'Entretien motivationnel individuel', priority: 'urgent'    },
    { id: 'a2',  causes: ['produit'],        icon: '📚', label: 'Session de formation produit',       priority: 'urgent'    },
    { id: 'a3',  causes: ['zone'],           icon: '🗺️', label: 'Redéfinir la zone de prospection',  priority: 'urgent'    },
    { id: 'a4',  causes: ['prospection'],    icon: '📞', label: 'Audit du plan de prospection',       priority: 'urgent'    },
    { id: 'a5',  causes: ['prospection'],    icon: '📞', label: 'Objectif de contacts journaliers',   priority: 'urgent'    },
    { id: 'a6',  causes: ['accompagnement'], icon: '🤝', label: 'Coaching hebdomadaire 1-to-1',       priority: 'urgent'    },
    { id: 'a7',  causes: ['objectifs'],      icon: '📋', label: 'Clarification des objectifs',        priority: 'urgent'    },
    { id: 'a8',  causes: ['absence'],        icon: '🏥', label: 'Suivi RH bienveillant',              priority: 'urgent'    },
    { id: 'a9',  causes: ['technique'],      icon: '🛠️', label: 'Diagnostic technique urgent',       priority: 'urgent'    },
    { id: 'a10', causes: ['motivation'],     icon: '😴', label: 'Incentives & objectifs intermédiaires', priority: 'important' },
    { id: 'a11', causes: ['motivation'],     icon: '😴', label: 'Plan de progression co-construit',  priority: 'important' },
    { id: 'a12', causes: ['produit'],        icon: '📚', label: 'Fiche mémo argumentaires',           priority: 'important' },
    { id: 'a13', causes: ['zone'],           icon: '🗺️', label: 'Stratégie terrain adaptée',         priority: 'important' },
    { id: 'a14', causes: ['zone'],           icon: '🗺️', label: 'Sortie terrain commune',            priority: 'important' },
    { id: 'a15', causes: ['prospection'],    icon: '📞', label: 'Formation relance & suivi pipeline', priority: 'important' },
    { id: 'a16', causes: ['accompagnement'], icon: '🤝', label: 'Binôme avec un top performer',       priority: 'important' },
    { id: 'a17', causes: ['objectifs'],      icon: '📋', label: 'Brief matinal quotidien',             priority: 'important' },
    { id: 'a18', causes: ['absence'],        icon: '🏥', label: 'Plan de rattrapage adapté',           priority: 'important' },
    { id: 'a19', causes: ['technique'],      icon: '🛠️', label: 'Formation outils internes',         priority: 'important' },
    { id: 'a20', causes: ['technique'],      icon: '🛠️', label: 'Escalade IT',                       priority: 'important' },
    { id: 'a21', causes: ['produit'],        icon: '📚', label: 'Simulations de vente (roleplay)',    priority: 'normal'    },
    { id: 'a22', causes: ['accompagnement'], icon: '🤝', label: 'Tableau de bord individuel',         priority: 'normal'    },
    { id: 'a23', causes: ['objectifs'],      icon: '📋', label: 'Affichage objectifs hebdomadaires',  priority: 'normal'    },
    { id: 'a24', causes: ['absence'],        icon: '🏥', label: 'Escalade RH si prolongé',            priority: 'normal'    },
  ];

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // Compute ratio (0–100 integer) for an agent on a given universe key.
  // Returns null when there is no objective (denominator = 0).
  // Returns 0 when objective > 0 but realisation = 0.
  function ratioFor(agent, uKey) {
    if (uKey === 'global') {
      var vals = UCOLS.map(function (U) {
        var o = agent['obj' + U], r = agent['rea' + U];
        return o > 0 ? r / o : null;
      }).filter(function (v) { return v !== null; });
      return vals.length
        ? Math.round(vals.reduce(function (s, v) { return s + v; }, 0) / vals.length * 100)
        : 0;
    }
    var U = uKey.toUpperCase();
    var o = agent['obj' + U], r = agent['rea' + U];
    return o > 0 ? Math.round(r / o * 100) : null;
  }

  // Return a CSS color variable string based on a ratio value.
  function colorR(r) {
    return r === null ? 'var(--muted)' : r >= 100 ? 'var(--green)' : r >= 50 ? 'var(--yellow)' : 'var(--red)';
  }

  // Pure ranking function: takes an array of agents and a universe key,
  // returns enriched copies sorted by ratio desc with 1224 ranking applied.
  function rankAgents(agentList, uKey) {
    var sorted = agentList.map(function (a) {
      return Object.assign({}, a, {
        ratioGlobal: ratioFor(a, 'global'),
        _r: ratioFor(a, uKey) || 0,
      });
    }).sort(function (a, b) { return b._r - a._r; });

    // Standard 1224 ranking: ex-aequo share the same rank, next skips
    for (var i = 0; i < sorted.length; i++) {
      if (i === 0) {
        sorted[i].rang = 1;
      } else if (sorted[i]._r === sorted[i - 1]._r) {
        sorted[i].rang = sorted[i - 1].rang;
      } else {
        sorted[i].rang = i + 1;
      }
    }
    return sorted;
  }

  function getDefaultAgents() {
    var data = [
      { franchise: 'EO Dar Es',     nom: 'BENJAMIN YAO',        tel: '0747268228', poste: 'STAGIAIRE', objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Dar Es',     nom: 'JACOB KOUASSI',        tel: '0778909805', poste: 'STAGIAIRE', objFO: 10, reaFO: 1, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Belle Ville',nom: 'ODILON KOFFI',         tel: '0748705689', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Belle Ville',nom: 'YEO KIEMA',            tel: '0789898953', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Belle Ville',nom: 'ZOUNGRANA ALIMA',      tel: '0747505631', poste: 'MC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'TOURE FRANCIS',        tel: '0708548161', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KOMPE FOFANA',         tel: '0779409986', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'STEPHANE AVOHOU',      tel: '0708144652', poste: 'MC',        objFO: 10, reaFO: 1, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 1, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'GBANGBO ANNE GISELE',  tel: '0789906787', poste: 'STAGIAIRE', objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 1, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'LOIC ASSIE DEFALONE',  tel: '0747198196', poste: 'STAGIAIRE', objFO: 10, reaFO: 2, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 1, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KONE KARIDJATOU',      tel: '0797329538', poste: 'MC',        objFO: 10, reaFO: 2, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'SEKONGO',              tel: '0747031104', poste: 'MC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'GNAMIEN TOPE JEKHIEL', tel: '0747901081', poste: 'SAV',       objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KOUASSI STEPHANIE',    tel: '0709502628', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 0,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KONATE FATOUMATA',     tel: '0708759382', poste: 'CC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KONAN ARMAND',         tel: '0777667033', poste: 'MC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 3,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'GLADYS',               tel: '0768799509', poste: 'MC',        objFO: 10, reaFO: 0, objLTE: 7, reaLTE: 1, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 3,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'KOFFI DANIELLE',       tel: '0777676962', poste: 'MC',        objFO: 10, reaFO: 1, objLTE: 7, reaLTE: 1, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 3,  reaOBA: 0 },
      { franchise: 'EO Bouaké',     nom: 'JEAN CLAUDE',          tel: '0707689444', poste: 'MC',        objFO: 10, reaFO: 1, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 3,  reaOBA: 0 },
      { franchise: 'Ps Dabakala',   nom: 'COULIBALY MAMA',       tel: '0777464376', poste: 'STAGIAIRE', objFO: 0,  reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 0, reaPC: 0, objOBA: 0,  reaOBA: 0 },
      { franchise: 'Ps Dabakala',   nom: 'YEO SIATOU',           tel: '0779707771', poste: 'STAGIAIRE', objFO: 0,  reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 0, reaPC: 0, objOBA: 0,  reaOBA: 0 },
      { franchise: 'Ps Dabakala',   nom: 'PINGUIN ADELE',        tel: '0747404041', poste: 'STAGIAIRE', objFO: 0,  reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 0, reaPC: 0, objOBA: 0,  reaOBA: 0 },
      { franchise: 'Eo Katiola',    nom: 'KOUADIO JOCELYNE',     tel: '0707175902', poste: 'CC',        objFO: 0,  reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
      { franchise: 'Eo Katiola',    nom: 'FATOUMA FOFANA',       tel: '0747404041', poste: 'CC',        objFO: 0,  reaFO: 0, objLTE: 7, reaLTE: 0, objPS: 12, reaPS: 0, objPC: 9, reaPC: 0, objOBA: 8,  reaOBA: 0 },
    ];
    return data.map(function (a) {
      return Object.assign({ id: uid(), causes: [], actions: [], comment: '' }, a);
    });
  }

  // ─── Expose ──────────────────────────────────────────────────────────────────
  root.UCOLS            = UCOLS;
  root.UINFO            = UINFO;
  root.CAUSES           = CAUSES;
  root.ACTIONS          = ACTIONS;
  root.uid              = uid;
  root.ratioFor         = ratioFor;
  root.colorR           = colorR;
  root.rankAgents       = rankAgents;
  root.getDefaultAgents = getDefaultAgents;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UCOLS, UINFO, CAUSES, ACTIONS, uid, ratioFor, colorR, rankAgents, getDefaultAgents };
  }

})(typeof window !== 'undefined' ? window : global);
