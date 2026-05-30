/ ══════════════════════════════════════════════════════════════════
// COMEO AI — SYSCOHADA Pro v4 | Révisé 2017
// Auteur : Marcio Jardel ZINZINDOHOUE — Groupe Express
// ══════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ══════════════════════════════════════════════════════════════════
// SECTION 1 — FIREBASE INITIALISATION
// ══════════════════════════════════════════════════════════════════

// ── Base cache robot (réponses IA mémorisées)
const robotFirebaseConfig = {
  apiKey: "AIzaSyAocBTsHd-A9OJ7RAagxwxtZd0pdW6TX3I",
  authDomain: "data-gbre.firebaseapp.com",
  databaseURL: "https://data-gbre-default-rtdb.firebaseio.com",
  projectId: "data-gbre",
  storageBucket: "data-gbre.firebasestorage.app",
  messagingSenderId: "293732235454",
  appId: "1:293732235454:web:c0b0f4a7b6c9b5d12f46ef",
  measurementId: "G-XD01FS1SPG"
};
const robotApp = initializeApp(robotFirebaseConfig, 'robot-cache');
const robotDb  = getFirestore(robotApp);

// ── Base principale utilisateurs/données
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
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Exposition globale Firebase (utilisée dans le HTML inline)
window._db            = db;
window._fbCollection  = collection;
window._fbAddDoc      = addDoc;
window._fbGetDocs     = getDocs;
window._fbDeleteDoc   = deleteDoc;
window._fbDoc         = doc;
window._fbQuery       = query;
window._fbOrderBy     = orderBy;
window._fbSetDoc      = setDoc;
window._fbGetDoc      = getDoc;
window._fbReady       = true;
document.dispatchEvent(new Event('firebase-ready'));


// ══════════════════════════════════════════════════════════════════
// SECTION 2 — CACHE ROBOT (Firestore + Mémoire)
// ══════════════════════════════════════════════════════════════════

const robotMemoryCache = new Map();

