import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPGgtXoDUycykLaTSee0S0yY0tkeJpqKI",
  authDomain: "data-com-a94a8.firebaseapp.com",
  databaseURL: "https://data-com-a94a8-default-rtdb.firebaseio.com",
  projectId: "data-com-a94a8",
  storageBucket: "data-com-a94a8.appspot.com",
  messagingSenderId: "276904640935",
  appId: "1:276904640935:web:9cd805aeba6c34c767f682",
  measurementId: "G-FYQCWY5G4S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window._db = db; window._fbCollection = collection; window._fbAddDoc = addDoc;
window._fbGetDocs = getDocs; window._fbDeleteDoc = deleteDoc; window._fbDoc = doc;
window._fbQuery = query; window._fbOrderBy = orderBy; window._fbSetDoc = setDoc;
window._fbGetDoc = getDoc; window._fbReady = true;
document.dispatchEvent(new Event('firebase-ready'));

// ══════════════════════════════════════════
// PLAN COMPTABLE SYSCOHADA RÉVISÉ 2017
// ══════════════════════════════════════════
const PC= {

  // ============================================================
  // CLASSE 1 — COMPTES DE RESSOURCES DURABLES
  // ============================================================

  // 10 – Capital
  "10": "CAPITAL",
  "101": "CAPITAL SOCIAL",
  "1011": "Capital souscrit, non appelé",
  "1012": "Capital souscrit, appelé, non versé",
  "1013": "Capital souscrit, appelé, versé, non amorti",
  "1014": "Capital souscrit, appelé, versé, amorti",
  "1018": "Capital souscrit soumis à des conditions particulières",
  "102": "CAPITAL PAR DOTATION",
  "1021": "Dotation initiale",
  "1022": "Dotations complémentaires",
  "1028": "Autres dotations",
  "103": "CAPITAL PERSONNEL",
  "104": "COMPTE DE L'EXPLOITANT",
  "1041": "Apports temporaires",
  "1042": "Opérations courantes",
  "1043": "Rémunérations, impôts et autres charges personnelles",
  "1047": "Prélèvements d'autoconsommation",
  "1048": "Autres prélèvements",
  "105": "PRIMES LIEES AU CAPITAL SOCIAL",
  "1051": "Primes d'émission",
  "1052": "Primes d'apport",
  "1053": "Primes de fusion",
  "1054": "Primes de conversion",
  "1058": "Autres primes",
  "106": "ECARTS DE REEVALUATION",
  "1061": "Ecarts de réévaluation légale",
  "1062": "Ecarts de réévaluation libre",
  "109": "APPORTEURS, CAPITAL SOUSCRIT, NON APPELE",

  // 11 – Réserves
  "11": "RESERVES",
  "111": "RESERVE LEGALE",
  "112": "RESERVES STATUTAIRES OU CONTRACTUELLES",
  "113": "RESERVES REGLEMENTEES",
  "1131": "Réserves de plus-values nettes à long terme",
  "1132": "Réserves d'attribution gratuite d'actions au personnel salarié et aux dirigeants",
  "1133": "Réserves consécutives à l'octroi de subventions d'investissement",
  "1134": "Réserves des valeurs mobilières donnant accès au capital",
  "1138": "Autres réserves réglementées",
  "118": "AUTRES RESERVES",
  "1181": "Réserves facultatives",
  "1188": "Réserves diverses",

  // 12 – Report à nouveau
  "12": "REPORT A NOUVEAU",
  "121": "REPORT A NOUVEAU CREDITEUR",
  "129": "REPORT A NOUVEAU DEBITEUR",
  "1291": "Perte nette à reporter",
  "1292": "Perte - Amortissements réputés différés",

  // 13 – Résultat net de l'exercice
  "13": "RESULTAT NET DE L'EXERCICE",
  "130": "RESULTAT EN INSTANCE D'AFFECTATION",
  "1301": "Résultat en instance d'affectation : Bénéfice",
  "1309": "Résultat en instance d'affectation : Perte",
  "131": "RESULTAT NET : BENEFICE",
  "132": "MARGE COMMERCIALE (MC)",
  "133": "VALEUR AJOUTEE (V.A.)",
  "134": "EXCEDENT BRUT D'EXPLOITATION (E.B.E.)",
  "135": "RESULTAT D'EXPLOITATION (R.E.)",
  "136": "RESULTAT FINANCIER (R.F.)",
  "137": "RESULTAT DES ACTIVITES ORDINAIRES (R.A.O.)",
  "138": "RESULTAT HORS ACTIVITES ORDINAIRES (R.H.A.O.)",
  "1381": "Résultat de fusion",
  "1382": "Résultat d'apport partiel d'actif",
  "1383": "Résultat de scission",
  "1384": "Résultat de liquidation",
  "139": "RESULTAT NET : PERTE",

  // 14 – Subventions d'investissement
  "14": "SUBVENTIONS D'INVESTISSEMENT",
  "141": "SUBVENTIONS D'EQUIPEMENT",
  "1411": "Etat",
  "1412": "Régions",
  "1413": "Départements",
  "1414": "Communes et collectivités publiques décentralisées",
  "1415": "Entités publiques ou mixtes",
  "1416": "Entités et organismes privés",
  "1417": "Organismes internationaux",
  "1418": "Autres",
  "148": "AUTRES SUBVENTIONS D'INVESTISSEMENT",

  // 15 – Provisions réglementées et fonds assimilés
  "15": "PROVISIONS REGLEMENTEES ET FONDS ASSIMILES",
  "151": "AMORTISSEMENTS DEROGATOIRES",
  "152": "PLUS-VALUES DE CESSION A REINVESTIR",
  "153": "FONDS REGLEMENTES",
  "1531": "Fonds National",
  "1532": "Prélèvement pour le Budget",
  "154": "PROVISIONS SPECIALES DE REEVALUATION",
  "155": "PROVISIONS REGLEMENTEES RELATIVES AUX IMMOBILISATIONS",
  "1551": "Reconstitution des gisements miniers et pétroliers",
  "156": "PROVISIONS REGLEMENTEES RELATIVES AUX STOCKS",
  "1561": "Hausse de prix",
  "1562": "Fluctuation des cours",
  "157": "PROVISIONS POUR INVESTISSEMENT",
  "158": "AUTRES PROVISIONS ET FONDS REGLEMENTES",

  // 16 – Emprunts et dettes assimilées
  "16": "EMPRUNTS ET DETTES ASSIMILEES",
  "161": "EMPRUNTS OBLIGATAIRES",
  "1611": "Emprunts obligataires ordinaires",
  "1612": "Emprunts obligataires convertibles en actions",
  "1613": "Emprunts obligataires remboursables en actions",
  "1618": "Autres emprunts obligataires",
  "162": "EMPRUNTS ET DETTES AUPRES DES ETABLISSEMENTS DE CREDIT",
  "163": "AVANCES RECUES DE L'ETAT",
  "164": "AVANCES RECUES ET COMPTES COURANTS BLOQUES",
  "165": "DEPOTS ET CAUTIONNEMENTS RECUS",
  "1651": "Dépôts",
  "1652": "Cautionnements",
  "166": "INTERETS COURUS",
  "1661": "sur emprunts obligataires",
  "1662": "sur emprunts et dettes auprès des établissements de crédit",
  "1663": "sur avances reçues de l'Etat",
  "1664": "sur avances reçues et comptes courants bloqués",
  "1665": "sur dépôts et cautionnements reçus",
  "1667": "sur avances assorties de conditions particulières",
  "1668": "sur autres emprunts et dettes",
  "167": "AVANCES ASSORTIES DE CONDITIONS PARTICULIERES",
  "1671": "Avances bloquées pour augmentation du capital",
  "1672": "Avances conditionnées par l'Etat",
  "1673": "Avances conditionnées par les autres organismes africains",
  "1674": "Avances conditionnées par les organismes internationaux",
  "168": "AUTRES EMPRUNTS ET DETTES",
  "1681": "Rentes viagères capitalisées",
  "1682": "Billets de fonds",
  "1683": "Dettes consécutives à des titres empruntés",
  "1684": "Emprunts participatifs",
  "1685": "Participation des travailleurs aux bénéfices",
  "1686": "Emprunts et dettes contractés auprès des autres tiers",

  // 17 – Dettes de location-acquisition
  "17": "DETTES DE LOCATION-ACQUISITION",
  "172": "DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL IMMOBILIER",
  "173": "DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL MOBILIER",
  "174": "DETTES DE LOCATION-ACQUISITION / LOCATION-VENTE",
  "176": "INTERETS COURUS",
  "1762": "sur dettes de location-acquisition / crédit-bail immobilier",
  "1763": "sur dettes de location-acquisition / crédit-bail mobilier",
  "1764": "sur dettes de location-acquisition / location-vente",
  "1768": "sur autres dettes de location-acquisition",
  "178": "AUTRES DETTES DE LOCATION-ACQUISITION",

  // 18 – Dettes liées à des participations et comptes de liaison
  "18": "DETTES LIEES A DES PARTICIPATIONS ET COMPTES DE LIAISON DES ETABLISSEMENTS ET SUCCURSALES",
  "181": "DETTES LIEES A DES PARTICIPATIONS",
  "1811": "Dettes liées à des participations (groupe)",
  "1812": "Dettes liées à des participations (hors groupe)",
  "182": "DETTES LIEES A DES SOCIETES EN PARTICIPATION",
  "183": "INTERETS COURUS SUR DETTES LIEES A DES PARTICIPATIONS",
  "184": "COMPTES PERMANENTS BLOQUES DES ETABLISSEMENTS ET SUCCURSALES",
  "185": "COMPTES PERMANENTS NON BLOQUES DES ETABLISSEMENTS ET SUCCURSALES",
  "186": "COMPTES DE LIAISON CHARGES",
  "187": "COMPTES DE LIAISON PRODUITS",
  "188": "COMPTES DE LIAISON DES SOCIETES EN PARTICIPATION",

  // 19 – Provisions pour risques et charges
  "19": "PROVISIONS POUR RISQUES ET CHARGES",
  "191": "PROVISIONS POUR LITIGES",
  "192": "PROVISIONS POUR GARANTIES DONNEES AUX CLIENTS",
  "193": "PROVISIONS POUR PERTES SUR MARCHES A ACHEVEMENT FUTUR",
  "194": "PROVISIONS POUR PERTES DE CHANGE",
  "195": "PROVISIONS POUR IMPOTS",
  "196": "PROVISIONS POUR PENSIONS ET OBLIGATIONS SIMILAIRES",
  "1961": "Provisions pour pensions et obligations similaires – engagement de retraite",
  "1962": "Actif du régime de retraite",
  "197": "PROVISIONS POUR RESTRUCTURATION",
  "198": "AUTRES PROVISIONS POUR RISQUES ET CHARGES",
  "1981": "Provisions pour amendes et pénalités",
  "1983": "Provisions de propre assureur",
  "1984": "Provisions pour démantèlement et remise en état",
  "1985": "Provisions pour droits à réduction ou avantage en nature (Chèques cadeaux, cartes...)",
  "1988": "Provisions pour divers risques et charges",

  // ============================================================
  // CLASSE 2 — COMPTES D'ACTIF IMMOBILISE
  // ============================================================

  // 21 – Immobilisations incorporelles
  "21": "IMMOBILISATIONS INCORPORELLES",
  "211": "FRAIS DE DEVELOPPEMENT",
  "212": "BREVETS, LICENCES, CONCESSIONS ET DROITS SIMILAIRES",
  "2121": "Brevets",
  "2122": "Licences",
  "2123": "Concessions de service public",
  "2128": "Autres concessions et droits similaires",
  "213": "LOGICIELS ET SITES INTERNET",
  "2131": "Logiciels",
  "2132": "Sites internet",
  "215": "MARQUES",
  "216": "FONDS COMMERCIAL",
  "217": "DROIT AU BAIL",
  "218": "INVESTISSEMENTS DE CREATION",
  "219": "AUTRES DROITS ET VALEURS INCORPORELS",
  "2181": "Frais de prospection et d'évaluation de ressources minérales",
  "2182": "Coûts d'obtention du contrat",
  "2183": "Fichiers clients, notices, titres de journaux et magazines",
  "2184": "Coûts des franchises",
  "2188": "Divers droits et valeurs incorporels",
  "2191": "Immobilisations incorporelles en cours - Frais de développement",
  "2193": "Immobilisations incorporelles en cours - Logiciels et sites internet",
  "2198": "Immobilisations incorporelles en cours - Autres droits et valeurs incorporels",

  // 22 – Terrains
  "22": "TERRAINS",
  "221": "TERRAINS AGRICOLES ET FORESTIERS",
  "2211": "Terrains d'exploitation agricole",
  "2212": "Terrains d'exploitation forestière",
  "2218": "Autres terrains",
  "222": "TERRAINS NUS",
  "2221": "Terrains à bâtir",
  "2228": "Autres terrains nus",
  "223": "TERRAINS BATIS",
  "2231": "pour bâtiments industriels et agricoles",
  "2232": "pour bâtiments administratifs et commerciaux",
  "2234": "pour bâtiments affectés aux autres opérations professionnelles",
  "2235": "pour bâtiments affectés aux autres opérations non professionnelles",
  "2238": "Autres terrains bâtis",
  "224": "TRAVAUX DE MISE EN VALEUR DES TERRAINS",
  "2241": "Plantation d'arbres et d'arbustes",
  "2245": "Améliorations du fonds",
  "2248": "Autres travaux",
  "225": "TERRAINS DE CARRIERES – TREFONDS",
  "2251": "Carrières",
  "226": "TERRAINS AMENAGES",
  "2261": "Parkings",
  "227": "TERRAINS MIS EN CONCESSION",
  "228": "AUTRES TERRAINS",
  "2281": "Terrains - immeubles de placement",
  "2285": "Terrains des logements affectés au personnel",
  "2286": "Terrains de location - acquisition",
  "2288": "Divers terrains",
  "229": "AMENAGEMENTS DE TERRAINS EN COURS",
  "2291": "Terrains agricoles et forestiers",
  "2292": "Terrains nus",
  "2295": "Terrains de carrières - tréfonds",
  "2298": "Autres terrains",

  // 23 – Bâtiments, installations techniques et agencements
  "23": "BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS",
  "231": "BATIMENTS INDUSTRIELS, AGRICOLES, ADMINISTRATIFS ET COMMERCIAUX SUR SOL PROPRE",
  "2311": "Bâtiments industriels",
  "2312": "Bâtiments agricoles",
  "2313": "Bâtiments administratifs et commerciaux",
  "2314": "Bâtiments affectés au logement du personnel",
  "2315": "Bâtiments - immeubles de placement",
  "2316": "Bâtiments de location - acquisition",
  "232": "BATIMENTS INDUSTRIELS, AGRICOLES, ADMINISTRATIFS ET COMMERCIAUX SUR SOL D'AUTRUI",
  "2321": "Bâtiments industriels",
  "2322": "Bâtiments agricoles",
  "2323": "Bâtiments administratifs et commerciaux",
  "2324": "Bâtiments affectés au logement du personnel",
  "2325": "Bâtiments - immeubles de placement",
  "2326": "Bâtiments de location - acquisition",
  "233": "OUVRAGES D'INFRASTRUCTURE",
  "2331": "Voies de terre",
  "2332": "Voies de fer",
  "2333": "Voies d'eau",
  "2334": "Barrages, Digues",
  "2335": "Pistes d'aérodrome",
  "2338": "Autres ouvrages d'infrastructures",
  "234": "AMENAGEMENTS, AGENCEMENTS ET INSTALLATIONS TECHNIQUES",
  "2341": "Installations complexes spécialisées sur sol propre",
  "2342": "Installations complexes spécialisées sur sol d'autrui",
  "2343": "Installations à caractère spécifique sur sol propre",
  "2344": "Installations à caractère spécifique sur sol d'autrui",
  "2345": "Aménagements et agencements des bâtiments",
  "235": "AMENAGEMENTS DE BUREAUX",
  "2351": "Installations générales",
  "2358": "Autres aménagements de bureaux",
  "237": "BATIMENTS INDUSTRIELS, AGRICOLES ET COMMERCIAUX MIS EN CONCESSION",
  "238": "AUTRES INSTALLATIONS ET AGENCEMENTS",
  "239": "BATIMENTS, AMENAGEMENTS, AGENCEMENTS ET INSTALLATIONS EN COURS",
  "2391": "Bâtiments en cours",
  "2392": "Installations en cours",
  "2393": "Ouvrages d'infrastructure en cours",
  "2394": "Aménagements, agencements et installations techniques en cours",
  "2395": "Aménagements de bureaux en cours",
  "2398": "Autres installations et agencements en cours",

  // 24 – Matériel, mobilier et actifs biologiques
  "24": "MATERIEL, MOBILIER ET ACTIFS BIOLOGIQUES",
  "241": "MATERIEL ET OUTILLAGE INDUSTRIEL ET COMMERCIAL",
  "2411": "Matériel industriel",
  "2412": "Outillage industriel",
  "2413": "Matériel commercial",
  "2414": "Outillage commercial",
  "2416": "Matériel et outillage industriel et commercial de location – acquisition",
  "242": "MATERIEL ET OUTILLAGE AGRICOLE",
  "2421": "Matériel agricole",
  "2422": "Outillage agricole",
  "2426": "Matériel et outillage agricole de location – acquisition",
  "243": "MATERIEL D'EMBALLAGE RECUPERABLE ET IDENTIFIABLE",
  "244": "MATERIEL ET MOBILIER",
  "2441": "Matériel de bureau",
  "2442": "Matériel informatique",
  "2443": "Matériel bureautique",
  "2444": "Mobilier de bureau",
  "2445": "Matériel et mobilier - immeubles de placement",
  "2446": "Matériel et mobilier de location - acquisition",
  "2447": "Matériel et mobilier des logements du personnel",
  "245": "MATERIEL DE TRANSPORT",
  "2451": "Matériel automobile",
  "2452": "Matériel ferroviaire",
  "2453": "Matériel fluvial, lagunaire",
  "2454": "Matériel naval",
  "2455": "Matériel aérien",
  "2456": "Matériel de transport de location - acquisition",
  "2457": "Matériel hippomobile",
  "2458": "Autres matériels de transport",
  "246": "ACTIFS BIOLOGIQUES",
  "2461": "Cheptel, animaux de trait",
  "2462": "Cheptel, animaux reproducteurs",
  "2463": "Animaux de garde",
  "2465": "Plantations agricoles",
  "2468": "Autres actifs biologiques",
  "247": "AGENCEMENTS, AMENAGEMENTS DU MATERIEL ET DES ACTIFS BIOLOGIQUES",
  "2471": "Agencements et aménagements du matériel",
  "2472": "Agencements et aménagements des actifs biologiques",
  "2478": "Autres agencements, aménagements du matériel et actifs biologiques",
  "248": "AUTRES MATERIELS ET MOBILIERS",
  "2481": "Collections et œuvres d'art",
  "2488": "Divers matériels et mobiliers",
  "249": "MATERIELS ET ACTIFS BIOLOGIQUES EN COURS",
  "2491": "Matériel et outillage industriel et commercial",
  "2492": "Matériel et outillage agricole",
  "2493": "Matériel d'emballage récupérable et identifiable",
  "2494": "Matériel et mobilier de bureau",
  "2495": "Matériel de transport",
  "2496": "Actifs biologiques",
  "2497": "Agencements et aménagements du matériel et des actifs biologiques",
  "2498": "Autres matériels et actifs biologiques",

  // 25 – Avances et acomptes versés sur immobilisations
  "25": "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS",
  "251": "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS INCORPORELLES",
  "252": "AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS CORPORELLES",

  // 26 – Titres de participation
  "26": "TITRES DE PARTICIPATION",
  "261": "TITRES DE PARTICIPATION DANS DES ENTITES SOUS CONTROLE EXCLUSIF",
  "262": "TITRES DE PARTICIPATION DANS DES ENTITES SOUS CONTROLE CONJOINT",
  "263": "TITRES DE PARTICIPATION DANS DES ENTITES CONFERANT UNE INFLUENCE NOTABLE",
  "265": "PARTICIPATIONS DANS DES ORGANISMES PROFESSIONNELS",
  "266": "PARTS DANS DES GROUPEMENTS D'INTERET ECONOMIQUE (G.I.E.)",
  "268": "AUTRES TITRES DE PARTICIPATION",

  // 27 – Autres immobilisations financières
  "27": "AUTRES IMMOBILISATIONS FINANCIERES",
  "271": "PRETS ET CREANCES",
  "2711": "Prêts participatifs",
  "2712": "Prêts aux associés",
  "2713": "Billets de fonds",
  "2714": "Créances de location-financement",
  "2715": "Titres prêtés",
  "2718": "Autres prêts et créances",
  "272": "PRETS AU PERSONNEL",
  "2721": "Prêts immobiliers",
  "2722": "Prêts mobiliers et d'installation",
  "2728": "Autres prêts au personnel",
  "273": "CREANCES SUR L'ETAT",
  "2731": "Retenues de garantie",
  "2733": "Fonds réglementé",
  "2734": "Créances sur le concédant",
  "2738": "Autres créances sur l'Etat",
  "274": "TITRES IMMOBILISES",
  "2741": "Titres immobilisés de l'activité de portefeuille (T.I.A.P)",
  "2742": "Titres participatifs",
  "2743": "Certificats d'investissement",
  "2744": "Parts de fonds commun de placement (F.C.P.)",
  "2745": "Obligations",
  "2746": "Actions ou parts propres",
  "2748": "Autres titres immobilisés",
  "275": "DEPOTS ET CAUTIONNEMENTS VERSES",
  "2751": "Dépôts pour loyers d'avance",
  "2752": "Dépôts pour l'électricité",
  "2753": "Dépôts pour l'eau",
  "2754": "Dépôts pour le gaz",
  "2755": "Dépôts pour le téléphone, le télex, la télécopie",
  "2756": "Cautionnements sur marchés publics",
  "2757": "Cautionnements sur autres opérations",
  "2758": "Autres dépôts et cautionnements",
  "276": "INTERETS COURUS",
  "2761": "Prêts et créances non commerciales",
  "2762": "Prêts au personnel",
  "2763": "Créances sur l'Etat",
  "2764": "Titres immobilisés",
  "2765": "Dépôts et cautionnements versés",
  "2766": "Créances de location-financement",
  "2767": "Créances rattachées à des participations",
  "2768": "Immobilisations financières diverses",
  "277": "CREANCES RATTACHEES A DES PARTICIPATIONS ET AVANCES A DES G.I.E.",
  "2771": "Créances rattachées à des participations (groupe)",
  "2772": "Créances rattachées à des participations (hors groupe)",
  "2773": "Créances rattachées à des sociétés en participation",
  "2774": "Avances à des Groupements d'intérêt économique (G.I.E.)",
  "278": "IMMOBILISATIONS FINANCIERES DIVERSES",
  "2781": "Créances diverses groupe",
  "2782": "Créances diverses hors groupe",
  "2784": "Banques dépôts à terme",
  "2785": "Or et métaux précieux",
  "2788": "Autres immobilisations financières",

  // 28 – Amortissements
  "28": "AMORTISSEMENTS",
  "281": "AMORTISSEMENTS DES IMMOBILISATIONS INCORPORELLES",
  "2811": "Amortissements des frais de développement",
  "2812": "Amortissements des brevets, licences, concessions et droits similaires",
  "2813": "Amortissements des logiciels et sites internet",
  "2814": "Amortissements des marques",
  "2815": "Amortissements du fonds commercial",
  "2816": "Amortissements du droit au bail",
  "2817": "Amortissements des investissements de création",
  "2818": "Amortissements des autres droits et valeurs incorporels",
  "282": "AMORTISSEMENTS DES TERRAINS",
  "2824": "Amortissements des travaux de mise en valeur des terrains",
  "283": "AMORTISSEMENTS DES BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS",
  "2831": "Amortissements des bâtiments industriels, agricoles, administratifs et commerciaux (sol propre)",
  "2832": "Amortissements des bâtiments industriels, agricoles, administratifs et commerciaux (sol d'autrui)",
  "2833": "Amortissements des ouvrages d'infrastructure",
  "2834": "Amortissements des aménagements, agencements et installations techniques",
  "2835": "Amortissements des aménagements de bureaux",
  "2837": "Amortissements des bâtiments industriels, agricoles et commerciaux mis en concession",
  "2838": "Amortissements des autres installations et agencements",
  "284": "AMORTISSEMENTS DU MATERIEL",
  "2841": "Amortissements du matériel et outillage industriel et commercial",
  "2842": "Amortissements du matériel et outillage agricole",
  "2843": "Amortissements du matériel d'emballage récupérable et identifiable",
  "2844": "Amortissements du matériel et mobilier",
  "2845": "Amortissements du matériel de transport",
  "2846": "Amortissements des actifs biologiques",
  "2847": "Amortissements des agencements, aménagements du matériel et des actifs biologiques",
  "2848": "Amortissements des autres matériels",

  // 29 – Dépréciations des immobilisations
  "29": "DEPRECIATIONS DES IMMOBILISATIONS",
  "291": "DEPRECIATIONS DES IMMOBILISATIONS INCORPORELLES",
  "2911": "Dépréciations des frais de développement",
  "2912": "Dépréciations des brevets, licences, concessions et droits similaires",
  "2913": "Dépréciations des logiciels et sites internet",
  "2914": "Dépréciations des marques",
  "2915": "Dépréciations du fonds commercial",
  "2916": "Dépréciations du droit au bail",
  "2917": "Dépréciations des investissements de création",
  "2918": "Dépréciations des autres droits et valeurs incorporels",
  "2919": "Dépréciations des immobilisations incorporelles en cours",
  "292": "DEPRECIATIONS DES TERRAINS",
  "2921": "Dépréciations des terrains agricoles et forestiers",
  "2922": "Dépréciations des terrains nus",
  "2923": "Dépréciations des terrains bâtis",
  "2924": "Dépréciations des travaux de mise en valeur des terrains",
  "2925": "Dépréciations des terrains de carrières-tréfonds",
  "2926": "Dépréciations des terrains aménagés",
  "2927": "Dépréciations des terrains mis en concession",
  "2928": "Dépréciations des autres terrains",
  "2929": "Dépréciations des aménagements de terrains en cours",
  "293": "DEPRECIATIONS DES BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS",
  "2931": "Dépréciations des bâtiments industriels, agricoles, administratifs et commerciaux (sol propre)",
  "2932": "Dépréciations des bâtiments industriels, agricoles, administratifs et commerciaux (sol d'autrui)",
  "2933": "Dépréciations des ouvrages d'infrastructures",
  "2934": "Dépréciations des aménagements, agencements et installations techniques",
  "2935": "Dépréciations des aménagements de bureaux",
  "2937": "Dépréciations des bâtiments industriels, agricoles et commerciaux mis en concession",
  "2938": "Dépréciations des autres installations et agencements",
  "2939": "Dépréciations des bâtiments et installations en cours",
  "294": "DEPRECIATIONS DE MATERIEL, DU MOBILIER ET DE L'ACTIF BIOLOGIQUE",
  "2941": "Dépréciations du matériel et outillage industriel et commercial",
  "2942": "Dépréciations du matériel et outillage agricole",
  "2943": "Dépréciations du matériel d'emballage récupérable et identifiable",
  "2944": "Dépréciations du matériel et mobilier",
  "2945": "Dépréciations du matériel de transport",
  "2946": "Dépréciations des actifs biologiques",
  "2947": "Dépréciations des agencements, aménagements du matériel et des actifs biologiques",
  "2948": "Dépréciations des autres matériels",
  "2949": "Dépréciations de matériel en cours",
  "295": "DEPRECIATIONS DES AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS",
  "2951": "Dépréciations des avances et acomptes versés sur immobilisations incorporelles",
  "2952": "Dépréciations des avances et acomptes versés sur immobilisations corporelles",
  "296": "DEPRECIATIONS DES TITRES DE PARTICIPATION",
  "2961": "Dépréciations des titres de participation dans des entités sous contrôle exclusif",
  "2962": "Dépréciations des titres de participation dans des entités sous contrôle conjoint",
  "2963": "Dépréciations des titres de participation dans des entités conférant une influence notable",
  "2965": "Dépréciations des participations dans des organismes professionnels",
  "2966": "Dépréciations des parts dans des GIE",
  "2968": "Dépréciations des autres titres de participation",
  "297": "DEPRECIATIONS DES AUTRES IMMOBILISATIONS FINANCIERES",
  "2971": "Dépréciations des prêts et créances",
  "2972": "Dépréciations des prêts au personnel",
  "2973": "Dépréciations des créances sur l'Etat",
  "2974": "Dépréciations des titres immobilisés",
  "2975": "Dépréciations des dépôts et cautionnements versés",
  "2977": "Dépréciations des créances rattachées à des participations et avances à des GIE",
  "2978": "Dépréciations des créances financières diverses",

  // ============================================================
  // CLASSE 3 — COMPTES DE STOCKS
  // ============================================================

  // 31 – Marchandises
  "31": "MARCHANDISES",
  "311": "MARCHANDISES A",
  "3111": "Marchandises A1",
  "3112": "Marchandises A2",
  "312": "MARCHANDISES B",
  "3121": "Marchandises B1",
  "3122": "Marchandises B2",
  "313": "ACTIFS BIOLOGIQUES",
  "3131": "Animaux",
  "3132": "Végétaux",
  "318": "MARCHANDISES HORS ACTIVITES ORDINAIRES (H.A.O.)",

  // 32 – Matières premières et fournitures liées
  "32": "MATIERES PREMIERES ET FOURNITURES LIEES",
  "321": "MATIERES A",
  "322": "MATIERES B",
  "323": "FOURNITURES (A,B)",

  // 33 – Autres approvisionnements
  "33": "AUTRES APPROVISIONNEMENTS",
  "331": "MATIERES CONSOMMABLES",
  "332": "FOURNITURES D'ATELIER ET D'USINE",
  "333": "FOURNITURES DE MAGASIN",
  "334": "FOURNITURES DE BUREAU",
  "335": "EMBALLAGES",
  "3351": "Emballages perdus",
  "3352": "Emballages récupérables non identifiables",
  "3353": "Emballages à usage mixte",
  "3358": "Autres emballages",
  "338": "AUTRES MATIERES",

  // 34 – Produits en cours
  "34": "PRODUITS EN COURS",
  "341": "PRODUITS EN COURS",
  "3411": "Produits en cours P1",
  "3412": "Produits en cours P2",
  "342": "TRAVAUX EN COURS",
  "3421": "Travaux en cours T1",
  "3422": "Travaux en cours T2",
  "343": "PRODUITS INTERMEDIAIRES EN COURS",
  "3431": "Produits intermédiaires A",
  "3432": "Produits intermédiaires B",
  "344": "PRODUITS RESIDUELS EN COURS",
  "3441": "Produits résiduels A",
  "3442": "Produits résiduels B",
  "3451": "Animaux",
  "3452": "Végétaux",

  // 35 – Services en cours
  "35": "SERVICES EN COURS",
  "351": "ETUDES EN COURS",
  "3511": "Etudes en cours E1",
  "3512": "Etudes en cours E2",
  "352": "PRESTATIONS DE SERVICES EN COURS",
  "3521": "Prestations de services S1",
  "3522": "Prestations de services S2",

  // 36 – Produits finis
  "36": "PRODUITS FINIS",
  "361": "PRODUITS FINIS A",
  "362": "PRODUITS FINIS B",
  "363": "ACTIFS BIOLOGIQUES",
  "3631": "Animaux",
  "3632": "Végétaux",
  "3638": "Autres stocks (activités annexes)",

  // 37 – Produits intermédiaires et résiduels
  "37": "PRODUITS INTERMEDIAIRES ET RESIDUELS",
  "371": "PRODUITS INTERMEDIAIRES",
  "3711": "Produits intermédiaires A",
  "3712": "Produits intermédiaires B",
  "372": "PRODUITS RESIDUELS",
  "3721": "Déchets",
  "3722": "Rebuts",
  "3723": "Matières de récupération",
  "373": "ACTIFS BIOLOGIQUES",
  "3731": "Animaux",
  "3732": "Végétaux",
  "3738": "Autres stocks (activités annexes)",

  // 38 – Stocks en cours de route, en consignation ou en dépôt
  "38": "STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT",
  "381": "MARCHANDISES EN COURS DE ROUTE",
  "382": "MATIERES PREMIERES ET FOURNITURES LIEES EN COURS DE ROUTE",
  "383": "AUTRES APPROVISIONNEMENTS EN COURS DE ROUTE",
  "386": "PRODUITS FINIS EN COURS DE ROUTE",
  "387": "STOCK EN CONSIGNATION OU EN DEPOT",
  "3871": "Stock en consignation",
  "3872": "Stock en dépôt",
  "388": "STOCK PROVENANT D'IMMOBILISATIONS MISES HORS SERVICE OU AU REBUT",

  // 39 – Dépréciations des stocks
  "39": "DEPRECIATIONS DES STOCKS ET ENCOURS DE PRODUCTION",
  "391": "DEPRECIATIONS DES STOCKS DE MARCHANDISES",
  "392": "DEPRECIATIONS DES STOCKS DE MATIERES PREMIERES ET FOURNITURES LIEES",
  "393": "DEPRECIATIONS DES STOCKS D'AUTRES APPROVISIONNEMENTS",
  "394": "DEPRECIATIONS DES PRODUCTIONS EN COURS",
  "395": "DEPRECIATIONS DES SERVICES EN COURS",
  "396": "DEPRECIATIONS DES STOCKS DE PRODUITS FINIS",
  "397": "DEPRECIATIONS DES STOCKS DE PRODUITS INTERMEDIAIRES ET RESIDUELS",
  "398": "DEPRECIATIONS DES STOCKS EN COURS DE ROUTE, EN CONSIGNATION OU EN DEPOT",

  // ============================================================
  // CLASSE 4 — COMPTES DE TIERS
  // ============================================================

  // 40 – Fournisseurs et comptes rattachés
  "40": "FOURNISSEURS ET COMPTES RATTACHES",
  "401": "FOURNISSEURS, DETTES EN COMPTE",
  "4011": "Fournisseurs",
  "4012": "Fournisseurs Groupe",
  "4013": "Fournisseurs sous-traitants",
  "4016": "Fournisseurs, réserve de propriété",
  "4017": "Fournisseurs, retenues de garantie",
  "402": "FOURNISSEURS, EFFETS A PAYER",
  "4021": "Fournisseurs, Effets à payer",
  "4022": "Fournisseurs - Groupe, Effets à payer",
  "4023": "Fournisseurs sous-traitants, Effets à payer",
  "404": "FOURNISSEURS, ACQUISITIONS COURANTES D'IMMOBILISATIONS",
  "4041": "Fournisseurs dettes en compte, immobilisations incorporelles",
  "4042": "Fournisseurs dettes en compte, immobilisations corporelles",
  "4046": "Fournisseurs effets à payer, immobilisations incorporelles",
  "4047": "Fournisseurs effets à payer, immobilisations corporelles",
  "408": "FOURNISSEURS, FACTURES NON PARVENUES",
  "4081": "Fournisseurs",
  "4082": "Fournisseurs - Groupe",
  "4083": "Fournisseurs sous-traitants",
  "4086": "Fournisseurs, intérêts courus",
  "409": "FOURNISSEURS DEBITEURS",
  "4091": "Fournisseurs avances et acomptes versés",
  "4092": "Fournisseurs - Groupe avances et acomptes versés",
  "4093": "Fournisseurs sous-traitants avances et acomptes versés",
  "4094": "Fournisseurs créances pour emballages et matériels à rendre",
  "4098": "Fournisseurs, rabais, remises, ristournes et autres avoirs à obtenir",

  // 41 – Clients et comptes rattachés
  "41": "CLIENTS ET COMPTES RATTACHES",
  "411": "CLIENTS",
  "4111": "Clients",
  "4112": "Clients – Groupe",
  "4114": "Clients, Etat et Collectivités publiques",
  "4115": "Clients, organismes internationaux",
  "4116": "Clients, réserve de propriété",
  "4117": "Clients, retenues de garantie",
  "4118": "Clients, dégrèvement de Taxes sur la Valeur Ajoutée (T.V.A.)",
  "412": "CLIENTS, EFFETS A RECEVOIR EN PORTEFEUILLE",
  "4121": "Clients, Effets à recevoir",
  "4122": "Clients - Groupe, Effets à recevoir",
  "4124": "Etat et Collectivités publiques, Effets à recevoir",
  "4125": "Organismes Internationaux, Effets à recevoir",
  "413": "CLIENTS, CHEQUES, EFFETS ET AUTRES VALEURS IMPAYES",
  "4131": "Clients, chèques impayés",
  "4132": "Clients, Effets impayés",
  "4133": "Clients, cartes de crédit impayées",
  "4138": "Clients, autres valeurs impayées",
  "414": "CREANCES SUR CESSIONS COURANTES D'IMMOBILISATIONS",
  "4141": "Créances en compte, immobilisations incorporelles",
  "4142": "Créances en compte, immobilisations corporelles",
  "4146": "Effets à recevoir, immobilisations incorporelles",
  "4147": "Effets à recevoir, immobilisations corporelles",
  "415": "CLIENTS, EFFETS ESCOMPTES NON ECHUS",
  "416": "CREANCES CLIENTS LITIGIEUSES OU DOUTEUSES",
  "4161": "Créances litigieuses",
  "4162": "Créances douteuses",
  "418": "CLIENTS, PRODUITS A RECEVOIR",
  "4181": "Clients, factures à établir",
  "4186": "Clients, intérêts courus",
  "419": "CLIENTS CREDITEURS",
  "4191": "Clients, avances et acomptes reçus",
  "4192": "Clients - Groupe, avances et acomptes reçus",
  "4194": "Clients, dettes pour emballages et matériels consignés",
  "4198": "Clients, rabais, remises, ristournes et autres avoirs à accorder",

  // 42 – Personnel
  "42": "PERSONNEL",
  "421": "PERSONNEL, AVANCES ET ACOMPTES",
  "4211": "Personnel, avances",
  "4212": "Personnel, acomptes",
  "4213": "Frais avancés et fournitures au personnel",
  "422": "PERSONNEL, REMUNERATIONS DUES",
  "423": "PERSONNEL, OPPOSITIONS, SAISIES-ARRETS",
  "4231": "Personnel, oppositions",
  "4232": "Personnel, saisies-arrêts",
  "4233": "Personnel, avis à tiers détenteur",
  "424": "PERSONNEL, OEUVRES SOCIALES INTERNES",
  "4241": "Assistance médicale",
  "4242": "Allocations familiales",
  "4245": "Organismes sociaux rattachés à l'entité",
  "4248": "Autres oeuvres sociales internes",
  "425": "REPRESENTANTS DU PERSONNEL",
  "4251": "Délégués du personnel",
  "4252": "Syndicats et Comités d'entreprises, d'Etablissement",
  "4258": "Autres représentants du personnel",
  "426": "PERSONNEL, PARTICIPATION AUX BENEFICES ET AU CAPITAL",
  "4261": "Participation aux bénéfices",
  "4264": "Participation au capital",
  "427": "PERSONNEL – DEPOTS",
  "428": "PERSONNEL, CHARGES A PAYER ET PRODUITS A RECEVOIR",
  "4281": "Dettes provisionnées pour congés à payer",
  "4286": "Autres charges à payer",
  "4287": "Produits à recevoir",

  // 43 – Organismes sociaux
  "43": "ORGANISMES SOCIAUX",
  "431": "SECURITE SOCIALE",
  "4311": "Prestations familiales",
  "4312": "Accidents de travail",
  "4313": "Caisse de retraite obligatoire",
  "4314": "Caisse de retraite facultative",
  "4318": "Autres cotisations sociales",
  "432": "CAISSES DE RETRAITE COMPLEMENTAIRE",
  "433": "AUTRES ORGANISMES SOCIAUX",
  "4331": "Mutuelle",
  "4332": "Assurances Retraite",
  "4333": "Assurances et organismes de santé",
  "438": "ORGANISMES SOCIAUX, CHARGES A PAYER ET PRODUITS A RECEVOIR",
  "4381": "Charges sociales sur gratifications à payer",
  "4382": "Charges sociales sur congés à payer",
  "4386": "Autres charges à payer",
  "4387": "Produits à recevoir",

  // 44 – Etat et collectivités publiques
  "44": "ETAT ET COLLECTIVITES PUBLIQUES",
  "441": "ETAT, IMPOT SUR LES BENEFICES",
  "442": "ETAT, AUTRES IMPOTS ET TAXES",
  "4421": "Impôts et taxes d'Etat",
  "4422": "Impôts et taxes pour les collectivités publiques",
  "4423": "Impôts et taxes recouvrables sur des obligataires",
  "4424": "Impôts et taxes recouvrables sur des associés",
  "4426": "Droits de douane",
  "4428": "Autres impôts et taxes",
  "443": "ETAT, T.V.A. FACTUREE",
  "4431": "T.V.A. facturée sur ventes",
  "4432": "T.V.A. facturée sur prestations de services",
  "4433": "T.V.A. facturée sur travaux",
  "4334": "T.V.A. facturée sur production livrée à soi-même",
  "4335": "T.V.A. sur factures à établir",
  "444": "ETAT, T.V.A. DUE OU CREDIT DE T.V.A.",
  "4441": "Etat, T.V.A. due",
  "4445": "Etat, dégrèvement T.V.A.",
  "4449": "Etat, crédit de T.V.A. à reporter",
  "445": "ETAT, T.V.A. RECUPERABLE",
  "4451": "T.V.A. récupérable sur immobilisations",
  "4452": "T.V.A. récupérable sur achats",
  "4453": "T.V.A. récupérable sur transport",
  "4454": "T.V.A. récupérable sur services extérieurs et autres charges",
  "4455": "T.V.A. récupérable sur factures non parvenues",
  "4456": "T.V.A. transférée par d'autres entités",
  "446": "ETAT, AUTRES TAXES SUR LE CHIFFRE D'AFFAIRES",
  "447": "ETAT, IMPOTS RETENUS A LA SOURCE",
  "4471": "Impôt Général sur le revenu",
  "4472": "Impôts sur salaires",
  "4473": "Contribution nationale",
  "4474": "Contribution nationale de solidarité",
  "4478": "Autres impôts et contributions",
  "448": "ETAT, CHARGES A PAYER ET PRODUITS A RECEVOIR",
  "4486": "Charges à payer",
  "4487": "Produits à recevoir",
  "449": "ETAT, CREANCES ET DETTES DIVERSES",
  "4491": "Etat, obligations cautionnées",
  "4492": "Etat, avances et acomptes versés sur impôts",
  "4493": "Etat, fonds de dotation à recevoir",
  "4494": "Etat, subventions d'investissement à recevoir",
  "4495": "Etat, subventions d'exploitation à recevoir",
  "4496": "Etat, subventions d'équilibre à recevoir",
  "4497": "Etat, avances sur subventions",
  "4499": "Etat, fonds réglementé provisionné",

  // 45 – Organismes internationaux
  "45": "ORGANISMES INTERNATIONAUX",
  "451": "OPERATIONS AVEC LES ORGANISMES AFRICAINS",
  "452": "OPERATIONS AVEC LES AUTRES ORGANISMES INTERNATIONAUX",
  "458": "ORGANISMES INTERNATIONAUX, FONDS DE DOTATION ET SUBVENTIONS A RECEVOIR",
  "4581": "Organismes internationaux, fonds de dotation à recevoir",
  "4582": "Organismes internationaux, subventions à recevoir",

  // 46 – Apporteurs, associés et groupe
  "46": "APPORTEURS, ASSOCIES ET GROUPE",
  "461": "APPORTEURS, OPERATIONS SUR LE CAPITAL",
  "4611": "Apporteurs, apports en nature",
  "4612": "Apporteurs, apports en numéraire",
  "4613": "Apporteurs, capital appelé, non versé",
  "4614": "Apporteurs, compte d'apport, opérations de restructuration (fusion…)",
  "4615": "Apporteurs, versements reçus sur augmentation de capital",
  "4616": "Apporteurs, versements anticipés",
  "4617": "Apporteurs défaillants",
  "4618": "Apporteurs, titres à échanger",
  "4619": "Apporteurs, capital à rembourser",
  "462": "ASSOCIES, COMPTES COURANTS",
  "4621": "Principal",
  "4626": "Intérêts courus",
  "463": "ASSOCIES, OPERATIONS FAITES EN COMMUN ET GIE",
  "4631": "Opérations courantes",
  "4636": "Intérêts courus",
  "465": "ASSOCIES, DIVIDENDES A PAYER",
  "466": "GROUPE, COMPTES COURANTS",
  "467": "APPORTEURS RESTANT DÛ SUR CAPITAL APPELE",
  "469": "ENTITE, DIVIDENDES A RECEVOIR",

  // 47 – Débiteurs et créditeurs divers
  "47": "DEBITEURS ET CREDITEURS DIVERS",
  "471": "DEBITEURS ET CREDITEURS DIVERS",
  "4711": "Débiteurs divers",
  "4712": "Créditeurs divers",
  "4713": "Obligataires",
  "4715": "Rémunérations d'administrateurs non associés",
  "4716": "Compte d'affacturage et de titrisation",
  "4717": "Débiteurs divers - retenues de garantie",
  "4718": "Apport, compte de fusion et opérations assimilées",
  "4719": "Bons de souscription d'actions et d'obligations",
  "472": "CREANCES ET DETTES SUR TITRES DE PLACEMENT",
  "4721": "Créances sur cessions de titres de placement",
  "4726": "Versements restant à effectuer sur titres de placement non libérés",
  "473": "INTERMEDIAIRES - OPERATIONS FAITES POUR COMPTE DE TIERS",
  "4731": "Mandants",
  "4732": "Mandataires",
  "4733": "Commettants",
  "4734": "Commissionnaires",
  "4739": "Etat, Collectivités publiques, fonds global d'allocation",
  "474": "COMPTE DE REPARTITION PERIODIQUE DES CHARGES ET DES PRODUITS",
  "4746": "Compte de répartition périodique des charges",
  "4747": "Compte de répartition périodique des produits",
  "475": "COMPTE TRANSITOIRE, AJUSTEMENT SPECIAL LIE A LA REVISION DU SYSCOHADA",
  "4751": "Compte-actif",
  "4752": "Compte-passif",
  "476": "CHARGES CONSTATEES D'AVANCE",
  "477": "PRODUITS CONSTATES D'AVANCE",
  "478": "ECARTS DE CONVERSION - ACTIF",
  "4781": "Diminution des créances d'exploitation et HAO",
  "4782": "Diminution des créances financières",
  "4783": "Augmentation des dettes d'exploitation et HAO",
  "4784": "Augmentation des dettes financières",
  "4786": "Différences d'évaluation sur instruments de trésorerie",
  "4788": "Différences compensées par couverture de change",
  "479": "ECARTS DE CONVERSION - PASSIF",
  "4791": "Augmentation des créances d'exploitation et HAO",
  "47911": "Augmentation des créances d'exploitation",
  "47928": "Augmentation des créances HAO",
  "4793": "Augmentation des créances financières / Diminution des dettes d'exploitation et HAO",
  "47931": "Diminution des dettes d'exploitation",
  "47948": "Diminution des dettes HAO",
  "4797": "Diminution des dettes financières",
  "4798": "Différences compensées par couverture de change",

  // 48 – Créances et dettes hors activités ordinaires (HAO)
  "48": "CREANCES ET DETTES HORS ACTIVITES ORDINAIRES (HAO)",
  "481": "FOURNISSEURS D'INVESTISSEMENTS",
  "4811": "Immobilisations incorporelles",
  "4812": "Immobilisations corporelles",
  "4813": "Versements restant à effectuer sur titres de participation et titres immobilisés non libérés",
  "4816": "Réserve de propriété",
  "48161": "Réserve de propriété - immobilisations incorporelles",
  "48162": "Réserve de propriété - immobilisations corporelles",
  "4817": "Retenues de garantie",
  "48171": "Retenues de garantie - immobilisations incorporelles",
  "48172": "Retenues de garantie - immobilisations corporelles",
  "4818": "Factures non parvenues",
  "48181": "Factures non parvenues - immobilisations incorporelles",
  "48182": "Factures non parvenues - immobilisations corporelles",
  "482": "FOURNISSEURS D'INVESTISSEMENTS, EFFETS A PAYER",
  "4821": "Immobilisations incorporelles",
  "4822": "Immobilisations corporelles (H.A.O.)",
  "485": "CREANCES SUR CESSIONS D'IMMOBILISATIONS",
  "4851": "En compte, immobilisations incorporelles",
  "4852": "En compte, immobilisations corporelles",
  "4853": "Effets à recevoir, immobilisations incorporelles",
  "4854": "Effets à recevoir, immobilisations corporelles",
  "4855": "Effets escomptés non échus",
  "4856": "Immobilisations financières",
  "4857": "Retenues de garantie",
  "4858": "Factures à établir",
  "488": "AUTRES CREANCES HORS ACTIVITES ORDINAIRES (H.A.O.)",

  // 49 – Dépréciations et provisions pour risques à court terme (Tiers)
  "49": "DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME (TIERS)",
  "490": "DEPRECIATIONS DES COMPTES FOURNISSEURS",
  "491": "DEPRECIATIONS DES COMPTES CLIENTS",
  "4911": "Créances litigieuses",
  "4912": "Créances douteuses",
  "492": "DEPRECIATIONS DES COMPTES PERSONNEL",
  "493": "DEPRECIATIONS DES COMPTES ORGANISMES SOCIAUX",
  "494": "DEPRECIATIONS DES COMPTES ETAT ET COLLECTIVITES PUBLIQUES",
  "495": "DEPRECIATIONS DES COMPTES ORGANISMES INTERNATIONAUX",
  "496": "DEPRECIATIONS DES COMPTES ASSOCIES ET GROUPE",
  "4962": "Associés, comptes courants",
  "4963": "Associés, opérations faites en commun et GIE",
  "4966": "Groupe, comptes courants",
  "497": "DEPRECIATIONS DES COMPTES DEBITEURS DIVERS",
  "498": "DEPRECIATIONS DES COMPTES DE CREANCES H.A.O.",
  "4985": "Créances sur cessions d'immobilisations",
  "4986": "Créances sur cessions de titres de placement",
  "4988": "Autres créances H.A.O.",
  "499": "PROVISIONS POUR RISQUES A COURT TERME",
  "4991": "Sur opérations d'exploitation",
  "4998": "Sur opérations H.A.O.",

  // ============================================================
  // CLASSE 5 — COMPTES DE TRESORERIE
  // ============================================================

  // 50 – Titres de placement
  "50": "TITRES DE PLACEMENT",
  "501": "TITRES DU TRESOR ET BONS DE CAISSE A COURT TERME",
  "5011": "Titres du Trésor à court terme",
  "5012": "Titres d'organismes financiers",
  "5013": "Bons de caisse à court terme",
  "5016": "Frais d'acquisition des titres de Trésor et bons de caisse",
  "502": "ACTIONS",
  "5021": "Actions ou parts propres",
  "5022": "Actions cotées",
  "5023": "Actions non cotées",
  "5024": "Actions démembrées (certificats d'investissement ; droits de vote)",
  "5025": "Autres actions",
  "5026": "Frais d'acquisition des actions",
  "503": "OBLIGATIONS",
  "5031": "Obligations émises par l'entité et rachetées par elle",
  "5032": "Obligations cotées",
  "5033": "Obligations non cotées",
  "5035": "Autres obligations",
  "5036": "Frais d'acquisition des obligations",
  "504": "BONS DE SOUSCRIPTION",
  "5042": "Bons de souscription d'actions",
  "5043": "Bons de souscription d'obligations",
  "505": "TITRES NEGOCIABLES HORS REGION",
  "506": "INTERETS COURUS",
  "5061": "Titres du Trésor et bons de caisse à court terme",
  "5062": "Actions",
  "5063": "Obligations",
  "508": "AUTRES TITRES DE PLACEMENT ET CREANCES ASSIMILEES",

  // 51 – Valeurs à encaisser
  "51": "VALEURS A ENCAISSER",
  "511": "EFFETS A ENCAISSER",
  "512": "EFFETS A L'ENCAISSEMENT",
  "513": "CHEQUES A ENCAISSER",
  "514": "CHEQUES A L'ENCAISSEMENT",
  "515": "CARTES DE CREDIT A ENCAISSER",
  "518": "AUTRES VALEURS A L'ENCAISSEMENT",
  "5181": "Warrants",
  "5182": "Billets de fonds",
  "5185": "Chèques de voyage",
  "5186": "Coupons échus",
  "5187": "Intérêts échus des obligations",

  // 52 – Banques
  "52": "BANQUES",
  "521": "BANQUES LOCALES",
  "5211": "Banques en monnaie nationale",
  "5215": "Banques en devises",
  "522": "BANQUES AUTRES ETATS REGION",
  "523": "BANQUES AUTRES ETATS ZONE MONETAIRE",
  "524": "BANQUES HORS ZONE MONETAIRE",
  "525": "BANQUES DEPOT A TERME",
  "526": "BANQUES, INTERETS COURUS",
  "5261": "Banque, intérêts courus charges à payer",
  "5267": "Banque, intérêts courus produits à recevoir",

  // 53 – Etablissements financiers et assimilés
  "53": "ETABLISSEMENTS FINANCIERS ET ASSIMILES",
  "531": "CHEQUES POSTAUX",
  "532": "TRESOR",
  "533": "SOCIETES DE GESTION ET D'INTERMEDIATION (S.G.I.)",
  "536": "ETABLISSEMENTS FINANCIERS, INTERETS COURUS",
  "538": "AUTRES ORGANISMES FINANCIERS",

  // 54 – Instruments de trésorerie
  "54": "INSTRUMENTS DE TRESORERIE",
  "541": "OPTIONS DE TAUX D'INTERET",
  "542": "OPTIONS DE TAUX DE CHANGE",
  "543": "OPTIONS DE TAUX BOURSIERS",
  "544": "INSTRUMENTS DE MARCHES A TERME",
  "545": "AVOIRS D'OR ET AUTRES METAUX PRECIEUX",

  // 55 – Instruments de monnaie électronique
  "55": "INSTRUMENTS DE MONNAIE ELECTRONIQUE",
  "551": "MONNAIE ELECTRONIQUE - CARTE CARBURANT",
  "552": "MONNAIE ELECTRONIQUE - TELEPHONE PORTABLE",
  "553": "MONNAIE ELECTRONIQUE - CARTE PEAGE",
  "554": "PORTE-MONNAIE ELECTRONIQUE",
  "558": "AUTRES INSTRUMENTS DE MONNAIES ELECTRONIQUES",

  // 56 – Banques, crédits de trésorerie et d'escompte
  "56": "BANQUES, CREDITS DE TRESORERIE ET D'ESCOMPTE",
  "561": "CREDITS DE TRESORERIE",
  "564": "ESCOMPTE DE CREDITS DE CAMPAGNE",
  "565": "ESCOMPTE DE CREDITS ORDINAIRES",
  "566": "BANQUES, CREDITS DE TRESORERIE, INTERETS COURUS",

  // 57 – Caisse
  "57": "CAISSE",
  "571": "CAISSE SIEGE SOCIAL",
  "5711": "Caisse en monnaie nationale",
  "5712": "Caisse en devises",
  "572": "CAISSE SUCCURSALE A",
  "5721": "en monnaie nationale",
  "5722": "en devises",
  "573": "CAISSE SUCCURSALE B",
  "5731": "en monnaie nationale",
  "5732": "en devises",

  // 58 – Régies d'avances, accréditifs et virements
  "58": "REGIES D'AVANCES, ACCREDITIFS ET VIREMENTS",
  "581": "REGIES D'AVANCE",
  "582": "ACCREDITIFS",
  "585": "VIREMENTS DE FONDS",
  "588": "AUTRES VIREMENTS INTERNES",

  // 59 – Dépréciations et provisions pour risque à court terme
  "59": "DEPRECIATIONS ET PROVISIONS POUR RISQUE A COURT TERME",
  "590": "DEPRECIATIONS DES TITRES DE PLACEMENT",
  "591": "DEPRECIATIONS DES TITRES ET VALEURS A ENCAISSER",
  "592": "DEPRECIATIONS DES COMPTES BANQUES",
  "593": "DEPRECIATIONS DES COMPTES ETABLISSEMENTS FINANCIERS ET ASSIMILES",
  "594": "DEPRECIATIONS DES COMPTES D'INSTRUMENTS DE TRESORERIE",
  "599": "PROVISIONS POUR RISQUE A COURT TERME A CARACTERE FINANCIER",

  // ============================================================
  // CLASSE 6 — COMPTES DE CHARGES DES ACTIVITES ORDINAIRES
  // ============================================================

  // 60 – Achats et variations de stocks
  "60": "ACHATS ET VARIATIONS DE STOCKS",
  "601": "ACHATS DE MARCHANDISES",
  "6011": "dans la Région",
  "6012": "hors Région",
  "6013": "aux entités du groupe dans la Région",
  "6014": "aux entités du groupe hors Région",
  "6015": "frais sur achats",
  "6019": "Rabais, Remises et Ristournes obtenus (non ventilés)",
  "602": "ACHATS DE MATIERES PREMIERES ET FOURNITURES LIEES",
  "6021": "dans la Région",
  "6022": "hors Région",
  "6023": "aux entités du groupe dans la Région",
  "6024": "aux entités du groupe hors Région",
  "6025": "frais sur achats",
  "6029": "Rabais, Remises et Ristournes obtenus (non ventilés)",
  "603": "VARIATIONS DES STOCKS DE BIENS ACHETES",
  "6031": "Variations des stocks de marchandises",
  "6032": "Variations des stocks de matières premières et fournitures liées",
  "6033": "Variations des stocks d'autres approvisionnements",
  "604": "ACHATS STOCKES DE MATIERES ET FOURNITURES CONSOMMABLES",
  "6041": "Matières consommables",
  "6042": "Matières combustibles",
  "6043": "Produits d'entretien",
  "6044": "Fournitures d'atelier et d'usine",
  "6045": "Frais sur achats",
  "6046": "Fournitures de magasin",
  "6047": "Fournitures de bureau",
  "6049": "Rabais, Remises et Ristournes obtenus (non ventilés)",
  "605": "AUTRES ACHATS",
  "6051": "Fournitures non stockables – Eau",
  "6052": "Fournitures non stockables - Electricité",
  "6053": "Fournitures non stockables – Autres énergies",
  "6054": "Fournitures d'entretien non stockables",
  "6055": "Fournitures de bureau non stockables",
  "6056": "Achats de petit matériel et outillage",
  "6057": "Achats d'études et prestations de services",
  "6058": "Achats de travaux, matériels et équipements",
  "6059": "Rabais, Remises et Ristournes obtenus (non ventilés)",
  "608": "ACHATS D'EMBALLAGES",
  "6081": "Emballages perdus",
  "6082": "Emballages récupérables non identifiables",
  "6083": "Emballages à usage mixte",
  "6085": "frais sur achats",
  "6089": "Rabais, Remises et Ristournes obtenus (non ventilés)",

  // 61 – Transports
  "61": "TRANSPORTS",
  "612": "TRANSPORTS SUR VENTES",
  "613": "TRANSPORTS POUR LE COMPTE DE TIERS",
  "614": "TRANSPORTS DU PERSONNEL",
  "616": "TRANSPORTS DE PLIS",
  "618": "AUTRES FRAIS DE TRANSPORT",
  "6181": "Voyages et déplacements",
  "6182": "Transports entre établissements ou chantiers",
  "6183": "Transports administratifs",

  // 62 – Services extérieurs
  "62": "SERVICES EXTERIEURS",
  "621": "SOUS-TRAITANCE GENERALE",
  "622": "LOCATIONS, CHARGES LOCATIVES",
  "6221": "Locations de terrains",
  "6222": "Locations de bâtiments",
  "6223": "Locations de matériels et outillages",
  "6224": "Malis sur emballages",
  "6225": "Locations d'emballages",
  "6226": "Fermages et loyers du foncier",
  "6228": "Locations et charges locatives diverses",
  "623": "REDEVANCES DE LOCATION-ACQUISITION",
  "6232": "Crédit-bail immobilier",
  "6233": "Crédit-bail mobilier",
  "6234": "Location-vente",
  "6238": "Autres contrats de location-acquisition",
  "624": "ENTRETIEN, REPARATIONS, REMISE EN ETAT ET MAINTENANCE",
  "6241": "Entretien et réparations des biens immobiliers",
  "6242": "Entretien et réparations des biens mobiliers",
  "6243": "Maintenance",
  "6244": "Charges de démantèlement et remise en état",
  "6248": "Autres entretiens et réparations",
  "625": "PRIMES D'ASSURANCE",
  "6251": "Assurances multirisques",
  "6252": "Assurances matériel de transport",
  "6253": "Assurances risques d'exploitation",
  "6254": "Assurances responsabilité du producteur",
  "6255": "Assurances insolvabilité clients",
  "6257": "Assurances transport sur ventes",
  "6258": "Autres primes d'assurances",
  "626": "ETUDES, RECHERCHES ET DOCUMENTATION",
  "6261": "Etudes et recherches",
  "6265": "Documentation générale",
  "6266": "Documentation technique",
  "627": "PUBLICITE, PUBLICATIONS, RELATIONS PUBLIQUES",
  "6271": "Annonces, insertions",
  "6272": "Catalogues, imprimés publicitaires",
  "6273": "Echantillons",
  "6274": "Foires et expositions",
  "6275": "Publications",
  "6276": "Cadeaux à la clientèle",
  "6277": "Frais de colloques, séminaires, conférences",
  "6278": "Autres charges de publicité et relations publiques",
  "628": "FRAIS DE TELECOMMUNICATIONS",
  "6281": "Frais de téléphone",
  "6282": "Frais de télex",
  "6283": "Frais de télécopie",
  "6288": "Autres frais de télécommunications",

  // 63 – Autres services extérieurs
  "63": "AUTRES SERVICES EXTERIEURS",
  "631": "FRAIS BANCAIRES",
  "6311": "Frais sur titres (vente, garde)",
  "6312": "Frais sur effets",
  "6313": "Location de coffres",
  "6314": "Commissions d'affacturage et de titrisation",
  "6315": "Commissions sur cartes de crédit",
  "6316": "Frais d'émission d'emprunts",
  "6317": "Frais sur instruments monnaie électronique",
  "6318": "Autres frais bancaires",
  "632": "REMUNERATIONS D'INTERMEDIAIRES ET DE CONSEILS",
  "6322": "Commissions et courtages sur ventes",
  "6324": "Honoraires des professions réglementées",
  "6325": "Frais d'actes et de contentieux",
  "6326": "Rémunérations d'affacturage et de titrisation",
  "6327": "Rémunérations des autres prestataires de services",
  "6328": "Divers frais",
  "633": "FRAIS DE FORMATION DU PERSONNEL",
  "634": "REDEVANCES POUR BREVETS, LICENCES, LOGICIELS, CONCESSIONS, DROITS ET VALEURS SIMILAIRES",
  "6342": "Redevances pour brevets, licences",
  "6343": "Redevances pour logiciels",
  "6344": "Redevances pour marques",
  "6345": "Redevances pour sites internet",
  "6346": "Redevances pour concessions, droits et valeurs similaires",
  "635": "COTISATIONS",
  "6351": "Cotisations",
  "6358": "Concours divers",
  "637": "REMUNERATIONS DE PERSONNEL EXTERIEUR A L'ENTITE",
  "6371": "Personnel intérimaire",
  "6372": "Personnel détaché ou prêté à l'entité",
  "638": "AUTRES CHARGES EXTERNES",
  "6381": "Frais de recrutement du personnel",
  "6382": "Frais de déménagement",
  "6383": "Réceptions",
  "6384": "Missions",
  "6385": "Charges de copropriété",
  "6388": "Charges externes diverses",

  // 64 – Impôts et taxes
  "64": "IMPOTS ET TAXES",
  "641": "IMPOTS ET TAXES DIRECTS",
  "6411": "Impôts fonciers et taxes annexes",
  "6412": "Patentes, licences et taxes annexes",
  "6413": "Taxes sur appointements et salaires",
  "6414": "Taxes d'apprentissage",
  "6415": "Formation professionnelle continue",
  "6418": "Autres impôts et taxes directs",
  "645": "IMPOTS ET TAXES INDIRECTS",
  "646": "DROITS D'ENREGISTREMENT",
  "6461": "Droits de mutation",
  "6462": "Droits de timbre",
  "6463": "Taxes sur les véhicules de société",
  "6464": "Vignettes",
  "6468": "Autres droits d'enregistrement",
  "647": "PENALITES, AMENDES FISCALES",
  "6471": "Pénalités d'assiette, impôts directs",
  "6472": "Pénalités d'assiette, impôts indirects",
  "6473": "Pénalités de recouvrement, impôts directs",
  "6474": "Pénalités de recouvrement, impôts indirects",
  "6478": "Autres pénalités et amendes fiscales",
  "648": "AUTRES IMPOTS ET TAXES",

  // 65 – Autres charges
  "65": "AUTRES CHARGES",
  "651": "PERTES SUR CREANCES CLIENTS ET AUTRES DEBITEURS",
  "6511": "Clients",
  "6515": "Autres débiteurs",
  "652": "QUOTE-PART DE RESULTAT SUR OPERATIONS",
  "6521": "Quote-part transférée de bénéfices (comptabilité du gérant)",
  "6525": "Pertes imputées par transfert (comptabilité des associés non gérants)",
  "654": "VALEURS COMPTABLES DES CESSIONS COURANTES D'IMMOBILISATIONS",
  "6541": "Immobilisations incorporelles",
  "6542": "Immobilisations corporelles",
  "656": "PERTE DE CHANGE SUR CREANCES ET DETTES COMMERCIALES",
  "657": "PENALITES ET AMENDES PENALES",
  "658": "CHARGES DIVERSES",
  "6581": "Indemnités de fonction et autres rémunérations d'administrateurs",
  "6582": "Dons",
  "6583": "Mécénat",
  "6588": "Autres charges diverses",
  "659": "CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME D'EXPLOITATION",
  "6591": "sur risques à court terme",
  "6593": "sur stocks",
  "6594": "sur créances",
  "6598": "Autres charges pour dépréciations et provisions pour risques à court terme",

  // 66 – Charges de personnel
  "66": "CHARGES DE PERSONNEL",
  "661": "REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NATIONAL",
  "6611": "Appointements salaires et commissions",
  "6612": "Primes et gratifications",
  "6613": "Congés payés",
  "6614": "Indemnités de préavis, de licenciement et de recherche d'embauche",
  "6615": "Indemnités de maladie versées aux travailleurs",
  "6616": "Supplément familial",
  "6617": "Avantages en nature",
  "6618": "Autres rémunérations directes",
  "662": "REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NON NATIONAL",
  "6621": "Appointements salaires et commissions",
  "6622": "Primes et gratifications",
  "6623": "Congés payés",
  "6624": "Indemnités de préavis, de licenciement et de recherche d'embauche",
  "6625": "Indemnités de maladie versées aux travailleurs",
  "6626": "Supplément familial",
  "6627": "Avantages en nature",
  "6628": "Autres rémunérations directes",
  "663": "INDEMNITES FORFAITAIRES VERSEES AU PERSONNEL",
  "6631": "Indemnités de logement",
  "6632": "Indemnités de représentation",
  "6633": "Indemnités d'expatriation",
  "6634": "Indemnités de transport",
  "6638": "Autres indemnités et avantages divers",
  "664": "CHARGES SOCIALES",
  "6641": "Charges sociales sur rémunération du personnel national",
  "6642": "Charges sociales sur rémunération du personnel non national",
  "666": "REMUNERATIONS ET CHARGES SOCIALES DE L'EXPLOITANT INDIVIDUEL",
  "6661": "Rémunération du travail de l'exploitant",
  "6662": "Charges sociales",
  "667": "REMUNERATION TRANSFEREE DE PERSONNEL EXTERIEUR",
  "6671": "Personnel intérimaire",
  "6672": "Personnel détaché ou prêté à l'entité",
  "668": "AUTRES CHARGES SOCIALES",
  "6681": "Versements aux Syndicats et Comités d'entreprise, d'établissement",
  "6682": "Versements aux Comités d'hygiène et de sécurité",
  "6683": "Versements et contributions aux autres œuvres sociales",
  "6684": "Médecine du travail et pharmacie",
  "6685": "Assurances et organismes de santé",
  "6686": "Assurances retraite et fonds de pensions",
  "6687": "Majorations et pénalités sociales",
  "6688": "Charges sociales diverses",

  // 67 – Frais financiers et charges assimilées
  "67": "FRAIS FINANCIERS ET CHARGES ASSIMILEES",
  "671": "INTERETS DES EMPRUNTS",
  "6711": "Emprunts obligataires",
  "6712": "Emprunts auprès des établissements de crédit",
  "6713": "Dettes liées à des participations",
  "6714": "Primes de remboursement des obligations",
  "672": "INTERETS DANS LOYERS DE LOCATION ACQUISITION",
  "6722": "Intérêts dans loyers de location-acquisition/crédit-bail immobilier",
  "6723": "Intérêts dans loyers de location-acquisition/crédit-bail mobilier",
  "6724": "Intérêts dans loyers de location-acquisition/location-vente",
  "6728": "Intérêts dans loyers des autres locations-acquisition",
  "673": "ESCOMPTES ACCORDES",
  "674": "AUTRES INTERETS",
  "6741": "Avances reçues et dépôts créditeurs",
  "6742": "Comptes courants bloqués",
  "6743": "Intérêts sur obligations cautionnées",
  "6744": "Intérêts sur dettes commerciales",
  "6745": "Intérêts bancaires et sur opérations de financement (escompte…)",
  "6748": "Intérêts sur dettes diverses",
  "675": "ESCOMPTES DES EFFETS DE COMMERCE",
  "676": "PERTES DE CHANGE FINANCIERES",
  "677": "PERTES SUR TITRES DE PLACEMENT",
  "6771": "Pertes sur cessions de titres de placement",
  "6772": "Malis provenant d'attribution gratuite d'actions au personnel salarié et aux dirigeants",
  "678": "PERTES ET CHARGES SUR RISQUES FINANCIERS",
  "6781": "sur rentes viagères",
  "6782": "sur opérations financières",
  "6784": "sur instruments de trésorerie",
  "679": "CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME FINANCIERES",
  "6791": "sur risques financiers",
  "6795": "sur titres de placement",
  "6798": "Autres charges pour dépréciations et provisions pour risques à court terme financières",

  // 68 – Dotations aux amortissements
  "68": "DOTATIONS AUX AMORTISSEMENTS",
  "681": "DOTATIONS AUX AMORTISSEMENTS D'EXPLOITATION",
  "6812": "Dotations aux amortissements des immobilisations incorporelles",
  "6813": "Dotations aux amortissements des immobilisations corporelles",

  // 69 – Dotations aux provisions et aux dépréciations
  "69": "DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS",
  "691": "DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS D'EXPLOITATION",
  "6911": "Dotations aux provisions pour risques et charges",
  "6913": "Dotations aux dépréciations des immobilisations incorporelles",
  "6914": "Dotations aux dépréciations des immobilisations corporelles",
  "697": "DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS FINANCIERES",
  "6971": "Dotations aux provisions pour risques et charges",
  "6972": "Dotations aux dépréciations des immobilisations financières",

  // ============================================================
  // CLASSE 7 — COMPTES DE PRODUITS DES ACTIVITES ORDINAIRES
  // ============================================================

  // 70 – Ventes
  "70": "VENTES",
  "701": "VENTES DE MARCHANDISES",
  "7011": "dans la Région",
  "7012": "hors Région",
  "7013": "aux entités du groupe dans la Région",
  "7014": "aux entités du groupe hors Région",
  "7015": "sur internet",
  "7019": "Rabais, remises, ristournes accordés (non ventilés)",
  "702": "VENTES DE PRODUITS FINIS",
  "7021": "dans la Région",
  "7022": "hors Région",
  "7023": "aux entités du groupe dans la Région",
  "7024": "aux entités du groupe hors Région",
  "7025": "sur internet",
  "7029": "Rabais, remises, ristournes accordés (non ventilés)",
  "703": "VENTES DE PRODUITS INTERMEDIAIRES",
  "7031": "dans la Région",
  "7032": "hors Région",
  "7033": "aux entités du groupe dans la Région",
  "7034": "aux entités du groupe hors Région",
  "7035": "sur internet",
  "7039": "Rabais, remises, ristournes accordés (non ventilés)",
  "704": "VENTES DE PRODUITS RESIDUELS",
  "7041": "dans la Région",
  "7042": "hors Région",
  "7043": "aux entités du groupe dans la Région",
  "7044": "aux entités du groupe hors Région",
  "7045": "sur internet",
  "7049": "Rabais, remises, ristournes accordés (non ventilés)",
  "705": "TRAVAUX FACTURES",
  "7051": "dans la Région",
  "7052": "hors Région",
  "7053": "aux entités du groupe dans la Région",
  "7054": "aux entités du groupe hors Région",
  "7055": "sur internet",
  "7059": "Rabais, remises, ristournes accordés (non ventilés)",
  "706": "SERVICES VENDUS",
  "7061": "dans la Région",
  "7062": "hors Région",
  "7063": "aux entités du groupe dans la Région",
  "7064": "aux entités du groupe hors Région",
  "7065": "sur internet",
  "7069": "Rabais, remises, ristournes accordés (non ventilés)",
  "707": "PRODUITS ACCESSOIRES",
  "7071": "Ports, emballages perdus et autres frais facturés",
  "7072": "Commissions et courtages",
  "7073": "Locations et redevances de location - financement",
  "7074": "Bonis sur reprises et cessions d'emballages",
  "7075": "Mise à disposition de personnel",
  "7076": "Redevances pour brevets, logiciels, marques et droits similaires",
  "7077": "Services exploités dans l'intérêt du personnel",
  "7078": "Autres produits accessoires",

  // 71 – Subventions d'exploitation
  "71": "SUBVENTIONS D'EXPLOITATION",
  "711": "SUR PRODUITS A L'EXPORTATION",
  "712": "SUR PRODUITS A L'IMPORTATION",
  "713": "SUR PRODUITS DE PEREQUATION",
  "714": "INDEMNITES ET SUBVENTIONS D'EXPLOITATION (entité agricole)",
  "718": "AUTRES SUBVENTIONS D'EXPLOITATION",
  "7181": "Versées par l'Etat et les collectivités publiques",
  "7182": "Versées par les organismes internationaux",
  "7183": "Versées par des tiers",

  // 72 – Production immobilisée
  "72": "PRODUCTION IMMOBILISEE",
  "721": "IMMOBILISATIONS INCORPORELLES",
  "722": "IMMOBILISATIONS CORPORELLES",
  "7221": "Immobilisations corporelles (hors actifs biologiques)",
  "7222": "Immobilisations corporelles (actifs biologiques)",
  "724": "PRODUCTION AUTO-CONSOMMEE",
  "726": "IMMOBILISATIONS FINANCIERES",

  // 73 – Variations des stocks de biens et de services produits
  "73": "VARIATIONS DES STOCKS DE BIENS ET DE SERVICES PRODUITS",
  "734": "VARIATIONS DES STOCKS DE PRODUITS EN COURS",
  "7341": "Produits en cours",
  "7342": "Travaux en cours",
  "735": "VARIATIONS DES SERVICES EN COURS",
  "7351": "Etudes en cours",
  "7352": "Prestations de services en cours",
  "736": "VARIATIONS DES STOCKS DE PRODUITS FINIS",
  "737": "VARIATIONS DES STOCKS DE PRODUITS INTERMEDIAIRES ET RESIDUELS",
  "7371": "Produits intermédiaires",
  "7372": "Produits résiduels",

  // 75 – Autres produits
  "75": "AUTRES PRODUITS",
  "751": "PROFITS SUR CREANCES CLIENTS ET AUTRES DEBITEURS",
  "752": "QUOTE-PART DE RESULTAT SUR OPERATIONS FAITES EN COMMUN",
  "7521": "Quote-part transférée de pertes (comptabilité du gérant)",
  "7525": "Bénéfices attribués par transfert (comptabilité des associés non gérants)",
  "754": "PRODUITS DES CESSIONS COURANTES D'IMMOBILISATIONS",
  "7541": "Immobilisations incorporelles",
  "7542": "Immobilisations corporelles",
  "756": "GAINS DE CHANGE SUR CREANCES ET DETTES COMMERCIALES",
  "758": "PRODUITS DIVERS",
  "7581": "Indemnités de fonction et autres rémunérations d'administrateurs",
  "7582": "Indemnités d'assurances reçues",
  "7588": "Autres produits divers",
  "759": "REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME D'EXPLOITATION",
  "7591": "sur risques à court terme",
  "7593": "sur stocks",
  "7594": "sur créances",
  "7598": "sur autres charges pour dépréciations et provisions pour risques à court terme d'exploitation",

  // 77 – Revenus financiers et produits assimilés
  "77": "REVENUS FINANCIERS ET PRODUITS ASSIMILES",
  "771": "INTERETS DE PRETS ET CREANCES DIVERSES",
  "7712": "Intérêts de prêts",
  "7713": "Intérêts sur créances diverses",
  "772": "REVENUS DE PARTICIPATIONS ET AUTRES TITRES IMMOBILISES",
  "7721": "Revenus des titres de participation",
  "7722": "Revenus autres titres immobilisés",
  "773": "ESCOMPTES OBTENUS",
  "774": "REVENUS DE PLACEMENT",
  "7745": "Revenus des obligations",
  "7746": "Revenus des titres de placement",
  "775": "INTERETS DANS LOYERS DE LOCATION-FINANCEMENT",
  "776": "GAINS DE CHANGE FINANCIERS",
  "777": "GAINS SUR CESSIONS DE TITRES DE PLACEMENT",
  "778": "GAINS SUR RISQUES FINANCIERS",
  "7781": "sur rentes viagères",
  "7782": "sur opérations financières",
  "7784": "sur instruments de trésorerie",
  "779": "REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME FINANCIERES",
  "7791": "sur risques financiers",
  "7795": "sur titres de placement",
  "7798": "sur autres charges pour dépréciations et provisions pour risques à court terme financières",

  // 78 – Transferts de charges
  "78": "TRANSFERTS DE CHARGES",
  "781": "TRANSFERTS DE CHARGES D'EXPLOITATION",
  "787": "TRANSFERTS DE CHARGES FINANCIERES",

  // 79 – Reprises de provisions, de dépréciations et autres
  "79": "REPRISES DE PROVISIONS, DE DEPRECIATIONS ET AUTRES",
  "791": "REPRISES DE PROVISIONS ET DEPRECIATIONS D'EXPLOITATION",
  "7911": "pour risques et charges",
  "7913": "des immobilisations incorporelles",
  "7914": "des immobilisations corporelles",
  "797": "REPRISES DE PROVISIONS ET DEPRECIATIONS FINANCIERES",
  "7971": "pour risques et charges",
  "7972": "des immobilisations financières",
  "798": "REPRISES D'AMORTISSEMENTS",
  "799": "REPRISES DE SUBVENTIONS D'INVESTISSEMENT",

  // ============================================================
  // CLASSE 8 — COMPTES DES AUTRES CHARGES ET PRODUITS (HAO)
  // ============================================================

  "81": "VALEURS COMPTABLES DES CESSIONS D'IMMOBILISATIONS",
  "811": "IMMOBILISATIONS INCORPORELLES",
  "812": "IMMOBILISATIONS CORPORELLES",
  "816": "IMMOBILISATIONS FINANCIERES",

  "82": "PRODUITS DES CESSIONS D'IMMOBILISATIONS",
  "821": "IMMOBILISATIONS INCORPORELLES",
  "822": "IMMOBILISATIONS CORPORELLES",
  "826": "IMMOBILISATIONS FINANCIERES",

  "83": "CHARGES HORS ACTIVITES ORDINAIRES",
  "831": "CHARGES H.A.O. CONSTATEES",
  "833": "CHARGES LIEES AUX OPERATIONS DE RESTRUCTURATION",
  "834": "PERTES SUR CREANCES H.A.O.",
  "835": "DONS ET LIBERALITES ACCORDES",
  "836": "ABANDONS DE CREANCES CONSENTIS",
  "837": "CHARGES LIEES AUX OPERATIONS DE LIQUIDATION",

  "84": "PRODUITS HORS ACTIVITES ORDINAIRES",
  "841": "PRODUITS H.A.O CONSTATES",
  "843": "PRODUITS LIES AUX OPERATIONS DE RESTRUCTURATION",
  "844": "INDEMNITES ET SUBVENTIONS H.A.O. (entité agricole)",
  "845": "DONS ET LIBERALITES OBTENUS",
  "846": "ABANDONS DE CREANCES OBTENUS",
  "847": "PRODUITS LIES AUX OPERATIONS DE LIQUIDATION",
  "848": "TRANSFERTS DE CHARGES H.A.O",
  "849": "REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME H.A.O.",

  "85": "DOTATIONS HORS ACTIVITES ORDINAIRES",
  "851": "DOTATIONS AUX PROVISIONS REGLEMENTEES",
  "852": "DOTATIONS AUX AMORTISSEMENTS H.A.O.",
  "853": "DOTATIONS AUX DEPRECIATIONS H.A.O.",
  "854": "DOTATIONS AUX PROVISIONS POUR RISQUES ET CHARGES H.A.O.",
  "858": "AUTRES DOTATIONS H.A.O.",

  "86": "REPRISES DE CHARGES, PROVISIONS ET DEPRECIATIONS HAO",
  "861": "REPRISES DE PROVISIONS REGLEMENTEES",
  "862": "REPRISES D'AMORTISSEMENTS H.A.O",
  "863": "REPRISES DE DEPRECIATIONS H.A.O.",
  "864": "REPRISES DE PROVISIONS POUR RISQUES ET CHARGES H.A.O.",
  "868": "AUTRES REPRISES H.A.O.",

  "87": "PARTICIPATION DES TRAVAILLEURS",
  "871": "PARTICIPATION LEGALE AUX BENEFICES",
  "874": "PARTICIPATION CONTRACTUELLE AUX BENEFICES",
  "878": "AUTRES PARTICIPATIONS",

  "881": "ETAT",
  "884": "COLLECTIVITES PUBLIQUES",
  "886": "GROUPE",
  "888": "AUTRES",

  // ============================================================
  // CLASSE 9 — COMPTES D'IMPOTS SUR LE RESULTAT
  // ============================================================

  "89": "IMPOTS SUR LE RESULTAT",
  "891": "IMPOTS SUR LES BENEFICES DE L'EXERCICE",
  "8911": "Activités exercées dans l'Etat",
  "8912": "Activités exercées dans les autres Etats de la Région",
  "8913": "Activités exercées hors Région",
  "892": "RAPPEL D'IMPOTS SUR RESULTATS ANTERIEURS",
  "895": "IMPOT MINIMUM FORFAITAIRE (I.M.F.)",
  "899": "DEGREVEMENTS ET ANNULATIONS D'IMPOTS SUR RESULTATS ANTERIEURS",
  "8991": "Dégrèvements",
  "8994": "Annulations pour pertes rétroactives",

  // ============================================================
  // CLASSE 9 — COMPTES D'ENGAGEMENTS ET COMPTES DE GESTION INTERNE
  // ============================================================

  "90": "ENGAGEMENTS OBTENUS ET ENGAGEMENTS ACCORDES",
  "901": "ENGAGEMENTS DE FINANCEMENT OBTENUS",
  "9011": "Crédits confirmés obtenus",
  "9012": "Emprunts restant à encaisser",
  "9013": "Facilités de financement renouvelables",
  "9014": "Facilités d'émission",
  "9018": "Autres engagements de financement obtenus",
  "902": "ENGAGEMENTS DE GARANTIE OBTENUS",
  "9021": "Avals obtenus",
  "9022": "Cautions, garanties obtenues",
  "9023": "Hypothèques obtenues",
  "9024": "Effets endossés par des tiers",
  "9028": "Autres garanties obtenues",
  "903": "ENGAGEMENTS RECIPROQUES",
  "9031": "Achats de marchandises à terme",
  "9032": "Achats à terme de devises",
  "9033": "Commandes fermes des clients",
  "9038": "Autres engagements réciproques",
  "904": "AUTRES ENGAGEMENTS OBTENUS",
  "9041": "Abandons de créances conditionnels",
  "9043": "Ventes avec clause de réserve de propriété",
  "9048": "Divers engagements obtenus",
  "905": "ENGAGEMENTS DE FINANCEMENT ACCORDES",
  "9051": "Crédits accordés non décaissés",
  "9058": "Autres engagements de financement accordés",
  "906": "ENGAGEMENTS DE GARANTIE ACCORDES",
  "9061": "Avals accordés",
  "9062": "Cautions, garanties accordées",
  "9063": "Hypothèques accordées",
  "9064": "Effets endossés par l'entité",
  "9068": "Autres garanties accordées",
  "907": "ENGAGEMENTS RECIPROQUES",
  "9071": "Ventes de marchandises à terme",
  "9072": "Ventes à terme de devises",
  "9073": "Commandes fermes aux fournisseurs",
  "9078": "Autres engagements réciproques",
  "908": "AUTRES ENGAGEMENTS ACCORDES",
  "9081": "Annulations conditionnelles de dettes",
  "9082": "Engagements de retraite",
  "9083": "Achats avec clause de réserve de propriété",
  "9088": "Divers engagements accordés",

  "91": "CONTREPARTIES DES ENGAGEMENTS",
  "92": "COMPTES REFLECHIS",
  "93": "COMPTES DE RECLASSEMENTS",
  "94": "COMPTES DES COUTS",
  "95": "COMPTES DE STOCKS",
  "96": "COMPTES D'ECARTS SUR COUTS PREETABLIS",
  "97": "COMPTES DE DIFFERENCES DE TRAITEMENT COMPTABLE",
  "98": "COMPTES DE RESULTATS",
  "99": "COMPTES DE LIAISONS INTERNES",

};

