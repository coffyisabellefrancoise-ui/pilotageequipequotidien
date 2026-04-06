// ─── Firebase initialisation (ES module) ─────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let fbApp = null;
let fbDb = null;
let fbListener = null;
let firebaseReady = false;

window._fbInit = function (config) {
  try {
    if (fbApp) {
      connectListener();
      return true;
    }
    fbApp = initializeApp(config, 'pilotage-' + Date.now());
    fbDb = getDatabase(fbApp);
    firebaseReady = true;
    connectListener();
    updateSyncUI('online');
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    updateSyncUI('error');
    return false;
  }
};

window._fbSave = async function (data) {
  if (!fbDb) return false;
  try {
    updateSyncUI('syncing');
    await set(ref(fbDb, 'pilotage'), data);
    updateSyncUI('online');
    return true;
  } catch (e) {
    console.error('Firebase save error:', e);
    updateSyncUI('error');
    return false;
  }
};

window._fbDisconnect = function () {
  if (fbListener) { fbListener(); fbListener = null; }
  fbApp = null; fbDb = null; firebaseReady = false;
  updateSyncUI('offline');
};

function connectListener() {
  if (!fbDb) return;
  if (fbListener) fbListener();
  const dataRef = ref(fbDb, 'pilotage');
  fbListener = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      window._onFirebaseData(data);
    }
  }, (error) => {
    console.error('Firebase listen error:', error);
    updateSyncUI('error');
  });
}

function updateSyncUI(state) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncLabel');
  const pill = document.getElementById('mainStatusPill');
  const pillText = document.getElementById('mainStatusText');
  const pillSub = document.getElementById('mainStatusSub');
  if (!dot) return;
  dot.className = 'sync-dot ' + state;
  if (state === 'online') {
    label.textContent = 'En ligne 🟢';
    if (pill) { pill.className = 'status-pill online'; pillText.textContent = 'Connecté à Firebase — données partagées'; pillSub.textContent = 'Toutes les modifications sont visibles par vos collègues en temps réel.'; }
  } else if (state === 'syncing') {
    label.textContent = 'Sync…';
  } else if (state === 'error') {
    label.textContent = 'Erreur 🔴';
    if (pill) { pill.className = 'status-pill offline'; pillText.textContent = 'Erreur de connexion Firebase'; pillSub.textContent = 'Vérifiez votre configuration Firebase dans Sauvegarde.'; }
  } else {
    label.textContent = 'Hors ligne';
    if (pill) { pill.className = 'status-pill offline'; pillText.textContent = 'Non connecté à Firebase'; pillSub.textContent = 'Configurez Firebase dans Sauvegarde pour partager les données.'; }
  }
}

// Firebase config — clé publique CDN (sécurité assurée par les Security Rules Firebase)
window._fbInit({
  apiKey: 'AIzaSyALwYbnckE9JPNXifR0NTXW6hy7yOxTsrE',
  projectId: 'pilotage-equipe',
  databaseURL: 'https://pilotage-equipe-default-rtdb.firebaseio.com',
});