function robotCacheKey(queryStr) {
  return queryStr
    .toLowerCase()
    .replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

async function robotCacheGet(key) {
  if (robotMemoryCache.has(key)) return robotMemoryCache.get(key);
  try {
    const snap = await getDoc(doc(robotDb, 'robot_cache', key));
    if (snap.exists()) {
      const answer = snap.data().answer;
      robotMemoryCache.set(key, answer);
      return answer;
    }
  } catch (_) {}
  return null;
}

async function robotCacheSet(key, answer) {
  robotMemoryCache.set(key, answer);
  try {
    await setDoc(doc(robotDb, 'robot_cache', key), {
      answer,
      savedAt: new Date().toISOString()
    });
  } catch (_) {}
}


// ══════════════════════════════════════════════════════════════════
// SECTION 3 — CONFIGURATION SERVEUR (clés Groq, modèles)
// Jamais de clés en dur — chargées depuis Firestore server_config
// ══════════════════════════════════════════════════════════════════

let GROQ_API_KEYS      = [];
let GROQ_MODELS        = [];
let groqKeyIdx         = 0;
let groqModelIdx       = 0;
let serverConfigLoaded = false;

const GROQ_MODELS_FALLBACK = [
  'llama-3.3-70b-versatile',
  'qwen/qwen3-32b',
  'meta-llama/llama-4-scout-17b-16e-instruct'
];

async function loadServerConfig() {
  try {
    const [keysSnap, modelsSnap] = await Promise.all([
      getDoc(doc(db, 'server_config', 'groq_keys')),
      getDoc(doc(db, 'server_config', 'models'))
    ]);
    if (keysSnap.exists())   GROQ_API_KEYS = (keysSnap.data().keys || []).map(k => k.value).filter(Boolean);
    if (modelsSnap.exists()) GROQ_MODELS   = modelsSnap.data().list || [];
    if (!GROQ_MODELS.length) GROQ_MODELS   = [...GROQ_MODELS_FALLBACK];
    serverConfigLoaded = true;
    console.log(`[COMEO] Config chargée — ${GROQ_API_KEYS.length} clé(s), ${GROQ_MODELS.length} modèle(s)`);
  } catch (e) {
    console.warn('[COMEO] Erreur config serveur :', e.message);
    GROQ_MODELS = [...GROQ_MODELS_FALLBACK];
  }
}


// ══════════════════════════════════════════════════════════════════
// SECTION 4 — PLAN COMPTABLE SYSCOHADA RÉVISÉ 2017
// ══════════════════════════════════════════════════════════════════

const PC = {
  "10":"CAPITAL","101":"CAPITAL SOCIAL","1011":"Capital souscrit, non appelé","1012":"Capital souscrit, appelé, non versé","1013":"Capital souscrit, appelé, versé, non amorti","1014":"Capital souscrit, appelé, versé, amorti","1018":"Capital souscrit soumis à des conditions particulières","102":"CAPITAL PAR DOTATION","1021":"Dotation initiale","1022":"Dotations complémentaires","1028":"Autres dotations","103":"CAPITAL PERSONNEL","104":"COMPTE DE L'EXPLOITANT","1041":"Apports temporaires","1042":"Opérations courantes","1043":"Rémunérations, impôts et autres charges personnelles","1047":"Prélèvements d'autoconsommation","1048":"Autres prélèvements","105":"PRIMES LIEES AU CAPITAL SOCIAL","1051":"Primes d'émission","1052":"Primes d'apport","1053":"Primes de fusion","1054":"Primes de conversion","1058":"Autres primes","106":"ECARTS DE REEVALUATION","1061":"Ecarts de réévaluation légale","1062":"Ecarts de réévaluation libre","109":"APPORTEURS, CAPITAL SOUSCRIT, NON APPELE",
  "11":"RESERVES","111":"RESERVE LEGALE","112":"RESERVES STATUTAIRES OU CONTRACTUELLES","113":"RESERVES REGLEMENTEES","118":"AUTRES RESERVES","1181":"Réserves facultatives","1188":"Réserves diverses",
  "12":"REPORT A NOUVEAU","121":"REPORT A NOUVEAU CREDITEUR","129":"REPORT A NOUVEAU DEBITEUR",
  "13":"RESULTAT NET DE L'EXERCICE","130":"RESULTAT EN INSTANCE D'AFFECTATION","131":"RESULTAT NET : BENEFICE","139":"RESULTAT NET : PERTE",
  "14":"SUBVENTIONS D'INVESTISSEMENT","141":"SUBVENTIONS D'EQUIPEMENT","148":"AUTRES SUBVENTIONS D'INVESTISSEMENT",
  "15":"PROVISIONS REGLEMENTEES ET FONDS ASSIMILES","151":"AMORTISSEMENTS DEROGATOIRES","155":"PROVISIONS REGLEMENTEES RELATIVES AUX IMMOBILISATIONS","157":"PROVISIONS POUR INVESTISSEMENT",
  "16":"EMPRUNTS ET DETTES ASSIMILEES","161":"EMPRUNTS OBLIGATAIRES","162":"EMPRUNTS ET DETTES AUPRES DES ETABLISSEMENTS DE CREDIT","163":"AVANCES RECUES DE L'ETAT","164":"AVANCES RECUES ET COMPTES COURANTS BLOQUES","165":"DEPOTS ET CAUTIONNEMENTS RECUS","166":"INTERETS COURUS","168":"AUTRES EMPRUNTS ET DETTES",
  "17":"DETTES DE LOCATION-ACQUISITION","172":"DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL IMMOBILIER","173":"DETTES DE LOCATION-ACQUISITION / CREDIT-BAIL MOBILIER",
  "18":"DETTES LIEES A DES PARTICIPATIONS","181":"DETTES LIEES A DES PARTICIPATIONS","184":"COMPTES PERMANENTS BLOQUES DES ETABLISSEMENTS ET SUCCURSALES",
  "19":"PROVISIONS POUR RISQUES ET CHARGES","191":"PROVISIONS POUR LITIGES","192":"PROVISIONS POUR GARANTIES DONNEES AUX CLIENTS","194":"PROVISIONS POUR PERTES DE CHANGE","195":"PROVISIONS POUR IMPOTS","196":"PROVISIONS POUR PENSIONS ET OBLIGATIONS SIMILAIRES","198":"AUTRES PROVISIONS POUR RISQUES ET CHARGES",
  "21":"IMMOBILISATIONS INCORPORELLES","211":"FRAIS DE DEVELOPPEMENT","212":"BREVETS, LICENCES, CONCESSIONS ET DROITS SIMILAIRES","213":"LOGICIELS ET SITES INTERNET","215":"MARQUES","216":"FONDS COMMERCIAL","217":"DROIT AU BAIL","219":"AUTRES DROITS ET VALEURS INCORPORELS",
  "22":"TERRAINS","221":"TERRAINS AGRICOLES ET FORESTIERS","222":"TERRAINS NUS","223":"TERRAINS BATIS","224":"TRAVAUX DE MISE EN VALEUR DES TERRAINS","228":"AUTRES TERRAINS",
  "23":"BATIMENTS, INSTALLATIONS TECHNIQUES ET AGENCEMENTS","231":"BATIMENTS INDUSTRIELS, AGRICOLES, ADMINISTRATIFS ET COMMERCIAUX SUR SOL PROPRE","2311":"Bâtiments industriels","2312":"Bâtiments agricoles","2313":"Bâtiments administratifs et commerciaux","232":"BATIMENTS SUR SOL D'AUTRUI","234":"AMENAGEMENTS, AGENCEMENTS ET INSTALLATIONS TECHNIQUES","235":"AMENAGEMENTS DE BUREAUX","239":"BATIMENTS EN COURS",
  "24":"MATERIEL, MOBILIER ET ACTIFS BIOLOGIQUES","241":"MATERIEL ET OUTILLAGE INDUSTRIEL ET COMMERCIAL","2411":"Matériel industriel","2412":"Outillage industriel","242":"MATERIEL ET OUTILLAGE AGRICOLE","244":"MATERIEL ET MOBILIER","2441":"Matériel de bureau","2442":"Matériel informatique","2443":"Matériel bureautique","2444":"Mobilier de bureau","2445":"Matériel et mobilier - immeubles de placement","245":"MATERIEL DE TRANSPORT","2451":"Matériel automobile","2452":"Matériel ferroviaire","2453":"Matériel fluvial, lagunaire","2454":"Matériel naval","2455":"Matériel aérien","246":"ACTIFS BIOLOGIQUES","248":"AUTRES MATERIELS ET MOBILIERS","249":"MATERIELS EN COURS",
  "25":"AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS","251":"Avances sur immobilisations incorporelles","252":"Avances sur immobilisations corporelles",
  "26":"TITRES DE PARTICIPATION","261":"Titres contrôle exclusif","262":"Titres contrôle conjoint","263":"Titres influence notable","268":"Autres titres de participation",
  "27":"AUTRES IMMOBILISATIONS FINANCIERES","271":"PRETS ET CREANCES","272":"PRETS AU PERSONNEL","273":"CREANCES SUR L'ETAT","274":"TITRES IMMOBILISES","275":"DEPOTS ET CAUTIONNEMENTS VERSES","276":"INTERETS COURUS","277":"CREANCES RATTACHEES A DES PARTICIPATIONS","278":"IMMOBILISATIONS FINANCIERES DIVERSES",
  "28":"AMORTISSEMENTS","281":"AMORTISSEMENTS DES IMMOBILISATIONS INCORPORELLES","2811":"Amortissements frais de développement","2812":"Amortissements brevets, licences","2813":"Amortissements logiciels et sites internet","2815":"Amortissements fonds commercial","2818":"Amortissements autres droits","282":"AMORTISSEMENTS DES TERRAINS","2824":"Amortissements travaux de mise en valeur","283":"AMORTISSEMENTS DES BATIMENTS","2831":"Amortissements bâtiments sol propre","2832":"Amortissements bâtiments sol d'autrui","2834":"Amortissements installations techniques","2835":"Amortissements aménagements de bureaux","284":"AMORTISSEMENTS DU MATERIEL","2841":"Amortissements matériel industriel et commercial","2842":"Amortissements matériel agricole","2844":"Amortissements matériel et mobilier","2845":"Amortissements matériel de transport","2846":"Amortissements actifs biologiques","2848":"Amortissements autres matériels",
  "29":"DEPRECIATIONS DES IMMOBILISATIONS","291":"Dépréciations immobilisations incorporelles","293":"Dépréciations bâtiments","294":"Dépréciations matériel","296":"Dépréciations titres de participation","297":"Dépréciations autres immobilisations financières",
  "31":"MARCHANDISES","311":"MARCHANDISES A","312":"MARCHANDISES B","313":"ACTIFS BIOLOGIQUES","318":"MARCHANDISES HORS ACTIVITES ORDINAIRES",
  "32":"MATIERES PREMIERES ET FOURNITURES LIEES","321":"MATIERES A","322":"MATIERES B","323":"FOURNITURES",
  "33":"AUTRES APPROVISIONNEMENTS","331":"MATIERES CONSOMMABLES","332":"FOURNITURES D'ATELIER ET D'USINE","333":"FOURNITURES DE MAGASIN","334":"FOURNITURES DE BUREAU","335":"EMBALLAGES","338":"AUTRES MATIERES",
  "34":"PRODUITS EN COURS","341":"Produits en cours","342":"Travaux en cours",
  "35":"SERVICES EN COURS","351":"Etudes en cours","352":"Prestations de services en cours",
  "36":"PRODUITS FINIS","361":"PRODUITS FINIS A","362":"PRODUITS FINIS B",
  "37":"PRODUITS INTERMEDIAIRES ET RESIDUELS","371":"Produits intermédiaires","372":"Produits résiduels",
  "38":"STOCKS EN COURS DE ROUTE","381":"Marchandises en cours de route","382":"Matières premières en cours de route","387":"Stock en consignation ou en dépôt",
  "39":"DEPRECIATIONS DES STOCKS","391":"Dépréciations marchandises","392":"Dépréciations matières premières","393":"Dépréciations autres approvisionnements","396":"Dépréciations produits finis",
  "40":"FOURNISSEURS ET COMPTES RATTACHES","401":"FOURNISSEURS, DETTES EN COMPTE","4011":"Fournisseurs","4012":"Fournisseurs Groupe","4013":"Fournisseurs sous-traitants","4016":"Fournisseurs, réserve de propriété","4017":"Fournisseurs, retenues de garantie","402":"FOURNISSEURS, EFFETS A PAYER","404":"FOURNISSEURS, ACQUISITIONS COURANTES D'IMMOBILISATIONS","4041":"Fournisseurs dettes en compte, immobilisations incorporelles","4042":"Fournisseurs dettes en compte, immobilisations corporelles","408":"FOURNISSEURS, FACTURES NON PARVENUES","409":"FOURNISSEURS DEBITEURS","4091":"Fournisseurs avances et acomptes versés","4094":"Fournisseurs créances pour emballages et matériels à rendre","4098":"Fournisseurs, rabais, remises, ristournes et autres avoirs à obtenir",
  "41":"CLIENTS ET COMPTES RATTACHES","411":"CLIENTS","4111":"Clients","4112":"Clients – Groupe","4114":"Clients, Etat et Collectivités publiques","412":"CLIENTS, EFFETS A RECEVOIR EN PORTEFEUILLE","413":"CLIENTS, CHEQUES, EFFETS ET AUTRES VALEURS IMPAYES","414":"CREANCES SUR CESSIONS COURANTES D'IMMOBILISATIONS","415":"CLIENTS, EFFETS ESCOMPTES NON ECHUS","416":"CREANCES CLIENTS LITIGIEUSES OU DOUTEUSES","418":"CLIENTS, PRODUITS A RECEVOIR","419":"CLIENTS CREDITEURS","4191":"Clients, avances et acomptes reçus","4194":"Clients, dettes pour emballages et matériels consignés",
  "42":"PERSONNEL","421":"PERSONNEL, AVANCES ET ACOMPTES","4211":"Personnel, avances","4212":"Personnel, acomptes","422":"PERSONNEL, REMUNERATIONS DUES","423":"PERSONNEL, OPPOSITIONS, SAISIES-ARRETS","424":"PERSONNEL, OEUVRES SOCIALES INTERNES","425":"REPRESENTANTS DU PERSONNEL","426":"PERSONNEL, PARTICIPATION AUX BENEFICES ET AU CAPITAL","427":"PERSONNEL – DEPOTS","428":"PERSONNEL, CHARGES A PAYER ET PRODUITS A RECEVOIR","4281":"Dettes provisionnées pour congés à payer","4286":"Autres charges à payer",
  "43":"ORGANISMES SOCIAUX","431":"SECURITE SOCIALE","4311":"Prestations familiales","4312":"Accidents de travail","4313":"Caisse de retraite obligatoire","432":"CAISSES DE RETRAITE COMPLEMENTAIRE","433":"AUTRES ORGANISMES SOCIAUX","438":"ORGANISMES SOCIAUX, CHARGES A PAYER ET PRODUITS A RECEVOIR",
  "44":"ETAT ET COLLECTIVITES PUBLIQUES","441":"ETAT, IMPOT SUR LES BENEFICES","442":"ETAT, AUTRES IMPOTS ET TAXES","4421":"Impôts et taxes d'Etat","4422":"Impôts et taxes collectivités publiques","4426":"Droits de douane","4428":"Autres impôts et taxes","443":"ETAT, T.V.A. FACTUREE","4431":"T.V.A. facturée sur ventes","4432":"T.V.A. facturée sur prestations de services","444":"ETAT, T.V.A. DUE OU CREDIT DE T.V.A.","4441":"Etat, T.V.A. due","4449":"Etat, crédit de T.V.A. à reporter","445":"ETAT, T.V.A. RECUPERABLE","4451":"T.V.A. récupérable sur immobilisations","4452":"T.V.A. récupérable sur achats","4453":"T.V.A. récupérable sur transport","4454":"T.V.A. récupérable sur services extérieurs","4455":"T.V.A. récupérable sur factures non parvenues","447":"ETAT, IMPOTS RETENUS A LA SOURCE","4471":"Impôt Général sur le revenu","4472":"Impôts sur salaires","4473":"Contribution nationale","4474":"Contribution nationale de solidarité","4478":"Autres impôts et contributions","448":"ETAT, CHARGES A PAYER ET PRODUITS A RECEVOIR","449":"ETAT, CREANCES ET DETTES DIVERSES","4491":"Etat, obligations cautionnées","4492":"Etat, avances et acomptes versés sur impôts","4494":"Etat, subventions d'investissement à recevoir","4495":"Etat, subventions d'exploitation à recevoir",
  "45":"ORGANISMES INTERNATIONAUX","451":"OPERATIONS AVEC LES ORGANISMES AFRICAINS","452":"OPERATIONS AVEC LES AUTRES ORGANISMES INTERNATIONAUX",
  "46":"APPORTEURS, ASSOCIES ET GROUPE","461":"APPORTEURS, OPERATIONS SUR LE CAPITAL","462":"ASSOCIES, COMPTES COURANTS","463":"ASSOCIES, OPERATIONS FAITES EN COMMUN ET GIE","465":"ASSOCIES, DIVIDENDES A PAYER","466":"GROUPE, COMPTES COURANTS","469":"ENTITE, DIVIDENDES A RECEVOIR",
  "47":"DEBITEURS ET CREDITEURS DIVERS","471":"DEBITEURS ET CREDITEURS DIVERS","4711":"Débiteurs divers","4712":"Créditeurs divers","4715":"Rémunérations d'administrateurs non associés","472":"CREANCES ET DETTES SUR TITRES DE PLACEMENT","473":"INTERMEDIAIRES - OPERATIONS FAITES POUR COMPTE DE TIERS","474":"COMPTE DE REPARTITION PERIODIQUE DES CHARGES ET DES PRODUITS","476":"CHARGES CONSTATEES D'AVANCE","477":"PRODUITS CONSTATES D'AVANCE","478":"ECARTS DE CONVERSION - ACTIF","479":"ECARTS DE CONVERSION - PASSIF",
  "48":"CREANCES ET DETTES HORS ACTIVITES ORDINAIRES (HAO)","481":"FOURNISSEURS D'INVESTISSEMENTS","4811":"Immobilisations incorporelles","4812":"Immobilisations corporelles","482":"FOURNISSEURS D'INVESTISSEMENTS, EFFETS A PAYER","485":"CREANCES SUR CESSIONS D'IMMOBILISATIONS","488":"AUTRES CREANCES HORS ACTIVITES ORDINAIRES",
  "49":"DEPRECIATIONS ET PROVISIONS POUR RISQUES A COURT TERME","490":"Dépréciations comptes fournisseurs","491":"Dépréciations comptes clients","492":"Dépréciations comptes personnel","493":"Dépréciations comptes organismes sociaux","494":"Dépréciations comptes Etat","497":"Dépréciations comptes débiteurs divers","499":"PROVISIONS POUR RISQUES A COURT TERME",
  "50":"TITRES DE PLACEMENT","501":"TITRES DU TRESOR ET BONS DE CAISSE A COURT TERME","502":"ACTIONS","503":"OBLIGATIONS","508":"AUTRES TITRES DE PLACEMENT ET CREANCES ASSIMILEES",
  "51":"VALEURS A ENCAISSER","511":"EFFETS A ENCAISSER","512":"EFFETS A L'ENCAISSEMENT","513":"CHEQUES A ENCAISSER","514":"CHEQUES A L'ENCAISSEMENT","515":"CARTES DE CREDIT A ENCAISSER","518":"AUTRES VALEURS A L'ENCAISSEMENT",
  "52":"BANQUES","521":"BANQUES LOCALES","5211":"Banques en monnaie nationale","5215":"Banques en devises","522":"BANQUES AUTRES ETATS REGION","523":"BANQUES AUTRES ETATS ZONE MONETAIRE","524":"BANQUES HORS ZONE MONETAIRE","525":"BANQUES DEPOT A TERME","526":"BANQUES, INTERETS COURUS",
  "53":"ETABLISSEMENTS FINANCIERS ET ASSIMILES","531":"CHEQUES POSTAUX","532":"TRESOR","533":"SOCIETES DE GESTION ET D'INTERMEDIATION","538":"AUTRES ORGANISMES FINANCIERS",
  "54":"INSTRUMENTS DE TRESORERIE","541":"OPTIONS DE TAUX D'INTERET","542":"OPTIONS DE TAUX DE CHANGE","545":"AVOIRS D'OR ET AUTRES METAUX PRECIEUX",
  "55":"INSTRUMENTS DE MONNAIE ELECTRONIQUE","551":"MONNAIE ELECTRONIQUE - CARTE CARBURANT","552":"MONNAIE ELECTRONIQUE - TELEPHONE PORTABLE","553":"MONNAIE ELECTRONIQUE - CARTE PEAGE","554":"PORTE-MONNAIE ELECTRONIQUE","558":"AUTRES INSTRUMENTS DE MONNAIES ELECTRONIQUES",
  "56":"BANQUES, CREDITS DE TRESORERIE ET D'ESCOMPTE","561":"CREDITS DE TRESORERIE","564":"ESCOMPTE DE CREDITS DE CAMPAGNE","565":"ESCOMPTE DE CREDITS ORDINAIRES",
  "57":"CAISSE","571":"CAISSE SIEGE SOCIAL","5711":"Caisse en monnaie nationale","5712":"Caisse en devises","572":"CAISSE SUCCURSALE A","573":"CAISSE SUCCURSALE B",
  "58":"REGIES D'AVANCES, ACCREDITIFS ET VIREMENTS","581":"REGIES D'AVANCE","582":"ACCREDITIFS","585":"VIREMENTS DE FONDS","588":"AUTRES VIREMENTS INTERNES",
  "59":"DEPRECIATIONS ET PROVISIONS POUR RISQUE A COURT TERME","590":"Dépréciations titres de placement","591":"Dépréciations titres et valeurs à encaisser","592":"Dépréciations comptes banques","599":"Provisions pour risque à court terme à caractère financier",
  "60":"ACHATS ET VARIATIONS DE STOCKS","601":"ACHATS DE MARCHANDISES","6011":"dans la Région","6012":"hors Région","6015":"frais sur achats","6019":"Rabais, Remises et Ristournes obtenus","602":"ACHATS DE MATIERES PREMIERES ET FOURNITURES LIEES","6021":"dans la Région","6022":"hors Région","603":"VARIATIONS DES STOCKS DE BIENS ACHETES","6031":"Variations des stocks de marchandises","6032":"Variations des stocks de matières premières","6033":"Variations des stocks d'autres approvisionnements","604":"ACHATS STOCKES DE MATIERES ET FOURNITURES CONSOMMABLES","6041":"Matières consommables","6042":"Matières combustibles","6043":"Produits d'entretien","6044":"Fournitures d'atelier et d'usine","6046":"Fournitures de magasin","6047":"Fournitures de bureau","605":"AUTRES ACHATS","6051":"Fournitures non stockables – Eau","6052":"Fournitures non stockables - Electricité","6053":"Fournitures non stockables – Autres énergies","6054":"Fournitures d'entretien non stockables","6055":"Fournitures de bureau non stockables","6056":"Achats de petit matériel et outillage","6057":"Achats d'études et prestations de services","6058":"Achats de travaux, matériels et équipements","608":"ACHATS D'EMBALLAGES","6081":"Emballages perdus","6082":"Emballages récupérables non identifiables",
  "61":"TRANSPORTS","612":"TRANSPORTS SUR VENTES","613":"TRANSPORTS POUR LE COMPTE DE TIERS","614":"TRANSPORTS DU PERSONNEL","616":"TRANSPORTS DE PLIS","618":"AUTRES FRAIS DE TRANSPORT","6181":"Voyages et déplacements","6182":"Transports entre établissements ou chantiers","6183":"Transports administratifs",
  "62":"SERVICES EXTERIEURS","621":"SOUS-TRAITANCE GENERALE","622":"LOCATIONS, CHARGES LOCATIVES","6221":"Locations de terrains","6222":"Locations de bâtiments","6223":"Locations de matériels et outillages","6224":"Malis sur emballages","6225":"Locations d'emballages","6228":"Locations et charges locatives diverses","623":"REDEVANCES DE LOCATION-ACQUISITION","6232":"Crédit-bail immobilier","6233":"Crédit-bail mobilier","624":"ENTRETIEN, REPARATIONS, REMISE EN ETAT ET MAINTENANCE","6241":"Entretien et réparations des biens immobiliers","6242":"Entretien et réparations des biens mobiliers","6243":"Maintenance","625":"PRIMES D'ASSURANCE","6251":"Assurances multirisques","6252":"Assurances matériel de transport","6253":"Assurances risques d'exploitation","626":"ETUDES, RECHERCHES ET DOCUMENTATION","6261":"Etudes et recherches","6265":"Documentation générale","627":"PUBLICITE, PUBLICATIONS, RELATIONS PUBLIQUES","6271":"Annonces, insertions","6272":"Catalogues, imprimés publicitaires","628":"FRAIS DE TELECOMMUNICATIONS","6281":"Frais de téléphone","6282":"Frais de télex","6283":"Frais de télécopie","6288":"Autres frais de télécommunications",
  "63":"AUTRES SERVICES EXTERIEURS","631":"FRAIS BANCAIRES","6311":"Frais sur titres (vente, garde)","6312":"Frais sur effets","6313":"Location de coffres","6315":"Commissions sur cartes de crédit","6316":"Frais d'émission d'emprunts","6318":"Autres frais bancaires","632":"REMUNERATIONS D'INTERMEDIAIRES ET DE CONSEILS","6322":"Commissions et courtages sur ventes","6324":"Honoraires des professions réglementées","6325":"Frais d'actes et de contentieux","6327":"Rémunérations des autres prestataires de services","633":"FRAIS DE FORMATION DU PERSONNEL","634":"REDEVANCES POUR BREVETS, LICENCES, LOGICIELS, CONCESSIONS, DROITS ET VALEURS SIMILAIRES","6342":"Redevances pour brevets, licences","6343":"Redevances pour logiciels","6344":"Redevances pour marques","6346":"Redevances pour concessions, droits et valeurs similaires","635":"COTISATIONS","6351":"Cotisations","637":"REMUNERATIONS DE PERSONNEL EXTERIEUR A L'ENTITE","6371":"Personnel intérimaire","6372":"Personnel détaché ou prêté à l'entité","638":"AUTRES CHARGES EXTERNES","6381":"Frais de recrutement du personnel","6382":"Frais de déménagement","6383":"Réceptions","6384":"Missions","6388":"Charges externes diverses",
  "64":"IMPOTS ET TAXES","641":"IMPOTS ET TAXES DIRECTS","6411":"Impôts fonciers et taxes annexes","6412":"Patentes, licences et taxes annexes","6413":"Taxes sur appointements et salaires","6414":"Taxes d'apprentissage","6415":"Formation professionnelle continue","6418":"Autres impôts et taxes directs","645":"IMPOTS ET TAXES INDIRECTS","646":"DROITS D'ENREGISTREMENT","6461":"Droits de mutation","6462":"Droits de timbre","6463":"Taxes sur les véhicules de société","647":"PENALITES, AMENDES FISCALES","648":"AUTRES IMPOTS ET TAXES",
  "65":"AUTRES CHARGES","651":"PERTES SUR CREANCES CLIENTS ET AUTRES DEBITEURS","654":"VALEURS COMPTABLES DES CESSIONS COURANTES D'IMMOBILISATIONS","6541":"Immobilisations incorporelles","6542":"Immobilisations corporelles","656":"PERTE DE CHANGE SUR CREANCES ET DETTES COMMERCIALES","657":"PENALITES ET AMENDES PENALES","658":"CHARGES DIVERSES","6581":"Indemnités de fonction et autres rémunérations d'administrateurs","6582":"Dons","6583":"Mécénat","6588":"Autres charges diverses","659":"CHARGES POUR DEPRECIATIONS ET PROVISIONS",
  "66":"CHARGES DE PERSONNEL","661":"REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NATIONAL","6611":"Appointements salaires et commissions","6612":"Primes et gratifications","6613":"Congés payés","6614":"Indemnités de préavis, de licenciement et de recherche d'embauche","6615":"Indemnités de maladie versées aux travailleurs","6616":"Supplément familial","6617":"Avantages en nature","6618":"Autres rémunérations directes","662":"REMUNERATIONS DIRECTES VERSEES AU PERSONNEL NON NATIONAL","663":"INDEMNITES FORFAITAIRES VERSEES AU PERSONNEL","6631":"Indemnités de logement","6632":"Indemnités de représentation","6633":"Indemnités d'expatriation","6634":"Indemnités de transport","6638":"Autres indemnités et avantages divers","664":"CHARGES SOCIALES","6641":"Charges sociales sur rémunération du personnel national","6642":"Charges sociales sur rémunération du personnel non national","666":"REMUNERATIONS ET CHARGES SOCIALES DE L'EXPLOITANT INDIVIDUEL","667":"REMUNERATION TRANSFEREE DE PERSONNEL EXTERIEUR","668":"AUTRES CHARGES SOCIALES","6681":"Versements aux Syndicats et Comités d'entreprise","6684":"Médecine du travail et pharmacie","6685":"Assurances et organismes de santé","6686":"Assurances retraite et fonds de pensions","6688":"Charges sociales diverses",
  "67":"FRAIS FINANCIERS ET CHARGES ASSIMILEES","671":"INTERETS DES EMPRUNTS","6711":"Emprunts obligataires","6712":"Emprunts auprès des établissements de crédit","672":"INTERETS DANS LOYERS DE LOCATION ACQUISITION","673":"ESCOMPTES ACCORDES","674":"AUTRES INTERETS","6741":"Avances reçues et dépôts créditeurs","6742":"Comptes courants bloqués","6744":"Intérêts sur dettes commerciales","6745":"Intérêts bancaires et sur opérations de financement","675":"ESCOMPTES DES EFFETS DE COMMERCE","676":"PERTES DE CHANGE FINANCIERES","677":"PERTES SUR TITRES DE PLACEMENT","679":"CHARGES POUR DEPRECIATIONS ET PROVISIONS POUR RISQUES FINANCIERES",
  "68":"DOTATIONS AUX AMORTISSEMENTS","681":"DOTATIONS AUX AMORTISSEMENTS D'EXPLOITATION","6812":"Dotations aux amortissements des immobilisations incorporelles","6813":"Dotations aux amortissements des immobilisations corporelles",
  "69":"DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS","691":"DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS D'EXPLOITATION","6911":"Dotations aux provisions pour risques et charges","6913":"Dotations aux dépréciations des immobilisations incorporelles","6914":"Dotations aux dépréciations des immobilisations corporelles","697":"DOTATIONS AUX PROVISIONS ET AUX DEPRECIATIONS FINANCIERES","6971":"Dotations aux provisions pour risques et charges financiers","6972":"Dotations aux dépréciations des immobilisations financières",
  "70":"VENTES","701":"VENTES DE MARCHANDISES","7011":"dans la Région","7012":"hors Région","7013":"aux entités du groupe dans la Région","7015":"sur internet","7019":"Rabais, remises, ristournes accordés","702":"VENTES DE PRODUITS FINIS","703":"VENTES DE PRODUITS INTERMEDIAIRES","704":"VENTES DE PRODUITS RESIDUELS","705":"TRAVAUX FACTURES","706":"SERVICES VENDUS","7061":"dans la Région","7062":"hors Région","707":"PRODUITS ACCESSOIRES","7071":"Ports, emballages perdus et autres frais facturés","7072":"Commissions et courtages","7073":"Locations et redevances de location - financement","7074":"Bonis sur reprises et cessions d'emballages","7075":"Mise à disposition de personnel","7076":"Redevances pour brevets, logiciels, marques et droits similaires","7077":"Services exploités dans l'intérêt du personnel","7078":"Autres produits accessoires",
  "71":"SUBVENTIONS D'EXPLOITATION","711":"SUR PRODUITS A L'EXPORTATION","712":"SUR PRODUITS A L'IMPORTATION","713":"SUR PRODUITS DE PEREQUATION","714":"INDEMNITES ET SUBVENTIONS D'EXPLOITATION","718":"AUTRES SUBVENTIONS D'EXPLOITATION","7181":"Versées par l'Etat et les collectivités publiques","7182":"Versées par les organismes internationaux","7183":"Versées par des tiers",
  "72":"PRODUCTION IMMOBILISEE","721":"IMMOBILISATIONS INCORPORELLES","722":"IMMOBILISATIONS CORPORELLES","724":"PRODUCTION AUTO-CONSOMMEE","726":"IMMOBILISATIONS FINANCIERES",
  "73":"VARIATIONS DES STOCKS DE BIENS ET DE SERVICES PRODUITS","734":"VARIATIONS DES STOCKS DE PRODUITS EN COURS","736":"VARIATIONS DES STOCKS DE PRODUITS FINIS","737":"VARIATIONS DES STOCKS DE PRODUITS INTERMEDIAIRES ET RESIDUELS",
  "75":"AUTRES PRODUITS","751":"PROFITS SUR CREANCES CLIENTS ET AUTRES DEBITEURS","754":"PRODUITS DES CESSIONS COURANTES D'IMMOBILISATIONS","7541":"Immobilisations incorporelles","7542":"Immobilisations corporelles","756":"GAINS DE CHANGE SUR CREANCES ET DETTES COMMERCIALES","758":"PRODUITS DIVERS","7581":"Indemnités de fonction et autres rémunérations d'administrateurs","7582":"Indemnités d'assurances reçues","7588":"Autres produits divers","759":"REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS",
  "77":"REVENUS FINANCIERS ET PRODUITS ASSIMILES","771":"INTERETS DE PRETS ET CREANCES DIVERSES","7712":"Intérêts de prêts","7713":"Intérêts sur créances diverses","772":"REVENUS DE PARTICIPATIONS ET AUTRES TITRES IMMOBILISES","7721":"Revenus des titres de participation","773":"ESCOMPTES OBTENUS","774":"REVENUS DE PLACEMENT","7745":"Revenus des obligations","7746":"Revenus des titres de placement","775":"INTERETS DANS LOYERS DE LOCATION-FINANCEMENT","776":"GAINS DE CHANGE FINANCIERS","777":"GAINS SUR CESSIONS DE TITRES DE PLACEMENT","778":"GAINS SUR RISQUES FINANCIERS","779":"REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS FINANCIERES",
  "78":"TRANSFERTS DE CHARGES","781":"TRANSFERTS DE CHARGES D'EXPLOITATION","787":"TRANSFERTS DE CHARGES FINANCIERES",
  "79":"REPRISES DE PROVISIONS, DE DEPRECIATIONS ET AUTRES","791":"REPRISES DE PROVISIONS ET DEPRECIATIONS D'EXPLOITATION","797":"REPRISES DE PROVISIONS ET DEPRECIATIONS FINANCIERES","799":"REPRISES DE SUBVENTIONS D'INVESTISSEMENT",
  "81":"VALEURS COMPTABLES DES CESSIONS D'IMMOBILISATIONS","811":"IMMOBILISATIONS INCORPORELLES","812":"IMMOBILISATIONS CORPORELLES","816":"IMMOBILISATIONS FINANCIERES",
  "82":"PRODUITS DES CESSIONS D'IMMOBILISATIONS","821":"IMMOBILISATIONS INCORPORELLES","822":"IMMOBILISATIONS CORPORELLES","826":"IMMOBILISATIONS FINANCIERES",
  "83":"CHARGES HORS ACTIVITES ORDINAIRES","831":"CHARGES H.A.O. CONSTATEES","833":"CHARGES LIEES AUX OPERATIONS DE RESTRUCTURATION","834":"PERTES SUR CREANCES H.A.O.","835":"DONS ET LIBERALITES ACCORDES","836":"ABANDONS DE CREANCES CONSENTIS","837":"CHARGES LIEES AUX OPERATIONS DE LIQUIDATION",
  "84":"PRODUITS HORS ACTIVITES ORDINAIRES","841":"PRODUITS H.A.O CONSTATES","843":"PRODUITS LIES AUX OPERATIONS DE RESTRUCTURATION","845":"DONS ET LIBERALITES OBTENUS","846":"ABANDONS DE CREANCES OBTENUS","848":"TRANSFERTS DE CHARGES H.A.O","849":"REPRISES DE CHARGES POUR DEPRECIATIONS ET PROVISIONS H.A.O.",
  "85":"DOTATIONS HORS ACTIVITES ORDINAIRES","851":"DOTATIONS AUX PROVISIONS REGLEMENTEES","852":"DOTATIONS AUX AMORTISSEMENTS H.A.O.","853":"DOTATIONS AUX DEPRECIATIONS H.A.O.","854":"DOTATIONS AUX PROVISIONS POUR RISQUES ET CHARGES H.A.O.","858":"AUTRES DOTATIONS H.A.O.",
  "86":"REPRISES DE CHARGES, PROVISIONS ET DEPRECIATIONS HAO","861":"REPRISES DE PROVISIONS REGLEMENTEES","862":"REPRISES D'AMORTISSEMENTS H.A.O","863":"REPRISES DE DEPRECIATIONS H.A.O.","864":"REPRISES DE PROVISIONS POUR RISQUES ET CHARGES H.A.O.","868":"AUTRES REPRISES H.A.O.",
  "87":"PARTICIPATION DES TRAVAILLEURS","871":"PARTICIPATION LEGALE AUX BENEFICES","874":"PARTICIPATION CONTRACTUELLE AUX BENEFICES",
  "89":"IMPOTS SUR LE RESULTAT","891":"IMPOTS SUR LES BENEFICES DE L'EXERCICE","8911":"Activités exercées dans l'Etat","8912":"Activités exercées dans les autres Etats de la Région","892":"RAPPEL D'IMPOTS SUR RESULTATS ANTERIEURS","895":"IMPOT MINIMUM FORFAITAIRE (I.M.F.)","899":"DEGREVEMENTS ET ANNULATIONS D'IMPOTS SUR RESULTATS ANTERIEURS",
  "90":"ENGAGEMENTS OBTENUS ET ENGAGEMENTS ACCORDES","901":"ENGAGEMENTS DE FINANCEMENT OBTENUS","902":"ENGAGEMENTS DE GARANTIE OBTENUS","903":"ENGAGEMENTS RECIPROQUES","904":"AUTRES ENGAGEMENTS OBTENUS","905":"ENGAGEMENTS DE FINANCEMENT ACCORDES","906":"ENGAGEMENTS DE GARANTIE ACCORDES","907":"ENGAGEMENTS RECIPROQUES","908":"AUTRES ENGAGEMENTS ACCORDES"
};

const CLASS_NAMES = {
  '1': 'Capitaux', '2': 'Immobilisations', '3': 'Stocks',
  '4': 'Tiers',    '5': 'Trésorerie',      '6': 'Charges',
  '7': 'Produits', '8': 'Spéciaux'
};
const NATURE_MAP = {
  '1': 'Passif', '2': 'Actif',   '3': 'Actif',    '4': 'Mixte',
  '5': 'Actif',  '6': 'Charge',  '7': 'Produit',  '8': 'Spécial'
};
const JOURNAL_NAMES = {
  'AC': 'Achats', 'VE': 'Ventes', 'BQ': 'Banque',
  'CA': 'Caisse', 'OD': 'Opérations Diverses', 'IN': 'Inventaire', 'AN': 'À Nouveau'
};
const JOURNAL_ICONS = {
  'AC': '🛒', 'VE': '💰', 'BQ': '🏦',
  'CA': '💵', 'OD': '📋', 'IN': '📦', 'AN': '📂'
};


// ══════════════════════════════════════════════════════════════════
// SECTION 5 — ÉTAT GLOBAL
// ══════════════════════════════════════════════════════════════════

let ecritures           = [];
let lignes              = [];
let pieceCounter        = 1;
let currentProfile      = null;
let isAILoading         = false;
let exportFormat        = 'pdf';
let ecrQueue            = [];
let ecrQueueIdx         = 0;
let currentGroupId      = null;
let conversationHistory = [];

// Tiers
let clientsList        = [];
let fournisseursList   = [];
let facturesList       = [];
let devisList          = [];
let facLignes          = [];
let editingFactureId   = null;
let editingClientId    = null;
let clientCounter      = 1;
let fournisseurCounter = 1;
let factureCounter     = 1;
let devisCounter       = 1;

// Exposition facLignes (accès inline HTML)
window.facLignes = facLignes;


// ══════════════════════════════════════════════════════════════════
// SECTION 6 — UTILITAIRES
// ══════════════════════════════════════════════════════════════════

/** Formatage nombre → séparateur FR sans décimales */
function fn(n) {
  return Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

/** Formatage nombre → espaces (pour PDF) */
function fnPDF(n) {
  return Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
window.fnPDF = fnPDF;

/** Formatage court (K / M / Md) */
function fs(n) {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1) + ' Md FCFA';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + ' M FCFA';
  if (a >= 1e3) return (n / 1e3).toFixed(0) + ' K FCFA';
  return (n || 0).toFixed(0) + ' FCFA';
}

/** Date ISO → "14 Janvier 2024" */
function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const mois = ['','Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  return `${parseInt(d)} ${mois[parseInt(m)]} ${y}`;
}

/** Attente Firebase ready */
function waitForFirebase() {
  return new Promise(r => {
    if (window._fbReady) { r(); return; }
    document.addEventListener('firebase-ready', r, { once: true });
  });
}

/** Toast notification */
function toast(message, type = 'info') {
  const c = document.getElementById('toastContainer') || document.getElementById('toast');
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  const icons  = { success: '✓', error: '✕', info: 'i' };
  const colors = { success: '#4ade80', error: '#f87171', info: '#d4a853' };
  d.innerHTML = `<span style="font-weight:700;color:${colors[type] || colors.info}">${icons[type] || 'i'}</span><span>${message}</span>`;
  c.appendChild(d);
  setTimeout(() => d.style.opacity = '0', 3500);
  setTimeout(() => d.remove(), 4100);
}

/** Tri SYSCOHADA — débits avant crédits */
function sortLignesDebitAvantCredit(lignes) {
  return [...lignes].sort((a, b) => {
    const aD = (parseFloat(a.debit) || 0) > 0;
    const bD = (parseFloat(b.debit) || 0) > 0;
    if (aD && !bD) return -1;
    if (!aD && bD) return 1;
    return 0;
  });
}

/** Label étape selon journal */
function getStepLabel(ecr) {
  const map = {
    'IN': 'Mouvement de stock',       'AC': 'Constatation facture achat',
    'VE': 'Constatation facture vente','BQ': 'Règlement banque',
    'CA': 'Règlement caisse',          'OD': 'Opération diverse',
    'AN': 'À nouveau'
  };
  return map[ecr.journal] || ecr.libelle || 'Écriture';
}

/** Formatage texte IA → HTML */
function fmt(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')
    // Réautorisation balises tableau
    .replace(/&lt;table&gt;/gi, '<table>').replace(/&lt;\/table&gt;/gi, '</table>')
    .replace(/&lt;thead&gt;/gi, '<thead>').replace(/&lt;\/thead&gt;/gi, '</thead>')
    .replace(/&lt;tbody&gt;/gi, '<tbody>').replace(/&lt;\/tbody&gt;/gi, '</tbody>')
    .replace(/&lt;tfoot&gt;/gi, '<tfoot>').replace(/&lt;\/tfoot&gt;/gi, '</tfoot>')
    .replace(/&lt;tr&gt;/gi, '<tr>').replace(/&lt;\/tr&gt;/gi, '</tr>')
    .replace(/&lt;th(&gt;|(\s[^&]*)&gt;)/gi, (_, m) => '<th' + m.replace(/&gt;/g, '>').replace(/&lt;/g, '<'))
    .replace(/&lt;\/th&gt;/gi, '</th>')
    .replace(/&lt;td(&gt;|(\s[^&]*)&gt;)/gi, (_, m) => '<td' + m.replace(/&gt;/g, '>').replace(/&lt;/g, '<'))
    .replace(/&lt;\/td&gt;/gi, '</td>')
    .replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>')
    .replace(/&lt;em&gt;/gi, '<em>').replace(/&lt;\/em&gt;/gi, '</em>')
    .replace(/&lt;br&gt;/gi, '<br>').replace(/&lt;br\/&gt;/gi, '<br>');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 7 — CORRECTEUR AUTOMATIQUE DE COMPTES
// ══════════════════════════════════════════════════════════════════

const MOTS_IMMOBILISATIONS = [
  'véhicule','camion','voiture','moto','transport','automobile',
  'ordinateur','informatique','bureau','mobilier','matériel',
  'machine','équipement','installation','bâtiment','terrain'
];
const COMPTES_IMMOB = {
  'véhicule':'2451','camion':'2451','voiture':'2451','moto':'2451',
  'automobile':'2451','transport':'2451','ordinateur':'2442',
  'informatique':'2442','bureau':'2441','mobilier':'2444',
  'matériel':'2441','machine':'2411','équipement':'2411'
};

function corrigerComptesErreurs(lignes) {
  return lignes.map(l => {
    const code = String(l.compte || '');
    const lib  = (l.libelle || '').toLowerCase();
    let newCode = code;

    // Achat en 601/607/6058 → vérifier si c'est une immobilisation
    if (['607', '6058', '601'].includes(code) && l.debit > 0) {
      const mot = MOTS_IMMOBILISATIONS.find(m => lib.includes(m));
      if (mot && !lib.includes('marchandis')) newCode = COMPTES_IMMOB[mot] || '2411';
    }

    // Amortissement terrain mal imputé
    if (['221','222','223','224'].includes(code) && l.credit > 0) newCode = '2845';

    // Chèque/virement → banque locale
    if (['511','512','513','514'].includes(code)) newCode = '521';

    // TVA 4452 sur immobilisation → 4451
    if (code === '4452' && l.debit > 0) {
      const immobMots = ['véhicule','camion','ordinateur','mobilier','matériel','machine','équipement'];
      if (immobMots.some(m => lib.includes(m))) newCode = '4451';
    }

    return { ...l, compte: newCode, libelle: l.libelle || PC[newCode] || l.libelle };
  });
}


// ══════════════════════════════════════════════════════════════════
// SECTION 8 — AUTHENTIFICATION
// ══════════════════════════════════════════════════════════════════

function switchTab(t) {
  document.getElementById('tab-login').classList.toggle('active', t === 'login');
  document.getElementById('tab-register').classList.toggle('active', t === 'register');
  document.getElementById('form-login').style.display    = t === 'login'    ? 'flex' : 'none';
  document.getElementById('form-register').style.display = t === 'register' ? 'flex' : 'none';
}

async function doRegister() {
  const company   = document.getElementById('r-company').value.trim();
  const email     = document.getElementById('r-email').value.trim();
  const compte701 = document.getElementById('r-compte701').value.trim() || '701';
  const exercice  = document.getElementById('r-exercice').value.trim() || '2024';
  const pass      = document.getElementById('r-pass').value;
  const err       = document.getElementById('r-err');
  err.classList.remove('show');

  if (!company) { err.textContent = "Nom d'entreprise requis"; err.classList.add('show'); return; }
  if (!email)   { err.textContent = "Email requis"; err.classList.add('show'); return; }
  if (pass.length < 6) { err.textContent = 'Mot de passe trop court (6 caractères min.)'; err.classList.add('show'); return; }

  try {
    await waitForFirebase();
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await window._fbSetDoc(window._fbDoc(window._db, 'profiles', cred.user.uid), {
      company, compte701, exercice, email,
      createdAt: new Date().toISOString()
    });
    toast('Profil créé avec succès ! Connectez-vous.', 'success');
    switchTab('login');
    document.getElementById('l-email').value = email;
  } catch (e) {
    const msgs = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/invalid-email': 'Email invalide.',
      'auth/weak-password': 'Mot de passe trop faible.'
    };
    err.textContent = msgs[e.code] || e.message;
    err.classList.add('show');
  }
}

async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  const err   = document.getElementById('l-err');
  err.classList.remove('show');

  if (!email || !pass) { err.textContent = 'Remplissez tous les champs'; err.classList.add('show'); return; }

  try {
    await waitForFirebase();
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await window._fbGetDoc(window._fbDoc(window._db, 'profiles', cred.user.uid));
    if (!snap.exists()) { err.textContent = 'Profil introuvable.'; err.classList.add('show'); return; }
    currentProfile = { ...snap.data(), id: cred.user.uid };
    conversationHistory = [];
    await loadApp();
  } catch (e) {
    const msgs = {
      'auth/user-not-found':     'Aucun compte avec cet email.',
      'auth/wrong-password':     'Mot de passe incorrect.',
      'auth/invalid-email':      'Email invalide.',
      'auth/too-many-requests':  'Trop de tentatives. Réessayez plus tard.'
    };
    err.textContent = msgs[e.code] || e.message;
    err.classList.add('show');
  }
}

async function doLogout() {
  if (!confirm('Se déconnecter ?')) return;
  await signOut(auth);
  currentProfile = null; ecritures = []; conversationHistory = [];
  document.getElementById('appShell').style.display   = 'none';
  document.getElementById('authOverlay').style.display = 'flex';
}

async function doForgotPassword() {
  const email = document.getElementById('l-email').value.trim();
  if (!email) { toast('Entrez votre email puis cliquez sur ce lien', 'error'); return; }
  try {
    await sendPasswordResetEmail(auth, email);
    toast('Email de réinitialisation envoyé à ' + email, 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}


// ══════════════════════════════════════════════════════════════════
// SECTION 9 — CHARGEMENT APPLICATION
// ══════════════════════════════════════════════════════════════════

async function loadApp() {
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appShell').style.display    = 'grid';
  document.getElementById('topCompanyName').textContent = currentProfile.company;
  document.getElementById('exerciceYear').value         = currentProfile.exercice || '2024';

  if (!serverConfigLoaded) await loadServerConfig();

  await Promise.all([
    loadEcrituresFromFirestore(),
    loadClientsFromFirestore(),
    loadFournisseursFromFirestore(),
    loadFacturesFromFirestore()
  ]);

  updateStats();
  renderPlanComptable();
  initSaisie();
}


// ══════════════════════════════════════════════════════════════════
// SECTION 10 — FIRESTORE CRUD
// ══════════════════════════════════════════════════════════════════

async function loadEcrituresFromFirestore() {
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'ecritures');
    const q    = window._fbQuery(col, window._fbOrderBy('date', 'asc'));
    const snap = await window._fbGetDocs(q);
    ecritures = [];
    snap.forEach(d => ecritures.push({ ...d.data(), _docId: d.id }));
    pieceCounter = ecritures.length + 1;
  } catch (e) { toast('Erreur chargement écritures : ' + e.message, 'error'); }
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

async function loadClientsFromFirestore() {
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'clients');
    const snap = await window._fbGetDocs(col);
    clientsList = [];
    snap.forEach(d => clientsList.push({ ...d.data(), _docId: d.id }));
    clientCounter = clientsList.length + 1;
  } catch (_) {}
}