// (ligne supprimée — inutile en contexte navigateur)
const CLASS_NAMES = {
  '1':'Capitaux','2':'Immobilisations','3':'Stocks','4':'Tiers',
  '5':'Trésorerie','6':'Charges','7':'Produits','8':'Spéciaux'
};
const NATURE_MAP = {
  '1':'Passif','2':'Actif','3':'Actif','4':'Mixte',
  '5':'Actif','6':'Charge','7':'Produit','8':'Spécial'
};
const JOURNAL_NAMES = {
  'AC':'Achats','VE':'Ventes','BQ':'Banque',
  'CA':'Caisse','OD':'Opérations Diverses','IN':'Inventaire','AN':'À Nouveau'
};
const JOURNAL_ICONS = {
  'AC':'🛒','VE':'💰','BQ':'🏦','CA':'💵','OD':'📋','IN':'📦','AN':'📂'
};

// ══════════════════════════════════════════
// TRI DÉBIT AVANT CRÉDIT — NORME SYSCOHADA
// Règle fondamentale : dans le journal, les lignes débitrices
// apparaissent TOUJOURS avant les lignes créditrices.
// ══════════════════════════════════════════
function sortLignesDebitAvantCredit(lignes) {
  return [...lignes].sort((a, b) => {
    const aIsDebit  = (parseFloat(a.debit)  || 0) > 0;
    const bIsDebit  = (parseFloat(b.debit)  || 0) > 0;
    if (aIsDebit && !bIsDebit) return -1;
    if (!aIsDebit && bIsDebit) return  1;
    return 0;
  });
}