async function loadFournisseursFromFirestore() {
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'fournisseurs');
    const snap = await window._fbGetDocs(col);
    fournisseursList = [];
    snap.forEach(d => fournisseursList.push({ ...d.data(), _docId: d.id }));
    fournisseurCounter = fournisseursList.length + 1;
  } catch (_) {}
}

async function loadFacturesFromFirestore() {
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'factures');
    const q    = window._fbQuery(col, window._fbOrderBy('dateEmission', 'desc'));
    const snap = await window._fbGetDocs(q);
    facturesList = [];
    snap.forEach(d => facturesList.push({ ...d.data(), _docId: d.id }));
    factureCounter = facturesList.length + 1;
  } catch (_) {}
}


// ══════════════════════════════════════════════════════════════════
// SECTION 11 — NAVIGATION
// ══════════════════════════════════════════════════════════════════

const VIEW_KEYS = {
  dashboard: 'tableau', saisie: 'saisie', journal: 'journal',
  grandlivre: 'grand',  balance: 'balance', bilan: 'bilan',
  resultat: 'résultat', tresorerie: 'trésor', plancomptable: 'plan',
  factures: 'factur',   devis: 'devis', clients: 'client', fournisseurs: 'fourniss'
};

const RENDERERS = {
  journal:      renderJournal,     grandlivre:    renderGrandLivre,
  balance:      renderBalance,     bilan:         renderBilan,
  resultat:     renderResultat,    tresorerie:    renderTresorerie,
  plancomptable:renderPlanComptable, saisie:      initSaisie,
  factures:     renderFactures,    devis:         renderDevis,
  clients:      renderClients,     fournisseurs:  renderFournisseurs
};

function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + view)?.classList.add('active');
  const key = VIEW_KEYS[view] || view;
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.textContent.toLowerCase().includes(key)) n.classList.add('active');
  });
  if (RENDERERS[view]) RENDERERS[view]();
}

function toggleMobileSidebar() {
  document.getElementById('mainSidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
function closeMobileSidebar() {
  document.getElementById('mainSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 12 — STATISTIQUES DASHBOARD
// ══════════════════════════════════════════════════════════════════

function updateStats() {
  let tD = 0, tC = 0;
  ecritures.forEach(e => e.lignes.forEach(l => { tD += l.debit || 0; tC += l.credit || 0; }));

  const all  = ecritures.flatMap(e => e.lignes);
  const prod = all.filter(l => l.compte?.[0] === '7').reduce((s, l) => s + (l.credit || 0), 0);
  const chg  = all.filter(l => l.compte?.[0] === '6').reduce((s, l) => s + (l.debit  || 0), 0);
  const res  = prod - chg;
  const eq   = Math.abs(tD - tC) < 0.01;

  // Indicateurs sidebar
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('s-ecritures', ecritures.length);
  set('s-debit',     fn(tD));
  set('s-credit',    fn(tC));

  const eqEl = document.getElementById('s-equil');
  if (eqEl) { eqEl.textContent = eq ? '✓ Équilibré' : '✗ Déséquilibré'; eqEl.className = 'val ' + (eq ? 'g' : 'r'); }

  // Dashboard cards
  set('dash-nb',     ecritures.length);
  set('dash-debit',  fs(tD));
  set('dash-credit', fs(tC));

  const re = document.getElementById('dash-res');
  if (re) { re.textContent = fs(res); re.style.color = res >= 0 ? 'var(--green)' : 'var(--red)'; }

  // Dates exercice
  const yr = document.getElementById('exerciceYear')?.value;
  const bd = document.getElementById('bilanDate');
  const ry = document.getElementById('resultatYear');
  if (bd) bd.textContent = '31/12/' + yr;
  if (ry) ry.textContent = yr;
}


// ══════════════════════════════════════════════════════════════════
// SECTION 13 — SAISIE MANUELLE
// ══════════════════════════════════════════════════════════════════

function initSaisie() {
  const dateEl  = document.getElementById('ecr-date');
  const pieceEl = document.getElementById('ecr-piece');
  if (dateEl  && !dateEl.value) dateEl.value = new Date().toISOString().split('T')[0];
  if (pieceEl) pieceEl.placeholder = 'N°' + String(pieceCounter).padStart(5, '0');
  if (lignes.length === 0) { addLigne(); addLigne(); }
  renderLignes();
  updateQueueBar();
}

function addLigne(compte = '', libelle = '', debit = '', credit = '') {
  lignes.push({ compte, libelle, debit, credit });
  renderLignes();
}
function removeLigne(i) { lignes.splice(i, 1); renderLignes(); }

function renderLignes() {
  const tbody        = document.getElementById('lignesBody');
  const cardContainer = document.getElementById('lignesCardContainer');
  if (tbody) tbody.innerHTML = '';
  if (cardContainer) cardContainer.innerHTML = '';

  lignes.forEach((l, i) => {
    // ── Vue tableau
    if (tbody) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><div class="asw">
          <input type="text" value="${l.compte}" placeholder="Compte…" style="width:100%;font-family:var(--font-mono)"
            oninput="lignes[${i}].compte=this.value;updateAccountSuggest(${i},this,'table')"
            onblur="hideDropdown('t-${i}')">
          <div class="adrop" id="drop-t-${i}"></div>
        </div></td>
        <td><input type="text" value="${l.libelle || ''}" placeholder="Libellé…" style="width:100%"
          oninput="lignes[${i}].libelle=this.value"></td>
        <td><input type="text" value="${l.debit || ''}" placeholder="0"
          style="text-align:right;width:100%;font-family:var(--font-mono)"
          oninput="lignes[${i}].debit=parseFloat(this.value.replace(/[^0-9.]/g,''))||0;updateBalance()"></td>
        <td><input type="text" value="${l.credit || ''}" placeholder="0"
          style="text-align:right;width:100%;font-family:var(--font-mono)"
          oninput="lignes[${i}].credit=parseFloat(this.value.replace(/[^0-9.]/g,''))||0;updateBalance()"></td>
        <td><button class="del-line" onclick="removeLigne(${i})">✕</button></td>`;
      tbody.appendChild(tr);
    }

    // ── Vue carte mobile
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
            <input class="ligne-card-input" type="text" value="${l.libelle || ''}" placeholder="Libellé…"
              oninput="lignes[${i}].libelle=this.value">
          </div>
        </div>
        <div class="ligne-card-row">
          <div class="ligne-card-field">
            <div class="ligne-card-label" style="color:var(--blue)">Débit (FCFA)</div>
            <input class="ligne-card-input" type="number" value="${l.debit || ''}" placeholder="0"
              style="font-family:var(--font-mono)"
              oninput="lignes[${i}].debit=parseFloat(this.value)||0;updateBalance()">
          </div>
          <div class="ligne-card-field">
            <div class="ligne-card-label" style="color:var(--green)">Crédit (FCFA)</div>
            <input class="ligne-card-input" type="number" value="${l.credit || ''}" placeholder="0"
              style="font-family:var(--font-mono)"
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
    </div>`
  ).join('');
  drop.classList.add('open');
}

function selectAccount(idx, code, lib) {
  lignes[idx].compte = code;
  if (!lignes[idx].libelle) lignes[idx].libelle = lib.substring(0, 54);
  renderLignes();
}

function hideDropdown(id) {
  setTimeout(() => {
    const d = document.getElementById('drop-' + id);
    if (d) d.classList.remove('open');
  }, 200);
}

function updateBalance() {
  let d = 0, c = 0;
  lignes.forEach(l => { d += parseFloat(l.debit) || 0; c += parseFloat(l.credit) || 0; });
  const s = d - c;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('totalDebitDisplay',  fn(d));
  set('totalCreditDisplay', fn(c));
  const el = document.getElementById('soldeDisplay');
  if (el) { el.textContent = fn(Math.abs(s)); el.className = 'val ' + (Math.abs(s) < 0.01 ? 'bok' : 'bbad'); }
}


// ══════════════════════════════════════════════════════════════════
// SECTION 14 — VALIDATION MANUELLE D'UNE ÉCRITURE
// ══════════════════════════════════════════════════════════════════

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
    toast(`Écriture non équilibrée — D: ${fn(d)} / C: ${fn(c)} — Δ: ${fn(Math.abs(d - c))} FCFA`, 'error');
    return;
  }

  const groupInfo = (ecrQueue.length > 0 && currentGroupId)
    ? { groupId: currentGroupId, groupLibelle: ecrQueue[0]?.libelle || libelle, groupSize: ecrQueue.length, groupIdx: ecrQueueIdx }
    : {};

  const ecriture = {
    id: Date.now(), date, journal, piece, libelle, ...groupInfo,
    createdAt: new Date().toISOString(),
    lignes: sortLignesDebitAvantCredit(valid).map(l => ({
      compte:  String(l.compte),
      libelle: l.libelle || PC[String(l.compte)] || '',
      debit:   Math.round(parseFloat(l.debit)  || 0),
      credit:  Math.round(parseFloat(l.credit) || 0)
    }))
  };

  const docId = await saveEcritureToFirestore(ecriture);
  if (!docId) return;

  ecritures.push(ecriture);
  pieceCounter++;
  updateStats();
  dismissFillBanner();
  toast(`✓ Écriture [${JOURNAL_NAMES[journal] || journal}] enregistrée — ${piece}`, 'success');

  ecrQueueIdx++;
  if (ecrQueueIdx < ecrQueue.length) {
    loadEcritureFromQueue(ecrQueueIdx);
    updateQueueBar();
    toast(`→ Écriture ${ecrQueueIdx + 1}/${ecrQueue.length} prête`, 'info');
  } else {
    ecrQueue = []; ecrQueueIdx = 0; currentGroupId = null; lignes = [];
    updateQueueBar();
    document.getElementById('ecr-libelle').value = '';
    document.getElementById('ecr-piece').value   = '';
    hideSaisieNotif();
    initSaisie();
  }
}


// ══════════════════════════════════════════════════════════════════
// SECTION 15 — FILE D'ATTENTE IA (QUEUE)
// ══════════════════════════════════════════════════════════════════

async function autoSaveAllEcritures() {
  if (ecrQueue.length === 0) { toast("Aucune écriture en file d'attente", 'error'); return; }

  const total = ecrQueue.length;
  const bar   = document.getElementById('autoSaveBar');
  const msg   = document.getElementById('autoSaveMsg');
  const prog  = document.getElementById('autoSaveProgress');
  if (bar) bar.classList.add('show');

  const date    = document.getElementById('ecr-date').value || new Date().toISOString().split('T')[0];
  const groupId = 'grp_' + Date.now();
  const groupLib = ecrQueue[0]?.libelle || 'Opération ' + new Date().toLocaleDateString('fr-FR');
  let saved = 0;
  const errors = [];

  for (let i = 0; i < ecrQueue.length; i++) {
    const ecr = ecrQueue[i];
    if (msg) msg.innerHTML = `<strong>Enregistrement ${i + 1}/${total}</strong> — [${ecr.journal}] ${ecr.libelle || 'Écriture ' + (i + 1)}`;
    if (prog) prog.style.width = ((i / total) * 100) + '%';

    const valid = (ecr.lignes || []).filter(l => l.compte && (l.debit || l.credit));
    if (valid.length < 2) { errors.push(`Écriture ${i + 1} : moins de 2 lignes valides`); continue; }

    let d = 0, c = 0;
    valid.forEach(l => { d += Math.round(parseFloat(l.debit) || 0); c += Math.round(parseFloat(l.credit) || 0); });

    if (Math.abs(d - c) > 2) {
      errors.push(`Écriture ${i + 1} [${ecr.journal}] : non équilibrée (Δ ${Math.abs(d - c)} FCFA)`);
      continue;
    }

    const piece   = 'N°' + String(pieceCounter).padStart(5, '0');
    const ecriture = {
      id: Date.now() + i, date, journal: ecr.journal || 'OD', piece,
      libelle: ecr.libelle || 'Écriture IA',
      groupId, groupLibelle: groupLib, groupSize: total, groupIdx: i,
      createdAt: new Date().toISOString(),
      lignes: sortLignesDebitAvantCredit(valid).map(l => ({
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

  if (prog) prog.style.width = '100%';
  await new Promise(r => setTimeout(r, 400));
  if (bar) bar.classList.remove('show');

  ecrQueue = []; ecrQueueIdx = 0; lignes = [];
  updateQueueBar(); hideMultiEcrBanner(); hideSaisieNotif(); dismissFillBanner();
  updateStats();

  if (errors.length > 0) {
    toast(`⚠️ ${saved}/${total} écritures — ${errors.length} erreur(s)`, 'error');
  } else {
    toast(`✅ ${saved} écriture${saved > 1 ? 's' : ''} enregistrée${saved > 1 ? 's' : ''} !`, 'success');
  }

  setTimeout(() => { navigate('journal'); renderJournal(); }, 500);
  initSaisie();
}

async function autoSaveAllFromNotif() {
  hideSaisieNotif();
  await autoSaveAllEcritures();
}

function setEcritureQueue(ecrituresAI) {
  ecrQueue = ecrituresAI;
  ecrQueueIdx = 0;
  if (ecrQueue.length > 0) { loadEcritureFromQueue(0); updateQueueBar(); }
}

function loadEcritureFromQueue(idx) {
  if (idx >= ecrQueue.length) return;
  const ecr         = ecrQueue[idx];
  const lignesSorted = sortLignesDebitAvantCredit(ecr.lignes || []);
  lignes = lignesSorted.map(l => ({
    compte:  String(l.compte || ''),
    libelle: l.libelle || PC[String(l.compte)] || '',
    debit:   Math.round(parseFloat(l.debit)  || 0),
    credit:  Math.round(parseFloat(l.credit) || 0)
  }));

  const jSelect  = document.getElementById('ecr-journal');
  const libInput = document.getElementById('ecr-libelle');
  const dateInput = document.getElementById('ecr-date');
  if (jSelect  && ecr.journal)  jSelect.value   = ecr.journal;
  if (libInput && ecr.libelle)  libInput.value  = ecr.libelle;
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
  const bar       = document.getElementById('saisieQueueBar');
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
    loadEcritureFromQueue(ecrQueueIdx);
    updateQueueBar();
    toast(`Écriture ${ecrQueueIdx + 1}/${ecrQueue.length} chargée`, 'info');
  } else {
    ecrQueue = []; ecrQueueIdx = 0; lignes = [];
    addLigne(); addLigne();
    renderLignes(); updateQueueBar(); dismissFillBanner();
  }
}

function dismissFillBanner()  { document.getElementById('aiFillBanner')?.classList.remove('show'); }
function hideMultiEcrBanner() { document.getElementById('multiEcrBanner')?.classList.remove('show'); }
function hideSaisieNotif()    { document.getElementById('saisieNotif')?.classList.remove('show'); }

function showMultiEcrBanner(ecrituresAI) {
  const banner = document.getElementById('multiEcrBanner');
  const list   = document.getElementById('mebList');
  const title  = document.getElementById('mebTitle');
  if (!banner) return;
  title.textContent = `COMEO AI a préparé ${ecrituresAI.length} écriture${ecrituresAI.length > 1 ? 's' : ''} liées`;
  list.innerHTML = ecrituresAI.map((e, i) =>
    `<li><span class="meb-n">${i + 1}</span><span class="meb-jnl">${e.journal || 'OD'}</span><span>${e.libelle || 'Écriture ' + (i + 1)}</span></li>`
  ).join('');
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 60000);
}

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

function goToSaisie() {
  hideSaisieNotif();
  navigate('saisie');
  setTimeout(() => {
    document.querySelector('#view-saisie .card:last-of-type')?.scrollIntoView({ behavior: 'smooth' });
  }, 200);
}


// ══════════════════════════════════════════════════════════════════
// SECTION 16 — FILTRAGE COMMUN
// ══════════════════════════════════════════════════════════════════

function getEcrituresFiltrees(opts = {}) {
  const { dateDebut, dateFin, journal, compte } = opts;
  return ecritures.filter(e => {
    if (dateDebut && e.date < dateDebut) return false;
    if (dateFin   && e.date > dateFin)   return false;
    if (journal   && e.journal !== journal) return false;
    if (compte) return e.lignes.some(l => l.compte?.startsWith(compte));
    return true;
  });
}

function getMap(opts = {}) {
  const ecFiltrees = opts.filtrer ? getEcrituresFiltrees(opts) : ecritures;
  const map = {};
  ecFiltrees.forEach(e => e.lignes.forEach(l => {
    if (!l.compte) return;
    if (!map[l.compte]) map[l.compte] = { debit: 0, credit: 0, mvts: [] };
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


// ══════════════════════════════════════════════════════════════════
// SECTION 17 — JOURNAL
// ══════════════════════════════════════════════════════════════════

function resetJournalFiltre() {
  document.getElementById('jnl-date-debut').value = '';
  document.getElementById('jnl-date-fin').value   = '';
  document.getElementById('journalFilter').value  = '';
  document.getElementById('journalSearch').value  = '';
  const a = document.getElementById('journal-analyse');
  if (a) a.style.display = 'none';
  renderJournal();
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
    if ([e.libelle, e.groupLibelle, e.piece].some(s => s?.toLowerCase().includes(search))) return true;
    return e.lignes.some(l =>
      l.compte?.includes(search) ||
      l.libelle?.toLowerCase().includes(search) ||
      PC[l.compte]?.toLowerCase().includes(search)
    );
  });

  if (!ecFiltered.length) {
    content.innerHTML = `<div class="empty-state"><div class="icon">≡</div><p>Aucune écriture pour cette sélection</p></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  // Regroupement
  const groupMap = {};
  const soloList = [];
  ecFiltered.forEach(e => {
    if (e.groupId) { if (!groupMap[e.groupId]) groupMap[e.groupId] = []; groupMap[e.groupId].push(e); }
    else soloList.push(e);
  });

  const groups = [];
  Object.values(groupMap).forEach(ecrs => {
    const sorted = [...ecrs].sort((a, b) => (a.groupIdx || 0) - (b.groupIdx || 0));
    groups.push({ type:'groupe', date: sorted[0].date, ecritures: sorted, libelle: sorted[0].groupLibelle || sorted[0].libelle, isGroupe: true });
  });
  soloList.forEach(e => groups.push({ type:'solo', date: e.date, ecritures: [e], libelle: e.libelle, isGroupe: false }));
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
        totalLignes += e.lignes.length;
        totalEcritures++;
      });
      totalD += groupD; totalC += groupC;

      const mainJournal = group.ecritures[0]?.journal || 'OD';
      const icon        = JOURNAL_ICONS[mainJournal] || '📋';
      const docIds      = group.ecritures.map(e => `'${e._docId}'`).join(',');
      const ecrIds      = group.ecritures.map(e => e.id).join(',');

      if (group.isGroupe) {
        html += `<div class="jnl-groupe">
          <div class="jnl-groupe-header">
            <div class="jnl-groupe-icon">${icon}</div>
            <div class="jnl-groupe-info">
              <div class="jnl-groupe-libelle" title="${(group.libelle || '').replace(/"/g,'&quot;')}">${group.libelle}</div>
              <div class="jnl-groupe-meta">${date} · ${group.ecritures.length} écritures · ${group.ecritures.map(e => e.piece || '—').join(' · ')}</div>
            </div>
            <div class="jnl-groupe-total">
              <div class="jnl-groupe-total-label">Montant total</div>
              <div class="jnl-groupe-total-val">${fn(groupD)} FCFA</div>
            </div>
            <span class="jnl-groupe-badge-count">${group.ecritures.length} écriture${group.ecritures.length > 1 ? 's' : ''}</span>
            <button class="jnl-groupe-del" onclick="deleteGroupe([${docIds}],[${ecrIds}])">✕ Tout supprimer</button>
          </div>
          <div class="jnl-groupe-body">
            ${group.ecritures.map((e, eIdx) => renderEcritureInGroupe(e, eIdx, group.ecritures.length)).join('')}
          </div>
        </div>`;
      } else {
        const e = group.ecritures[0];
        let eD = 0, eC = 0;
        e.lignes.forEach(l => { eD += l.debit || 0; eC += l.credit || 0; });
        const equil = Math.abs(eD - eC) < 1;
        html += `<div class="jnl-groupe">
          <div class="jnl-groupe-header">
            <div class="jnl-groupe-icon">${JOURNAL_ICONS[e.journal] || '📋'}</div>
            <div class="jnl-groupe-info">
              <div class="jnl-groupe-libelle">${e.libelle || '<em style="opacity:.4">Sans libellé</em>'}</div>
              <div class="jnl-groupe-meta">${date} · ${e.piece || '—'} · ${JOURNAL_NAMES[e.journal] || e.journal}</div>
            </div>
            <div class="jnl-groupe-total">
              <div class="jnl-groupe-total-label">Débit / Crédit</div>
              <div class="jnl-groupe-total-val" style="font-size:11px">
                <span style="color:#60a5fa">${fn(eD)}</span> / <span style="color:#4ade80">${fn(eC)}</span>
              </div>
            </div>
            <span class="jnl-step-equil ${equil ? 'ok' : 'nok'}">${equil ? '✓ EQ' : '✗ NEQ'}</span>
            <button class="jnl-groupe-del" onclick="deleteEcriture('${e._docId}',${e.id})">✕</button>
          </div>
          <div class="jnl-groupe-body">${renderEcritureInGroupe(e, 0, 1)}</div>
        </div>`;
      }
    });
  });

  content.innerHTML = html;

  if (footer) {
    footer.style.display = 'block';
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('jnl-nb-groupes',   groups.length);
    set('jnl-nb-ecr',       totalEcritures);
    set('jnl-nb-lignes',    totalLignes);
    set('jnl-total-debit',  fn(totalD) + ' FCFA');
    set('jnl-total-credit', fn(totalC) + ' FCFA');
    const eqEl = document.getElementById('jnl-equil-label');
    if (eqEl) {
      const balanced = Math.abs(totalD - totalC) < 1;
      eqEl.textContent = balanced ? '✓ Équilibré' : '✗ Déséquilibré';
      eqEl.className   = 'jnl-footer-val ' + (balanced ? 'eq' : 'neq');
    }
  }
}

function renderEcritureInGroupe(e, eIdx, totalInGroupe) {
  let eD = 0, eC = 0;
  e.lignes.forEach(l => { eD += l.debit || 0; eC += l.credit || 0; });
  const equil        = Math.abs(eD - eC) < 1;
  const stepLabel    = getStepLabel(e);
  const lignesAffich = sortLignesDebitAvantCredit(e.lignes);
  return `<div class="jnl-ecriture type-${e.journal}">
    <div class="jnl-ecriture-subheader">
      ${totalInGroupe > 1 ? `<span class="jnl-step-badge">${eIdx + 1}</span>` : ''}
      <span class="jnl-step-jnl-badge ${e.journal}">${e.journal}</span>
      <span class="jnl-step-label">${stepLabel}</span>
      <span class="jnl-step-piece">${e.piece || '—'} · ${JOURNAL_NAMES[e.journal] || e.journal}</span>
      <span class="jnl-step-totaux" style="margin-left:auto">
        <span style="color:#60a5fa">${fn(eD)}</span> / <span style="color:#4ade80">${fn(eC)}</span>
      </span>
      <span class="jnl-step-equil ${equil ? 'ok' : 'nok'}">${equil ? '✓' : '✗'}</span>
      <button class="jnl-step-del" onclick="deleteEcriture('${e._docId}',${e.id})">✕</button>
    </div>
    <div class="jnl-ecriture-body">
      <table class="jnl-lignes-table">
        <thead><tr>
          <th style="width:200px">Compte</th><th>Libellé</th>
          <th class="right" style="width:140px">Débit (FCFA)</th>
          <th class="right" style="width:140px">Crédit (FCFA)</th>
        </tr></thead>
        <tbody>
          ${lignesAffich.map(l => `<tr>
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
  updateStats(); renderJournal();
  toast('Écriture supprimée', 'info');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 18 — GRAND LIVRE
// ══════════════════════════════════════════════════════════════════

function resetGLFiltre() {
  document.getElementById('gl-date-debut').value = '';
  document.getElementById('gl-date-fin').value   = '';
  document.getElementById('glSearch').value       = '';
  renderGrandLivre();
}

function renderGrandLivre() {
  const search    = document.getElementById('glSearch')?.value?.toLowerCase() || '';
  const dateDebut = document.getElementById('gl-date-debut')?.value || '';
  const dateFin   = document.getElementById('gl-date-fin')?.value   || '';
  const opts      = (dateDebut || dateFin) ? { filtrer: true, dateDebut, dateFin } : {};
  const map       = getMap(opts);
  const content   = document.getElementById('grandLivreContent');
  if (!content) return;

  const comptes   = Object.keys(map).sort();
  if (!comptes.length) {
    content.innerHTML = '<div class="empty-state"><div class="icon">⊞</div><p>Aucun mouvement</p></div>';
    return;
  }

  const filtered = comptes.filter(c =>
    !search || c.includes(search) || (PC[c] || '').toLowerCase().includes(search)
  );

  content.innerHTML = filtered.map(code => {
    const acc = map[code];
    const s   = acc.debit - acc.credit;
    const lib = PC[code] || 'Compte ' + code;
    const isD = s >= 0;
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
            <thead><tr>
              <th>Date</th><th>Jnl</th><th>Pièce</th><th>Libellé</th>
              <th style="text-align:right">Débit</th><th style="text-align:right">Crédit</th>
              <th style="text-align:right">Solde progressif</th>
            </tr></thead>
            <tbody>
              ${acc.mvts.map((m, i) => {
                const rD = acc.mvts.slice(0, i + 1).reduce((s, x) => s + x.debit,  0);
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
                    ${rs >= 0 ? 'Sd ' : 'Sc '}${fn(Math.abs(rs))}
                  </td>
                </tr>`;
              }).join('')}
              <tr class="total-row">
                <td colspan="4" style="text-align:right;font-weight:700">TOTAUX</td>
                <td class="debit">${fn(acc.debit)}</td>
                <td class="credit">${fn(acc.credit)}</td>
                <td style="text-align:right;font-family:var(--font-mono);color:${isD ? '#60a5fa' : '#4ade80'}">
                  ${isD ? 'Sd ' : 'Sc '}${fn(Math.abs(s))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleGL(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}


// ══════════════════════════════════════════════════════════════════
// SECTION 19 — BALANCE
// ══════════════════════════════════════════════════════════════════

function resetBalanceFiltre() {
  ['bal-date-debut','bal-date-fin','bal-journal','bal-classe'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const a = document.getElementById('balance-analyse');
  if (a) a.style.display = 'none';
  renderBalance();
}

function renderBalance() {
  const dateDebut = document.getElementById('bal-date-debut')?.value || '';
  const dateFin   = document.getElementById('bal-date-fin')?.value   || '';
  const journal   = document.getElementById('bal-journal')?.value    || '';
  const classe    = document.getElementById('bal-classe')?.value     || '';
  const opts      = (dateDebut || dateFin || journal) ? { filtrer: true, dateDebut, dateFin, journal } : {};
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
    const acc = map[code];
    const s   = acc.debit - acc.credit;
    const sd  = s > 0 ? s  : 0;
    const sc  = s < 0 ? -s : 0;
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

  rows.push(`<tr class="total-row">
    <td colspan="2">TOTAUX GÉNÉRAUX</td>
    <td class="debit">${fn(tD)}</td>
    <td class="credit">${fn(tC)}</td>
    <td style="text-align:right;font-family:var(--font-mono)">${fn(tSD)}</td>
    <td style="text-align:right;font-family:var(--font-mono)">${fn(tSC)}</td>
  </tr>`);

  tbody.innerHTML = rows.join('');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 20 — BILAN
// ══════════════════════════════════════════════════════════════════

function renderBilan() {
  const dateArrete = document.getElementById('bilan-date-arrete')?.value;
  const opts       = dateArrete ? { filtrer: true, dateFin: dateArrete } : {};
  const map        = getMap(opts);
  const content    = document.getElementById('bilanContent');
  if (!content) return;

  if (!Object.keys(map).length) {
    content.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">⊠</div><p>Saisissez des écritures pour générer le bilan</p></div>';
    return;
  }

  const actif  = {
    immob:    { title: 'ACTIF IMMOBILISÉ',                      comptes: [] },
    stocks:   { title: 'STOCKS ET EN-COURS',                    comptes: [] },
    creances: { title: 'CRÉANCES ET EMPLOIS ASSIMILÉS',         comptes: [] },
    treso:    { title: 'TRÉSORERIE-ACTIF',                      comptes: [] }
  };
  const passif = {
    cap: { title: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES',  comptes: [] },
    df:  { title: 'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES',comptes: [] },
    dct: { title: 'PASSIF CIRCULANT',                           comptes: [] },
    tp:  { title: 'TRÉSORERIE-PASSIF',                          comptes: [] }
  };

  Object.entries(map).forEach(([code, acc]) => {
    const s  = acc.debit - acc.credit;
    const cl = code[0];
    const e  = { code, lib: (PC[code] || code).substring(0, 40), solde: Math.abs(s) };
    if      (cl === '2') { if (s > 0) actif.immob.comptes.push(e); }
    else if (cl === '3') { if (s > 0) actif.stocks.comptes.push(e); }
    else if (cl === '4') {
      if (s > 0) actif.creances.comptes.push(e);
      else if (s < 0) passif.dct.comptes.push({ ...e, solde: Math.abs(s) });
    }
    else if (cl === '5') {
      if (s > 0) actif.treso.comptes.push(e);
      else passif.tp.comptes.push({ ...e, solde: Math.abs(s) });
    }
    else if (cl === '1') {
      (parseInt(code) <= 160 ? passif.cap : passif.df)
        .comptes.push({ code, lib: (PC[code] || code).substring(0, 40), solde: Math.abs(s) });
    }
  });

  const renderCol = sections => sections.map(s => {
    if (!s.comptes.length) return '';
    const total = s.comptes.reduce((sum, c) => sum + c.solde, 0);
    return `<div class="bilan-section">
      <div class="bilan-section-title">${s.title}</div>
      ${s.comptes.map(c => `
        <div class="bilan-line">
          <span class="acc-code">${c.code}</span>
          <span class="acc-name">${c.lib}</span>
          <span class="acc-amount">${fn(c.solde)}</span>
        </div>`).join('')}
      <div class="bilan-line" style="font-weight:700;border-bottom:none;margin-top:3px">
        <span class="acc-code"></span>
        <span class="acc-name" style="color:var(--ink)">Sous-total</span>
        <span class="acc-amount">${fn(total)}</span>
      </div>
    </div>`;
  }).join('');

  const tA = [...actif.immob.comptes,  ...actif.stocks.comptes, ...actif.creances.comptes, ...actif.treso.comptes]
    .reduce((s, c) => s + c.solde, 0);
  const tP = [...passif.cap.comptes, ...passif.df.comptes, ...passif.dct.comptes, ...passif.tp.comptes]
    .reduce((s, c) => s + c.solde, 0);

  const label = dateArrete
    ? `Arrêté au ${dateArrete}`
    : `Exercice ${document.getElementById('exerciceYear').value}`;

  content.innerHTML = `
    <div class="bilan-col">
      <div class="bilan-col-header actif">ACTIF — ${label}</div>
      ${renderCol(Object.values(actif))}
      <div class="bilan-total"><span>TOTAL ACTIF</span><span>${fn(tA)} FCFA</span></div>
    </div>
    <div class="bilan-col">
      <div class="bilan-col-header passif">PASSIF — ${label}</div>
      ${renderCol(Object.values(passif))}
      <div class="bilan-total"><span>TOTAL PASSIF</span><span>${fn(tP)} FCFA</span></div>
    </div>`;
}


// ══════════════════════════════════════════════════════════════════
// SECTION 21 — COMPTE DE RÉSULTAT
// ══════════════════════════════════════════════════════════════════

function renderResultat() {
  const map     = getMap();
  const content = document.getElementById('resultatContent');
  if (!content) return;

  if (!Object.keys(map).length) {
    content.innerHTML = '<div class="empty-state"><div class="icon">↗</div><p>Aucune donnée</p></div>';
    return;
  }

  const gt = pfx => Object.entries(map)
    .filter(([c]) => pfx.some(p => c.startsWith(p)))
    .reduce((s, [, a]) => s + (a.debit - a.credit), 0);

  const ventes   = Math.abs(gt(['701','702','703','704','705']));
  const prodsAcc = Math.abs(gt(['707']));
  const autrProd = Math.abs(gt(['75','718','711']));
  const transports = gt(['612','614']);
  const servExt  = gt(['621','622','624','625','626','627','628','631','632','634','635','638']);
  const impTaxes = gt(['641','645']);
  const autresChg= gt(['651','654','658']);
  const personnel= gt(['661','662','663','664']);
  const dap      = gt(['681','691','697']);
  const revFin   = Math.abs(gt(['771','772','773','774','776','777']));
  const chgFin   = gt(['671','673','674','676']);
  const haoP     = Math.abs(gt(['821','822','841']));
  const haoC     = gt(['811','812','831','834','839','851','852','854']);
  const imp      = gt(['891','895']);

  const mc  = ventes - Math.abs(gt(['601'])) - gt(['6031']);
  const ca  = ventes + prodsAcc;
  const va  = ca + autrProd - Math.abs(gt(['601','602','604','605','608'])) - gt(['6031','6032']) - transports - servExt - impTaxes - autresChg;
  const ebe = va - personnel;
  const re  = ebe - dap;
  const rf  = revFin - chgFin;
  const rao = re + rf;
  const rhao= haoP - haoC;
  const res = rao + rhao - imp;

  const rr = (lbl, val, cls = '') =>
    `<div class="rrow ${cls}"><span>${lbl}</span>
      <span class="amount ${val >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(val))} FCFA${val < 0 ? ' (−)' : ''}</span>
    </div>`;

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
    ${rr("→ Résultat d'exploitation (RE — XE)", re, 'total')}
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
    ${rr('IS / IBP — Impôt sur les Bénéfices (891) — CI : 25%', -imp, 'sub')}
    <div class="rrow result">
      <span>${res >= 0 ? "✓ RÉSULTAT NET DE L'EXERCICE — BÉNÉFICE" : "✗ RÉSULTAT NET — PERTE"}</span>
      <span class="amount ${res >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(res))} FCFA</span>
    </div>
  </div>`;
}


// ══════════════════════════════════════════════════════════════════
// SECTION 22 — TRÉSORERIE
// ══════════════════════════════════════════════════════════════════

function renderTresorerie() {
  const map     = getMap();
  const content = document.getElementById('tresorerieContent');
  if (!content) return;

  const tc = Object.entries(map).filter(([c]) => c.startsWith('5'));
  if (!tc.length) {
    content.innerHTML = '<div class="empty-state"><div class="icon">◎</div><p>Aucun mouvement de trésorerie</p></div>';
    return;
  }

  const total = tc.reduce((s, [, a]) => s + (a.debit - a.credit), 0);
  content.innerHTML = `<div class="rlist">
    <div class="rrow header"><span>COMPTES DE TRÉSORERIE — CLASSE 5 — SYSCOHADA</span><span></span></div>
    <div class="rrow header" style="font-size:10px;opacity:.5"><span>Mobile Money (Orange Money, MTN MoMo, Wave, Moov) → Compte 552</span><span></span></div>
    ${tc.map(([code, acc]) => {
      const s = acc.debit - acc.credit;
      return `<div class="rrow sub">
        <span><span class="ct">${code}</span><span style="margin-left:6px">${(PC[code] || '').substring(0, 34)}</span></span>
        <span class="amount ${s >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(s))} FCFA${s < 0 ? ' (Créditeur)' : ''}</span>
      </div>`;
    }).join('')}
    <div class="rrow result">
      <span>Trésorerie nette totale</span>
      <span class="amount ${total >= 0 ? 'pos' : 'neg'}">${fn(Math.abs(total))} FCFA</span>
    </div>
  </div>`;
}


// ══════════════════════════════════════════════════════════════════
// SECTION 23 — PLAN COMPTABLE
// ══════════════════════════════════════════════════════════════════

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

  if (!entries.length) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><p>Aucun compte trouvé</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = entries.map(([code, lib]) => {
    const cl  = code[0];
    const isH = lib === lib.toUpperCase() && lib.length > 3;
    const pad = Math.min((code.length - 1) * 10, 30);
    return `<tr>
      <td><span class="ct">${code}</span></td>
      <td style="padding-left:${pad}px;font-weight:${isH?'600':'400'};color:${isH?'var(--ink)':'var(--slate)'}">${lib.substring(0, 70)}</td>
      <td style="color:var(--muted);font-size:11px">${CLASS_NAMES[cl] || ''}</td>
      <td><span style="font-size:10px;padding:2px 7px;border-radius:3px;background:var(--surface3);color:var(--muted)">${NATURE_MAP[cl] || ''}</span></td>
    </tr>`;
  }).join('');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 24 — EXPORT MODAL
// ══════════════════════════════════════════════════════════════════

function openExportModal() {
  const m = document.getElementById('exportModal');
  if (m) m.style.display = 'flex';
  selectExport('pdf');
  updateExportOptions();
}
function closeExportModal() { document.getElementById('exportModal')?.style && (document.getElementById('exportModal').style.display = 'none'); }

function selectExport(fmt) {
  exportFormat = fmt;
  ['pdf','word','excel'].forEach(f => {
    document.getElementById('opt-' + f)?.classList.toggle('selected', fmt === f);
  });
}

function updateExportOptions() {
  const docType  = document.getElementById('export-doc-type')?.value;
  const jnlFilter = document.getElementById('export-journal-filter');
  if (jnlFilter) jnlFilter.style.display = docType === 'journal' ? 'block' : 'none';
}

function doExport() {
  const docType = document.getElementById('export-doc-type')?.value || 'journal';
  closeExportModal();
  if (docType === 'facture_single') { toast('Sélectionnez une facture dans la liste pour l\'imprimer', 'info'); navigate('factures'); return; }
  if (exportFormat === 'pdf')   exportPDFAvance();
  else if (exportFormat === 'word')  exportWordAvance();
  else if (exportFormat === 'excel') exportExcelAvance();
}

function getFilteredEcrituresForExport() {
  const jnl       = document.getElementById('export-journal-select')?.value || '';
  const dateDebut  = document.getElementById('export-date-debut')?.value   || '';
  const dateFin    = document.getElementById('export-date-fin')?.value     || '';
  return ecritures.filter(e => {
    if (jnl      && e.journal !== jnl)   return false;
    if (dateDebut && e.date < dateDebut)  return false;
    if (dateFin   && e.date > dateFin)    return false;
    return true;
  });
}


// ══════════════════════════════════════════════════════════════════
// SECTION 25 — EXPORT PDF COMPTABILITÉ
// ══════════════════════════════════════════════════════════════════

function exportPDFAvance() {
  const { jsPDF } = window.jspdf;
  const doc       = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const yr        = document.getElementById('exerciceYear').value;
  const company   = currentProfile?.company || 'Entreprise';
  const docType   = document.getElementById('export-doc-type')?.value || 'journal';
  const jnlSel    = document.getElementById('export-journal-select')?.value || '';
  const dD        = document.getElementById('export-date-debut')?.value || '';
  const dF        = document.getElementById('export-date-fin')?.value   || '';
  const pageW     = 210;
  const now       = new Date().toLocaleDateString('fr-FR');

  const DOC_TITLES = {
    journal:'JOURNAL GÉNÉRAL', balance:'BALANCE GÉNÉRALE', grandlivre:'GRAND LIVRE',
    bilan:'BILAN', resultat:'COMPTE DE RÉSULTAT', tresorerie:'TRÉSORERIE', factures:'LISTE DES FACTURES'
  };

  // En-tête
  doc.setFillColor(10, 11, 16); doc.rect(0, 0, pageW, 24, 'F');
  doc.setTextColor(212, 168, 83); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('SYSCOHADA Pro v4 — ' + (DOC_TITLES[docType] || 'DOCUMENT'), 14, 10);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  doc.text(`${company} · Exercice ${yr} · Monnaie FCFA · COMEO AI`, 14, 16);
  doc.setTextColor(180, 180, 180); doc.setFontSize(7);
  const periode  = (dD || dF) ? `Période : ${dD || 'début'} → ${dF || 'fin'}` : 'Exercice complet';
  const jnlLabel = jnlSel ? ` · Journal : ${JOURNAL_NAMES[jnlSel] || jnlSel}` : '';
  doc.text(periode + jnlLabel + ` · Édité le ${now}`, pageW - 14, 16, { align: 'right' });
  doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.4); doc.line(14, 26, pageW - 14, 26);

  if (docType === 'journal') {
    const ecrs = getFilteredEcrituresForExport();
    let rows = [], totalD = 0, totalC = 0;
    ecrs.forEach(e => {
      sortLignesDebitAvantCredit(e.lignes).forEach(l => {
        rows.push([e.date, e.journal, e.piece || '', l.compte, (PC[l.compte]||'').substring(0,24), l.libelle||e.libelle||'', l.debit?fn(l.debit):'', l.credit?fn(l.credit):'']);
        totalD += l.debit || 0; totalC += l.credit || 0;
      });
    });
    doc.autoTable({
      startY: 30,
      head: [['Date','Jnl','Pièce','Compte','Libellé compte','Libellé opération','Débit FCFA','Crédit FCFA']],
      body: rows, foot: [['','','','','','TOTAUX', fn(totalD), fn(totalC)]],
      styles:{ font:'helvetica', fontSize:7.5, cellPadding:2.5 },
      headStyles:{ fillColor:[10,11,16], textColor:[212,168,83], fontStyle:'bold', fontSize:7 },
      footStyles:{ fillColor:[30,34,54], textColor:[212,168,83], fontStyle:'bold', fontSize:8 },
      alternateRowStyles:{ fillColor:[250,248,244] },
      columnStyles:{ 0:{cellWidth:18}, 1:{cellWidth:10,halign:'center'}, 2:{cellWidth:16}, 3:{cellWidth:14,fontStyle:'bold'}, 4:{cellWidth:26}, 5:{cellWidth:38}, 6:{cellWidth:20,halign:'right'}, 7:{cellWidth:20,halign:'right'} },
      margin:{ left:14, right:14 }
    });

  } else if (docType === 'balance') {
    const map   = getMap();
    const rows  = Object.entries(map).sort().map(([code, acc]) => {
      const s = acc.debit - acc.credit;
      return [code, (PC[code]||'').substring(0,40), fn(acc.debit), fn(acc.credit), s>0?fn(s):'', s<0?fn(-s):''];
    });
    doc.autoTable({
      startY:30,
      head:[['Compte','Libellé','Mvt Débit','Mvt Crédit','Solde Débiteur','Solde Créditeur']],
      body:rows,
      styles:{ font:'helvetica', fontSize:8, cellPadding:3 },
      headStyles:{ fillColor:[10,11,16], textColor:[212,168,83], fontStyle:'bold', fontSize:7 },
      alternateRowStyles:{ fillColor:[250,248,244] },
      columnStyles:{ 2:{halign:'right'}, 3:{halign:'right'}, 4:{halign:'right'}, 5:{halign:'right'} },
      margin:{ left:14, right:14 }
    });

  } else if (docType === 'factures') {
    const rows = facturesList.map(f => [f.numero, f.type, f.dateEmission||'', f.clientNom||'', fn(f.ht), fn(f.tva), fn(f.ttc), f.statut]);
    doc.autoTable({
      startY:30,
      head:[['N° Facture','Type','Date','Client','HT','TVA','TTC','Statut']],
      body:rows,
      styles:{ font:'helvetica', fontSize:8, cellPadding:3 },
      headStyles:{ fillColor:[10,11,16], textColor:[212,168,83], fontStyle:'bold', fontSize:7 },
      alternateRowStyles:{ fillColor:[250,248,244] },
      columnStyles:{ 4:{halign:'right'}, 5:{halign:'right'}, 6:{halign:'right',fontStyle:'bold'} },
      margin:{ left:14, right:14 }
    });
  }

  doc.save(`COMEO_${(DOC_TITLES[docType]||docType).replace(/\s+/g,'_')}_${company.replace(/\s+/g,'_')}_${yr}.pdf`);
  toast('✓ PDF exporté', 'success');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 26 — EXPORT WORD & EXCEL COMPTABILITÉ
// ══════════════════════════════════════════════════════════════════

function exportWordAvance() {
  const yr      = document.getElementById('exerciceYear').value;
  const company = currentProfile?.company || 'Entreprise';
  const docType = document.getElementById('export-doc-type')?.value || 'journal';
  const jnlSel  = document.getElementById('export-journal-select')?.value || '';
  const now     = new Date().toLocaleDateString('fr-FR');
  const DOC_TITLES = { journal:'JOURNAL GÉNÉRAL', balance:'BALANCE GÉNÉRALE', factures:'LISTE DES FACTURES' };

  let tableHTML = '';
  const th = 'background:#0a0b10;color:#d4a853;padding:6pt 10pt;font-size:9pt;text-align:left;text-transform:uppercase';
  const td = 'border-bottom:1pt solid #e0dbd0;padding:5pt 10pt';

  if (docType === 'journal') {
    let totalD = 0, totalC = 0, rows = '';
    getFilteredEcrituresForExport().forEach(e => {
      sortLignesDebitAvantCredit(e.lignes).forEach(l => {
        rows += `<tr><td>${e.date}</td><td>${e.journal}</td><td>${e.piece||''}</td><td>${l.compte}</td><td>${(PC[l.compte]||'').substring(0,26)}</td><td>${l.libelle||e.libelle||''}</td><td align="right">${l.debit?fn(l.debit):''}</td><td align="right">${l.credit?fn(l.credit):''}</td></tr>`;
        totalD += l.debit || 0; totalC += l.credit || 0;
      });
    });
    rows += `<tr style="font-weight:bold;background:#f0ece3"><td colspan="6">TOTAUX</td><td align="right">${fn(totalD)}</td><td align="right">${fn(totalC)}</td></tr>`;
    tableHTML = `<table><thead><tr><th>Date</th><th>Jnl</th><th>Pièce</th><th>Compte</th><th>Libellé compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr></thead><tbody>${rows}</tbody></table>`;

  } else if (docType === 'balance') {
    let rows = '';
    Object.entries(getMap()).sort().forEach(([code, acc]) => {
      const s = acc.debit - acc.credit;
      rows += `<tr><td>${code}</td><td>${(PC[code]||'').substring(0,40)}</td><td align="right">${fn(acc.debit)}</td><td align="right">${fn(acc.credit)}</td><td align="right">${s>0?fn(s):''}</td><td align="right">${s<0?fn(-s):''}</td></tr>`;
    });
    tableHTML = `<table><thead><tr><th>Compte</th><th>Libellé</th><th>Mvt Débit</th><th>Mvt Crédit</th><th>Solde Débiteur</th><th>Solde Créditeur</th></tr></thead><tbody>${rows}</tbody></table>`;

  } else if (docType === 'factures') {
    let rows = '';
    facturesList.forEach(f => { rows += `<tr><td>${f.numero}</td><td>${f.type}</td><td>${f.dateEmission||''}</td><td>${f.clientNom||''}</td><td align="right">${fn(f.ht)}</td><td align="right">${fn(f.tva)}</td><td align="right"><strong>${fn(f.ttc)}</strong></td><td>${f.statut}</td></tr>`; });
    tableHTML = `<table><thead><tr><th>N° Facture</th><th>Type</th><th>Date</th><th>Client</th><th>HT</th><th>TVA</th><th>TTC</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  const html = `<html><head><meta charset="utf-8"><style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;margin:40pt}h1{font-size:16pt}table{width:100%;border-collapse:collapse;margin:10pt 0}th{${th}}td{${td}}tr:nth-child(even) td{background:#faf8f4}</style></head>
  <body><h1>COMEO AI v4 — ${DOC_TITLES[docType]||docType}</h1>
  <p>${company} · Exercice ${yr}${jnlSel?' · Journal '+JOURNAL_NAMES[jnlSel]:''} · Édité le ${now}</p>
  ${tableHTML}</body></html>`;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `COMEO_${docType}_${company.replace(/\s+/g,'_')}_${yr}.doc`;
  a.click();
  toast('✓ Word exporté', 'success');
}

function exportExcelAvance() {
  const yr      = document.getElementById('exerciceYear').value;
  const company = currentProfile?.company || 'Entreprise';
  const docType = document.getElementById('export-doc-type')?.value || 'journal';
  const jnlSel  = document.getElementById('export-journal-select')?.value || '';
  let rows      = [];

  if (docType === 'journal') {
    rows = [['Date','Journal','Pièce','Compte','Libellé compte','Libellé opération','Débit FCFA','Crédit FCFA']];
    getFilteredEcrituresForExport().forEach(e => {
      sortLignesDebitAvantCredit(e.lignes).forEach(l => {
        rows.push([e.date, e.journal, e.piece||'', l.compte, PC[l.compte]||'', l.libelle||e.libelle||'', l.debit||0, l.credit||0]);
      });
    });
  } else if (docType === 'balance') {
    rows = [['Compte','Libellé','Mvt Débit','Mvt Crédit','Solde Débiteur','Solde Créditeur']];
    Object.entries(getMap()).sort().forEach(([code, acc]) => {
      const s = acc.debit - acc.credit;
      rows.push([code, PC[code]||'', acc.debit, acc.credit, s>0?s:0, s<0?-s:0]);
    });
  } else if (docType === 'factures') {
    rows = [['N° Facture','Type','Date émission','Date échéance','Client','HT','TVA','TTC','Montant payé','Statut']];
    facturesList.forEach(f => rows.push([f.numero, f.type, f.dateEmission||'', f.dateEcheance||'', f.clientNom||'', f.ht, f.tva, f.ttc, f.montantPaye||0, f.statut]));
  } else if (docType === 'grandlivre') {
    rows = [['Compte','Libellé compte','Date','Journal','Pièce','Libellé opération','Débit','Crédit','Solde progressif']];
    Object.entries(getMap()).sort().forEach(([code, acc]) => {
      let solde = 0;
      acc.mvts.forEach(m => {
        solde += m.debit - m.credit;
        rows.push([code, PC[code]||'', m.date, m.journal, m.piece||'', m.libelle||'', m.debit||0, m.credit||0, Math.abs(solde)]);
      });
    });
  }

  const header = [
    [`COMEO AI v4 — ${docType.toUpperCase()}`,'','','','','','',''],
    [company, 'Exercice '+yr, jnlSel?'Journal: '+JOURNAL_NAMES[jnlSel]:'Tous journaux','','','','',''],
    [],
    ...rows
  ];

  const csv  = header.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a    = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `COMEO_${docType}_${company.replace(/\s+/g,'_')}_${yr}.csv`;
  a.click();
  toast('✓ Excel (CSV) exporté', 'success');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 27 — FACTURES — LIGNES & CALCULS
// ══════════════════════════════════════════════════════════════════

function calcLigneHT(l) {
  return Math.round((l.qte || 0) * (l.pu || 0) * (1 - (l.remise || 0) / 100));
}
function calcLigneTVA(l) {
  return Math.round(calcLigneHT(l) * (l.tva || 0) / 100);
}

function addFacLigne(des = '', qte = 1, pu = 0, remise = 0, tva = 18) {
  facLignes.push({ designation: des, qte, pu, remise, tva });
  renderFacLignes();
}
function removeFacLigne(i) { facLignes.splice(i, 1); renderFacLignes(); }

function renderFacLignes() {
  const tbody = document.getElementById('facLignesBody');
  if (!tbody) return;
  if (facLignes.length === 0) addFacLigne();

  tbody.innerHTML = facLignes.map((l, i) => `
    <tr>
      <td style="padding:4px 6px">
        <input type="text" value="${l.designation || ''}" placeholder="Description du produit/service…"
          style="width:100%;background:transparent;border:none;color:var(--ink);font-size:12px;font-family:var(--font-body);outline:none;padding:4px 6px"
          oninput="facLignes[${i}].designation=this.value">
      </td>
      <td style="padding:4px 6px">
        <input type="number" value="${l.qte}" min="0" step="0.001"
          style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:3px;color:var(--ink);font-size:12px;font-family:var(--font-mono);text-align:right;padding:4px 6px"
          oninput="facLignes[${i}].qte=parseFloat(this.value)||0;updateFacTotaux()">
      </td>
      <td style="padding:4px 6px">
        <input type="number" value="${l.pu}" min="0"
          style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:3px;color:var(--ink);font-size:12px;font-family:var(--font-mono);text-align:right;padding:4px 6px"
          oninput="facLignes[${i}].pu=parseFloat(this.value)||0;updateFacTotaux()">
      </td>
      <td style="padding:4px 6px">
        <input type="number" value="${l.remise}" min="0" max="100"
          style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:3px;color:var(--ink);font-size:12px;font-family:var(--font-mono);text-align:right;padding:4px 6px"
          oninput="facLignes[${i}].remise=parseFloat(this.value)||0;updateFacTotaux()">
      </td>
      <td style="padding:4px 6px">
        <input type="number" value="${l.tva}" min="0" max="100"
          style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:3px;color:var(--ink);font-size:12px;font-family:var(--font-mono);text-align:right;padding:4px 6px"
          oninput="facLignes[${i}].tva=parseFloat(this.value)||18;updateFacTotaux()">
      </td>
      <td style="padding:4px 6px;text-align:right;font-family:var(--font-mono);font-size:11px;color:var(--ink)">${fn(calcLigneHT(l))}</td>
      <td style="padding:4px 6px"><button class="del-line" onclick="removeFacLigne(${i})">✕</button></td>
    </tr>`).join('');

  updateFacTotaux();
}

function updateFacTotaux() {
  const remiseG = parseFloat(document.getElementById('fac-remise-globale')?.value || 0);
  let ht = 0, tvaTotal = 0;
  facLignes.forEach(l => { ht += calcLigneHT(l); tvaTotal += calcLigneTVA(l); });
  const remiseMt = Math.round(ht * remiseG / 100);
  const htNet    = ht - remiseMt;
  const tvaNet   = Math.round(tvaTotal * (1 - remiseG / 100));
  const ttc      = htNet + tvaNet;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('fac-subtotal',  fn(ht)     + ' FCFA');
  set('fac-tva-total', fn(tvaNet) + ' FCFA');
  set('fac-ttc-total', fn(ttc)    + ' FCFA');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 28 — FACTURES — MODAL OUVRIR/FERMER
// ══════════════════════════════════════════════════════════════════

function openFactureModal(id = null) {
  editingFactureId = id;
  facLignes.length = 0;
  const modal = document.getElementById('factureModal');
  const title = document.getElementById('factureModalTitle');
  if (!modal) return;

  const today    = new Date().toISOString().split('T')[0];
  const echeance = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

  if (id) {
    const fac = facturesList.find(f => f.id === id);
    if (!fac) return;
    if (title) title.textContent = 'Modifier la facture ' + fac.numero;
    set('fac-numero',         fac.numero);
    set('fac-type',           fac.type || 'facture');
    set('fac-date-emission',  fac.dateEmission || today);
    set('fac-date-echeance',  fac.dateEcheance || echeance);
    set('fac-client-search',  fac.clientNom || '');
    set('fac-ref',            fac.reference || '');
    set('fac-client-adresse', fac.clientAdresse || '');
    set('fac-client-email',   fac.clientEmail || '');
    set('fac-client-tel',     fac.clientTel || '');
    set('fac-notes',          fac.notes || '');
    set('fac-mode-reglement', fac.modeReglement || 'virement');
    set('fac-conditions',     fac.conditions || '30j');
    set('fac-monnaie',        fac.monnaie || 'FCFA');
    set('fac-remise-globale', fac.remiseGlobale || 0);
    (fac.lignes || []).forEach(l => facLignes.push(l));
  } else {
    if (title) title.textContent = 'Nouvelle Facture';
    set('fac-numero',         'FAC-' + new Date().getFullYear() + '-' + String(factureCounter).padStart(4,'0'));
    set('fac-type',           'facture');
    set('fac-date-emission',  today);
    set('fac-date-echeance',  echeance);
    set('fac-client-search',  '');
    set('fac-ref',            '');
    set('fac-client-adresse', '');
    set('fac-client-email',   '');
    set('fac-client-tel',     '');
    set('fac-notes',          '');
    set('fac-remise-globale', 0);
  }

  renderFacLignes();
  modal.style.display = 'flex';
}

function closeFactureModal() { document.getElementById('factureModal').style.display = 'none'; }
function openDevisModal()    { openFactureModal(); document.getElementById('fac-type').value = 'proforma'; }

function searchClientDrop(q) {
  const drop = document.getElementById('drop-client');
  if (!drop) return;
  if (!q || q.length < 1) { drop.classList.remove('open'); return; }
  const matches = clientsList.filter(c =>
    c.nom.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 8);
  if (!matches.length) { drop.classList.remove('open'); return; }
  drop.innerHTML = matches.map(c =>
    `<div class="aoption" onmousedown="selectClientForFac(${c.id})">
      <span class="code">${c.code}</span><span class="name">${c.nom}</span>
    </div>`
  ).join('');
  drop.classList.add('open');
}

function selectClientForFac(id) {
  const cli = clientsList.find(c => c.id === id);
  if (!cli) return;
  const set = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v; };
  set('fac-client-search',  cli.nom);
  set('fac-client-email',   cli.email || '');
  set('fac-client-tel',     cli.tel   || '');
  set('fac-client-adresse', cli.adresse || '');
  document.getElementById('drop-client').classList.remove('open');
  const inp = document.getElementById('fac-client-search');
  if (inp) inp.dataset.clientId = id;
}

function newFactureForClient(clientId) {
  const cli = clientsList.find(c => c.id === clientId);
  openFactureModal();
  if (cli) {
    setTimeout(() => {
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      set('fac-client-search',  cli.nom);
      set('fac-client-email',   cli.email   || '');
      set('fac-client-tel',     cli.tel     || '');
      set('fac-client-adresse', cli.adresse || '');
    }, 100);
  }
  navigate('factures');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 29 — FACTURES — SAUVEGARDE & AUTO-COMPTABILISATION
// ══════════════════════════════════════════════════════════════════

async function saveFacture(statut = 'brouillon') {
  const clientNom = document.getElementById('fac-client-search').value.trim();
  if (!clientNom) { toast('Le client est obligatoire', 'error'); return; }
  if (!facLignes.filter(l => l.designation).length) { toast('Ajoutez au moins une ligne', 'error'); return; }

  const remiseG    = parseFloat(document.getElementById('fac-remise-globale').value || 0);
  let ht = 0, tvaTotal = 0;
  facLignes.forEach(l => { ht += calcLigneHT(l); tvaTotal += calcLigneTVA(l); });
  const remiseMt = Math.round(ht * remiseG / 100);
  const htNet    = ht - remiseMt;
  const tvaNet   = Math.round(tvaTotal * (1 - remiseG / 100));
  const ttc      = htNet + tvaNet;

  const clientId = parseInt(document.getElementById('fac-client-search').dataset?.clientId || 0);
  const get = id => document.getElementById(id)?.value || '';

  const facture = {
    id:            editingFactureId || Date.now(),
    numero:        get('fac-numero'),
    type:          get('fac-type'),
    dateEmission:  get('fac-date-emission'),
    dateEcheance:  get('fac-date-echeance'),
    clientId, clientNom,
    clientAdresse: get('fac-client-adresse'),
    clientEmail:   get('fac-client-email'),
    clientTel:     get('fac-client-tel'),
    reference:     get('fac-ref'),
    notes:         get('fac-notes'),
    modeReglement: get('fac-mode-reglement'),
    conditions:    get('fac-conditions'),
    monnaie:       get('fac-monnaie'),
    remiseGlobale: remiseG,
    lignes:        facLignes.filter(l => l.designation),
    ht: htNet, tva: tvaNet, ttc,
    statut, montantPaye: 0,
    createdAt: new Date().toISOString()
  };

  // Auto-retard
  if (statut === 'envoyee' && facture.dateEcheance < new Date().toISOString().split('T')[0]) {
    facture.statut = 'retard';
  }

  try {
    const col = window._fbCollection(window._db, 'profiles', currentProfile.id, 'factures');
    if (editingFactureId) {
      const existing = facturesList.find(f => f.id === editingFactureId);
      if (existing?._docId) {
        await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'factures', existing._docId), facture);
        const idx = facturesList.findIndex(f => f.id === editingFactureId);
        facturesList[idx] = { ...facture, _docId: existing._docId };
      }
    } else {
      const ref = await window._fbAddDoc(col, facture);
      facturesList.push({ ...facture, _docId: ref.id });
      factureCounter++;
    }

    if (statut === 'envoyee' && facture.type === 'facture') {
      await autoComptabiliserFacture(facture);
    }

    closeFactureModal(); renderFactures();
    toast(`✓ Facture ${facture.numero} enregistrée (${statut})`, 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}

async function autoComptabiliserFacture(fac) {
  const date    = fac.dateEmission;
  const groupId = 'grp_fac_' + fac.id;
  const ecr = {
    id: Date.now(), date, journal: 'VE', piece: fac.numero,
    libelle:      `Facture ${fac.numero} — ${fac.clientNom}`,
    groupId, groupLibelle: `Vente — ${fac.clientNom}`, groupSize: 1, groupIdx: 0,
    createdAt: new Date().toISOString(),
    lignes: sortLignesDebitAvantCredit([
      { compte: '411',  libelle: `Client ${fac.clientNom}`,     debit: fac.ttc, credit: 0 },
      { compte: '701',  libelle: 'Ventes de marchandises',       debit: 0, credit: fac.ht  },
      { compte: '4431', libelle: 'TVA facturée sur ventes',      debit: 0, credit: fac.tva }
    ])
  };
  const docId = await saveEcritureToFirestore(ecr);
  if (docId) { ecritures.push(ecr); pieceCounter++; updateStats(); }
}

async function marquerPayee(id) {
  const fac = facturesList.find(f => f.id === id);
  if (!fac) return;
  fac.statut = 'payee'; fac.montantPaye = fac.ttc;
  try {
    if (fac._docId) await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'factures', fac._docId), fac);
    const ecr = {
      id: Date.now(), date: new Date().toISOString().split('T')[0], journal: 'BQ',
      piece: fac.numero, libelle: `Règlement facture ${fac.numero} — ${fac.clientNom}`,
      groupId: 'grp_regfac_' + fac.id, groupLibelle: 'Règlement client', groupSize: 1, groupIdx: 0,
      createdAt: new Date().toISOString(),
      lignes: sortLignesDebitAvantCredit([
        { compte: '521', libelle: 'Banques locales',       debit: fac.ttc, credit: 0 },
        { compte: '411', libelle: `Client ${fac.clientNom}`, debit: 0, credit: fac.ttc }
      ])
    };
    const docId = await saveEcritureToFirestore(ecr);
    if (docId) { ecritures.push(ecr); updateStats(); }
    renderFactures();
    toast(`✓ Facture ${fac.numero} payée + écriture banque générée`, 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}

async function supprimerFacture(id) {
  if (!confirm('Supprimer cette facture ?')) return;
  const fac = facturesList.find(f => f.id === id);
  if (fac?._docId) await window._fbDeleteDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'factures', fac._docId));
  facturesList = facturesList.filter(f => f.id !== id);
  renderFactures();
  toast('Facture supprimée', 'info');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 30 — FACTURES — AFFICHAGE LISTE
// ══════════════════════════════════════════════════════════════════

function resetFactureFiltre() {
  ['fac-date-debut','fac-date-fin','fac-statut','fac-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderFactures();
}

function renderFactures() {
  const dateDebut = document.getElementById('fac-date-debut')?.value || '';
  const dateFin   = document.getElementById('fac-date-fin')?.value   || '';
  const statut    = document.getElementById('fac-statut')?.value     || '';
  const search    = (document.getElementById('fac-search')?.value || '').toLowerCase();
  const tbody     = document.getElementById('facturesBody');
  if (!tbody) return;

  const today = new Date().toISOString().split('T')[0];
  facturesList.forEach(f => {
    if (f.statut === 'envoyee' && f.dateEcheance && f.dateEcheance < today) f.statut = 'retard';
  });

  const filtered = facturesList.filter(f => {
    if (dateDebut && f.dateEmission < dateDebut) return false;
    if (dateFin   && f.dateEmission > dateFin)   return false;
    if (statut    && f.statut !== statut)          return false;
    if (search && !f.clientNom?.toLowerCase().includes(search) && !f.numero?.toLowerCase().includes(search)) return false;
    return true;
  });

  // KPIs
  const all = facturesList.filter(f => f.statut !== 'annulee');
  const kpi = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  kpi('fkpi-total',   fs(all.reduce((s,f) => s+(f.ttc||0), 0)));
  kpi('fkpi-paye',    fs(all.filter(f=>f.statut==='payee').reduce((s,f) => s+(f.ttc||0), 0)));
  kpi('fkpi-attente', fs(all.filter(f=>f.statut==='envoyee').reduce((s,f) => s+(f.ttc||0), 0)));
  kpi('fkpi-retard',  fs(all.filter(f=>f.statut==='retard').reduce((s,f) => s+(f.ttc||0), 0)));
  kpi('fkpi-nb', all.length);

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><p>Aucune facture</p></div></td></tr>';
    return;
  }

  const STATUT_LABELS = {
    brouillon:'Brouillon', envoyee:'Envoyée', payee:'Payée',
    partielle:'Partielle', annulee:'Annulée', retard:'En retard'
  };

  tbody.innerHTML = filtered.map(f => {
    const reste = (f.ttc || 0) - (f.montantPaye || 0);
    return `<tr class="fac-row-${f.statut}">
      <td><strong style="font-family:var(--font-mono);font-size:11px">${f.numero}</strong></td>
      <td style="font-size:11px;font-family:var(--font-mono)">${f.dateEmission || '—'}</td>
      <td style="font-size:11px;font-family:var(--font-mono);color:${f.statut==='retard'?'var(--red)':'var(--muted)'}">${f.dateEcheance || '—'}</td>
      <td style="font-weight:500">${f.clientNom || '—'}</td>
      <td style="text-align:right;font-family:var(--font-mono)">${fn(f.ht)}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:#60a5fa">${fn(f.tva)}</td>
      <td style="text-align:right;font-family:var(--font-mono);font-weight:700">${fn(f.ttc)}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:${reste>0?'var(--red)':'var(--green)'}">${fn(f.montantPaye||0)}</td>
      <td><span class="statut-badge statut-${f.statut}">${STATUT_LABELS[f.statut]||f.statut}</span></td>
      <td style="display:flex;gap:4px;flex-wrap:wrap">
        <button class="btn-action" onclick="exportFacturePDF(${f.id})">📄 PDF</button>
        <button class="btn-action" onclick="exportFactureWord(${f.id})">📝 Word</button>
        <button class="btn-action" onclick="exportFactureExcel(${f.id})">📊 Excel</button>
        ${f.statut !== 'payee' && f.statut !== 'annulee' ? `<button class="btn-action" onclick="marquerPayee(${f.id})">✓ Payée</button>` : ''}
        <button class="btn-action" onclick="openFactureModal(${f.id})">✎</button>
        <button class="btn-action danger" onclick="supprimerFacture(${f.id})">✕</button>
      </td>
    </tr>`;
  }).join('');
}

function renderDevis() {
  const tbody = document.getElementById('devisBody');
  if (!tbody) return;
  const devis = facturesList.filter(f => f.type === 'proforma');
  if (!devis.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Aucun devis</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = devis.map(f => `<tr>
    <td><strong style="font-family:var(--font-mono);font-size:11px">${f.numero}</strong></td>
    <td style="font-size:11px">${f.dateEmission}</td>
    <td style="font-size:11px">${f.dateEcheance || '—'}</td>
    <td>${f.clientNom}</td>
    <td style="text-align:right;font-family:var(--font-mono);font-weight:700">${fn(f.ttc)}</td>
    <td><span class="statut-badge statut-${f.statut}">${f.statut}</span></td>
    <td>
      <button class="btn-action" onclick="convertirDevisEnFacture(${f.id})">→ Convertir</button>
      <button class="btn-action" onclick="exportFacturePDF(${f.id})">📄 PDF</button>
      <button class="btn-action danger" onclick="supprimerFacture(${f.id})">✕</button>
    </td>
  </tr>`).join('');
}

async function convertirDevisEnFacture(id) {
  const dev = facturesList.find(f => f.id === id);
  if (!dev) return;
  dev.type = 'facture'; dev.statut = 'envoyee';
  dev.numero = 'FAC-' + new Date().getFullYear() + '-' + String(factureCounter).padStart(4,'0');
  factureCounter++;
  try {
    if (dev._docId) await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'factures', dev._docId), dev);
    await autoComptabiliserFacture(dev);
    renderFactures(); renderDevis();
    toast(`✓ Devis converti en facture ${dev.numero}`, 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}


// ══════════════════════════════════════════════════════════════════
// SECTION 31 — EXPORT FACTURE PDF / WORD / EXCEL
// ══════════════════════════════════════════════════════════════════

function exportFacturePDF(id) {
  const fac     = facturesList.find(f => f.id === id);
  if (!fac) return;
  const { jsPDF } = window.jspdf;
  const doc     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const company = currentProfile?.company || 'Mon Entreprise';
  const monnaie = fac.monnaie || 'FCFA';
  const pageW   = 210;
  const typeLabel = { facture:'FACTURE', proforma:'PROFORMA', avoir:'AVOIR', acompte:'ACOMPTE' };

  // En-tête
  doc.setFillColor(10, 11, 16); doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(212, 168, 83); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(company, 14, 12);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('SYSCOHADA Révisé 2017 · COMEO AI v4', 14, 19);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text(typeLabel[fac.type] || 'FACTURE', pageW - 14, 12, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(255, 200, 100);
  doc.text(fac.numero, pageW - 14, 19, { align: 'right' });
  doc.setTextColor(180, 180, 180); doc.setFontSize(7);
  doc.text('Emise le ' + (fac.dateEmission||'-') + ' - Echeance ' + (fac.dateEcheance||'-'), pageW - 14, 24, { align: 'right' });

  // Émetteur / Client
  doc.setTextColor(10, 11, 16); doc.setFontSize(8);
  doc.setFont('helvetica', 'bold'); doc.text('EMETTEUR', 14, 38);
  doc.setFont('helvetica', 'normal'); doc.text(company, 14, 44); doc.text('Abidjan, Cote d\'Ivoire', 14, 49);
  doc.setFont('helvetica', 'bold'); doc.text('CLIENT / DEBITEUR', 110, 38);
  doc.setFont('helvetica', 'normal'); doc.text(fac.clientNom || '—', 110, 44);
  if (fac.clientAdresse) doc.text(fac.clientAdresse, 110, 49);
  if (fac.clientEmail)   doc.text(fac.clientEmail, 110, 54);
  if (fac.reference)   { doc.setFont('helvetica','italic'); doc.text('Réf : ' + fac.reference, 14, 56); }

  doc.setDrawColor(212, 168, 83); doc.setLineWidth(0.4); doc.line(14, 62, pageW - 14, 62);

  // Lignes
  const rows = (fac.lignes || []).filter(l => l.designation).map(l => [
    l.designation, String(l.qte), fnPDF(l.pu),
    (l.remise || 0) + '%', (l.tva || 18) + '%',
    fnPDF(calcLigneHT(l)) + ' ' + monnaie
  ]);
  doc.autoTable({
    startY: 66,
    head: [['Désignation','Qté','P.U. HT','Remise','TVA','Total HT']],
    body: rows,
    styles:{ font:'helvetica', fontSize:8, cellPadding:3 },
    headStyles:{ fillColor:[10,11,16], textColor:[212,168,83], fontStyle:'bold', fontSize:7 },
    alternateRowStyles:{ fillColor:[250,248,244] },
    columnStyles:{ 0:{cellWidth:'auto'}, 1:{cellWidth:18,halign:'right'}, 2:{cellWidth:28,halign:'right'}, 3:{cellWidth:18,halign:'right'}, 4:{cellWidth:14,halign:'right'}, 5:{cellWidth:34,halign:'right',fontStyle:'bold'} },
    margin:{ left:14, right:14 }
  });

  let y = doc.lastAutoTable.finalY + 8;

  // Totaux
  const totaux = [
    ['Sous-total HT', fnPDF(fac.ht) + ' ' + monnaie],
    ['TVA',           fnPDF(fac.tva) + ' ' + monnaie],
    ['TOTAL TTC',     fnPDF(fac.ttc) + ' ' + monnaie]
  ];
  totaux.forEach(([label, val], i) => {
    const isTotal = i === totaux.length - 1;
    if (isTotal) { doc.setFillColor(10,11,16); doc.rect(pageW-14-90, y-4, 90, 10, 'F'); doc.setTextColor(212,168,83); }
    else doc.setTextColor(80,80,80);
    doc.setFontSize(isTotal ? 10 : 8); doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.text(label, pageW-14-92, y+2, { align:'right' });
    doc.text(val,   pageW-14,    y+2, { align:'right' });
    y += 10;
  });

  if (fac.notes) { y += 6; doc.setTextColor(120,120,120); doc.setFontSize(7.5); doc.text(fac.notes.substring(0,200), 14, y); y += 8; }

  y = Math.max(y + 10, 270);
  doc.setDrawColor(200,192,176); doc.setLineWidth(0.3); doc.line(14, y, pageW-14, y);
  doc.setTextColor(150,150,150); doc.setFontSize(7); doc.setFont('helvetica','normal');
  doc.text('Reglement par ' + (fac.modeReglement||'virement') + ' - COMEO AI v4 - SYSCOHADA', 14, y+5);
  doc.text('Page 1/1', pageW-14, y+5, { align:'right' });

  doc.save(`${(fac.type||'facture').toUpperCase()}_${fac.numero}_${(fac.clientNom||'').replace(/\s+/g,'_')}.pdf`);
  toast('✓ PDF généré : ' + fac.numero, 'success');
}

function exportFactureWord(id) {
  const fac     = facturesList.find(f => f.id === id);
  if (!fac) return;
  const company = currentProfile?.company || 'Mon Entreprise';
  const monnaie = fac.monnaie || 'FCFA';

  const lignesHTML = (fac.lignes || []).filter(l => l.designation).map((l, i) =>
    `<tr style="background:${i%2===0?'#fff':'#fafafa'}">
      <td>${l.designation}</td><td align="right">${l.qte}</td>
      <td align="right">${fn(l.pu)}</td><td align="right">${l.remise||0}%</td>
      <td align="right">${l.tva||18}%</td>
      <td align="right"><strong>${fn(calcLigneHT(l))} ${monnaie}</strong></td>
    </tr>`
  ).join('');

  const html = `<html><head><meta charset="utf-8">
  <style>body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#222;margin:40pt}
  table{width:100%;border-collapse:collapse;margin:12pt 0}
  th{background:#0a0b10;color:#d4a853;padding:7pt 10pt;font-size:9pt;text-align:left}
  td{padding:6pt 10pt;border-bottom:1pt solid #eee}
  .total-row td{font-weight:bold;font-size:13pt;background:#0a0b10;color:#d4a853}</style>
  </head><body>
  <table><tr>
    <td style="width:50%;border:none"><h1 style="font-size:18pt;margin:0">${company}</h1><p style="color:#888;font-size:9pt">SYSCOHADA · COMEO AI v4</p></td>
    <td style="width:50%;border:none;text-align:right">
      <span style="background:#0a0b10;color:#d4a853;padding:4pt 14pt;font-weight:bold">${(fac.type||'facture').toUpperCase()}</span><br>
      <strong style="font-size:14pt">${fac.numero}</strong><br>
      <span style="color:#888;font-size:9pt">Émise : ${fac.dateEmission||'—'} · Échéance : ${fac.dateEcheance||'—'}</span>
    </td>
  </tr></table>
  <table><tr>
    <td style="width:50%;border:1pt solid #eee;border-radius:4pt;padding:10pt"><strong>ÉMETTEUR</strong><br>${company}<br>Abidjan, Côte d'Ivoire</td>
    <td style="width:50%;border:1pt solid #eee;border-radius:4pt;padding:10pt"><strong>CLIENT</strong><br>${fac.clientNom||'—'}<br>${fac.clientAdresse||''}<br>${fac.clientEmail||''}</td>
  </tr></table>
  <table>
    <thead><tr><th>Désignation</th><th>Qté</th><th>P.U. HT</th><th>Remise</th><th>TVA</th><th>Total HT</th></tr></thead>
    <tbody>${lignesHTML}</tbody>
  </table>
  <table style="width:260pt;margin-left:auto">
    <tr><td>Sous-total HT</td><td align="right">${fn(fac.ht)} ${monnaie}</td></tr>
    <tr><td>TVA</td><td align="right">${fn(fac.tva)} ${monnaie}</td></tr>
    <tr class="total-row"><td>TOTAL TTC</td><td align="right">${fn(fac.ttc)} ${monnaie}</td></tr>
  </table>
  ${fac.notes?`<p style="color:#888;font-size:9pt;border-top:1pt solid #eee;padding-top:8pt">${fac.notes}</p>`:''}
  <p style="color:#bbb;font-size:8pt;border-top:1pt solid #eee;margin-top:20pt">Règlement par ${fac.modeReglement||'virement'} · COMEO AI v4 · SYSCOHADA</p>
  </body></html>`;

  const blob = new Blob([html], { type:'application/msword;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(fac.type||'facture').toUpperCase()}_${fac.numero}.doc`;
  a.click();
  toast('✓ Word généré : ' + fac.numero, 'success');
}

function exportFactureExcel(id) {
  const fac     = facturesList.find(f => f.id === id);
  if (!fac) return;
  const monnaie = fac.monnaie || 'FCFA';

  const rows = [
    ['DÉSIGNATION','QTÉ','P.U. HT','REMISE %','TVA %','MONTANT HT','MONTANT TVA','MONTANT TTC'],
    ...(fac.lignes||[]).filter(l=>l.designation).map(l => [
      l.designation, l.qte, l.pu, l.remise||0, l.tva||18,
      calcLigneHT(l), calcLigneTVA(l), calcLigneHT(l)+calcLigneTVA(l)
    ]),
    [],
    ['','','','','SOUS-TOTAL HT', fac.ht,'',''],
    ['','','','','TVA',           fac.tva,'',''],
    ['','','','','TOTAL TTC',     fac.ttc,'','']
  ];

  const header = [
    ['FACTURE', fac.numero,'','','','','',''],
    ['Client',  fac.clientNom,'','','','','',''],
    ['Date émission', fac.dateEmission,'','','','','',''],
    ['Date échéance', fac.dateEcheance,'','','','','',''],
    ['Monnaie', monnaie,'','','','','',''],
    [], ...rows
  ];

  const csv  = header.map(r => r.join('\t')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/tab-separated-values;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(fac.type||'facture').toUpperCase()}_${fac.numero}.xls`;
  a.click();
  toast('✓ Excel généré : ' + fac.numero, 'success');
}

function exportFactureList() {
  const csv = [
    ['N° FACTURE','TYPE','DATE','ÉCHÉANCE','CLIENT','HT','TVA','TTC','PAYÉ','STATUT'].join(';'),
    ...facturesList.map(f => [
      f.numero, f.type, f.dateEmission, f.dateEcheance||'', f.clientNom||'',
      f.ht, f.tva, f.ttc, f.montantPaye||0, f.statut
    ].join(';'))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'liste_factures.csv'; a.click();
  toast('✓ Liste exportée en CSV', 'success');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 32 — CLIENTS
// ══════════════════════════════════════════════════════════════════

function openClientModal(id = null) {
  editingClientId = id;
  const modal = document.getElementById('clientModal');
  const title = document.getElementById('clientModalTitle');
  if (!modal) return;
  const set = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v; };

  if (id) {
    const cli = clientsList.find(c => c.id === id);
    if (!cli) return;
    if (title) title.textContent = 'Modifier le client';
    set('cli-code',    cli.code    || '');
    set('cli-nom',     cli.nom     || '');
    set('cli-tel',     cli.tel     || '');
    set('cli-email',   cli.email   || '');
    set('cli-ville',   cli.ville   || '');
    set('cli-adresse', cli.adresse || '');
    set('cli-nif',     cli.nif     || '');
    set('cli-notes',   cli.notes   || '');
  } else {
    if (title) title.textContent = 'Nouveau client';
    set('cli-code',    'CLI-' + String(clientCounter).padStart(3, '0'));
    set('cli-nom',     ''); set('cli-tel',     ''); set('cli-email', '');
    set('cli-ville',   ''); set('cli-adresse', ''); set('cli-nif',   ''); set('cli-notes', '');
  }
  modal.style.display = 'flex';
}

function closeClientModal() { document.getElementById('clientModal').style.display = 'none'; }

async function saveClient() {
  const nom = document.getElementById('cli-nom').value.trim();
  if (!nom) { toast('Le nom du client est obligatoire', 'error'); return; }

  const get = id => document.getElementById(id)?.value || '';
  const client = {
    id: editingClientId || Date.now(),
    code: get('cli-code'), nom,
    tel: get('cli-tel'), email: get('cli-email'), ville: get('cli-ville'),
    adresse: get('cli-adresse'), nif: get('cli-nif'), notes: get('cli-notes'),
    createdAt: new Date().toISOString()
  };

  try {
    const col = window._fbCollection(window._db, 'profiles', currentProfile.id, 'clients');
    if (editingClientId) {
      const existing = clientsList.find(c => c.id === editingClientId);
      if (existing?._docId) {
        await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'clients', existing._docId), client);
        const idx = clientsList.findIndex(c => c.id === editingClientId);
        clientsList[idx] = { ...client, _docId: existing._docId };
      }
    } else {
      const ref = await window._fbAddDoc(col, client);
      clientsList.push({ ...client, _docId: ref.id });
      clientCounter++;
    }
    closeClientModal(); renderClients();
    toast('✓ Client enregistré', 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}

function renderClients() {
  const search = (document.getElementById('cli-search')?.value || '').toLowerCase();
  const tbody  = document.getElementById('clientsBody');
  if (!tbody) return;

  const filtered = clientsList.filter(c =>
    !search || c.nom?.toLowerCase().includes(search) ||
    c.email?.toLowerCase().includes(search) || c.tel?.includes(search)
  );

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Aucun client enregistré</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const caTotal  = facturesList.filter(f => f.clientId === c.id && f.statut !== 'annulee').reduce((s, f) => s + (f.ttc || 0), 0);
    const soldeDu  = facturesList.filter(f => f.clientId === c.id && ['envoyee','partielle','retard'].includes(f.statut))
      .reduce((s, f) => s + ((f.ttc || 0) - (f.montantPaye || 0)), 0);
    return `<tr>
      <td><span class="ct">${c.code}</span></td>
      <td style="font-weight:500">${c.nom}</td>
      <td style="font-size:11px;font-family:var(--font-mono)">${c.tel || '—'}</td>
      <td style="font-size:11px">${c.email || '—'}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:var(--green)">${fn(caTotal)}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:${soldeDu>0?'var(--red)':'var(--muted)'}">${fn(soldeDu)}</td>
      <td>
        <button class="btn-action" onclick="openClientModal(${c.id})">✎ Modifier</button>
        <button class="btn-action" onclick="newFactureForClient(${c.id})">+ Facture</button>
      </td>
    </tr>`;
  }).join('');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 33 — FOURNISSEURS
// ══════════════════════════════════════════════════════════════════

function openFournisseurModal(id = null) {
  const modal = document.getElementById('fournisseurModal');
  if (!modal) return;
  const set = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = v; };
  set('four-code',    'FRN-' + String(fournisseurCounter).padStart(3, '0'));
  set('four-nom',     ''); set('four-tel',     ''); set('four-email', '');
  set('four-ville',   ''); set('four-adresse', ''); set('four-nif',   ''); set('four-notes', '');
  modal.style.display = 'flex';
}

function closeFournisseurModal() { document.getElementById('fournisseurModal').style.display = 'none'; }

async function saveFournisseur() {
  const nom = document.getElementById('four-nom').value.trim();
  if (!nom) { toast('Le nom du fournisseur est obligatoire', 'error'); return; }

  const get = id => document.getElementById(id)?.value || '';
  const fournisseur = {
    id: Date.now(),
    code: get('four-code'), nom,
    tel: get('four-tel'), email: get('four-email'), ville: get('four-ville'),
    adresse: get('four-adresse'), nif: get('four-nif'), notes: get('four-notes'),
    createdAt: new Date().toISOString()
  };

  try {
    const col = window._fbCollection(window._db, 'profiles', currentProfile.id, 'fournisseurs');
    const ref = await window._fbAddDoc(col, fournisseur);
    fournisseursList.push({ ...fournisseur, _docId: ref.id });
    fournisseurCounter++;
    closeFournisseurModal(); renderFournisseurs();
    toast('✓ Fournisseur enregistré', 'success');
  } catch (e) { toast('Erreur : ' + e.message, 'error'); }
}

function renderFournisseurs() {
  const search = (document.getElementById('four-search')?.value || '').toLowerCase();
  const tbody  = document.getElementById('fournisseursBody');
  if (!tbody) return;

  const filtered = fournisseursList.filter(f =>
    !search || f.nom?.toLowerCase().includes(search) || f.tel?.includes(search)
  );

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Aucun fournisseur enregistré</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(f => {
    const totalAchats = ecritures
      .filter(e => e.journal === 'AC' && e.lignes.some(l => l.libelle?.toLowerCase().includes(f.nom.toLowerCase())))
      .reduce((s, e) => s + e.lignes.filter(l => l.compte === '401').reduce((ss, l) => ss + (l.credit || 0), 0), 0);
    return `<tr>
      <td><span class="ct">${f.code}</span></td>
      <td style="font-weight:500">${f.nom}</td>
      <td style="font-size:11px;font-family:var(--font-mono)">${f.tel || '—'}</td>
      <td style="font-size:11px">${f.email || '—'}</td>
      <td style="text-align:right;font-family:var(--font-mono)">${fn(totalAchats)}</td>
      <td style="text-align:right;font-family:var(--font-mono);color:var(--muted)">—</td>
      <td><button class="btn-action" onclick="openFournisseurModal(${f.id})">✎</button></td>
    </tr>`;
  }).join('');
}


// ══════════════════════════════════════════════════════════════════
// SECTION 34 — COMEO AI — SYSTEM PROMPT
// ══════════════════════════════════════════════════════════════════

function buildSystemPrompt(ctx) {
  const { nbEcritures, companyName, exercice, totalDebit, totalCredit, comptesSoldes, allDates, ecrituresResume } = ctx;
  const today = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return `Tu es COMEO AI — Expert-Comptable Diplômé et Commissaire aux Comptes agréé en Côte d'Ivoire, membre de l'ONECCA-CI. Tu maîtrises parfaitement le SYSCOHADA Révisé 2017 et le droit fiscal ivoirien.

════════════════════════════════════════════
🧠 MÉTHODE DE RAISONNEMENT OBLIGATOIRE
════════════════════════════════════════════

Avant de produire TOUTE écriture, tu DOIS raisonner en silence selon ces étapes :

ÉTAPE 1 — IDENTIFIER L'OPÉRATION
  → Quelle est la nature exacte de l'opération ? (achat, vente, salaire, immobilisation, emprunt...)
  → L'opération est-elle HT ou TTC ? Si TTC : HT = TTC ÷ 1,18 | TVA = TTC × 18/118
  → Qui paie / qui reçoit ? Quelle est la contrepartie financière ?

ÉTAPE 2 — COMPTER LES ÉCRITURES NÉCESSAIRES
  → Combien d'écritures cette opération requiert-elle ? (1, 2 ou 3 ?)
  → Ne JAMAIS générer moins d'écritures que nécessaire

ÉTAPE 3 — CHOISIR LES COMPTES EXACTS
  → Classe 6 pour charges, Classe 7 pour produits, Classe 2 pour immobilisations
  → JAMAIS 601 pour véhicule/ordinateur/mobilier → utiliser 2451/2442/2444
  → JAMAIS 511/512/513 pour règlement par chèque → utiliser 521
  → TVA : 4452 achats courants | 4451 immobilisations | 4453 transports | 4454 services

ÉTAPE 4 — VÉRIFIER L'ÉQUILIBRE
  → Σ DÉBITS = Σ CRÉDITS (tolérance : 0 FCFA)
  → Lignes débitrices TOUJOURS en premier (norme SYSCOHADA)

ÉTAPE 5 — FORMATER EN JSON
  → Utiliser EXACTEMENT le format ###ECRITURE### décrit ci-dessous

════════════════════════════════════════════
📋 SCHÉMAS OBLIGATOIRES PAR TYPE D'OPÉRATION
════════════════════════════════════════════

📌 ACHAT MARCHANDISES À CRÉDIT (3 écritures)
ÉCRITURE 1 [AC] — Constatation : DÉBIT 601 [HT] + DÉBIT 4452 [TVA] / CRÉDIT 401 [TTC]
ÉCRITURE 2 [IN] — Entrée stock : DÉBIT 311 [HT] / CRÉDIT 6031 [HT]
ÉCRITURE 3 [BQ] — Règlement : DÉBIT 401 [TTC] / CRÉDIT 521 [TTC]

📌 VENTE MARCHANDISES (3 écritures)
ÉCRITURE 1 [VE] — Facturation : DÉBIT 411 [TTC] / CRÉDIT 701 [HT] + CRÉDIT 4431 [TVA]
ÉCRITURE 2 [IN] — Sortie stock : DÉBIT 6031 [coût] / CRÉDIT 311 [coût]
ÉCRITURE 3 [BQ] — Encaissement : DÉBIT 521 [TTC] / CRÉDIT 411 [TTC]

📌 SALAIRES (2 écritures)
ÉCRITURE 1 [OD] : DÉBIT 661 [brut] / CRÉDIT 422 [net] + CRÉDIT 431 [CNPS 7,7%] + CRÉDIT 447 [retenues]
ÉCRITURE 2 [BQ] : DÉBIT 422 [net] / CRÉDIT 521 [net]

📌 IMMOBILISATION (2 écritures)
ÉCRITURE 1 [AC] : DÉBIT 24xx [HT] + DÉBIT 4451 [TVA] / CRÉDIT 401 [TTC]
ÉCRITURE 2 [BQ] : DÉBIT 401 [TTC] / CRÉDIT 521 [TTC]

════════════════════════════════════════════
🔢 CALCULS FISCAUX — CÔTE D'IVOIRE
════════════════════════════════════════════
TVA 18% | HT connu : TVA = HT×0,18 | TTC connu : HT = ARRONDI(TTC÷1,18)
CNPS salarial : 7,7% | CNPS patronal : 16% | IS : 25% | IMF : 0,5% CA HT min 3 000 000 FCFA
RÈGLE : Toujours arrondir à l'entier — JAMAIS de centimes en FCFA.

════════════════════════════════════════════
✅ COMPTES CORRECTS
════════════════════════════════════════════
Chèque/virement → 521 | Espèces → 571 | Mobile Money → 552
TVA achats → 4452 | TVA immob → 4451 | TVA ventes → 4431
Véhicule → 2451 | Informatique → 2442 | Mobilier → 2444 | Matériel → 2441
Amort véhicule → 2845 | Salaires dus → 422 | Fournisseur → 401 | Client → 411

════════════════════════════════════════════
🔴 RÈGLES ABSOLUES
════════════════════════════════════════════
1. Chaque écriture DOIT être équilibrée : Σ DÉBITS = Σ CRÉDITS
2. Lignes DÉBITRICES toujours EN PREMIER
3. JAMAIS de décimales — FCFA entiers
4. TOUJOURS générer TOUTES les écritures nécessaires
5. Explication textuelle AVANT les blocs ###ECRITURE###

════════════════════════════════════════════
📂 CONTEXTE ENTREPRISE
════════════════════════════════════════════
Entreprise    : ${companyName}
Exercice      : ${exercice}
Date du jour  : ${today}
Nb écritures  : ${nbEcritures}
Total Débit   : ${totalDebit} FCFA
Total Crédit  : ${totalCredit} FCFA
${comptesSoldes    ? `Soldes comptes : ${comptesSoldes}` : ''}
${ecrituresResume  ? `Dernières opérations : ${ecrituresResume}` : ''}
${allDates         ? `Période couverte : ${allDates}` : ''}

════════════════════════════════════════════
📝 FORMAT JSON — STRICT
════════════════════════════════════════════
###ECRITURE###{"journal":"XX","libelle":"Libellé précis","lignes":[
{"compte":"XXXX","libelle":"Libellé","debit":MONTANT,"credit":0},
{"compte":"XXXX","libelle":"Libellé","debit":0,"credit":MONTANT}
]}

Journaux valides : AC | VE | BQ | CA | OD | IN | AN

📋 FILTRES :
###FILTRE###{"type":"journal","dateDebut":"YYYY-MM-DD","dateFin":"YYYY-MM-DD","journal":"","compte":""}
###FILTRE###{"type":"balance","dateDebut":"","dateFin":"","journal":"","compte":""}
###FILTRE###{"type":"grandlivre","dateDebut":"","dateFin":"","journal":"","compte":"XXX"}
###FILTRE###{"type":"bilan","dateDebut":"","dateFin":"YYYY-MM-DD","journal":"","compte":""}`;
}

function buildAIContext() {
  let tD = 0, tC = 0;
  ecritures.forEach(e => e.lignes.forEach(l => { tD += l.debit || 0; tC += l.credit || 0; }));
  const map = getMap();
  const comptesSoldes = Object.entries(map).slice(0, 12)
    .map(([c, a]) => { const s = a.debit - a.credit; return `${c}:${s>=0?'Sd':'Sc'}${fn(Math.abs(s))}FCFA`; })
    .join(' | ');
  return {
    nbEcritures:    ecritures.length,
    companyName:    currentProfile?.company || 'Entreprise',
    exercice:       document.getElementById('exerciceYear')?.value || '2024',
    totalDebit:     fn(tD),
    totalCredit:    fn(tC),
    comptesSoldes,
    ecrituresResume: ecritures.slice(-5).map(e => `${e.date}[${e.journal}]${e.libelle||'—'}`).join('; '),
    allDates:       [...new Set(ecritures.map(e => e.date))].sort().join(', ')
  };
}


// ══════════════════════════════════════════════════════════════════
// SECTION 35 — COMEO AI — ENVOI MESSAGE
// ══════════════════════════════════════════════════════════════════

function handleAiKey(e, ctx) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendToAI(ctx); }
}

function quickAI(text) {
  const input = document.getElementById('aiInput');
  if (input) input.value = text;
  navigate('dashboard');
  sendToAI('dashboard');
}

async function sendToAI(context) {
  if (isAILoading) return;

  if (GROQ_API_KEYS.length === 0) {
    appendMsg(context, 'ai',
      '⚠️ <strong>COMEO AI non configuré.</strong><br>Aucune clé API Groq enregistrée. ' +
      'Rendez-vous sur <strong>server.html</strong> pour ajouter vos clés.'
    );
    return;
  }

  const inputId  = context === 'dashboard' ? 'aiInput' : `aiInput-${context}`;
  const input    = document.getElementById(inputId);
  const msg      = input?.value?.trim();
  if (!msg) return;

  isAILoading = true;
  input.value  = '';

  const sendBtnId = context === 'dashboard' ? 'aiSendBtn' : null;
  const sendBtn   = sendBtnId ? document.getElementById(sendBtnId) : null;
  if (sendBtn) sendBtn.disabled = true;

  appendMsg(context, 'user', msg);
  const tid = appendTyping(context);

  const ctxData      = buildAIContext();
  const systemPrompt = buildSystemPrompt(ctxData);
  conversationHistory.push({ role: 'user', content: msg });
  if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

  try {
    let response, lastError;
    const totalAttempts = Math.min(GROQ_API_KEYS.length * GROQ_MODELS.length, 6);

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      const keyToUse   = GROQ_API_KEYS[(groqKeyIdx + attempt) % GROQ_API_KEYS.length];
      const modelToUse = GROQ_MODELS[(groqModelIdx + Math.floor(attempt / GROQ_API_KEYS.length)) % GROQ_MODELS.length];
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyToUse}` },
          body: JSON.stringify({
            model: modelToUse, max_tokens: 6000, temperature: 0.02, top_p: 0.95,
            messages: [{ role: 'system', content: systemPrompt }, ...conversationHistory]
          })
        });
        if (response.ok) {
          groqKeyIdx   = (groqKeyIdx   + attempt) % GROQ_API_KEYS.length;
          groqModelIdx = (groqModelIdx + Math.floor(attempt / GROQ_API_KEYS.length)) % GROQ_MODELS.length;
          break;
        }
        const errData = await response.json().catch(() => ({}));
        lastError = errData.error?.message || 'Erreur ' + response.status;
        if (['decommissioned','deprecated'].some(k => lastError.includes(k)) || response.status === 404) {
          toast(`⚠️ Modèle/clé ${attempt + 1} indisponible → bascule...`, 'info');
        } else break;
      } catch (e) { lastError = e.message; }
    }

    removeTyping(context, tid);
    if (!response || !response.ok) throw new Error(lastError || 'Toutes les clés/modèles sont indisponibles');

    const data     = await response.json();
    const fullText = data.choices?.[0]?.message?.content || 'Pas de réponse.';
    conversationHistory.push({ role: 'assistant', content: fullText });

    // ── Traitement FILTRE
    if (fullText.includes('###FILTRE###')) {
      const idx         = fullText.indexOf('###FILTRE###');
      const displayText = fullText.substring(0, idx).trim();
      const jsonStr     = fullText.substring(idx + 12).trim();
      if (displayText) appendMsg(context, 'ai', displayText);
      try {
        const clean = jsonStr.replace(/```json|```/g, '').trim();
        const match = clean.match(/(\{[\s\S]*?\})/);
        if (match) applyFiltreAndNavigate(JSON.parse(match[1]), context);
      } catch (pe) { console.warn('Filtre parse error:', pe); }

    // ── Traitement ÉCRITURE
    } else if (fullText.includes('###ECRITURE###')) {
      const parts          = fullText.split('###ECRITURE###');
      const textBeforeFirst = parts[0].trim();
      const ecrituresAI    = [];

      for (let i = 1; i < parts.length; i++) {
        const match = parts[i].trim().match(/(\{[\s\S]*\})/);
        if (!match) continue;
        try {
          const ecr = JSON.parse(match[1].replace(/```json|```/g, '').trim());
          if (!ecr.lignes || ecr.lignes.length < 2) continue;
          let d = 0, c = 0;
          ecr.lignes.forEach(l => { d += Math.round(parseFloat(l.debit)||0); c += Math.round(parseFloat(l.credit)||0); });
          ecr.lignes = sortLignesDebitAvantCredit(
            corrigerComptesErreurs(ecr.lignes.map(l => ({
              ...l, debit: Math.round(parseFloat(l.debit)||0), credit: Math.round(parseFloat(l.credit)||0)
            })))
          );
          if (Math.abs(d - c) <= 5) ecrituresAI.push(ecr);
          else console.warn(`Écriture ${i} rejetée — Δ ${Math.abs(d-c)} FCFA`);
        } catch (pe) { console.warn('JSON parse error écriture', i, ':', pe.message); }
      }

      if (textBeforeFirst) appendMsg(context, 'ai', textBeforeFirst);
      if (ecrituresAI.length === 0) {
        appendMsg(context, 'ai', '⚠️ Aucune écriture équilibrée extraite. Veuillez reformuler votre demande.');
      } else {
        currentGroupId = 'grp_' + Date.now();
        appendMsg(context, 'ai',
          `✅ <strong>${ecrituresAI.length} écriture${ecrituresAI.length > 1 ? 's' : ''} liées</strong> préparées :<br>` +
          ecrituresAI.map((e, i) => `<br><strong>${i+1}. [${e.journal}]</strong> ${e.libelle}`).join('') +
          '<br><br>⚡ Cliquez <strong>"Tout enregistrer"</strong> pour valider en un clic.'
        );
        setEcritureQueue(ecrituresAI);
        if (context !== 'saisie') {
          showMultiEcrBanner(ecrituresAI);
          showSaisieNotif(ecrituresAI[0]?.libelle || msg.substring(0, 40), ecrituresAI.length);
        } else {
          toast(`✨ ${ecrituresAI.length} écriture${ecrituresAI.length>1?'s':''} préparée${ecrituresAI.length>1?'s':''}`, 'info');
        }
      }

    // ── Réponse simple
    } else {
      appendMsg(context, 'ai', fullText);
    }
  } catch (err) {
    removeTyping(context, tid);
    conversationHistory.pop();
    appendMsg(context, 'ai', `⚠️ Incident technique : ${err.message} — Veuillez réessayer.`);
  }

  isAILoading = false;
  if (sendBtn) sendBtn.disabled = false;
}

function applyFiltreAndNavigate(filtre, context) {
  const { type, dateDebut, dateFin, journal, compte } = filtre;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };

  if (type === 'journal') {
    navigate('journal');
    if (dateDebut) set('jnl-date-debut', dateDebut);
    if (dateFin)   set('jnl-date-fin',   dateFin);
    if (journal)   set('journalFilter',   journal);
    renderJournal();
    const analyseEl = document.getElementById('journal-analyse');
    if (analyseEl) {
      analyseEl.style.display = 'block';
      const label = dateDebut === dateFin ? formatDateFR(dateDebut) : `${formatDateFR(dateDebut)} au ${formatDateFR(dateFin)}`;
      analyseEl.innerHTML = `<div class="analyse-title">📋 Journal — ${label || 'Exercice complet'}</div>Affichage des écritures pour la période demandée.`;
    }
  } else if (type === 'balance') {
    navigate('balance');
    if (dateDebut) set('bal-date-debut', dateDebut);
    if (dateFin)   set('bal-date-fin',   dateFin);
    if (journal)   set('bal-journal',    journal);
    renderBalance();
  } else if (type === 'grandlivre') {
    navigate('grandlivre');
    if (dateDebut) set('gl-date-debut', dateDebut);
    if (dateFin)   set('gl-date-fin',   dateFin);
    if (compte)    set('glSearch',       compte);
    renderGrandLivre();
    if (compte) setTimeout(() => { const el = document.getElementById('gl-'+compte); if (el) el.style.display = 'block'; }, 200);
  } else if (type === 'bilan') {
    navigate('bilan');
    if (dateFin) set('bilan-date-arrete', dateFin);
    renderBilan();
  }
}

// ── Messages IA
function appendMsg(context, role, text) {
  const msgId = context === 'dashboard' ? 'aiMessages' : `aiMessages-${context}`;
  const c     = document.getElementById(msgId);
  if (!c) return;
  const d = document.createElement('div');
  d.className = 'msg ' + role;
  d.innerHTML = `<div class="msg-av">${role==='ai'?'CA':'U'}</div><div class="msg-body">${fmt(text)}</div>`;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
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

function removeTyping(context, id) { document.getElementById(id)?.remove(); }


// ══════════════════════════════════════════════════════════════════
// SECTION 36 — ROBOT VOCAL IA
// STT (Web Speech API) → Groq LLM → TTS (SpeechSynthesis)
// ══════════════════════════════════════════════════════════════════

let robotOpen        = false;
let robotListening   = false;
let robotSpeaking    = false;
let robotRecog       = null;
let robotSynth       = window.speechSynthesis;
let robotVoice       = null;
let robotConvHistory = [];

// ── Jeux de lumière ──
const ROBOT_LIGHT_COLORS = [
  ['#d4a853','#8b5cf6'], ['#3b82f6','#22c55e'], ['#f59e0b','#ec4899'],
  ['#06b6d4','#d4a853'], ['#8b5cf6','#3b82f6'], ['#22c55e','#f59e0b'],
  ['#ec4899','#06b6d4'], ['#d4a853','#22c55e']
];
let robotLightInterval = null;
let robotLightIdx      = 0;

function startRobotLights() {
  stopRobotLights();
  const panel  = document.getElementById('robotPanel');
  const avatar = document.getElementById('robotAvatar');
  const orb1   = document.querySelector('.r-orb1');
  const orb2   = document.querySelector('.r-orb2');
  const orb3   = document.querySelector('.r-orb3');
  const grid   = document.querySelector('.r-grid');
  if (!orb1 || !panel) return;

  robotLightInterval = setInterval(() => {
    const [c1, c2] = ROBOT_LIGHT_COLORS[robotLightIdx % ROBOT_LIGHT_COLORS.length];
    const c3 = ROBOT_LIGHT_COLORS[(robotLightIdx + 3) % ROBOT_LIGHT_COLORS.length][0];
    robotLightIdx++;
    if (orb1) orb1.style.background = `radial-gradient(circle, ${c1}, transparent 70%)`;
    if (orb2) orb2.style.background = `radial-gradient(circle, ${c2}, transparent 70%)`;
    if (orb3) orb3.style.background = `radial-gradient(circle, ${c3}, transparent 70%)`;
    if (grid) grid.style.backgroundImage = `linear-gradient(${c1}22 1px, transparent 1px),linear-gradient(90deg, ${c1}22 1px, transparent 1px)`;
    if (avatar) { avatar.style.boxShadow = `0 0 0 4px ${c1}33, 0 0 60px ${c2}44`; avatar.style.borderColor = c1; }
    if (panel)  panel.style.background  = `radial-gradient(ellipse at 30% 20%, ${c1}18 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${c2}14 0%, transparent 50%), #06070f`;
  }, 600);
}

function stopRobotLights() {
  if (robotLightInterval) { clearInterval(robotLightInterval); robotLightInterval = null; }
  const reset = (sel, prop, val) => { const el = typeof sel === 'string' ? document.querySelector(sel) : document.getElementById(sel); if (el) el.style[prop] = val; };
  reset('.r-orb1',    'background', 'radial-gradient(circle,#d4a853,transparent 70%)');
  reset('.r-orb2',    'background', 'radial-gradient(circle,#8b5cf6,transparent 70%)');
  reset('.r-orb3',    'background', 'radial-gradient(circle,#3b82f6,transparent 70%)');
  reset('.r-grid',    'backgroundImage', '');
  reset('robotPanel', 'background',  '');
  const av = document.getElementById('robotAvatar'); if (av) { av.style.boxShadow = ''; av.style.borderColor = ''; }
}

// ── Statuts visuels ──
function setRobotStatus(state) {
  const pill   = document.getElementById('robotStatusPill');
  const avatar = document.getElementById('robotAvatar');
  const hint   = document.getElementById('robotHint');
  const mic    = document.getElementById('robotMicBtn');
  const bars   = document.querySelectorAll('.rv-bar');
  if (!pill) return;

  const cfg = {
    online:    { text: 'En ligne',    cls: '',         hint: 'Appuyez pour parler', micOn: false },
    listening: { text: 'Écoute…',     cls: 'listening',hint: 'Je vous écoute…',     micOn: true  },
    thinking:  { text: 'Réflexion…',  cls: 'thinking', hint: 'Analyse en cours…',   micOn: false },
    speaking:  { text: 'Répond…',     cls: 'speaking', hint: 'Je vous réponds…',    micOn: false }
  };
  const s = cfg[state] || cfg.online;
  pill.textContent = s.text;
  pill.className   = 'robot-status-pill ' + s.cls;
  if (avatar) avatar.className  = 'robot-avatar-main ' + (state !== 'online' ? state : '');
  if (hint)   hint.textContent  = s.hint;
  if (mic)    mic.classList.toggle('active', s.micOn);
  bars.forEach(b => b.style.opacity = state === 'online' ? '.3' : '.85');
}

function setRobotBubble(text) {
  const bubble = document.getElementById('robotBubble');
  const inner  = document.getElementById('robotBubbleText');
  const target = inner || bubble;
  if (!target) return;
  if (bubble) bubble.classList.add('fading');
  setTimeout(() => {
    target.innerHTML = text + '<span class="blink-cur"></span>';
    if (bubble) bubble.classList.remove('fading');
    if (bubble) bubble.scrollTop = bubble.scrollHeight;
  }, 180);
}

// ── Visualiseur barres ──
function initRobotVisualizer() {
  const viz = document.getElementById('robotViz');
  if (!viz || viz.children.length > 0) return;
  const peaks = [4,8,14,20,28,34,38,40,38,34,30,26,30,34,38,40,38,34,28,20,14,8,6,4];
  for (let i = 0; i < 24; i++) {
    const b = document.createElement('div');
    b.className = 'rv-bar';
    b.style.cssText = `--max:${peaks[i]||20}px;--spd:${0.4+Math.random()*0.5}s;animation-delay:${i*0.04}s`;
    viz.appendChild(b);
  }

  function animBars() {
    const avatar = document.getElementById('robotAvatar');
    const state  = avatar?.classList.contains('speaking') ? 'speaking'
      : avatar?.classList.contains('listening') ? 'listening' : 'idle';
    const active = state !== 'idle';
    document.querySelectorAll('.rv-bar').forEach((bar, i) => {
      const max       = peaks[i] || 20;
      const amplitude = state === 'speaking' ? max : state === 'listening' ? max * 0.6 : 4;
      const wave      = amplitude * (0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 130 + i * 0.55)));
      bar.style.height = Math.max(4, active ? wave : 4) + 'px';
    });
    requestAnimationFrame(animBars);
  }
  animBars();
}

function initRobotBg() {
  const bg = document.getElementById('robotBg');
  if (!bg || bg.children.length > 0) return;
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('div');
    const sz = 40 + Math.random() * 120;
    d.className = 'robot-bg-dot';
    d.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--spd:${8+Math.random()*14}s;animation-delay:${Math.random()*8}s`;
    bg.appendChild(d);
  }
}

// ── Voix française ──
function pickRobotVoice() {
  const voices  = robotSynth.getVoices();
  if (!voices.length) return;
  const neural  = voices.find(v => v.lang.startsWith('fr') && ['Neural','Premium','Enhanced'].some(k => v.name.includes(k)));
  const google  = voices.find(v => v.name.includes('Google') && v.lang.startsWith('fr'));
  const ms      = voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('fr'));
  const anyFr   = voices.find(v => v.lang.startsWith('fr'));
  robotVoice = neural || google || ms || anyFr || voices[0] || null;
}
speechSynthesis.addEventListener('voiceschanged', pickRobotVoice);
setTimeout(pickRobotVoice, 200);
setTimeout(pickRobotVoice, 800);
pickRobotVoice();

// ── TTS ──
function cleanTextForSpeech(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1').replace(/[\[\]#_~`]/g,'')
    .replace(/\bFCFA\b/g,'francs CFA').replace(/\bTVA\b/g,"taxe sur la valeur ajoutée")
    .replace(/\bHT\b/g,'hors taxe').replace(/\bTTC\b/g,'toutes taxes comprises')
    .replace(/\bCNPS\b/g,'caisse nationale de prévoyance sociale')
    .replace(/\bSYSCOHADA\b/gi,'Syscohada').replace(/\bONECCA\b/gi,'Onecca')
    .replace(/\bOHADA\b/gi,'ohada').replace(/[;:]/g,',').replace(/[—–-]{2,}/g,', ')
    .replace(/\.\.\./g,', ').replace(/[()[\]{}]/g,', ')
    .replace(/\bN°\s*\d+/g, m => 'numéro ' + m.replace(/[^0-9]/g,''))
    .replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g,'$1 ')
    .replace(/\s{2,}/g,' ').trim();
}

function splitIntoNaturalChunks(text) {
  const raw    = text.match(/[^.!?,;:]+[.!?,;:]*/g) || [text];
  const chunks = [];
  for (const s of raw) {
    if (!s.trim() || s.trim().length < 2) continue;
    if (s.length > 60) {
      const words = s.split(/\s+/);
      let buf = '';
      for (const w of words) {
        buf += (buf ? ' ' : '') + w;
        if (buf.length > 50) { chunks.push(buf.trim()); buf = ''; }
      }
      if (buf.trim()) chunks.push(buf.trim());
    } else {
      chunks.push(s.trim());
    }
  }
  return chunks.filter(c => c.length > 1);
}

function robotSpeak(text) {
  robotSynth.cancel();
  robotSpeaking = true;
  setRobotStatus('speaking');
  startRobotLights();

  setRobotBubble(
    text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:var(--warm)">$1</strong>')
        .replace(/\n/g,'<br>')
  );

  const chunks = splitIntoNaturalChunks(cleanTextForSpeech(text));
  let idx = 0;

  function speakNext() {
    if (idx >= chunks.length || !robotSpeaking) {
      robotSpeaking = false; stopRobotLights(); setRobotStatus('online');
      setTimeout(() => { if (robotOpen && !robotListening) startRobotListening(); }, 700);
      return;
    }
    const chunk = chunks[idx].trim();
    if (!chunk) { idx++; speakNext(); return; }
    const utter   = new SpeechSynthesisUtterance(chunk);
    if (robotVoice) utter.voice = robotVoice;
    utter.lang    = 'fr-FR'; utter.rate = 1.15; utter.pitch = 0.95; utter.volume = 1.0;
    const pauseMs = chunk.endsWith('?') ? 120 : chunk.endsWith('!') ? 80 : 50;
    utter.onend   = () => { idx++; setTimeout(speakNext, pauseMs); };
    utter.onerror = () => { idx++; speakNext(); };
    robotSynth.speak(utter);
  }
  speakNext();
}

// ── STT ──
function initRobotSTT() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recog = new SpeechRecognition();
  recog.lang = 'fr-FR'; recog.continuous = true; recog.interimResults = true; recog.maxAlternatives = 1;

  let silenceTimer    = null;
  let lastTranscript  = '';

  recog.onresult = e => {
    let finalText = '', interimText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t          = e.results[i][0].transcript;
      const confidence = e.results[i][0].confidence || 1;
      if (e.results[i].isFinal && confidence > 0.45) finalText += t;
      else if (!e.results[i].isFinal) interimText += t;
    }
    lastTranscript += finalText;
    const current = (lastTranscript || interimText).trim();
    if (current) setRobotBubble(`<em style="opacity:.6;font-size:12px">J'entends : </em><br>${lastTranscript || interimText}`);

    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      const query = lastTranscript.trim() || interimText.trim();
      if (query.length > 2) {
        recog.stop(); robotListening = false; lastTranscript = '';
        handleRobotQuery(query);
      }
    }, 900);
  };

  recog.onerror = e => {
    if (silenceTimer) clearTimeout(silenceTimer);
    lastTranscript = ''; robotListening = false; setRobotStatus('online');
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      setRobotBubble('Désolé, je n\'ai pas bien entendu. Réessayez.');
    } else {
      setTimeout(() => { if (robotOpen) startRobotListening(); }, 1000);
    }
  };

  recog.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    lastTranscript = '';
    if (robotListening) { robotListening = false; setRobotStatus('online'); }
  };

  return recog;
}