function getStepLabel(ecr) {
  const jnl = ecr.journal;
  if(jnl === 'IN') return 'Mouvement de stock';
  if(jnl === 'AC') return 'Constatation facture achat';
  if(jnl === 'VE') return 'Constatation facture vente';
  if(jnl === 'BQ') return 'Règlement banque';
  if(jnl === 'CA') return 'Règlement caisse';
  if(jnl === 'OD') return 'Opération diverse';
  if(jnl === 'AN') return 'À nouveau';
  return ecr.libelle || 'Écriture';
}

// ── État global ──
let ecritures = [], lignes = [], pieceCounter = 1, currentProfile = null, isAILoading = false;
let exportFormat = 'pdf';
let ecrQueue = [], ecrQueueIdx = 0;
let currentGroupId = null;

const GROQ_API_KEY = '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';
const GROQ_MODELS  = [
  'llama-3.3-70b-versatile',
  'qwen/qwen3-32b',
  'meta-llama/llama-4-scout-17b-16e-instruct'
];
let groqModelIdx = 0;

// ══════════════════════════════════════════
// MOBILE SIDEBAR
// ══════════════════════════════════════════
function toggleMobileSidebar() {
  document.getElementById('mainSidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeMobileSidebar() {
  document.getElementById('mainSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ══════════════════════════════════════════
// SYSTEM PROMPT
// ══════════════════════════════════════════
function buildSystemPrompt(ctx) {
  const { nbEcritures, companyName, exercice, totalDebit, totalCredit, comptesSoldes, allDates, ecrituresResume } = ctx;
  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return `Tu es COMEO AI — Expert-Comptable Diplômé et Commissaire aux Comptes de Côte d'Ivoire, membre de l'ONECCA-CI (Ordre National des Experts-Comptables et Comptables Agréés de Côte d'Ivoire). Tu as 25 ans d'expérience dans les cabinets d'expertise comptable à Abidjan (Plateau, Cocody, Marcory).

════════════════════════════════════════════
🎓 FORMATION ET RÉFÉRENCES OFFICIELLES
════════════════════════════════════════════

Tu bases TOUTES tes imputations comptables sur ces sources officielles :

1. PLAN COMPTABLE SYSCOHADA RÉVISÉ 2017
   - Acte Uniforme OHADA du 26 janvier 2017
   - Applicable en Côte d'Ivoire depuis le 01/01/2018
   - Source : ohada.com — syscohada.org — ONECCA-CI

2. DOCTRINE COMPTABLE IVOIRIENNE
   - Guides pratiques ONECCA-CI
   - Bulletins officiels DGI Côte d'Ivoire
   - Jurisprudence comptable UEMOA/OHADA

3. FISCALITÉ IVOIRIENNE EN VIGUEUR (Code Général des Impôts CI) :
   - TVA : 18% taux normal | 9% taux réduit
   - IS : 25% | IMF : 0,5% CA HT (minimum 3 000 000 FCFA)
   - CNPS patronal : 16% | salarial : 7,7%
   - CN patronale : 1,6% | salariale : 1,5%
   - TPA : 0,4% masse salariale brute
   - Retenue à la source marchés publics : 15%
   - IRCM (dividendes) : 15%

════════════════════════════════════════════
🧠 RAISONNEMENT COMPTABLE — PROCESSUS OBLIGATOIRE
════════════════════════════════════════════

Avant de générer TOUTE écriture, tu dois raisonner ainsi :

ÉTAPE 1 — QUALIFICATION DE L'OPÉRATION :
  → S'agit-il d'une charge ? d'un actif ? d'un produit ? d'une dette ?
  → Quelle est la nature économique exacte de l'opération ?

ÉTAPE 2 — RECHERCHE DU BON COMPTE SYSCOHADA :
  → Consulte mentalement le Plan Comptable SYSCOHADA Révisé 2017
  → Identifie la classe, le compte principal, le sous-compte exact
  → Vérifie la cohérence avec la doctrine ONECCA-CI

ÉTAPE 3 — VALIDATION AVANT ÉCRITURE :
  → Ce bien/service dure-t-il plus d'un an ? → CLASSE 2 (immobilisation)
  → Ce bien/service dure-t-il moins d'un an ? → CLASSE 6 (charge)
  → Quel est le mode de règlement exact ? → CLASSE 5 appropriée
  → L'écriture est-elle parfaitement équilibrée ?

════════════════════════════════════════════
📚 RÈGLES D'IMPUTATION SYSCOHADA — MÉMORISÉES
════════════════════════════════════════════

CLASSE 1 — CAPITAUX ET RESSOURCES DURABLES :
  101 Capital social | 161 Emprunts obligataires
  162 Emprunts établissements de crédit | 191-199 Provisions risques

CLASSE 2 — IMMOBILISATIONS (biens durables > 1 exercice) :
  211 Frais développement | 212 Brevets licences
  216 Fonds commercial | 2311 Bâtiments sol propre
  2411 Matériel industriel | 2442 Matériel informatique
  2444 Mobilier bureau | 2451 Matériel automobile/transport
  275 Dépôts cautionnements versés
  → Amortissements : 2811/2831/2841/2842/2844/2845

CLASSE 3 — STOCKS :
  311 Marchandises | 321 Matières premières
  361 Produits finis | 381 Marchandises en transit

CLASSE 4 — COMPTES DE TIERS :
  401 Fournisseurs (CRÉDIT = dette) | 411 Clients (DÉBIT = créance)
  431 Sécurité sociale | 441 Impôt sur bénéfices
  4431 TVA facturée (CRÉDIT) | 4452 TVA récupérable (DÉBIT)
  447 Impôts retenus à la source | 4711 Débiteurs divers

CLASSE 5 — TRÉSORERIE :
  521 Banques locales (virement, chèque, prélèvement)
  552 Monnaie électronique téléphone portable
       → Orange Money, MTN MoMo, Wave, Moov Money
  571 Caisse siège social (espèces)
  585 Virements de fonds internes

CLASSE 6 — CHARGES :
  601 Achats marchandises | 602 Achats matières premières
  604 Matières fournitures consommables
  6051 Eau | 6052 Electricité | 6042 Carburant
  6047 Fournitures bureau | 621 Sous-traitance
  6222 Locations bâtiments | 6252 Assurance transport
  6281 Frais téléphone | 634 Redevances brevets logiciels
  641 Impôts taxes directs | 661 Rémunérations personnel national
  664 Charges sociales | 671 Intérêts emprunts
  681 Dotations amortissements exploitation

CLASSE 7 — PRODUITS :
  701 Ventes marchandises | 702 Ventes produits finis
  706 Services vendus | 707 Produits accessoires
  711-718 Subventions exploitation
  771 Intérêts prêts | 791 Reprises provisions

════════════════════════════════════════════
⚠️ RÈGLES FONDAMENTALES — JAMAIS VIOLÉES
════════════════════════════════════════════

RÈGLE 1 — IMMOBILISATION vs CHARGE :
  ✅ Achat véhicule/camion/moto         → DÉBIT 2451 (JAMAIS 601/607)
  ✅ Achat ordinateur/matériel info     → DÉBIT 2442 (JAMAIS 601/607)
  ✅ Achat mobilier bureau              → DÉBIT 2444 (JAMAIS 601/607)
  ✅ Achat bâtiment                     → DÉBIT 2311 (JAMAIS 601/607)
  ✅ Amortissement véhicule             → CRÉDIT 2845 (JAMAIS 221/222)
  ✅ Amortissement matériel info        → CRÉDIT 2844 (JAMAIS 221/222)

RÈGLE 2 — TRÉSORERIE :
  ✅ Paiement par virement/chèque       → CRÉDIT 521
  ✅ Paiement en espèces                → CRÉDIT 571
  ✅ Paiement Mobile Money              → CRÉDIT 552
  ❌ JAMAIS 512 pour régler (512 = effets reçus des clients)
  ❌ JAMAIS 511 pour régler (511 = effets à encaisser)

RÈGLE 3 — FOURNISSEURS vs CLIENTS :
  ✅ Dette fournisseur                  → CRÉDIT 401x
  ✅ Créance client                     → DÉBIT 411x
  ❌ JAMAIS inverser 401 et 411

RÈGLE 4 — TVA CÔTE D'IVOIRE :
  ✅ TVA collectée sur ventes           → CRÉDIT 4431 (18%)
  ✅ TVA déductible sur achats          → DÉBIT 4452 (18%)
  ✅ TVA déductible sur immobilisations → DÉBIT 4451 (18%)

RÈGLE 5 — ORDRE DES LIGNES SYSCOHADA :
  ✅ Lignes DÉBITRICES toujours EN PREMIER
  ✅ Lignes CRÉDITRICES toujours EN DERNIER
  ❌ JAMAIS une ligne créditrice avant une ligne débitrice

════════════════════════════════════════════
📋 RÈGLE DES 3 ÉCRITURES LIÉES
════════════════════════════════════════════

Pour tout achat/vente de marchandises avec mouvement de stock :

Écriture 1 — [AC] Constatation facture achat :
  DÉBIT  601  Achats marchandises        HT
  DÉBIT  4452 TVA récupérable 18%        TVA
  CRÉDIT 401  Fournisseur                TTC

Écriture 2 — [IN] Entrée en stock :
  DÉBIT  311  Marchandises               Montant HT
  CRÉDIT 6031 Variation stocks march.    Montant HT

Écriture 3 — [BQ/CA] Règlement :
  DÉBIT  401  Fournisseur                TTC
  CRÉDIT 521  Banque (ou 571 Caisse)     TTC

════════════════════════════════════════════
CONTEXTE DE L'ENTREPRISE
════════════════════════════════════════════
Entreprise    : ${companyName}
Exercice      : ${exercice}
Date du jour  : ${today}
Écritures     : ${nbEcritures}
Total Débit   : ${totalDebit} FCFA
Total Crédit  : ${totalCredit} FCFA
${comptesSoldes   ? `Soldes comptes    : ${comptesSoldes}`   : ''}
${ecrituresResume ? `Dernières opérat. : ${ecrituresResume}` : ''}
${allDates        ? `Dates couvertes   : ${allDates}`        : ''}

════════════════════════════════════════════
FORMAT TECHNIQUE DES ÉCRITURES JSON
════════════════════════════════════════════

EXEMPLE CORRECT — Achat véhicule TTC 5 900 000 FCFA :
###ECRITURE###{"journal":"AC","libelle":"Achat véhicule — Facture N°001","lignes":[
{"compte":"2451","libelle":"Matériel automobile","debit":5000000,"credit":0},
{"compte":"4451","libelle":"TVA récupérable immobilisation 18%","debit":900000,"credit":0},
{"compte":"4011","libelle":"Fournisseur CFAO Motors","debit":0,"credit":5900000}
]}

###ECRITURE###{"journal":"BQ","libelle":"Règlement CFAO Motors — virement","lignes":[
{"compte":"4011","libelle":"Fournisseur CFAO Motors","debit":5900000,"credit":0},
{"compte":"521","libelle":"Banque SGBCI","debit":0,"credit":5900000}
]}

RÈGLES JSON :
- Montants FCFA entiers (pas de virgule, pas de centimes)
- Chaque écriture ÉQUILIBRÉE : Σ débits = Σ crédits
- Lignes débitrices (debit > 0) TOUJOURS EN PREMIER
- Lignes créditrices (credit > 0) TOUJOURS EN DERNIER

════════════════════════════════════════════
FILTRAGE ET INTERROGATION DES DONNÉES
════════════════════════════════════════════

Journal période :
###FILTRE###{"type":"journal","dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD","journal":"","compte":""}

Balance :
###FILTRE###{"type":"balance","dateDebut":"","dateFin":"","journal":"","compte":""}

Grand livre compte :
###FILTRE###{"type":"grandlivre","dateDebut":"","dateFin":"","journal":"","compte":"XXX"}

Bilan arrêté :
###FILTRE###{"type":"bilan","dateDebut":"","dateFin":"YYYY-MM-DD","journal":"","compte":""}`;
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function switchTab(t) {
  document.getElementById('tab-login').classList.toggle('active', t === 'login');
  document.getElementById('tab-register').classList.toggle('active', t === 'register');
  document.getElementById('form-login').style.display = t === 'login' ? 'flex' : 'none';
  document.getElementById('form-register').style.display = t === 'register' ? 'flex' : 'none';
}

async function doRegister() {
  const company   = document.getElementById('r-company').value.trim();
  const compte701 = document.getElementById('r-compte701').value.trim() || '701';
  const exercice  = document.getElementById('r-exercice').value.trim() || '2024';
  const pass      = document.getElementById('r-pass').value;
  const err       = document.getElementById('r-err');
  err.classList.remove('show');
  if (!company) { err.textContent = "Nom d'entreprise requis"; err.classList.add('show'); return; }
  if (pass.length < 4) { err.textContent = 'Mot de passe trop court (4 caractères min.)'; err.classList.add('show'); return; }
  const profileId = company.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await waitForFirebase();
    const docRef = window._fbDoc(window._db, 'profiles', profileId);
    const snap   = await window._fbGetDoc(docRef);
    if (snap.exists()) { err.textContent = "Ce nom d'entreprise existe déjà."; err.classList.add('show'); return; }
    await window._fbSetDoc(docRef, { company, compte701, exercice, password: btoa(pass), createdAt: new Date().toISOString() });
    toast('Profil créé avec succès ! Connectez-vous.', 'success');
    switchTab('login');
    document.getElementById('l-company').value = company;
  } catch (e) { err.textContent = 'Erreur : ' + e.message; err.classList.add('show'); }
}

async function doLogin() {
  const company = document.getElementById('l-company').value.trim();
  const pass    = document.getElementById('l-pass').value;
  const err     = document.getElementById('l-err');
  err.classList.remove('show');
  if (!company || !pass) { err.textContent = 'Remplissez tous les champs'; err.classList.add('show'); return; }
  const profileId = company.toLowerCase().replace(/[^a-z0-9]/g, '_');
  try {
    await waitForFirebase();
    const docRef = window._fbDoc(window._db, 'profiles', profileId);
    const snap   = await window._fbGetDoc(docRef);
    if (!snap.exists()) { err.textContent = 'Entreprise introuvable.'; err.classList.add('show'); return; }
    const profile = snap.data();
    if (atob(profile.password) !== pass) { err.textContent = 'Mot de passe incorrect'; err.classList.add('show'); return; }
    currentProfile = { ...profile, id: profileId };
    localStorage.setItem('syscohada_session', JSON.stringify({ profileId, company }));
    await loadApp();
  } catch (e) { err.textContent = 'Erreur : ' + e.message; err.classList.add('show'); }
}

function doLogout() {
  if (!confirm('Se déconnecter ?')) return;
  localStorage.removeItem('syscohada_session');
  currentProfile = null; ecritures = [];
  document.getElementById('appShell').style.display   = 'none';
  document.getElementById('authOverlay').style.display = 'flex';
}

function waitForFirebase() {
  return new Promise(r => {
    if (window._fbReady) { r(); return; }
    document.addEventListener('firebase-ready', r, { once: true });
  });
}

async function loadApp() {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appShell').style.display    = 'grid';
  document.getElementById('topCompanyName').textContent = currentProfile.company;
  document.getElementById('exerciceYear').value = currentProfile.exercice || '2024';
  await loadEcrituresFromFirestore();
  updateStats(); renderPlanComptable(); initSaisie();
}

// ══════════════════════════════════════════
// FIRESTORE
// ══════════════════════════════════════════
async function loadEcrituresFromFirestore() {
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'ecritures');
    const q    = window._fbQuery(col, window._fbOrderBy('date', 'asc'));
    const snap = await window._fbGetDocs(q);
    ecritures = [];
    snap.forEach(d => ecritures.push({ ...d.data(), _docId: d.id }));
    pieceCounter = ecritures.length + 1;
  } catch (e) { toast('Erreur chargement : ' + e.message, 'error'); }
}

async function saveEcritureToFirestore(ecriture) {
  try {
    const col    = window._fbCollection(window._db, 'profiles', currentProfile.id, 'ecritures');
    const docRef = await window._fbAddDoc(col, ecriture);
    ecriture._docId = docRef.id;
    return docRef.id;
  } catch (e) { toast('Erreur sauvegarde : ' + e.message, 'error'); return null; }
}

async function deleteEcritureFromFirestore(docId) {
  try {
    await window._fbDeleteDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'ecritures', docId));
  } catch (e) { toast('Erreur suppression : ' + e.message, 'error'); }
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
const VIEW_KEYS = {
  dashboard:'tableau', saisie:'saisie', journal:'journal',
  grandlivre:'grand',  balance:'balance', bilan:'bilan',
  resultat:'résultat', tresorerie:'trésor', plancomptable:'plan'
};
const RENDERERS = {
  journal:renderJournal, grandlivre:renderGrandLivre, balance:renderBalance,
  bilan:renderBilan, resultat:renderResultat, tresorerie:renderTresorerie,
  plancomptable:renderPlanComptable, saisie:initSaisie
};

function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  const key = VIEW_KEYS[view] || view;
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.toLowerCase().includes(key)) n.classList.add('active');
  });
  if (RENDERERS[view]) RENDERERS[view]();
}

// ══════════════════════════════════════════
// STATS
// ══════════════════════════════════════════
function updateStats() {
  let tD = 0, tC = 0;
  ecritures.forEach(e => e.lignes.forEach(l => { tD += l.debit || 0; tC += l.credit || 0; }));
  const all  = ecritures.flatMap(e => e.lignes);
  const prod = all.filter(l => l.compte?.[0] === '7').reduce((s, l) => s + (l.credit || 0), 0);
  const chg  = all.filter(l => l.compte?.[0] === '6').reduce((s, l) => s + (l.debit  || 0), 0);
  const res  = prod - chg;
  const eq   = Math.abs(tD - tC) < 0.01;
  document.getElementById('s-ecritures').textContent = ecritures.length;
  document.getElementById('s-debit').textContent     = fn(tD);
  document.getElementById('s-credit').textContent    = fn(tC);
  const eqEl = document.getElementById('s-equil');
  eqEl.textContent = eq ? '✓ Équilibré' : '✗ Déséquilibré';
  eqEl.className   = 'val ' + (eq ? 'g' : 'r');
  document.getElementById('dash-nb').textContent     = ecritures.length;
  document.getElementById('dash-debit').textContent  = fs(tD);
  document.getElementById('dash-credit').textContent = fs(tC);
  const re = document.getElementById('dash-res');
  re.textContent  = fs(res);
  re.style.color  = res >= 0 ? 'var(--green)' : 'var(--red)';
  const yr = document.getElementById('exerciceYear').value;
  const bd = document.getElementById('bilanDate');
  const ry = document.getElementById('resultatYear');
  if (bd) bd.textContent = '31/12/' + yr;
  if (ry) ry.textContent = yr;
}