function startRobotListening() {
  if (robotSpeaking || robotListening) return;
  if (!robotRecog) robotRecog = initRobotSTT();
  if (!robotRecog) { setRobotBubble('Votre navigateur ne supporte pas la reconnaissance vocale.'); return; }
  try { robotRecog.start(); robotListening = true; setRobotStatus('listening'); }
  catch (_) { robotListening = false; }
}

function stopRobotListening() {
  if (robotRecog && robotListening) {
    try { robotRecog.stop(); } catch (_) {}
    robotListening = false;
  }
}

function toggleRobotMic() {
  if (robotSpeaking)   { robotSynth.cancel(); robotSpeaking = false; setRobotStatus('online'); return; }
  if (robotListening)  { stopRobotListening(); setRobotStatus('online'); }
  else                 { startRobotListening(); }
}

// ── Ouvrir / Fermer ──
function openRobot() {
  const panel = document.getElementById('robotPanel');
  if (!panel) return;
  panel.classList.add('open'); robotOpen = true; document.body.style.overflow = 'hidden';
  initRobotVisualizer(); initRobotBg();
  setTimeout(() => robotSpeak('Bonjour, comment puis-je vous aider ?'), 150);
}

function closeRobot() {
  const panel = document.getElementById('robotPanel');
  if (!panel) return;
  stopRobotListening(); robotSynth.cancel(); stopRobotLights();
  panel.classList.remove('open'); robotOpen = false; document.body.style.overflow = '';
  robotSpeaking = false; setRobotStatus('online');
}