function fn(n) { return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 }); }
function fs(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1) + ' Md FCFA';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + ' M FCFA';
  if (a >= 1e3) return (n / 1e3).toFixed(0) + ' K FCFA';
  return (n || 0).toFixed(0) + ' FCFA';
}

// ══════════════════════════════════════════
// SAISIE
// ══════════════════════════════════════════
function initSaisie() {
  document.getElementById('ecr-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('ecr-piece').placeholder = 'N°' + String(pieceCounter).padStart(5, '0');
  if (lignes.length === 0) { addLigne(); addLigne(); }
  renderLignes(); updateQueueBar();
}

function addLigne(compte = '', libelle = '', debit = '', credit = '') {
  lignes.push({ compte, libelle, debit, credit }); renderLignes();
}
function removeLigne(i) { lignes.splice(i, 1); renderLignes(); }

// ══════════════════════════════════════════
// AUTO SAVE
// ══════════════════════════════════════════
async function autoSaveAllEcritures() {
  if (ecrQueue.length === 0) { toast("Aucune écriture en file d'attente", 'error'); return; }
  const total   = ecrQueue.length;
  const bar     = document.getElementById('autoSaveBar');
  const msg     = document.getElementById('autoSaveMsg');
  const prog    = document.getElementById('autoSaveProgress');
  bar.classList.add('show');
  const date     = document.getElementById('ecr-date').value || new Date().toISOString().split('T')[0];
  const groupId  = 'grp_' + Date.now();
  const groupLib = ecrQueue[0]?.libelle || 'Opération ' + new Date().toLocaleDateString('fr-FR');
  let saved = 0;
  const errors = [];

  for (let i = 0; i < ecrQueue.length; i++) {
    const ecr = ecrQueue[i];
    msg.innerHTML = `<strong>Enregistrement ${i + 1}/${total}</strong> — [${ecr.journal}] ${ecr.libelle || 'Écriture ' + (i + 1)}`;
    prog.style.width = ((i / total) * 100) + '%';
    const valid = (ecr.lignes || []).filter(l => l.compte && (l.debit || l.credit));
    if (valid.length < 2) { errors.push(`Écriture ${i + 1} : moins de 2 lignes valides`); continue; }
    let d = 0, c = 0;
    valid.forEach(l => { d += Math.round(parseFloat(l.debit) || 0); c += Math.round(parseFloat(l.credit) || 0); });
    if (Math.abs(d - c) > 2) { errors.push(`Écriture ${i + 1} [${ecr.journal}] : non équilibrée (Δ ${Math.abs(d - c)} FCFA)`); continue; }
    const piece    = 'N°' + String(pieceCounter).padStart(5, '0');
    // ── Tri débit avant crédit avant sauvegarde ──
    const lignesSorted = sortLignesDebitAvantCredit(valid);
    const ecriture = {
      id: Date.now() + i, date, journal: ecr.journal || 'OD', piece,
      libelle: ecr.libelle || 'Écriture IA',
      groupId, groupLibelle: groupLib, groupSize: total, groupIdx: i,
      createdAt: new Date().toISOString(),
      lignes: lignesSorted.map(l => ({
        compte:  String(l.compte),
        libelle: l.libelle || PC[String(l.compte)] || '',
        debit:   Math.round(parseFloat(l.debit)  || 0),
        credit:  Math.round(parseFloat(l.credit) || 0)
      }))
    };
    const docId = await saveEcritureToFirestore(ecriture);
    if (docId) { ecritures.push(ecriture); pieceCounter++; saved++; }
    await new Promise(r => setTimeout(r, 150));
  }

  prog.style.width = '100%';
  await new Promise(r => setTimeout(r, 400));
  bar.classList.remove('show');
  ecrQueue = []; ecrQueueIdx = 0; lignes = [];
  updateQueueBar(); hideMultiEcrBanner(); hideSaisieNotif(); dismissFillBanner();
  updateStats();
  if (errors.length > 0) {
    toast(`⚠️ ${saved}/${total} écritures enregistrées — ${errors.length} erreur(s)`, 'error');
  } else {
    toast(`✅ ${saved} écriture${saved > 1 ? 's' : ''} enregistrée${saved > 1 ? 's' : ''} et groupée${saved > 1 ? 's' : ''} !`, 'success');
  }
  setTimeout(() => { navigate('journal'); renderJournal(); }, 500);
  initSaisie();
}

async function autoSaveAllFromNotif() { hideSaisieNotif(); await autoSaveAllEcritures(); }

function setEcritureQueue(ecritures_ai) {
  ecrQueue = ecritures_ai; ecrQueueIdx = 0;
  if (ecrQueue.length > 0) { loadEcritureFromQueue(0); updateQueueBar(); }
}

function loadEcritureFromQueue(idx) {
  if (idx >= ecrQueue.length) return;
  const ecr = ecrQueue[idx];
  // ── Tri débit avant crédit au chargement dans la saisie ──
  const lignesSorted = sortLignesDebitAvantCredit(ecr.lignes || []);
  lignes = lignesSorted.map(l => ({
    compte:  String(l.compte || ''),
    libelle: l.libelle || PC[String(l.compte)] || '',
    debit:   Math.round(parseFloat(l.debit)  || 0),
    credit:  Math.round(parseFloat(l.credit) || 0)
  }));
  const jSelect = document.getElementById('ecr-journal');
  if (jSelect && ecr.journal) jSelect.value = ecr.journal;
  const libInput = document.getElementById('ecr-libelle');
  if (libInput && ecr.libelle) libInput.value = ecr.libelle;
  const dateInput = document.getElementById('ecr-date');
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().split('T')[0];
  renderLignes();
  const banner = document.getElementById('aiFillBanner');
  const desc   = document.getElementById('aiFillDesc');
  const num    = document.getElementById('aiFillNum');
  if (banner && desc) {
    desc.textContent = ecr.libelle || 'Écriture préparée par COMEO AI';
    if (num) num.textContent = ecrQueue.length > 1 ? `(${idx + 1}/${ecrQueue.length})` : '';
    banner.classList.add('show');
  }
}

function updateQueueBar() {
  const bar = document.getElementById('saisieQueueBar');
  if (!bar) return;
  const counter   = document.getElementById('sqbCounter');
  const remaining = ecrQueue.length - ecrQueueIdx;
  if (remaining > 0) {
    bar.classList.add('show');
    if (counter) counter.textContent = remaining + ' écriture' + (remaining > 1 ? 's' : '');
    const btnAll = document.getElementById('btnValidateAll');
    if (btnAll) btnAll.style.display = remaining > 1 ? 'inline-flex' : 'none';
  } else { bar.classList.remove('show'); }
}

function skipToNextEcriture() {
  ecrQueueIdx++;
  if (ecrQueueIdx < ecrQueue.length) {
    loadEcritureFromQueue(ecrQueueIdx); updateQueueBar();
    toast('Écriture ' + (ecrQueueIdx + 1) + '/' + ecrQueue.length + ' chargée', 'info');
  } else {
    ecrQueue = []; ecrQueueIdx = 0; lignes = []; addLigne(); addLigne(); renderLignes();
    updateQueueBar(); dismissFillBanner();
  }
}

function dismissFillBanner() { const b = document.getElementById('aiFillBanner'); if (b) b.classList.remove('show'); }

function showMultiEcrBanner(ecritures_ai) {
  const banner = document.getElementById('multiEcrBanner');
  const list   = document.getElementById('mebList');
  const title  = document.getElementById('mebTitle');
  if (!banner) return;
  title.textContent = `COMEO AI a préparé ${ecritures_ai.length} écriture${ecritures_ai.length > 1 ? 's' : ''} liées`;
  list.innerHTML = ecritures_ai.map((e, i) =>
    `<li><span class="meb-n">${i + 1}</span><span class="meb-jnl">${e.journal || 'OD'}</span><span>${e.libelle || 'Écriture ' + (i + 1)}</span></li>`
  ).join('');
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 60000);
}
function hideMultiEcrBanner() { const b = document.getElementById('multiEcrBanner'); if (b) b.classList.remove('show'); }

function showSaisieNotif(libelle, count) {
  const notif = document.getElementById('saisieNotif');
  const body  = document.getElementById('saisieNotifBody');
  if (!notif) return;
  body.textContent = count > 1
    ? `${count} écritures liées préparées. Cliquez "Tout enregistrer" pour les grouper.`
    : `"${libelle || 'Écriture'}" — Vérifiez et enregistrez.`;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 15000);
}
function hideSaisieNotif() { const n = document.getElementById('saisieNotif'); if (n) n.classList.remove('show'); }

function goToSaisie() {
  hideSaisieNotif(); navigate('saisie');
  setTimeout(() => {
    const card = document.querySelector('#view-saisie .card:last-of-type');
    if (card) card.scrollIntoView({ behavior: 'smooth' });
  }, 200);
}

// ══════════════════════════════════════════
// RENDER LIGNES
// ══════════════════════════════════════════
function renderLignes() {
  const tbody = document.getElementById('lignesBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const cardContainer = document.getElementById('lignesCardContainer');
  if (cardContainer) cardContainer.innerHTML = '';

  lignes.forEach((l, i) => {
    // Ligne tableau desktop
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="asw">
        <input type="text" value="${l.compte}" placeholder="Compte…" style="width:100%;font-family:var(--font-mono)"
          oninput="lignes[${i}].compte=this.value;updateAccountSuggest(${i},this,'table')"
          onblur="hideDropdown('t-${i}')">
        <div class="adrop" id="drop-t-${i}"></div>
      </div></td>
      <td><input type="text" value="${l.libelle || ''}" placeholder="Libellé…" style="width:100%" oninput="lignes[${i}].libelle=this.value"></td>
      <td><input type="text" value="${l.debit || ''}" placeholder="0" style="text-align:right;width:100%;font-family:var(--font-mono)"
        oninput="lignes[${i}].debit=parseFloat(this.value.replace(/[^0-9.]/g,''))||0;updateBalance()"></td>
      <td><input type="text" value="${l.credit || ''}" placeholder="0" style="text-align:right;width:100%;font-family:var(--font-mono)"
        oninput="lignes[${i}].credit=parseFloat(this.value.replace(/[^0-9.]/g,''))||0;updateBalance()"></td>
      <td><button class="del-line" onclick="removeLigne(${i})">✕</button></td>`;
    tbody.appendChild(tr);

    // Carte mobile
    if (cardContainer) {
      const card = document.createElement('div');
      card.className = 'ligne-card';
      card.innerHTML = `
        <div class="ligne-card-row">
          <div class="ligne-card-field">
            <div class="ligne-card-label">Compte</div>
            <div style="position:relative">
              <input class="ligne-card-input" type="text" value="${l.compte}" placeholder="Compte…" style="font-family:var(--font-mono)"
                oninput="lignes[${i}].compte=this.value;updateAccountSuggest(${i},this,'card')"
                onblur="hideDropdown('c-${i}')">
              <div class="adrop" id="drop-c-${i}"></div>
            </div>
          </div>
          <div class="ligne-card-field">
            <div class="ligne-card-label">Libellé</div>
            <input class="ligne-card-input" type="text" value="${l.libelle || ''}" placeholder="Libellé…" oninput="lignes[${i}].libelle=this.value">
          </div>
        </div>
        <div class="ligne-card-row">
          <div class="ligne-card-field">
            <div class="ligne-card-label" style="color:var(--blue)">Débit (FCFA)</div>
            <input class="ligne-card-input" type="number" value="${l.debit || ''}" placeholder="0" style="font-family:var(--font-mono)"
              oninput="lignes[${i}].debit=parseFloat(this.value)||0;updateBalance()">
          </div>
          <div class="ligne-card-field">
            <div class="ligne-card-label" style="color:var(--green)">Crédit (FCFA)</div>
            <input class="ligne-card-input" type="number" value="${l.credit || ''}" placeholder="0" style="font-family:var(--font-mono)"
              oninput="lignes[${i}].credit=parseFloat(this.value)||0;updateBalance()">
          </div>
        </div>
        <div class="ligne-card-actions">
          <button class="del-line" style="opacity:.6" onclick="removeLigne(${i})">✕ Supprimer</button>
        </div>`;
      cardContainer.appendChild(card);
    }
  });
  updateBalance();
}

function updateAccountSuggest(idx, input, mode) {
  const q      = input.value.toLowerCase().trim();
  const dropId = mode === 'card' ? 'c-' + idx : 't-' + idx;
  const drop   = document.getElementById('drop-' + dropId);
  if (!drop) return;
  if (!q || q.length < 2) { drop.classList.remove('open'); return; }
  const matches = Object.entries(PC)
    .filter(([code, lib]) => code.startsWith(q) || lib.toLowerCase().includes(q))
    .slice(0, 12);
  if (!matches.length) { drop.classList.remove('open'); return; }
  drop.innerHTML = matches.map(([code, lib]) =>
    `<div class="aoption" onmousedown="selectAccount(${idx},'${code}','${lib.replace(/'/g, "\\'")}')">
      <span class="code">${code}</span><span class="name">${lib.substring(0, 46)}</span>
    </div>`).join('');
  drop.classList.add('open');
}

function selectAccount(idx, code, lib) {
  lignes[idx].compte = code;
  if (!lignes[idx].libelle) lignes[idx].libelle = lib.substring(0, 54);
  renderLignes();
}
function hideDropdown(id) {
  setTimeout(() => { const d = document.getElementById('drop-' + id); if (d) d.classList.remove('open'); }, 200);
}

function updateBalance() {
  let d = 0, c = 0;
  lignes.forEach(l => { d += parseFloat(l.debit) || 0; c += parseFloat(l.credit) || 0; });
  const s   = d - c;
  const tdd = document.getElementById('totalDebitDisplay');
  const tcd = document.getElementById('totalCreditDisplay');
  const el  = document.getElementById('soldeDisplay');
  if (tdd) tdd.textContent = fn(d);
  if (tcd) tcd.textContent = fn(c);
  if (el)  { el.textContent = fn(Math.abs(s)); el.className = 'val ' + (Math.abs(s) < 0.01 ? 'bok' : 'bbad'); }
}

// ══════════════════════════════════════════
// VALIDATION MANUELLE
// ══════════════════════════════════════════
async function saveEcriture() {
  const date    = document.getElementById('ecr-date').value;
  const journal = document.getElementById('ecr-journal').value;
  const piece   = document.getElementById('ecr-piece').value || 'N°' + String(pieceCounter).padStart(5, '0');
  const libelle = document.getElementById('ecr-libelle').value;
  if (!date) { toast('Veuillez saisir une date', 'error'); return; }
  const valid = lignes.filter(l => l.compte && (l.debit || l.credit));
  if (valid.length < 2) { toast('Au moins 2 lignes requises', 'error'); return; }
  let d = 0, c = 0;
  valid.forEach(l => { d += parseFloat(l.debit) || 0; c += parseFloat(l.credit) || 0; });
  if (Math.abs(d - c) > 0.01) {
    toast(`Écriture non équilibrée — Débit: ${fn(d)} / Crédit: ${fn(c)} — Différence: ${fn(Math.abs(d - c))} FCFA`, 'error');
    return;
  }
  let groupInfo = {};
  if (ecrQueue.length > 0 && currentGroupId) {
    groupInfo = { groupId: currentGroupId, groupLibelle: ecrQueue[0]?.libelle || libelle, groupSize: ecrQueue.length, groupIdx: ecrQueueIdx };
  }
  // ── Tri débit avant crédit avant sauvegarde manuelle ──
  const lignesSorted = sortLignesDebitAvantCredit(valid);
  const ecriture = {
    id: Date.now(), date, journal, piece, libelle, ...groupInfo,
    createdAt: new Date().toISOString(),
    lignes: lignesSorted.map(l => ({
      compte:  String(l.compte),
      libelle: l.libelle || PC[String(l.compte)] || '',
      debit:   Math.round(parseFloat(l.debit)  || 0),
      credit:  Math.round(parseFloat(l.credit) || 0)
    }))
  };
  const docId = await saveEcritureToFirestore(ecriture);
  if (!docId) return;
  ecritures.push(ecriture); pieceCounter++; updateStats(); dismissFillBanner();
  toast(`✓ Écriture [${JOURNAL_NAMES[journal] || journal}] enregistrée — Pièce ${piece}`, 'success');
  ecrQueueIdx++;
  if (ecrQueueIdx < ecrQueue.length) {
    loadEcritureFromQueue(ecrQueueIdx); updateQueueBar();
    toast(`→ Écriture ${ecrQueueIdx + 1}/${ecrQueue.length} prête à valider`, 'info');
  } else {
    ecrQueue = []; ecrQueueIdx = 0; currentGroupId = null; lignes = []; updateQueueBar();
    document.getElementById('ecr-libelle').value = '';
    document.getElementById('ecr-piece').value   = '';
    hideSaisieNotif(); initSaisie();
  }
}

// ══════════════════════════════════════════
// FILTRAGE COMMUN
// ══════════════════════════════════════════
function getEcrituresFiltrees(opts = {}) {
  const { dateDebut, dateFin, journal, compte } = opts;
  return ecritures.filter(e => {
    if (dateDebut && e.date < dateDebut) return false;
    if (dateFin   && e.date > dateFin)   return false;
    if (journal   && e.journal !== journal) return false;
    if (compte) return e.lignes.some(l => l.compte && l.compte.startsWith(compte));
    return true;
  });
}

// ══════════════════════════════════════════
// JOURNAL
// ══════════════════════════════════════════
function resetJournalFiltre() {
  document.getElementById('jnl-date-debut').value = '';
  document.getElementById('jnl-date-fin').value   = '';
  document.getElementById('journalFilter').value  = '';
  document.getElementById('journalSearch').value  = '';
  const a = document.getElementById('journal-analyse');
  if (a) a.style.display = 'none';
  renderJournal();
}

function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const mois = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  return `${parseInt(d)} ${mois[parseInt(m)]} ${y}`;
}

function renderJournal() {
  const search    = (document.getElementById('journalSearch')?.value || '').toLowerCase();
  const filter    = document.getElementById('journalFilter')?.value  || '';
  const dateDebut = document.getElementById('jnl-date-debut')?.value || '';
  const dateFin   = document.getElementById('jnl-date-fin')?.value   || '';
  const content   = document.getElementById('journalContent');
  const footer    = document.getElementById('journal-totaux-footer');
  if (!content) return;

  const ecFiltrees = getEcrituresFiltrees({ dateDebut, dateFin, journal: filter });
  const ecFiltered = ecFiltrees.filter(e => {
    if (!search) return true;
    if ((e.libelle || '').toLowerCase().includes(search))      return true;
    if ((e.groupLibelle || '').toLowerCase().includes(search)) return true;
    if ((e.piece || '').toLowerCase().includes(search))        return true;
    return e.lignes.some(l =>
      (l.compte || '').includes(search) ||
      (l.libelle || '').toLowerCase().includes(search) ||
      (PC[l.compte] || '').toLowerCase().includes(search)
    );
  });

  if (!ecFiltered.length) {
    content.innerHTML = `<div class="empty-state"><div class="icon">≡</div><p>Aucune écriture pour cette sélection</p></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  const groupMap = {};
  const soloList = [];
  ecFiltered.forEach(e => {
    if (e.groupId) {
      if (!groupMap[e.groupId]) groupMap[e.groupId] = [];
      groupMap[e.groupId].push(e);
    } else { soloList.push(e); }
  });

  const groups = [];
  Object.values(groupMap).forEach(ecrs => {
    const sorted = [...ecrs].sort((a, b) => (a.groupIdx || 0) - (b.groupIdx || 0));
    groups.push({ type:'groupe', date:sorted[0].date, ecritures:sorted, libelle:sorted[0].groupLibelle || sorted[0].libelle || 'Opération', isGroupe:true });
  });
  soloList.forEach(e => {
    groups.push({ type:'solo', date:e.date, ecritures:[e], libelle:e.libelle || 'Écriture', isGroupe:false });
  });
  groups.sort((a, b) => a.date.localeCompare(b.date) || (a.ecritures[0].createdAt || '').localeCompare(b.ecritures[0].createdAt || ''));

  const byDate = {};
  groups.forEach(g => { if (!byDate[g.date]) byDate[g.date] = []; byDate[g.date].push(g); });

  let totalD = 0, totalC = 0, totalLignes = 0, totalEcritures = 0;
  let html = '';

  Object.keys(byDate).sort().forEach(date => {
    html += `<div class="jnl-date-sep">
      <div class="jnl-date-sep-line"></div>
      <div class="jnl-date-sep-label">📅 ${formatDateFR(date)}</div>
      <div class="jnl-date-sep-line"></div>
    </div>`;

    byDate[date].forEach(group => {
      let groupD = 0, groupC = 0;
      group.ecritures.forEach(e => {
        e.lignes.forEach(l => { groupD += l.debit || 0; groupC += l.credit || 0; });
        totalLignes += e.lignes.length; totalEcritures++;
      });
      totalD += groupD; totalC += groupC;
      const mainJournal = group.ecritures[0]?.journal || 'OD';
      const icon   = JOURNAL_ICONS[mainJournal] || '📋';
      const docIds = group.ecritures.map(e => `'${e._docId}'`).join(',');
      const ecrIds = group.ecritures.map(e => e.id).join(',');

      if (group.isGroupe) {
        html += `<div class="jnl-groupe">
          <div class="jnl-groupe-header">
            <div class="jnl-groupe-icon">${icon}</div>
            <div class="jnl-groupe-info">
              <div class="jnl-groupe-libelle" title="${(group.libelle || '').replace(/"/g, '&quot;')}">${group.libelle}</div>
              <div class="jnl-groupe-meta">${date} · ${group.ecritures.length} écritures liées · ${group.ecritures.map(e => e.piece || '—').join(' · ')}</div>
            </div>
            <div class="jnl-groupe-total">
              <div class="jnl-groupe-total-label">Montant total</div>
              <div class="jnl-groupe-total-val">${fn(groupD)} FCFA</div>
            </div>
            <span class="jnl-groupe-badge-count">${group.ecritures.length} écriture${group.ecritures.length > 1 ? 's' : ''}</span>
            <button class="jnl-groupe-del" onclick="deleteGroupe([${docIds}],[${ecrIds}])" title="Supprimer tout le groupe">✕ Tout supprimer</button>
          </div>
          <div class="jnl-groupe-body">
            ${group.ecritures.map((e, eIdx) => renderEcritureInGroupe(e, eIdx, group.ecritures.length)).join('')}
          </div>
        </div>`;
      } else {
        const e = group.ecritures[0];
        let eD = 0, eC = 0;
        e.lignes.forEach(l => { eD += l.debit || 0; eC += l.credit || 0; });
        const equil  = Math.abs(eD - eC) < 1;
        const jnlCls = e.journal || 'OD';
        html += `<div class="jnl-groupe">
          <div class="jnl-groupe-header">
            <div class="jnl-groupe-icon">${JOURNAL_ICONS[jnlCls] || '📋'}</div>
            <div class="jnl-groupe-info">
              <div class="jnl-groupe-libelle">${e.libelle || '<em style="opacity:.4">Sans libellé</em>'}</div>
              <div class="jnl-groupe-meta">${date} · ${e.piece || '—'} · ${JOURNAL_NAMES[jnlCls] || jnlCls}</div>
            </div>
            <div class="jnl-groupe-total">
              <div class="jnl-groupe-total-label">Débit / Crédit</div>
              <div class="jnl-groupe-total-val" style="font-size:11px">
                <span style="color:#60a5fa">${fn(eD)}</span> / <span style="color:#4ade80">${fn(eC)}</span>
              </div>
            </div>
            <span class="jnl-step-equil ${equil ? 'ok' : 'nok'}">${equil ? '✓ EQ' : '✗ NEQ'}</span>
            <button class="jnl-groupe-del" onclick="deleteEcriture('${e._docId}',${e.id})" title="Supprimer">✕</button>
          </div>
          <div class="jnl-groupe-body">${renderEcritureInGroupe(e, 0, 1)}</div>
        </div>`;
      }
    });
  });

  content.innerHTML = html;
  if (footer) {
    footer.style.display = 'block';
    document.getElementById('jnl-nb-groupes').textContent   = groups.length;
    document.getElementById('jnl-nb-ecr').textContent       = totalEcritures;
    document.getElementById('jnl-nb-lignes').textContent    = totalLignes;
    document.getElementById('jnl-total-debit').textContent  = fn(totalD) + ' FCFA';
    document.getElementById('jnl-total-credit').textContent = fn(totalC) + ' FCFA';
    const eqEl = document.getElementById('jnl-equil-label');
    if (eqEl) {
      const balanced = Math.abs(totalD - totalC) < 1;
      eqEl.textContent = balanced ? '✓ Équilibré' : '✗ Déséquilibré';
      eqEl.className   = 'jnl-footer-val ' + (balanced ? 'eq' : 'neq');
    }
  }
}

// ══════════════════════════════════════════
// RENDER ÉCRITURE DANS GROUPE
// ── CORRECTION : tri débit avant crédit à l'affichage ──
// ══════════════════════════════════════════
function renderEcritureInGroupe(e, eIdx, totalInGroupe) {
  let eD = 0, eC = 0;
  e.lignes.forEach(l => { eD += l.debit || 0; eC += l.credit || 0; });
  const equil     = Math.abs(eD - eC) < 1;
  const jnlCls    = e.journal || 'OD';
  const stepLabel = getStepLabel(e);
  // ── Tri débit avant crédit pour l'affichage ──
  const lignesAffichage = sortLignesDebitAvantCredit(e.lignes);
  return `<div class="jnl-ecriture type-${jnlCls}">
    <div class="jnl-ecriture-subheader">
      ${totalInGroupe > 1 ? `<span class="jnl-step-badge">${eIdx + 1}</span>` : ''}
      <span class="jnl-step-jnl-badge ${jnlCls}">${jnlCls}</span>
      <span class="jnl-step-label">${stepLabel}</span>
      <span class="jnl-step-piece">${e.piece || '—'} · ${JOURNAL_NAMES[jnlCls] || jnlCls}</span>
      <span class="jnl-step-totaux" style="margin-left:auto">
        <span style="color:#60a5fa">${fn(eD)}</span> / <span style="color:#4ade80">${fn(eC)}</span>
      </span>
      <span class="jnl-step-equil ${equil ? 'ok' : 'nok'}">${equil ? '✓' : '✗'}</span>
      <button class="jnl-step-del" onclick="deleteEcriture('${e._docId}',${e.id})" title="Supprimer cette écriture">✕</button>
    </div>
    <div class="jnl-ecriture-body">
      <table class="jnl-lignes-table">
        <thead><tr>
          <th style="width:200px">Compte</th>
          <th>Libellé</th>
          <th class="right" style="width:140px">Débit (FCFA)</th>
          <th class="right" style="width:140px">Crédit (FCFA)</th>
        </tr></thead>
        <tbody>
          ${lignesAffichage.map(l => `
            <tr>
              <td><div class="jnl-compte-badge">
                <span class="jnl-compte-code">${l.compte}</span>
                <span class="jnl-compte-name" title="${PC[l.compte] || ''}">${(PC[l.compte] || '').substring(0, 22)}</span>
              </div></td>
              <td><span class="jnl-libelle-ligne">${l.libelle || e.libelle || '—'}</span></td>
              <td class="jnl-debit-cell">${l.debit  ? fn(l.debit)  : '<span style="color:var(--line2)">—</span>'}</td>
              <td class="jnl-credit-cell">${l.credit ? fn(l.credit) : '<span style="color:var(--line2)">—</span>'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

async function deleteGroupe(docIds, ids) {
  if (!confirm(`Supprimer ce groupe de ${docIds.length} écriture${docIds.length > 1 ? 's' : ''} ?`)) return;
  for (const docId of docIds) await deleteEcritureFromFirestore(docId);
  ids.forEach(id => { ecritures = ecritures.filter(e => e.id !== id); });
  updateStats(); renderJournal();
  toast(`${docIds.length} écriture${docIds.length > 1 ? 's' : ''} supprimée${docIds.length > 1 ? 's' : ''}`, 'info');
}

async function deleteEcriture(docId, id) {
  if (!confirm('Supprimer cette écriture ?')) return;
  await deleteEcritureFromFirestore(docId);
  ecritures = ecritures.filter(e => e.id !== id);
  updateStats(); renderJournal(); toast('Écriture supprimée', 'info');
}

// ══════════════════════════════════════════
// GRAND LIVRE
// ══════════════════════════════════════════
function getMap(opts = {}) {
  const ecFiltrees = opts.filtrer ? getEcrituresFiltrees(opts) : ecritures;
  const map = {};
  ecFiltrees.forEach(e => e.lignes.forEach(l => {
    if (!l.compte) return;
    if (!map[l.compte]) map[l.compte] = { debit:0, credit:0, mvts:[] };
    map[l.compte].debit  += l.debit  || 0;
    map[l.compte].credit += l.credit || 0;
    map[l.compte].mvts.push({
      date: e.date, piece: e.piece || '', journal: e.journal,
      libelle: l.libelle || e.libelle || '',
      debit: l.debit || 0, credit: l.credit || 0
    });
  }));
  return map;
}

function resetGLFiltre() {
  document.getElementById('gl-date-debut').value = '';
  document.getElementById('gl-date-fin').value   = '';
  document.getElementById('glSearch').value      = '';
  renderGrandLivre();
}

function renderGrandLivre() {
  const search    = document.getElementById('glSearch')?.value?.toLowerCase() || '';
  const dateDebut = document.getElementById('gl-date-debut')?.value || '';
  const dateFin   = document.getElementById('gl-date-fin')?.value   || '';
  const opts      = (dateDebut || dateFin) ? { filtrer:true, dateDebut, dateFin } : {};
  const map       = getMap(opts);
  const content   = document.getElementById('grandLivreContent');
  if (!content) return;
  const comptes = Object.keys(map).sort();
  if (!comptes.length) { content.innerHTML = '<div class="empty-state"><div class="icon">⊞</div><p>Aucun mouvement</p></div>'; return; }
  const filtered = comptes.filter(c => !search || c.includes(search) || (PC[c] || '').toLowerCase().includes(search));
  content.innerHTML = filtered.map(code => {
    const acc = map[code], s = acc.debit - acc.credit, lib = PC[code] || 'Compte ' + code, isD = s >= 0;
    return `<div class="gl-account">
      <div class="gl-account-header" onclick="toggleGL('gl-${code}')">
        <span class="gl-code">${code}</span>
        <span class="gl-name">${lib.substring(0, 46)}</span>
        <span style="color:rgba(255,255,255,.3);font-size:10px;font-family:var(--font-mono);margin-right:6px">${acc.mvts.length} mvt${acc.mvts.length > 1 ? 's' : ''}</span>
        <span class="gl-balance ${isD ? 'debit' : 'credit'}">${isD ? 'Sd' : 'Sc'} ${fn(Math.abs(s))} FCFA</span>
      </div>
      <div id="gl-${code}" style="display:none">
        <div style="overflow-x:auto">
        <table class="dt">
          <thead><tr><th>Date</th><th>Jnl</th><th>Pièce</th><th>Libellé</th>
            <th style="text-align:right">Débit</th><th style="text-align:right">Crédit</th>
            <th style="text-align:right">Solde progressif</th></tr></thead>
          <tbody>${acc.mvts.map((m, i) => {
            const rD = acc.mvts.slice(0, i + 1).reduce((s, x) => s + x.debit, 0);
            const rC = acc.mvts.slice(0, i + 1).reduce((s, x) => s + x.credit, 0);
            const rs = rD - rC;
            return `<tr>
              <td style="font-family:var(--font-mono);font-size:10px">${m.date}</td>
              <td><span class="ct">${m.journal}</span></td>
              <td style="font-family:var(--font-mono);font-size:9.5px;color:var(--muted)">${m.piece}</td>
              <td>${m.libelle}</td>
              <td class="debit">${m.debit  ? fn(m.debit)  : ''}</td>
              <td class="credit">${m.credit ? fn(m.credit) : ''}</td>
              <td style="text-align:right;font-family:var(--font-mono);font-size:11px;color:${rs >= 0 ? '#60a5fa' : '#4ade80'}">
                ${rs >= 0 ? 'Sd ' : 'Sc '}${fn(Math.abs(rs))}</td>
            </tr>`;
          }).join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align:right;font-weight:700">TOTAUX</td>
            <td class="debit">${fn(acc.debit)}</td>
            <td class="credit">${fn(acc.credit)}</td>
            <td style="text-align:right;font-family:var(--font-mono);color:${isD ? '#60a5fa' : '#4ade80'}">
              ${isD ? 'Sd ' : 'Sc '}${fn(Math.abs(s))}</td>
          </tr></tbody>
        </table></div>
      </div>
    </div>`;
  }).join('');
}
function toggleGL(id) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }

// ══════════════════════════════════════════
// BALANCE
// ══════════════════════════════════════════
function resetBalanceFiltre() {
  document.getElementById('bal-date-debut').value = '';
  document.getElementById('bal-date-fin').value   = '';
  document.getElementById('bal-journal').value    = '';
  document.getElementById('bal-classe').value     = '';
  const a = document.getElementById('balance-analyse');
  if (a) a.style.display = 'none';
  renderBalance();
}

function renderBalance() {
  const dateDebut = document.getElementById('bal-date-debut')?.value || '';
  const dateFin   = document.getElementById('bal-date-fin')?.value   || '';
  const journal   = document.getElementById('bal-journal')?.value    || '';
  const classe    = document.getElementById('bal-classe')?.value     || '';
  const opts      = (dateDebut || dateFin || journal) ? { filtrer:true, dateDebut, dateFin, journal } : {};
  const map       = getMap(opts);
  const tbody     = document.getElementById('balanceBody');
  if (!tbody) return;
  let comptes = Object.keys(map).sort();
  if (classe) comptes = comptes.filter(c => c.startsWith(classe));
  if (!comptes.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><p>Aucune donnée pour cette sélection</p></div></td></tr>';
    return;
  }
  let tD = 0, tC = 0, tSD = 0, tSC = 0;
  const rows = comptes.map(code => {
    const acc = map[code], s = acc.debit - acc.credit, sd = s > 0 ? s : 0, sc = s < 0 ? -s : 0;
    tD += acc.debit; tC += acc.credit; tSD += sd; tSC += sc;
    return `<tr>
      <td><span class="ct">${code}</span></td>
      <td style="font-size:11px">${(PC[code] || '').substring(0, 42)}</td>
      <td class="debit">${fn(acc.debit)}</td>
      <td class="credit">${fn(acc.credit)}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:#2563eb">${sd ? fn(sd) : ''}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:#16a34a">${sc ? fn(sc) : ''}</td>
    </tr>`;
  });
  rows.push(`<tr class="total-row"><td colspan="2">TOTAUX GÉNÉRAUX</td>
    <td class="debit">${fn(tD)}</td><td class="credit">${fn(tC)}</td>
    <td style="text-align:right;font-family:var(--font-mono)">${fn(tSD)}</td>
    <td style="text-align:right;font-family:var(--font-mono)">${fn(tSC)}</td>
  </tr>`);
  tbody.innerHTML = rows.join('');
}

// ══════════════════════════════════════════
// BILAN
// ══════════════════════════════════════════
function renderBilan() {
  const dateArrete = document.getElementById('bilan-date-arrete')?.value;
  const opts       = dateArrete ? { filtrer:true, dateFin:dateArrete } : {};
  const map        = getMap(opts);
  const content    = document.getElementById('bilanContent');
  if (!content) return;
  if (!Object.keys(map).length) {
    content.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">⊠</div><p>Saisissez des écritures pour générer le bilan</p></div>';
    return;
  }
  const actif  = {
    immob:    { title:'ACTIF IMMOBILISÉ', comptes:[] },
    stocks:   { title:'STOCKS ET EN-COURS', comptes:[] },
    creances: { title:'CRÉANCES ET EMPLOIS ASSIMILÉS', comptes:[] },
    treso:    { title:'TRÉSORERIE-ACTIF', comptes:[] }
  };
  const passif = {
    cap: { title:'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES', comptes:[] },
    df:  { title:'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES', comptes:[] },
    dct: { title:'PASSIF CIRCULANT', comptes:[] },
    tp:  { title:'TRÉSORERIE-PASSIF', comptes:[] }
  };
  Object.entries(map).forEach(([code, acc]) => {
    const s  = acc.debit - acc.credit;
    const cl = code[0];
    const e  = { code, lib:(PC[code] || code).substring(0, 40), solde:Math.abs(s) };
    if      (cl === '2') { if (s > 0) actif.immob.comptes.push(e); }
    else if (cl === '3') { if (s > 0) actif.stocks.comptes.push(e); }
    else if (cl === '4') { if (s > 0) actif.creances.comptes.push(e); else if (s < 0) passif.dct.comptes.push({ ...e, solde:Math.abs(s) }); }
    else if (cl === '5') { if (s > 0) actif.treso.comptes.push(e);   else passif.tp.comptes.push({ ...e, solde:Math.abs(s) }); }
    else if (cl === '1') { const n = parseInt(code); (n <= 160 ? passif.cap : passif.df).comptes.push({ code, lib:(PC[code] || code).substring(0, 40), solde:Math.abs(s) }); }
  });
  const rc = sections => sections.map(s => {
    if (!s.comptes.length) return '';
    const total = s.comptes.reduce((sum, c) => sum + c.solde, 0);
    return `<div class="bilan-section">
      <div class="bilan-section-title">${s.title}</div>
      ${s.comptes.map(c => `<div class="bilan-line"><span class="acc-code">${c.code}</span><span class="acc-name">${c.lib}</span><span class="acc-amount">${fn(c.solde)}</span></div>`).join('')}
      <div class="bilan-line" style="font-weight:700;border-bottom:none;margin-top:3px">
        <span class="acc-code"></span><span class="acc-name" style="color:var(--ink)">Sous-total</span><span class="acc-amount">${fn(total)}</span>
      </div>
    </div>`;
  }).join('');
  const tA = [...actif.immob.comptes, ...actif.stocks.comptes, ...actif.creances.comptes, ...actif.treso.comptes].reduce((s, c) => s + c.solde, 0);
  const tP = [...passif.cap.comptes,  ...passif.df.comptes,   ...passif.dct.comptes,     ...passif.tp.comptes].reduce((s, c) => s + c.solde, 0);
  const label = dateArrete ? `Arrêté au ${dateArrete}` : `Exercice ${document.getElementById('exerciceYear').value}`;
  content.innerHTML = `
    <div class="bilan-col"><div class="bilan-col-header actif">ACTIF — ${label}</div>${rc(Object.values(actif))}<div class="bilan-total"><span>TOTAL ACTIF</span><span>${fn(tA)} FCFA</span></div></div>
    <div class="bilan-col"><div class="bilan-col-header passif">PASSIF — ${label}</div>${rc(Object.values(passif))}<div class="bilan-total"><span>TOTAL PASSIF</span><span>${fn(tP)} FCFA</span></div></div>`;
}

// ══════════════════════════════════════════
// RÉSULTAT
// ══════════════════════════════════════════
function renderResultat() {
  const map     = getMap();
  const content = document.getElementById('resultatContent');
  if (!content) return;
  if (!Object.keys(map).length) { content.innerHTML = '<div class="empty-state"><div class="icon">↗</div><p>Aucune donnée</p></div>'; return; }
  const gt = pfx => Object.entries(map).filter(([c]) => pfx.some(p => c.startsWith(p))).reduce((s, [, a]) => s + (a.debit - a.credit), 0);
  const ventes    = Math.abs(gt(['701','702','703','704','705']));
  const prodsAcc  = Math.abs(gt(['707']));
  const autrProd  = Math.abs(gt(['75','718','711']));
  const transports = gt(['612','614']);
  const servExt   = gt(['621','622','624','625','626','627','628','631','632','634','635','638']);
  const impTaxes  = gt(['641','645']);
  const autresChg = gt(['651','654','658']);
  const personnel = gt(['661','662','663','664']);
  const dap       = gt(['681','691','697']);
  const revFin    = Math.abs(gt(['771','772','773','774','776','777']));
  const chgFin    = gt(['671','673','674','676']);
  const haoP      = Math.abs(gt(['821','822','841']));
  const haoC      = gt(['811','812','831','834','839','851','852','854']);
  const imp       = gt(['891','895']);
  const mc   = ventes - Math.abs(gt(['601'])) - gt(['6031']);
  const ca   = ventes + prodsAcc;
  const va   = ca + autrProd - Math.abs(gt(['601','602','604','605','608'])) - gt(['6031','6032']) - transports - servExt - impTaxes - autresChg;
  const ebe  = va - personnel;
  const re   = ebe - dap;
  const rf   = revFin - chgFin;
  const rao  = re + rf;
  const rhao = haoP - haoC;
  const res  = rao + rhao - imp;
  const rr = (lbl, val, cls = '') => `<div class="rrow ${cls}"><span>${lbl}</span><span class="amount ${val >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(val))} FCFA${val < 0 ? ' (−)' : ''}</span></div>`;
  content.innerHTML = `<div class="rlist">
    <div class="rrow header"><span>COMPTE DE RÉSULTAT — SYSCOHADA Révisé 2017</span><span></span></div>
    ${rr('Ventes de marchandises (701)', ventes, 'sub')}
    ${rr('Achats + Var. stocks (601+6031)', -(Math.abs(gt(['601'])) + gt(['6031'])), 'sub')}
    ${rr('→ Marge commerciale (XA)', mc, 'total')}
    ${rr('Produits accessoires (707+75)', prodsAcc + autrProd, 'sub')}
    ${rr('→ CA net et autres produits (XB)', ca, 'total')}
    ${rr('Transports + Services extérieurs', -(transports + servExt), 'sub')}
    ${rr('Impôts et taxes (641+645)', -(impTaxes + autresChg), 'sub')}
    ${rr('→ Valeur ajoutée brute (XC)', va, 'total')}
    ${rr('Charges de personnel (661–664)', -personnel, 'sub')}
    ${rr("→ E.B.E. — Excédent Brut d'Exploitation (XD)", ebe, 'total')}
    ${rr('Dotations amort. et prov. (681+691)', -dap, 'sub')}
    ${rr('→ Résultat d\'exploitation (RE — XE)', re, 'total')}
    <div class="divider"></div>
    <div class="rrow header"><span>RÉSULTAT FINANCIER</span><span></span></div>
    ${rr('Revenus financiers (77)', revFin, 'sub')}
    ${rr('Charges financières (67)', -chgFin, 'sub')}
    ${rr('→ Résultat financier (RF — XF)', rf, 'total')}
    ${rr('→ Résultat des Activités Ordinaires (RAO — XG)', rao, 'total')}
    <div class="divider"></div>
    <div class="rrow header"><span>RÉSULTAT H.A.O.</span><span></span></div>
    ${rr('Produits HAO', haoP, 'sub')}
    ${rr('Charges HAO', -haoC, 'sub')}
    ${rr('→ RHAO (XH)', rhao, 'total')}
    <div class="divider"></div>
    ${rr('IS / IBP — Impôt sur les Bénéfices (891) — Taux CI : 25%', -imp, 'sub')}
    <div class="rrow result">
      <span>${res >= 0 ? "✓ RÉSULTAT NET DE L'EXERCICE — BÉNÉFICE" : "✗ RÉSULTAT NET DE L'EXERCICE — PERTE"}</span>
      <span class="amount ${res >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(res))} FCFA</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
// TRÉSORERIE
// ══════════════════════════════════════════
function renderTresorerie() {
  const map     = getMap();
  const content = document.getElementById('tresorerieContent');
  if (!content) return;
  const tc = Object.entries(map).filter(([c]) => c.startsWith('5'));
  if (!tc.length) { content.innerHTML = '<div class="empty-state"><div class="icon">◎</div><p>Aucun mouvement de trésorerie</p></div>'; return; }
  const total = tc.reduce((s, [, a]) => s + (a.debit - a.credit), 0);
  content.innerHTML = `<div class="rlist">
    <div class="rrow header"><span>COMPTES DE TRÉSORERIE — CLASSE 5 — SYSCOHADA</span><span></span></div>
    <div class="rrow header" style="font-size:10px;opacity:.5"><span>Mobile Money (Orange Money, MTN MoMo, Wave, Moov) → Compte 552</span><span></span></div>
    ${tc.map(([code, acc]) => {
      const s = acc.debit - acc.credit;
      return `<div class="rrow sub"><span><span class="ct">${code}</span><span style="margin-left:6px">${(PC[code] || '').substring(0, 34)}</span></span><span class="amount ${s >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(s))} FCFA${s < 0 ? ' (Créditeur)' : ''}</span></div>`;
    }).join('')}
    <div class="rrow result"><span>Trésorerie nette totale</span><span class="amount ${total >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(total))} FCFA</span></div>
  </div>`;
}

// ══════════════════════════════════════════
// PLAN COMPTABLE
// ══════════════════════════════════════════
function renderPlanComptable() {
  const search = document.getElementById('pcSearch')?.value?.toLowerCase() || '';
  const cls    = document.getElementById('pcClass')?.value || '';
  const tbody  = document.getElementById('pcBody');
  if (!tbody) return;
  const entries = Object.entries(PC).filter(([code, lib]) => {
    if (cls    && !code.startsWith(cls)) return false;
    if (search && !code.includes(search) && !lib.toLowerCase().includes(search)) return false;
    return true;
  }).slice(0, 300);
  if (!entries.length) { tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><p>Aucun compte trouvé</p></div></td></tr>'; return; }
  tbody.innerHTML = entries.map(([code, lib]) => {
    const cl = code[0], isH = lib === lib.toUpperCase() && lib.length > 3, pad = (code.length - 1) * 10;
    return `<tr>
      <td><span class="ct">${code}</span></td>
      <td style="padding-left:${Math.min(pad, 30)}px;font-weight:${isH ? '600' : '400'};color:${isH ? 'var(--ink)' : 'var(--slate)'}">${lib.substring(0, 70)}</td>
      <td style="color:var(--muted);font-size:11px">${CLASS_NAMES[cl] || ''}</td>
      <td><span style="font-size:10px;padding:2px 7px;border-radius:3px;background:var(--surface3);color:var(--muted)">${NATURE_MAP[cl] || ''}</span></td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════
// EXPORT PDF / WORD
// ══════════════════════════════════════════
function openExportModal()  { const m = document.getElementById('exportModal'); if (m) m.style.display = 'flex'; selectExport('pdf'); }
function closeExportModal() { const m = document.getElementById('exportModal'); if (m) m.style.display = 'none'; }
function selectExport(fmt) {
  exportFormat = fmt;
  document.getElementById('opt-pdf')?.classList.toggle('selected', fmt === 'pdf');
  document.getElementById('opt-word')?.classList.toggle('selected', fmt === 'word');
}
function doExport() { closeExportModal(); if (exportFormat === 'pdf') exportPDF(); else exportWord(); }

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc     = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const yr      = document.getElementById('exerciceYear').value;
  const company = currentProfile?.company || 'Entreprise';
  const pageW   = 210;
  const now     = new Date().toLocaleDateString('fr-FR');
  doc.setFillColor(10, 11, 16); doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(212, 168, 83); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('SYSCOHADA Pro v4 — Révisé 2017', 14, 10);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('COMEO AI — Expert-Comptable Ivoirien | ONECCA-CI', 14, 16);
  doc.setTextColor(255, 255, 255); doc.setFontSize(8);
  doc.text(company, pageW - 14, 10, { align:'right' });
  doc.text('Exercice ' + yr + ' | Monnaie : FCFA (XOF)', pageW - 14, 16, { align:'right' });
  doc.setTextColor(10, 11, 16); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('JOURNAL GÉNÉRAL', 14, 34);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(130, 128, 112);
  doc.text('Édité le ' + now, 14, 40);
  doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.5); doc.line(14, 43, pageW - 14, 43);
  const tableData = [];
  let totalD = 0, totalC = 0;
  // ── Tri débit avant crédit dans l'export PDF ──
  ecritures.forEach(e => {
    const lignesSorted = sortLignesDebitAvantCredit(e.lignes);
    lignesSorted.forEach(l => {
      tableData.push([e.date, e.journal, e.piece || '', l.compte, (PC[l.compte] || '').substring(0, 28), l.libelle || e.libelle || '', l.debit ? fn(l.debit) : '', l.credit ? fn(l.credit) : '']);
      totalD += l.debit || 0; totalC += l.credit || 0;
    });
  });
  doc.autoTable({
    startY: 48,
    head: [['Date','Jnl','N° Pièce','Compte','Libellé compte','Libellé opération','Débit FCFA','Crédit FCFA']],
    body: tableData,
    foot: [['','','','','','TOTAUX', fn(totalD), fn(totalC)]],
    styles:           { font:'helvetica', fontSize:7.5, cellPadding:2.5 },
    headStyles:       { fillColor:[10,11,16], textColor:[212,168,83], fontStyle:'bold', fontSize:7 },
    footStyles:       { fillColor:[30,34,54], textColor:[212,168,83], fontStyle:'bold', fontSize:8 },
    alternateRowStyles: { fillColor:[250,248,244] },
    columnStyles: {
      0:{cellWidth:18}, 1:{cellWidth:10,halign:'center'}, 2:{cellWidth:18},
      3:{cellWidth:16,fontStyle:'bold'}, 4:{cellWidth:28}, 5:{cellWidth:36},
      6:{cellWidth:22,halign:'right'}, 7:{cellWidth:22,halign:'right'}
    },
    margin: { left:14, right:14 }
  });
  doc.save(`SYSCOHADA_v4_${company.replace(/\s+/g, '_')}_${yr}.pdf`);
  toast('✓ PDF exporté avec succès', 'success');
}

function exportWord() {
  const yr      = document.getElementById('exerciceYear').value;
  const company = currentProfile?.company || 'Entreprise';
  const now     = new Date().toLocaleDateString('fr-FR');
  let jRows = '', totalD = 0, totalC = 0;
  // ── Tri débit avant crédit dans l'export Word ──
  ecritures.forEach(e => {
    const lignesSorted = sortLignesDebitAvantCredit(e.lignes);
    lignesSorted.forEach(l => {
      jRows += `<tr><td>${e.date}</td><td>${e.journal}</td><td>${e.piece || ''}</td><td>${l.compte}</td><td>${(PC[l.compte] || '').substring(0, 28)}</td><td>${l.libelle || e.libelle || ''}</td><td style="text-align:right">${l.debit ? fn(l.debit) : ''}</td><td style="text-align:right">${l.credit ? fn(l.credit) : ''}</td></tr>`;
      totalD += l.debit || 0; totalC += l.credit || 0;
    });
  });
  const th = 'background:#0a0b10;color:#d4a853;padding:6px 10px;text-align:left;font-size:9pt;text-transform:uppercase';
  const td = 'border-bottom:1px solid #e0dbd0;padding:5px 10px';
  const html = `<html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt}table{width:100%;border-collapse:collapse;margin-bottom:20pt}th{${th}}td{${td}}tr:nth-child(even) td{background:#faf8f4}</style></head>
  <body>
  <h1 style="font-family:Georgia,serif;font-size:16pt;color:#0a0b10">SYSCOHADA Pro v4 — ${company} — Exercice ${yr}</h1>
  <p>Édité le ${now} | COMEO AI — Expert-Comptable Ivoirien | Monnaie : FCFA (XOF)</p>
  <h2>Journal Général</h2>
  <table><thead><tr><th>Date</th><th>Jnl</th><th>Pièce</th><th>Compte</th><th>Libellé compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr></thead>
  <tbody>${jRows}</tbody>
  <tfoot><tr><td colspan="6" style="font-weight:bold;text-align:right">TOTAUX</td><td style="font-weight:bold;text-align:right">${fn(totalD)}</td><td style="font-weight:bold;text-align:right">${fn(totalC)}</td></tr></tfoot></table>
  </body></html>`;
  const blob = new Blob([html], { type:'application/msword;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `SYSCOHADA_v4_${company.replace(/\s+/g, '_')}_${yr}.doc`;
  a.click(); URL.revokeObjectURL(url);
  toast('✓ Document Word exporté', 'success');
}



// ══════════════════════════════════════════
// CORRECTEUR AUTOMATIQUE DE COMPTES SYSCOHADA
// ══════════════════════════════════════════
const CORRECTIONS_COMPTES = {
  // Achats mal imputés en immobilisation
  '607': null, // à corriger selon contexte
  // Terrains utilisés comme amortissement → amortissement matériel
  '221': '2845',
  '222': '2845',
  '223': '2845',
  // Effets à l'encaissement utilisés comme banque
  '512': '521',
  '511': '521',
  '513': '521',
  // Clients utilisés comme fournisseurs
  '411': '401',
};

const MOTS_IMMOBILISATIONS = [
  'véhicule','camion','voiture','moto','transport','automobile',
  'ordinateur','informatique','bureau','mobilier','matériel',
  'machine','équipement','installation','bâtiment','terrain'
];

const COMPTES_IMMOB = {
  'véhicule':'2451','camion':'2451','voiture':'2451',
  'moto':'2451','automobile':'2451','transport':'2451',
  'ordinateur':'2442','informatique':'2442',
  'bureau':'2441','mobilier':'2444',
  'matériel':'2441','machine':'2411','équipement':'2411',
};

function corrigerComptesErreurs(lignes) {
  return lignes.map(l => {
    const code = String(l.compte || '');
    const lib  = (l.libelle || '').toLowerCase();
    let newCode = code;

    // Correction : 607 utilisé pour une immobilisation
    if (code === '607' || code === '6058') {
      const motTrouve = MOTS_IMMOBILISATIONS.find(m => lib.includes(m));
      if (motTrouve && l.debit > 0) {
        newCode = COMPTES_IMMOB[motTrouve] || '245';
        console.warn(`[CORRECTION] ${code} → ${newCode} pour "${lib}"`);
      }
    }

    // Correction : compte terrain utilisé en amortissement
    if (['221','222','223','224'].includes(code) && l.credit > 0) {
      newCode = '2845';
      console.warn(`[CORRECTION] ${code} → 2845 (amortissement matériel)`);
    }

    // Correction : effets à l'encaissement utilisés comme banque
    if (['511','512','513','514'].includes(code)) {
      newCode = '521';
      console.warn(`[CORRECTION] ${code} → 521 (Banque locale)`);
    }

    return { ...l, compte: newCode, libelle: l.libelle || PC[newCode] || l.libelle };
  });
}
// ══════════════════════════════════════════
// COMEO AI — MOTEUR IA
// ══════════════════════════════════════════
function handleAiKey(e, ctx) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToAI(ctx); } }

function quickAI(text) {
  const input = document.getElementById('aiInput');
  if (input) input.value = text;
  navigate('dashboard');
  sendToAI('dashboard');
}

function buildAIContext() {
  let tD = 0, tC = 0;
  ecritures.forEach(e => e.lignes.forEach(l => { tD += l.debit || 0; tC += l.credit || 0; }));
  const map = getMap();
  const comptesSoldes = Object.entries(map).slice(0, 12).map(([c, a]) => {
    const s = a.debit - a.credit;
    return `${c}:${s >= 0 ? 'Sd' : 'Sc'}${fn(Math.abs(s))}FCFA`;
  }).join(' | ');
  const dernieres = ecritures.slice(-5).map(e => `${e.date}[${e.journal}]${e.libelle || '—'}`).join('; ');
  const allDates  = [...new Set(ecritures.map(e => e.date))].sort().join(', ');
  return {
    nbEcritures:     ecritures.length,
    companyName:     currentProfile?.company || 'Entreprise',
    exercice:        document.getElementById('exerciceYear')?.value || '2024',
    totalDebit:      fn(tD),
    totalCredit:     fn(tC),
    comptesSoldes,
    ecrituresResume: dernieres,
    allDates
  };
}

async function sendToAI(context) {
  if (isAILoading) return;
  const inputId = context === 'dashboard' ? 'aiInput' : `aiInput-${context}`;
  const input   = document.getElementById(inputId);
  const msg     = input?.value?.trim();
  if (!msg) return;
  isAILoading = true; input.value = '';
  const sendBtnId = context === 'dashboard' ? 'aiSendBtn' : null;
  if (sendBtnId) { const btn = document.getElementById(sendBtnId); if (btn) btn.disabled = true; }
  appendMsg(context, 'user', msg);
  const tid        = appendTyping(context);
  const ctxData    = buildAIContext();
  const systemPrompt = buildSystemPrompt(ctxData);
  try {
  let response, lastError;
for (let attempt = 0; attempt < GROQ_MODELS.length; attempt++) {
  const modelToUse = GROQ_MODELS[(groqModelIdx + attempt) % GROQ_MODELS.length];
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: modelToUse,
        max_tokens: 4000,
        temperature: 0.05,
        messages: [
          { role:'system', content: systemPrompt },
          { role:'user',   content: msg }
        ]
      })
    });
    if (response.ok) {
      groqModelIdx = (groqModelIdx + attempt) % GROQ_MODELS.length;
      break;
    }
    const errData = await response.json().catch(() => ({}));
    lastError = errData.error?.message || 'Erreur ' + response.status;
    if (lastError.includes('decommissioned') || lastError.includes('deprecated') || response.status === 404) {
      toast(`⚠️ Modèle ${modelToUse} indisponible → bascule...`, 'info');
      continue;
    }
    break;
  } catch(e) { lastError = e.message; }
}
removeTyping(context, tid);
if (!response || !response.ok) {
  throw new Error(lastError || 'Tous les modèles sont indisponibles');
}
    const data     = await response.json();
    const fullText = data.choices?.[0]?.message?.content || 'Pas de réponse.';

    // Traitement FILTRE
    const filtreMarker = fullText.indexOf('###FILTRE###');
    if (filtreMarker !== -1) {
      const displayText = fullText.substring(0, filtreMarker).trim();
      const jsonStr     = fullText.substring(filtreMarker + 12).trim();
      if (displayText) appendMsg(context, 'ai', displayText);
      try {
        const clean     = jsonStr.replace(/```json|```/g, '').trim();
        const jsonMatch = clean.match(/(\{[\s\S]*?\})/);
        if (jsonMatch) { const filtre = JSON.parse(jsonMatch[1]); applyFiltreAndNavigate(filtre, context); }
      } catch (pe) { console.warn('Filtre parse error:', pe); }

    // Traitement ÉCRITURE
    } else if (fullText.includes('###ECRITURE###')) {
      const parts          = fullText.split('###ECRITURE###');
      const textBeforeFirst = parts[0].trim();
      const ecrituresAI    = [];
      for (let i = 1; i < parts.length; i++) {
        const segment   = parts[i].trim();
        const jsonMatch = segment.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          try {
            const cleanJson = jsonMatch[1].replace(/```json|```/g, '').trim();
            const ecr       = JSON.parse(cleanJson);
            if (ecr.lignes && ecr.lignes.length >= 2) {
              let d = 0, c = 0;
              ecr.lignes.forEach(l => { d += Math.round(parseFloat(l.debit) || 0); c += Math.round(parseFloat(l.credit) || 0); });
              // ── Tri débit avant crédit dès la réception depuis l'IA ──
              ecr.lignes = sortLignesDebitAvantCredit(
                ecr.lignes.map(l => ({ ...l, debit: Math.round(parseFloat(l.debit) || 0), credit: Math.round(parseFloat(l.credit) || 0) }))
              );
              ecr.lignes = corrigerComptesErreurs(ecr.lignes);
if (Math.abs(d - c) <= 2) ecrituresAI.push(ecr);
            }
          } catch (pe) { console.warn('JSON parse error écriture', i, ':', pe.message); }
        }
      }
      if (textBeforeFirst) appendMsg(context, 'ai', textBeforeFirst);
      if (ecrituresAI.length === 0) {
        appendMsg(context, 'ai', '⚠️ Aucune écriture équilibrée extraite. Veuillez reformuler votre demande.');
      } else {
        currentGroupId = 'grp_' + Date.now();
        const confirmMsg = `✅ <strong>${ecrituresAI.length} écriture${ecrituresAI.length > 1 ? 's' : ''} liées</strong> préparées et groupées :<br>` +
          ecrituresAI.map((e, i) => `<br><strong>${i + 1}. [${e.journal}]</strong> ${e.libelle}`).join('') +
          `<br><br>⚡ Cliquez <strong>"Tout enregistrer"</strong> pour valider toutes les écritures.`;
        appendMsg(context, 'ai', confirmMsg);
        setEcritureQueue(ecrituresAI);
        if (context === 'saisie') {
          toast(`✨ ${ecrituresAI.length} écriture${ecrituresAI.length > 1 ? 's' : ''} préparée${ecrituresAI.length > 1 ? 's' : ''} et liées`, 'info');
        } else {
          showMultiEcrBanner(ecrituresAI);
          showSaisieNotif(ecrituresAI[0]?.libelle || msg.substring(0, 40), ecrituresAI.length);
        }
      }
    } else {
      appendMsg(context, 'ai', fullText);
    }
  } catch (err) {
    removeTyping(context, tid);
    appendMsg(context, 'ai', `⚠️ Incident technique : ${err.message} — Veuillez réessayer.`);
  }
  isAILoading = false;
  if (sendBtnId) { const btn = document.getElementById(sendBtnId); if (btn) btn.disabled = false; }
}