// ── Journal 3D ──
function showRobot3DJournal(ecrituresData) {
  document.getElementById('robot3DOverlay')?.remove();
  const overlay    = document.createElement('div');
  overlay.id       = 'robot3DOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(6,7,15,.97);display:flex;flex-direction:column;overflow:hidden;animation:fadein .3s ease';

  const groupes = {};
  ecrituresData.forEach(e => {
    const key = e.groupId || ('solo_' + e.id);
    if (!groupes[key]) groupes[key] = [];
    groupes[key].push(e);
  });

  const groupList = Object.values(groupes).sort((a,b) => a[0].date.localeCompare(b[0].date));
  const jnlColors = { AC:'#f59e0b',VE:'#22c55e',BQ:'#3b82f6',CA:'#8b5cf6',OD:'#ec4899',IN:'#06b6d4',AN:'#d4a853' };

  const cardsHTML = groupList.slice(0, 20).map((grp, gi) => {
    const e = grp[0];
    let tD = 0, tC = 0;
    grp.forEach(ec => ec.lignes.forEach(l => { tD += l.debit||0; tC += l.credit||0; }));
    const color     = jnlColors[e.journal] || '#d4a853';
    const lignesHTML = grp.flatMap(ec => sortLignesDebitAvantCredit(ec.lignes).map(l =>
      `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:10px;font-family:var(--font-mono)">
        <span style="color:rgba(255,255,255,.5)">${l.compte}</span>
        <span style="flex:1;margin:0 8px;color:rgba(255,255,255,.7);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.libelle||PC[l.compte]||''}</span>
        <span style="color:#60a5fa;min-width:70px;text-align:right">${l.debit?fnPDF(l.debit):''}</span>
        <span style="color:#4ade80;min-width:70px;text-align:right">${l.credit?fnPDF(l.credit):''}</span>
      </div>`
    )).join('');
    return `<div class="r3d-card" style="background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);border:1px solid ${color}44;border-radius:12px;padding:16px;min-width:320px;max-width:380px;flex-shrink:0;transform:perspective(800px) rotateY(${(gi-groupList.length/2)*3}deg);box-shadow:0 8px 32px ${color}22;transition:transform .3s,box-shadow .3s;cursor:pointer"
      onmouseover="this.style.transform='perspective(800px) rotateY(0deg) scale(1.04)';this.style.boxShadow='0 16px 48px ${color}44'"
      onmouseout="this.style.transform='perspective(800px) rotateY(${(gi-groupList.length/2)*3}deg)';this.style.boxShadow='0 8px 32px ${color}22'">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="background:${color};color:#000;padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;font-family:var(--font-mono)">${e.journal}</span>
        <span style="font-size:10px;color:rgba(255,255,255,.4);font-family:var(--font-mono)">${e.date}</span>
        <span style="margin-left:auto;font-size:10px;color:${color};font-family:var(--font-mono);font-weight:700">${fnPDF(tD)} FCFA</span>
      </div>
      <div style="font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.groupLibelle||e.libelle||'—'}</div>
      <div style="max-height:120px;overflow:hidden">${lignesHTML}</div>
      ${grp.length>1?`<div style="margin-top:6px;font-size:9px;color:${color};opacity:.7">${grp.length} écritures liées</div>`:''}
    </div>`;
  }).join('');

   overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:#d4a853;box-shadow:0 0 10px #d4a853"></div>
        <span style="font-size:13px;font-weight:700;color:#d4a853;letter-spacing:.08em;font-family:var(--font-mono)">
          JOURNAL 3D — ${ecrituresData.length} ÉCRITURE${ecrituresData.length > 1 ? 'S' : ''}
        </span>
        <span style="font-size:10px;color:rgba(255,255,255,.3);font-family:var(--font-mono)">${currentProfile?.company || ''}</span>
      </div>
      <button onclick="document.getElementById('robot3DOverlay').remove()"
        style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-family:var(--font-mono);transition:background .2s"
        onmouseover="this.style.background='rgba(255,255,255,.12)'"
        onmouseout="this.style.background='rgba(255,255,255,.06)'">✕ Fermer</button>
    </div>
    <div style="flex:1;overflow-x:auto;overflow-y:hidden;display:flex;align-items:center;gap:16px;padding:32px 40px;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#d4a85333 transparent">
      ${cardsHTML}
    </div>
    <div style="padding:10px 24px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:10px;color:rgba(255,255,255,.25);font-family:var(--font-mono)">
        ← Faites défiler horizontalement pour voir toutes les écritures →
      </span>
      <button onclick="navigate('journal');document.getElementById('robot3DOverlay').remove()"
        style="background:rgba(212,168,83,.15);border:1px solid rgba(212,168,83,.3);color:#d4a853;padding:5px 14px;border-radius:5px;cursor:pointer;font-size:11px;font-family:var(--font-mono)">
        Ouvrir le journal complet →
      </button>
    </div>`;
 
  document.body.appendChild(overlay);
}
 
// ── Requête vocale ──
async function handleRobotQuery(query) {
  if (GROQ_API_KEYS.length === 0) {
    robotSpeak("Je ne suis pas encore configuré. Veuillez ajouter une clé API Groq dans les paramètres serveur.");
    return;
  }
 
  setRobotStatus('thinking');
  startRobotLights();
  setRobotBubble(`<em style="opacity:.5;font-size:11px">Vous avez dit :</em><br><strong>${query}</strong><br><br><span style="opacity:.4;font-size:11px">Réflexion…</span>`);
 
  robotConvHistory.push({ role: 'user', content: query });
  if (robotConvHistory.length > 12) robotConvHistory = robotConvHistory.slice(-12);
 
  const ctxData = buildAIContext();
  const sysPromptVocal = buildSystemPrompt(ctxData) +
    `\n\n════════════════════════════════════════════\n🎙️ MODE VOCAL — RÈGLES SPÉCIFIQUES\n════════════════════════════════════════════\n` +
    `- Réponds en français parlé naturel, phrases courtes et directes.\n` +
    `- Évite le jargon technique dans les explications orales.\n` +
    `- Maximum 4 phrases pour les réponses simples.\n` +
    `- Pour les écritures comptables, génère le JSON normalement (###ECRITURE###).\n` +
    `- Commence toujours par un acquittement bref (ex: "Très bien.", "Voici ce que je prépare.").`;
 
  try {
    let response, lastError;
    for (let attempt = 0; attempt < Math.min(GROQ_API_KEYS.length, 3); attempt++) {
      const keyToUse   = GROQ_API_KEYS[(groqKeyIdx + attempt) % GROQ_API_KEYS.length];
      const modelToUse = GROQ_MODELS[groqModelIdx % GROQ_MODELS.length];
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyToUse}` },
          body: JSON.stringify({
            model: modelToUse, max_tokens: 4000, temperature: 0.05,
            messages: [{ role: 'system', content: sysPromptVocal }, ...robotConvHistory]
          })
        });
        if (response.ok) break;
        lastError = 'Erreur ' + response.status;
      } catch (e) { lastError = e.message; }
    }
 
    if (!response || !response.ok) throw new Error(lastError || 'Serveur indisponible');
 
    const data     = await response.json();
    const fullText = data.choices?.[0]?.message?.content || 'Je n\'ai pas pu générer de réponse.';
    robotConvHistory.push({ role: 'assistant', content: fullText });
 
    // Traitement ÉCRITURE en mode vocal
    if (fullText.includes('###ECRITURE###')) {
      const parts          = fullText.split('###ECRITURE###');
      const texteParlé     = parts[0].replace(/###FILTRE###[\s\S]*/, '').trim();
      const ecrituresAI    = [];
 
      for (let i = 1; i < parts.length; i++) {
        const match = parts[i].trim().match(/(\{[\s\S]*\})/);
        if (!match) continue;
        try {
          const ecr = JSON.parse(match[1].replace(/```json|```/g, '').trim());
          if (!ecr.lignes || ecr.lignes.length < 2) continue;
          let d = 0, c = 0;
          ecr.lignes.forEach(l => { d += Math.round(parseFloat(l.debit)||0); c += Math.round(parseFloat(l.credit)||0); });
          ecr.lignes = sortLignesDebitAvantCredit(
            corrigerComptesErreurs(ecr.lignes.map(l => ({
              ...l, debit: Math.round(parseFloat(l.debit)||0), credit: Math.round(parseFloat(l.credit)||0)
            })))
          );
          if (Math.abs(d - c) <= 5) ecrituresAI.push(ecr);
        } catch (_) {}
      }
 
      const speakText = texteParlé ||
        `J'ai préparé ${ecrituresAI.length} écriture${ecrituresAI.length > 1 ? 's' : ''} comptable${ecrituresAI.length > 1 ? 's' : ''} liée${ecrituresAI.length > 1 ? 's' : ''}. Rendez-vous dans la saisie pour les valider.`;
 
      if (ecrituresAI.length > 0) {
        currentGroupId = 'grp_robot_' + Date.now();
        setEcritureQueue(ecrituresAI);
        showSaisieNotif(ecrituresAI[0]?.libelle || query.substring(0, 40), ecrituresAI.length);
        showMultiEcrBanner(ecrituresAI);
        robotSpeak(speakText + ` Vérifiez la saisie pour les valider.`);
      } else {
        robotSpeak('Je n\'ai pas pu préparer les écritures correctement. Pouvez-vous reformuler ?');
      }
 
    // Traitement FILTRE en mode vocal
    } else if (fullText.includes('###FILTRE###')) {
      const idx         = fullText.indexOf('###FILTRE###');
      const parlé       = fullText.substring(0, idx).trim();
      const jsonStr     = fullText.substring(idx + 12).trim();
      try {
        const clean = jsonStr.replace(/```json|```/g, '').trim();
        const match = clean.match(/(\{[\s\S]*?\})/);
        if (match) {
          applyFiltreAndNavigate(JSON.parse(match[1]), 'robot');
          const speakText = parlé || 'Voici les données demandées.';
          robotSpeak(speakText);
        }
      } catch (_) {
        robotSpeak(parlé || fullText.substring(0, 300));
      }
 
    // Réponse textuelle simple
    } else {
      // Nettoyer le markdown pour la synthèse vocale
      const plainText = fullText
        .replace(/###ECRITURE###[\s\S]*/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,4}\s/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 600);
      robotSpeak(plainText);
    }
 
  } catch (err) {
    robotConvHistory.pop();
    robotSpeak(`Désolé, j'ai rencontré une erreur technique. ${err.message.substring(0, 80)}. Veuillez réessayer.`);
  }
}
 
 
// ══════════════════════════════════════════════════════════════════
// SECTION 37 — ANALYSE IA DU JOURNAL (bouton "Analyser")
// ══════════════════════════════════════════════════════════════════
 
async function analyserJournalIA() {
  if (GROQ_API_KEYS.length === 0) { toast('Clé API non configurée', 'error'); return; }
  if (!ecritures.length) { toast('Aucune écriture à analyser', 'error'); return; }
 
  const analyseEl = document.getElementById('journal-analyse');
  if (!analyseEl) return;
  analyseEl.style.display = 'block';
  analyseEl.innerHTML     = `<div class="analyse-title">🤖 Analyse en cours…</div>
    <div class="typing"><span></span><span></span><span></span></div>`;
 
  const jnlFilter  = document.getElementById('journalFilter')?.value  || '';
  const dateDebut  = document.getElementById('jnl-date-debut')?.value || '';
  const dateFin    = document.getElementById('jnl-date-fin')?.value   || '';
  const ecFiltrees = getEcrituresFiltrees({ dateDebut, dateFin, journal: jnlFilter });
 
  const ctxData   = buildAIContext();
  const resumeEcr = ecFiltrees.slice(-20).map(e =>
    `[${e.date}|${e.journal}] ${e.libelle||'—'} → ${e.lignes.map(l => `${l.compte}:D${l.debit||0}:C${l.credit||0}`).join(', ')}`
  ).join('\n');
 
  const prompt = `Analyse comptable des ${ecFiltrees.length} écritures suivantes (SYSCOHADA, ${currentProfile?.company || ''}, exercice ${ctxData.exercice}) :
 
${resumeEcr}
 
Fournis une analyse structurée :
1. Résumé global (mouvements, équilibre, cohérence SYSCOHADA)
2. Points forts (respect des règles, imputations correctes)
3. Anomalies ou points de vigilance (comptes mal utilisés, écritures non équilibrées)
4. Recommandations pratiques (max 3)
 
Réponse concise, professionnelle, en français.`;
 
  try {
    const keyToUse   = GROQ_API_KEYS[groqKeyIdx % GROQ_API_KEYS.length];
    const modelToUse = GROQ_MODELS[groqModelIdx % GROQ_MODELS.length];
    const response   = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyToUse}` },
      body: JSON.stringify({
        model: modelToUse, max_tokens: 2000, temperature: 0.1,
        messages: [
          { role: 'system', content: buildSystemPrompt(ctxData) },
          { role: 'user',   content: prompt }
        ]
      })
    });
 
    if (!response.ok) throw new Error('Erreur ' + response.status);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Aucune analyse disponible.';
    analyseEl.innerHTML = `<div class="analyse-title">📊 Analyse IA — ${ecFiltrees.length} écriture${ecFiltrees.length > 1 ? 's' : ''}</div>${fmt(text)}`;
  } catch (e) {
    analyseEl.innerHTML = `<div class="analyse-title">⚠️ Erreur</div>Impossible d'analyser : ${e.message}`;
  }
}
 