function applyFiltreAndNavigate(filtre, context) {
  const { type, dateDebut, dateFin, journal, compte } = filtre;
  if (type === 'journal') {
    navigate('journal');
    if (dateDebut) document.getElementById('jnl-date-debut').value = dateDebut;
    if (dateFin)   document.getElementById('jnl-date-fin').value   = dateFin;
    if (journal)   document.getElementById('journalFilter').value  = journal;
    renderJournal();
    const analyseEl = document.getElementById('journal-analyse');
    if (analyseEl) {
      analyseEl.style.display = 'block';
      const label = dateDebut === dateFin ? formatDateFR(dateDebut) : `${formatDateFR(dateDebut)} au ${formatDateFR(dateFin)}`;
      analyseEl.innerHTML = `<div class="analyse-title">📋 Journal — ${label || 'Exercice complet'}</div>Affichage des écritures pour la période demandée.`;
    }
  } else if (type === 'balance') {
    navigate('balance');
    if (dateDebut) document.getElementById('bal-date-debut').value = dateDebut;
    if (dateFin)   document.getElementById('bal-date-fin').value   = dateFin;
    if (journal)   document.getElementById('bal-journal').value    = journal;
    renderBalance();
  } else if (type === 'grandlivre') {
    navigate('grandlivre');
    if (dateDebut) document.getElementById('gl-date-debut').value = dateDebut;
    if (dateFin)   document.getElementById('gl-date-fin').value   = dateFin;
    if (compte)    document.getElementById('glSearch').value      = compte;
    renderGrandLivre();
    if (compte) setTimeout(() => { const el = document.getElementById('gl-' + compte); if (el) el.style.display = 'block'; }, 200);
  } else if (type === 'bilan') {
    navigate('bilan');
    if (dateFin) document.getElementById('bilan-date-arrete').value = dateFin;
    renderBilan();
  }
}

// ── Affichage messages ──
function appendMsg(context, role, text) {
  const msgId = context === 'dashboard' ? 'aiMessages' : `aiMessages-${context}`;
  const c = document.getElementById(msgId);
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'msg ' + role;
  d.innerHTML = `<div class="msg-av">${role === 'ai' ? 'CA' : 'U'}</div><div class="msg-body">${fmt(text)}</div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
}
function appendTyping(context) {
  const id    = 't' + Date.now();
  const msgId = context === 'dashboard' ? 'aiMessages' : `aiMessages-${context}`;
  const c     = document.getElementById(msgId);
  if (!c) return id;
  const d = document.createElement('div');
  d.className = 'msg ai'; d.id = id;
  d.innerHTML = `<div class="msg-av">CA</div><div class="msg-body"><div class="typing"><span></span><span></span><span></span></div></div>`;
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  return id;
}
function removeTyping(context, id) { const el = document.getElementById(id); if (el) el.remove(); }

function fmt(text) {
  if (!text) return '';
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/`(.*?)`/g,'<code>$1</code>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>')
    .replace(/&lt;table&gt;/gi,'<table>').replace(/&lt;\/table&gt;/gi,'</table>')
    .replace(/&lt;thead&gt;/gi,'<thead>').replace(/&lt;\/thead&gt;/gi,'</thead>')
    .replace(/&lt;tbody&gt;/gi,'<tbody>').replace(/&lt;\/tbody&gt;/gi,'</tbody>')
    .replace(/&lt;tfoot&gt;/gi,'<tfoot>').replace(/&lt;\/tfoot&gt;/gi,'</tfoot>')
    .replace(/&lt;tr&gt;/gi,'<tr>').replace(/&lt;\/tr&gt;/gi,'</tr>')
    .replace(/&lt;th(&gt;|(\s[^&]*)&gt;)/gi, (_, m) => '<th' + m.replace(/&gt;/g,'>').replace(/&lt;/g,'<'))
    .replace(/&lt;\/th&gt;/gi,'</th>')
    .replace(/&lt;td(&gt;|(\s[^&]*)&gt;)/gi, (_, m) => '<td' + m.replace(/&gt;/g,'>').replace(/&lt;/g,'<'))
    .replace(/&lt;\/td&gt;/gi,'</td>')
    .replace(/&lt;strong&gt;/gi,'<strong>').replace(/&lt;\/strong&gt;/gi,'</strong>')
    .replace(/&lt;em&gt;/gi,'<em>').replace(/&lt;\/em&gt;/gi,'</em>')
    .replace(/&lt;br&gt;/gi,'<br>').replace(/&lt;br\/&gt;/gi,'<br>');
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function toast(message, type = 'info') {
  const c = document.getElementById('toastContainer') || document.getElementById('toast');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  const icons  = { success:'✓', error:'✕', info:'i' };
  const colors = { success:'#4ade80', error:'#f87171', info:'#d4a853' };
  d.innerHTML = `<span style="font-weight:700;color:${colors[type] || colors.info}">${icons[type] || 'i'}</span><span>${message}</span>`;
  c.appendChild(d);
  setTimeout(() => d.style.opacity = '0', 3500);
  setTimeout(() => d.remove(), 4100);
}

// ══════════════════════════════════════════
// INIT SESSION
// ══════════════════════════════════════════
document.addEventListener('firebase-ready', async () => {
  const session = localStorage.getItem('syscohada_session');
  if (session) {
    try {
      const { profileId } = JSON.parse(session);
      const docRef = window._fbDoc(window._db, 'profiles', profileId);
      const snap   = await window._fbGetDoc(docRef);
      if (snap.exists()) {
        currentProfile = { ...snap.data(), id: profileId };
        await loadApp();
      }
    } catch (e) { localStorage.removeItem('syscohada_session'); }
  }
});

// ══════════════════════════════════════════
// EXPOSITION GLOBALE
// ══════════════════════════════════════════
window.sendToAI             = sendToAI;
window.handleAiKey          = handleAiKey;
window.quickAI              = quickAI;
window.doLogin              = doLogin;
window.doRegister           = doRegister;
window.doLogout             = doLogout;
window.switchTab            = switchTab;
window.navigate             = navigate;
window.addLigne             = addLigne;
window.removeLigne          = removeLigne;
window.saveEcriture         = saveEcriture;
window.updateAccountSuggest = updateAccountSuggest;
window.selectAccount        = selectAccount;
window.hideDropdown         = hideDropdown;
window.updateBalance        = updateBalance;
window.autoSaveAllEcritures = autoSaveAllEcritures;
window.autoSaveAllFromNotif = autoSaveAllFromNotif;
window.skipToNextEcriture   = skipToNextEcriture;
window.dismissFillBanner    = dismissFillBanner;
window.hideMultiEcrBanner   = hideMultiEcrBanner;
window.hideSaisieNotif      = hideSaisieNotif;
window.goToSaisie           = goToSaisie;
window.toggleGL             = toggleGL;
window.deleteEcriture       = deleteEcriture;
window.deleteGroupe         = deleteGroupe;
window.openExportModal      = openExportModal;
window.closeExportModal     = closeExportModal;
window.selectExport         = selectExport;
window.doExport             = doExport;
window.renderJournal        = renderJournal;
window.renderGrandLivre     = renderGrandLivre;
window.renderBalance        = renderBalance;
window.renderBilan          = renderBilan;
window.renderResultat       = renderResultat;
window.renderTresorerie     = renderTresorerie;
window.renderPlanComptable  = renderPlanComptable;
window.resetJournalFiltre   = resetJournalFiltre;
window.resetGLFiltre        = resetGLFiltre;
window.resetBalanceFiltre   = resetBalanceFiltre;
window.updateStats          = updateStats;
window.toggleMobileSidebar  = toggleMobileSidebar;
window.closeMobileSidebar   = closeMobileSidebar;