async function analyserBalanceIA() {
  if (GROQ_API_KEYS.length === 0) { toast('Clé API non configurée', 'error'); return; }
  const analyseEl = document.getElementById('balance-analyse');
  if (!analyseEl) return;
  analyseEl.style.display = 'block';
  analyseEl.innerHTML     = `<div class="analyse-title">🤖 Analyse de la balance…</div>
    <div class="typing"><span></span><span></span><span></span></div>`;
 
  const map       = getMap();
  const soldesStr = Object.entries(map).map(([code, acc]) => {
    const s = acc.debit - acc.credit;
    return `${code} (${(PC[code]||'').substring(0,30)}) : ${s>=0?'Sd':'Sc'} ${fn(Math.abs(s))} FCFA`;
  }).join('\n');
 
  const prompt = `Analyse de la balance générale SYSCOHADA de ${currentProfile?.company || 'l\'entreprise'} :
 
${soldesStr}
 
Identifie :
1. Cohérence des soldes (actif/passif/charges/produits selon leur nature)
2. Comptes à solde anormal (débiteur/créditeur inversé)
3. Résultat préliminaire (Produits − Charges)
4. Ratios clés (autonomie financière, liquidité approximative)
5. Alertes fiscales (TVA, IS estimé)
 
Réponse structurée et professionnelle.`;
 
  try {
    const keyToUse   = GROQ_API_KEYS[groqKeyIdx % GROQ_API_KEYS.length];
    const modelToUse = GROQ_MODELS[groqModelIdx % GROQ_MODELS.length];
    const response   = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${keyToUse}` },
      body: JSON.stringify({
        model: modelToUse, max_tokens: 2000, temperature: 0.1,
        messages: [
          { role: 'system', content: buildSystemPrompt(buildAIContext()) },
          { role: 'user',   content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error('Erreur ' + response.status);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Aucune analyse.';
    analyseEl.innerHTML = `<div class="analyse-title">📊 Analyse Balance IA</div>${fmt(text)}`;
  } catch (e) {
    analyseEl.innerHTML = `<div class="analyse-title">⚠️ Erreur</div>${e.message}`;
  }
}
 
 
// ══════════════════════════════════════════════════════════════════
// SECTION 38 — PROFIL & PARAMÈTRES
// ══════════════════════════════════════════════════════════════════
 
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (!modal) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  set('prof-company',   currentProfile?.company   || '');
  set('prof-email',     currentProfile?.email     || '');
  set('prof-exercice',  currentProfile?.exercice  || '2024');
  set('prof-compte701', currentProfile?.compte701 || '701');
  modal.style.display = 'flex';
}
 
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
}
 
async function saveProfile() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const company   = get('prof-company');
  const exercice  = get('prof-exercice');
  const compte701 = get('prof-compte701') || '701';
 
  if (!company)  { toast('Le nom de l\'entreprise est requis', 'error'); return; }
  if (!exercice) { toast('L\'exercice est requis', 'error'); return; }
 
  try {
    await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id), {
      ...currentProfile, company, exercice, compte701,
      updatedAt: new Date().toISOString()
    });
    currentProfile = { ...currentProfile, company, exercice, compte701 };
    document.getElementById('topCompanyName').textContent  = company;
    document.getElementById('exerciceYear').value          = exercice;
    closeProfileModal();
    toast('✓ Profil mis à jour', 'success');
    updateStats();
  } catch (e) { toast('Erreur sauvegarde : ' + e.message, 'error'); }
}
 
async function changeExercice() {
  const yr = document.getElementById('exerciceYear')?.value;
  if (!yr || yr.length !== 4) { toast('Année invalide', 'error'); return; }
  if (currentProfile) {
    currentProfile.exercice = yr;
    try {
      await window._fbSetDoc(window._fbDoc(window._db, 'profiles', currentProfile.id), {
        ...currentProfile, exercice: yr
      });
      toast(`✓ Exercice ${yr} activé`, 'success');
      updateStats();
    } catch (_) {}
  }
}
 
 
// ══════════════════════════════════════════════════════════════════
// SECTION 39 — RAPPROCHEMENT BANCAIRE
// ══════════════════════════════════════════════════════════════════
 
function ouvrirRapprochement() {
  const modal = document.getElementById('rapprochementModal');
  if (!modal) return;
  const map     = getMap();
  const solde521 = (map['521'] ? map['521'].debit - map['521'].credit : 0);
  const el = document.getElementById('rapp-solde-compta');
  if (el) el.textContent = fn(solde521) + ' FCFA';
  modal.style.display = 'flex';
}
 
function fermerRapprochement() {
  const modal = document.getElementById('rapprochementModal');
  if (modal) modal.style.display = 'none';
}
 
function calculerRapprochement() {
  const soldeBanque  = parseFloat(document.getElementById('rapp-solde-banque')?.value  || 0);
  const depOubl      = parseFloat(document.getElementById('rapp-dep-oubl')?.value       || 0);
  const recOubl      = parseFloat(document.getElementById('rapp-rec-oubl')?.value       || 0);
  const erreurs      = parseFloat(document.getElementById('rapp-erreurs')?.value        || 0);
 
  const map          = getMap();
  const soldeCompta  = map['521'] ? map['521'].debit - map['521'].credit : 0;
  const soldeAjuste  = soldeBanque + depOubl - recOubl + erreurs;
  const ecart        = soldeCompta - soldeAjuste;
 
  const resEl = document.getElementById('rapp-resultat');
  if (resEl) {
    resEl.style.display = 'block';
    resEl.innerHTML = `
      <div class="rapp-ligne"><span>Solde comptable (521)</span><span>${fn(soldeCompta)} FCFA</span></div>
      <div class="rapp-ligne"><span>Solde relevé bancaire</span><span>${fn(soldeBanque)} FCFA</span></div>
      <div class="rapp-ligne"><span>Dépenses non comptabilisées</span><span>+ ${fn(depOubl)} FCFA</span></div>
      <div class="rapp-ligne"><span>Recettes non comptabilisées</span><span>− ${fn(recOubl)} FCFA</span></div>
      <div class="rapp-ligne"><span>Corrections d'erreurs</span><span>${fn(erreurs)} FCFA</span></div>
      <div class="rapp-ligne rapp-total ${Math.abs(ecart) < 1 ? 'ok' : 'nok'}">
        <span>${Math.abs(ecart) < 1 ? '✓ Rapprochement équilibré' : '✗ Écart non résolu'}</span>
        <span>${fn(Math.abs(ecart))} FCFA</span>
      </div>`;
  }
}
 
 
// ══════════════════════════════════════════════════════════════════
// SECTION 40 — UTILITAIRES GLOBAUX & INITIALISATION
// ══════════════════════════════════════════════════════════════════
 
/** Réinitialiser toutes les données (avec confirmation) */
async function resetAllData() {
  if (!confirm('⚠️ ATTENTION : Cette action supprime TOUTES les écritures de cet exercice.\n\nCette action est irréversible. Confirmer ?')) return;
  if (!confirm('Dernière confirmation — Supprimer définitivement toutes les écritures ?')) return;
 
  try {
    const col  = window._fbCollection(window._db, 'profiles', currentProfile.id, 'ecritures');
    const snap = await window._fbGetDocs(col);
    const delP = [];
    snap.forEach(d => delP.push(window._fbDeleteDoc(window._fbDoc(window._db, 'profiles', currentProfile.id, 'ecritures', d.id))));
    await Promise.all(delP);
    ecritures = []; pieceCounter = 1; lignes = []; ecrQueue = []; ecrQueueIdx = 0;
    updateStats(); renderJournal(); initSaisie();
    toast('✓ Toutes les écritures ont été supprimées', 'info');
  } catch (e) { toast('Erreur suppression : ' + e.message, 'error'); }
}
 
/** Impression directe de la vue active */
function printCurrentView() {
  const views     = document.querySelectorAll('.view.active');
  const viewTitle = views[0]?.id?.replace('view-', '') || 'document';
  const content   = views[0]?.innerHTML || '';
  const company   = currentProfile?.company || 'Entreprise';
  const yr        = document.getElementById('exerciceYear')?.value || '';
  const now       = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
 
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>COMEO — ${viewTitle.toUpperCase()} — ${company}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;font-size:10pt;color:#111;padding:20mm}
      h1{font-size:14pt;margin-bottom:6pt;color:#0a0b10}
      .print-header{border-bottom:2pt solid #d4a853;padding-bottom:8pt;margin-bottom:16pt;display:flex;justify-content:space-between;align-items:flex-end}
      .print-header .left .company{font-size:16pt;font-weight:700;color:#0a0b10}
      .print-header .left .sub{font-size:8pt;color:#666;margin-top:3pt}
      .print-header .right{text-align:right;font-size:8.5pt;color:#555}
      table{width:100%;border-collapse:collapse;margin:10pt 0}
      th{background:#0a0b10;color:#d4a853;padding:5pt 8pt;font-size:8pt;text-align:left;font-weight:700}
      td{padding:4pt 8pt;border-bottom:0.5pt solid #e0dbd0;font-size:8.5pt}
      tr:nth-child(even) td{background:#faf8f4}
      .ct{background:#0a0b10;color:#d4a853;padding:1pt 5pt;border-radius:2pt;font-family:monospace;font-size:8pt}
      .debit{text-align:right;font-family:monospace;color:#1d4ed8}
      .credit{text-align:right;font-family:monospace;color:#166534}
      .total-row td{font-weight:700;background:#f0ece3!important}
      .empty-state,.nav-item,.btn-action,.adrop,.msg,.toast,.queue-bar{display:none!important}
      @media print{@page{margin:15mm}body{padding:0}}
    </style>
  </head><body>
    <div class="print-header">
      <div class="left">
        <div class="company">${company}</div>
        <div class="sub">SYSCOHADA Révisé 2017 · COMEO AI v4 · Exercice ${yr}</div>
      </div>
      <div class="right">
        <strong>${viewTitle.toUpperCase()}</strong><br>
        Édité le ${now}
      </div>
    </div>
    ${content}
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 400);
}
 
/** Copier le solde d'un compte dans le presse-papier */
function copierSolde(code) {
  const map = getMap();
  if (!map[code]) { toast('Compte introuvable', 'error'); return; }
  const s   = map[code].debit - map[code].credit;
  const txt = `${code} — ${PC[code] || 'Compte'} : ${s >= 0 ? 'Solde débiteur' : 'Solde créditeur'} ${fn(Math.abs(s))} FCFA`;
  navigator.clipboard?.writeText(txt).then(() => toast('Solde copié : ' + txt, 'success')).catch(() => toast('Copie impossible', 'error'));
}
 
/** Dupliquer une écriture existante vers la saisie */
function dupliquerEcriture(id) {
  const ecr = ecritures.find(e => e.id === id);
  if (!ecr) return;
  lignes = ecr.lignes.map(l => ({ ...l }));
  const jSelect  = document.getElementById('ecr-journal');
  const libInput = document.getElementById('ecr-libelle');
  if (jSelect)  jSelect.value  = ecr.journal;
  if (libInput) libInput.value = ecr.libelle || '';
  navigate('saisie');
  renderLignes();
  toast('Écriture dupliquée dans la saisie — modifiez et enregistrez', 'info');
}
 
/** Recherche globale multi-vues */
function globalSearch(query) {
  if (!query || query.length < 2) return;
  const q = query.toLowerCase().trim();
 
  // Chercher dans les écritures
  const found = ecritures.filter(e =>
    e.libelle?.toLowerCase().includes(q) ||
    e.piece?.toLowerCase().includes(q)   ||
    e.lignes.some(l => l.compte?.startsWith(q) || l.libelle?.toLowerCase().includes(q))
  );
 
  // Chercher dans le plan comptable
  const pcFound = Object.entries(PC).filter(([code, lib]) =>
    code.startsWith(q) || lib.toLowerCase().includes(q)
  ).slice(0, 10);
 
  if (found.length > 0) {
    navigate('journal');
    const searchEl = document.getElementById('journalSearch');
    if (searchEl) searchEl.value = query;
    renderJournal();
    toast(`${found.length} écriture${found.length > 1 ? 's' : ''} trouvée${found.length > 1 ? 's' : ''}`, 'info');
  } else if (pcFound.length > 0) {
    navigate('plancomptable');
    const pcSearchEl = document.getElementById('pcSearch');
    if (pcSearchEl) pcSearchEl.value = query;
    renderPlanComptable();
    toast(`${pcFound.length} compte${pcFound.length > 1 ? 's' : ''} trouvé${pcFound.length > 1 ? 's' : ''} dans le plan comptable`, 'info');
  } else {
    toast('Aucun résultat pour "' + query + '"', 'info');
  }
}
 
/** Raccourcis clavier globaux */
document.addEventListener('keydown', e => {
  // Escape — fermer modaux ouverts
  if (e.key === 'Escape') {
    ['factureModal','clientModal','fournisseurModal','profileModal','exportModal','rapprochementModal']
      .forEach(id => {
        const modal = document.getElementById(id);
        if (modal && modal.style.display !== 'none') modal.style.display = 'none';
      });
    closeRobot();
    closeMobileSidebar();
    document.getElementById('robot3DOverlay')?.remove();
  }
  // Ctrl+S — sauvegarder écriture si dans la vue saisie
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    const saisieView = document.getElementById('view-saisie');
    if (saisieView?.classList.contains('active')) { e.preventDefault(); saveEcriture(); }
  }
  // Ctrl+Shift+J — aller au journal
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') { e.preventDefault(); navigate('journal'); }
  // Ctrl+Shift+B — aller au bilan
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') { e.preventDefault(); navigate('bilan'); }
  // Ctrl+Shift+R — aller au résultat
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') { e.preventDefault(); navigate('resultat'); }
});
 
/** Gestion du rechargement de page avec session active */
window.addEventListener('beforeunload', e => {
  if (ecrQueue.length > 0 || lignes.some(l => l.compte && (l.debit || l.credit))) {
    e.preventDefault();
    e.returnValue = 'Des données non enregistrées seront perdues. Quitter quand même ?';
  }
});
 
/** Gestion responsive — redimensionnement */
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const active = document.querySelector('.view.active')?.id?.replace('view-', '');
    if (active && RENDERERS[active]) RENDERERS[active]();
  }, 300);
});
 
 
// ══════════════════════════════════════════════════════════════════
// SECTION 41 — INITIALISATION AU DÉMARRAGE
// ══════════════════════════════════════════════════════════════════
 
/** Vérification de la session Firebase au chargement */
onAuthStateChanged(auth, async user => {
  if (user) {
    try {
      await waitForFirebase();
      const snap = await window._fbGetDoc(window._fbDoc(window._db, 'profiles', user.uid));
      if (snap.exists()) {
        currentProfile = { ...snap.data(), id: user.uid };
        conversationHistory = [];
        await loadApp();
      } else {
        // Profil inexistant : forcer la déconnexion
        await signOut(auth);
        document.getElementById('appShell').style.display    = 'none';
        document.getElementById('authOverlay').style.display = 'flex';
      }
    } catch (e) {
      console.warn('[COMEO] Erreur session :', e.message);
      document.getElementById('appShell').style.display    = 'none';
      document.getElementById('authOverlay').style.display = 'flex';
    }
  } else {
    document.getElementById('appShell').style.display    = 'none';
    document.getElementById('authOverlay').style.display = 'flex';
  }
});
 
/** Expositions globales des fonctions HTML inline */
Object.assign(window, {
  // Auth
  switchTab, doLogin, doRegister, doLogout, doForgotPassword,
  // Navigation
  navigate, toggleMobileSidebar, closeMobileSidebar,
  // Saisie
  addLigne, removeLigne, saveEcriture, updateBalance, updateAccountSuggest,
  selectAccount, hideDropdown, initSaisie, renderLignes,
  // Queue IA
  autoSaveAllEcritures, autoSaveAllFromNotif, skipToNextEcriture,
  dismissFillBanner, hideMultiEcrBanner, hideSaisieNotif, goToSaisie,
  // Journal
  renderJournal, resetJournalFiltre, deleteEcriture, deleteGroupe,
  analyserJournalIA, dupliquerEcriture,
  // Grand livre
  renderGrandLivre, resetGLFiltre, toggleGL,
  // Balance
  renderBalance, resetBalanceFiltre, analyserBalanceIA,
  // États financiers
  renderBilan, renderResultat, renderTresorerie, renderPlanComptable,
  // Export
  openExportModal, closeExportModal, selectExport, doExport, updateExportOptions,
  exportPDFAvance, exportWordAvance, exportExcelAvance, printCurrentView,
  // Factures
  openFactureModal, closeFactureModal, openDevisModal, saveFacture,
  addFacLigne, removeFacLigne, updateFacTotaux, renderFacLignes,
  searchClientDrop, selectClientForFac, renderFactures, renderDevis,
  marquerPayee, supprimerFacture, convertirDevisEnFacture, resetFactureFiltre,
  exportFacturePDF, exportFactureWord, exportFactureExcel, exportFactureList,
  // Clients
  openClientModal, closeClientModal, saveClient, renderClients,
  newFactureForClient,
  // Fournisseurs
  openFournisseurModal, closeFournisseurModal, saveFournisseur, renderFournisseurs,
  // IA
  sendToAI, handleAiKey, quickAI,
  // Robot vocal
  openRobot, closeRobot, toggleRobotMic,
  // Profil
  openProfileModal, closeProfileModal, saveProfile, changeExercice,
  // Rapprochement
  ouvrirRapprochement, fermerRapprochement, calculerRapprochement,
  // Utilitaires
  resetAllData, copierSolde, globalSearch,
  // Helpers exposés
  fn, fs, fmt, fnPDF, formatDateFR,
  // Plan comptable
  PC, CLASS_NAMES, NATURE_MAP, JOURNAL_NAMES, JOURNAL_ICONS
});
 
console.log('[COMEO AI v4] ✓ Module chargé — SYSCOHADA Révisé 2017');
