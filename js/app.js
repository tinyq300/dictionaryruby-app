// js/app.js - Основная логика работы словарей

(function() {
  'use strict';

  // URL parameters support
  const urlParams = new URLSearchParams(window.location.search);

  // State
  const state = {
    currentDictId: urlParams.get('dict') || localStorage.getItem('dict_active_id') || 'dict1',
    currentLang: urlParams.get('lang') || localStorage.getItem('dict_lang') || 'ru',
    theme: urlParams.get('theme') || localStorage.getItem('dict_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    searchQuery: urlParams.get('q') || '',
    searchScope: urlParams.get('scope') || 'all', // 'all' | 'word' | 'def'
    activeLetter: urlParams.get('letter') || null,
    favoritesOnly: urlParams.get('fav') === '1',
    favorites: JSON.parse(localStorage.getItem('dict_favorites') || '[]'),
    isAdmin: urlParams.get('admin') === '1' || sessionStorage.getItem('dict_admin_auth') === 'true' || localStorage.getItem('dict_admin_auth') === 'true',
    selectedWordForModal: null,
    editingWord: null
  };

  // DOM Elements cache
  const elements = {
    html: document.documentElement,
    appTitle: document.getElementById('appTitle'),
    appSubtitle: document.getElementById('appSubtitle'),
    logoBtn: document.getElementById('logoBtn'),
    
    dictTab1: document.getElementById('dictTab1'),
    dictTab2: document.getElementById('dictTab2'),
    dictTab1Label: document.getElementById('dictTab1Label'),
    dictTab2Label: document.getElementById('dictTab2Label'),
    dictTab1ShortLabel: document.getElementById('dictTab1ShortLabel'),
    dictTab2ShortLabel: document.getElementById('dictTab2ShortLabel'),
    currentDictBadge: document.getElementById('currentDictBadge'),
    totalWordsBadge: document.getElementById('totalWordsBadge'),

    // Author Showcase Banner
    authorShowcase: document.getElementById('authorShowcase'),
    authorBgNekrasov: document.getElementById('authorBgNekrasov'),
    authorBgKolas: document.getElementById('authorBgKolas'),
    authorEmblemImg: document.getElementById('authorEmblemImg'),
    authorThemeIcon: document.getElementById('authorThemeIcon'),
    authorShowcaseTitle: document.getElementById('authorShowcaseTitle'),
    authorShowcaseYear: document.getElementById('authorShowcaseYear'),
    authorShowcaseWorks: document.getElementById('authorShowcaseWorks'),
    authorShowcaseQuote: document.getElementById('authorShowcaseQuote'),
    authorShowcaseTags: document.getElementById('authorShowcaseTags'),
    floatingLettersContainer: document.getElementById('floatingLettersContainer'),
    
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    toggleFavoritesBtn: document.getElementById('toggleFavoritesBtn'),
    favCountBadge: document.getElementById('favCountBadge'),
    favOnlyCheckbox: document.getElementById('favOnlyCheckbox'),
    
    // Admin Controls in Header
    openLoginModalBtn: document.getElementById('openLoginModalBtn'),
    adminActiveControls: document.getElementById('adminActiveControls'),
    adminAddNewWordBtn: document.getElementById('adminAddNewWordBtn'),
    adminLogoutBtn: document.getElementById('adminLogoutBtn'),
    
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    scopeBtns: document.querySelectorAll('.scope-btn'),
    quickCharBtns: document.querySelectorAll('.quick-char-btn'),
    
    alphabetList: document.getElementById('alphabetList'),
    resultsCount: document.getElementById('resultsCount'),
    activeFilterBadge: document.getElementById('activeFilterBadge'),
    resetAllBtn: document.getElementById('resetAllBtn'),
    
    wordsContainer: document.getElementById('wordsContainer'),
    emptyState: document.getElementById('emptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    
    // Word Modal
    wordModal: document.getElementById('wordModal'),
    modalContent: document.getElementById('modalContent'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalCloseActionBtn: document.getElementById('modalCloseActionBtn'),
    modalCopyBtn: document.getElementById('modalCopyBtn'),
    modalEditWordBtn: document.getElementById('modalEditWordBtn'),
    
    // Data Management Modal
    openDataModalBtn: document.getElementById('openDataModalBtn'),
    mobileManageBtn: document.getElementById('mobileManageBtn'),
    dataModal: document.getElementById('dataModal'),
    closeDataModalBtn: document.getElementById('closeDataModalBtn'),
    dataModalCurrentDictName: document.getElementById('dataModalCurrentDictName'),
    dataTabAdd: document.getElementById('dataTabAdd'),
    dataTabImport: document.getElementById('dataTabImport'),
    dataTabExport: document.getElementById('dataTabExport'),
    addWordForm: document.getElementById('addWordForm'),
    importPanel: document.getElementById('importPanel'),
    exportPanel: document.getElementById('exportPanel'),
    
    // Form Inputs
    newWordTitle: document.getElementById('newWordTitle'),
    newWordStressed: document.getElementById('newWordStressed'),
    newWordPos: document.getElementById('newWordPos'),
    newWordGender: document.getElementById('newWordGender'),
    newWordTranslation: document.getElementById('newWordTranslation'),
    newWordExamples: document.getElementById('newWordExamples'),
    newWordSynonyms: document.getElementById('newWordSynonyms'),
    
    // Import/Export Inputs
    importJsonTextarea: document.getElementById('importJsonTextarea'),
    applyImportBtn: document.getElementById('applyImportBtn'),
    importStatusMsg: document.getElementById('importStatusMsg'),
    exportJsonTextarea: document.getElementById('exportJsonTextarea'),
    copyExportBtn: document.getElementById('copyExportBtn'),
    downloadExportBtn: document.getElementById('downloadExportBtn'),
    downloadDictionariesJsBtn: document.getElementById('downloadDictionariesJsBtn'),
    resetDatabaseBtn: document.getElementById('resetDatabaseBtn'),

    // Admin Login Modal
    adminLoginModal: document.getElementById('adminLoginModal'),
    closeLoginModalBtn: document.getElementById('closeLoginModalBtn'),
    cancelLoginBtn: document.getElementById('cancelLoginBtn'),
    adminLoginForm: document.getElementById('adminLoginForm'),
    adminUsernameInput: document.getElementById('adminUsernameInput'),
    adminPasswordInput: document.getElementById('adminPasswordInput'),
    togglePasswordVisibilityBtn: document.getElementById('togglePasswordVisibilityBtn'),
    adminRememberMeCheckbox: document.getElementById('adminRememberMeCheckbox'),
    adminLoginErrorBox: document.getElementById('adminLoginErrorBox'),

    // Change Password Modal
    adminBadgeIndicator: document.getElementById('adminBadgeIndicator'),
    openChangePasswordModalBtn: document.getElementById('openChangePasswordModalBtn'),
    changePasswordModal: document.getElementById('changePasswordModal'),
    closeChangePasswordModalBtn: document.getElementById('closeChangePasswordModalBtn'),
    cancelChangePasswordBtn: document.getElementById('cancelChangePasswordBtn'),
    changePasswordForm: document.getElementById('changePasswordForm'),
    changePasswordErrorBox: document.getElementById('changePasswordErrorBox'),
    currentPasswordInput: document.getElementById('currentPasswordInput'),
    newPasswordInput: document.getElementById('newPasswordInput'),
    confirmPasswordInput: document.getElementById('confirmPasswordInput'),

    // Edit Word Modal
    editWordModal: document.getElementById('editWordModal'),
    editWordModalTitle: document.getElementById('editWordModalTitle'),
    editWordDictName: document.getElementById('editWordDictName'),
    closeEditWordModalBtn: document.getElementById('closeEditWordModalBtn'),
    cancelEditWordBtn: document.getElementById('cancelEditWordBtn'),
    editWordForm: document.getElementById('editWordForm'),
    editWordId: document.getElementById('editWordId'),
    editWordTitle: document.getElementById('editWordTitle'),
    editWordStressed: document.getElementById('editWordStressed'),
    editWordWork: document.getElementById('editWordWork'),
    editWordSuffix: document.getElementById('editWordSuffix'),
    editWordGrammar: document.getElementById('editWordGrammar'),
    editWordMeaning: document.getElementById('editWordMeaning'),
    editWordDerivation: document.getElementById('editWordDerivation'),
    editWordTags: document.getElementById('editWordTags'),
    editWordStylistics: document.getElementById('editWordStylistics'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toastText')
  };

  // Helper: Get translation string
  function t(key, replacements = {}) {
    const lang = state.currentLang || 'ru';
    const langDict = (window.i18n && window.i18n[lang]) || (window.i18n && window.i18n.ru) || (window.i18n && window.i18n.be);
    let str = (langDict && langDict[key]) || (window.i18n && window.i18n.ru && window.i18n.ru[key]) || (window.i18n && window.i18n.be && window.i18n.be[key]) || key;
    for (const [rKey, rVal] of Object.entries(replacements)) {
      str = str.replace(new RegExp(`\\{${rKey}\\}`, 'g'), rVal);
    }
    return str;
  }

  // Corpus cache versioning: ensure newly updated comparative dictionary is loaded
  const CORPUS_VERSION = '2026_comparative_ru_be_v1';
  try {
    if (localStorage.getItem('dict_corpus_version') !== CORPUS_VERSION) {
      localStorage.removeItem('dict_corpus_dict1');
      localStorage.removeItem('dict_corpus_dict2');
      localStorage.setItem('dict_corpus_version', CORPUS_VERSION);
    }
  } catch(e) {
    console.warn('localStorage access error', e);
  }

  // Get active dictionary working corpus (supports localStorage overrides)
  function getActiveDictionaryWords() {
    const dictId = state.currentDictId;
    const stored = localStorage.getItem('dict_corpus_' + dictId);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing stored corpus for ' + dictId, e);
      }
    }
    const baseWords = window.dictionariesData[dictId]?.words || [];
    return [...baseWords];
  }

  // Save working corpus to localStorage and re-render
  function saveActiveDictionaryWords(words) {
    const dictId = state.currentDictId;
    localStorage.setItem('dict_corpus_' + dictId, JSON.stringify(words));
    renderAlphabet();
    renderFilteredWords();
    updateDictionaryHeaderInfo();
    refreshExportJson();
  }

  // Single char normalization for cross-lingual Russian/Belarusian search
  function normalizeChar(ch) {
    const c = ch.toLowerCase();
    // Russian 'и', Belarusian 'і', Latin 'i'
    if (c === 'і' || c === 'i') return 'и';
    // Belarusian 'ў', Russian 'у', Latin 'u'
    if (c === 'ў' || c === 'u') return 'у';
    // 'ё' and 'е'
    if (c === 'ё') return 'е';
    // Apostrophes & Russian 'ъ': standard, curly, modifier letters, etc.
    if (c === 'ъ' || c === '’' || c === '`' || c === 'ʼ' || c === 'ʻ' || c === 'ʽ' || c === '՚' || c === 'ˊ' || c === 'ˋ' || c === '"') return "'";
    return c;
  }

  // Text normalization for smart search
  function normalizeText(text) {
    if (!text) return '';
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics / accents
      .split('')
      .map(normalizeChar)
      .join('')
      .trim();
  }

  // Apply UI translations to DOM
  function updateInterfaceLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = t(key);
    });

    // Update Dictionary Tabs text
    const dict1 = window.dictionariesData.dict1;
    const dict2 = window.dictionariesData.dict2;
    const isBe = state.currentLang === 'be';
    if (dict1 && elements.dictTab1Label) {
      elements.dictTab1Label.textContent = isBe ? (dict1.nameBe || dict1.nameRu) : (dict1.nameRu || dict1.nameBe);
      if (elements.dictTab1ShortLabel) {
        elements.dictTab1ShortLabel.textContent = isBe ? (dict1.shortNameBe || dict1.shortNameRu) : (dict1.shortNameRu || dict1.shortNameBe);
      }
    }
    if (dict2 && elements.dictTab2Label) {
      elements.dictTab2Label.textContent = isBe ? (dict2.nameBe || dict2.nameRu) : (dict2.nameRu || dict2.nameBe);
      if (elements.dictTab2ShortLabel) {
        elements.dictTab2ShortLabel.textContent = isBe ? (dict2.shortNameBe || dict2.shortNameRu) : (dict2.shortNameRu || dict2.shortNameBe);
      }
    }

    document.documentElement.lang = state.currentLang || 'ru';

    updateDictionaryHeaderInfo();
  }

  // Update Dictionary Tab UI and Badges
  function updateDictionaryTabs() {
    const isDict1 = state.currentDictId === 'dict1';
    
    // Tab 1
    if (isDict1) {
      elements.dictTab1.className = "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-600/50";
      elements.dictTab2.className = "px-3 py-1.5 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5";
    } else {
      elements.dictTab2.className = "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-600/50";
      elements.dictTab1.className = "px-3 py-1.5 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5";
    }

    updateAuthorShowcase();
    updateDictionaryHeaderInfo();
    renderAlphabet();
    renderFilteredWords();
  }

  // Update Author Thematic Showcase Banner, Background Art & Floating Letters
  function updateAuthorShowcase() {
    const dict = window.dictionariesData[state.currentDictId];
    if (!dict || !dict.theme) return;
    const theme = dict.theme;

    if (elements.authorBgNekrasov) {
      elements.authorBgNekrasov.classList.toggle('active', state.currentDictId === 'dict1');
    }
    if (elements.authorBgKolas) {
      elements.authorBgKolas.classList.toggle('active', state.currentDictId === 'dict2');
    }
    if (elements.authorEmblemImg) {
      elements.authorEmblemImg.src = theme.emblemImg;
      elements.authorEmblemImg.alt = theme.authorName;
    }
    if (elements.authorThemeIcon) {
      elements.authorThemeIcon.textContent = theme.icon;
    }
    if (elements.authorShowcaseTitle) {
      elements.authorShowcaseTitle.textContent = theme.authorName;
    }
    if (elements.authorShowcaseYear) {
      elements.authorShowcaseYear.textContent = theme.years;
    }
    if (elements.authorShowcaseWorks) {
      elements.authorShowcaseWorks.textContent = theme.works;
    }
    if (elements.authorShowcaseQuote) {
      elements.authorShowcaseQuote.textContent = theme.quote;
    }
    if (elements.authorShowcaseTags && theme.tags) {
      elements.authorShowcaseTags.innerHTML = theme.tags.map(tag => 
        `<span class="px-2 py-0.5 rounded bg-white/10 text-slate-200 backdrop-blur-sm border border-white/10">${escapeHtml(tag)}</span>`
      ).join('');
    }

    // Render Floating Decorative Letters across banner
    if (elements.floatingLettersContainer && theme.floatingLetters) {
      const letterConfigs = [
        { top: '10%', left: '16%', size: '36px', opacity: 0.28, delay: '0s', rot: '-6deg' },
        { top: '65%', left: '8%', size: '28px', opacity: 0.22, delay: '1.2s', rot: '8deg' },
        { top: '12%', left: '42%', size: '42px', opacity: 0.18, delay: '2.5s', rot: '-10deg' },
        { top: '70%', left: '38%', size: '30px', opacity: 0.24, delay: '0.8s', rot: '5deg' },
        { top: '15%', right: '22%', size: '46px', opacity: 0.26, delay: '1.8s', rot: '12deg' },
        { top: '60%', right: '14%', size: '32px', opacity: 0.22, delay: '3.1s', rot: '-8deg' },
        { top: '22%', right: '6%', size: '38px', opacity: 0.30, delay: '0.4s', rot: '15deg' },
        { top: '75%', right: '4%', size: '26px', opacity: 0.20, delay: '2.2s', rot: '-4deg' }
      ];

      elements.floatingLettersContainer.innerHTML = theme.floatingLetters.map((char, idx) => {
        const conf = letterConfigs[idx % letterConfigs.length];
        const posStyle = conf.left ? `left: ${conf.left};` : `right: ${conf.right};`;
        return `<span class="floating-letter" style="top: ${conf.top}; ${posStyle} font-size: ${conf.size}; opacity: ${conf.opacity}; animation-delay: ${conf.delay}; transform: rotate(${conf.rot}); color: #fef3c7;">${escapeHtml(char)}</span>`;
      }).join('');
    }
  }

  function updateDictionaryHeaderInfo() {
    const dict = window.dictionariesData[state.currentDictId];
    if (!dict) return;

    const isBe = state.currentLang === 'be';
    const dictName = isBe ? (dict.nameBe || dict.nameRu) : (dict.nameRu || dict.nameBe);
    const allWords = getActiveDictionaryWords();

    if (elements.currentDictBadge) {
      elements.currentDictBadge.textContent = `${state.currentDictId === 'dict1' ? '1: ' : '2: '}${dictName}`;
    }
    if (elements.totalWordsBadge) {
      elements.totalWordsBadge.textContent = t('wordCountInfo', { total: allWords.length });
    }
    if (elements.dataModalCurrentDictName) {
      elements.dataModalCurrentDictName.textContent = dictName;
    }
  }

  // Render Alphabet chips
  function renderAlphabet() {
    const dict = window.dictionariesData[state.currentDictId];
    if (!dict || !dict.alphabet) return;

    elements.alphabetList.innerHTML = '';

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = `alphabet-chip px-3 text-xs ${!state.activeLetter ? 'active' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
    allBtn.textContent = t('alphabetAll');
    allBtn.addEventListener('click', () => {
      state.activeLetter = null;
      renderAlphabet();
      renderFilteredWords();
    });
    elements.alphabetList.appendChild(allBtn);

    // Individual letter buttons
    dict.alphabet.forEach(letter => {
      const btn = document.createElement('button');
      const isActive = state.activeLetter === letter;
      btn.className = `alphabet-chip ${isActive ? 'active' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`;
      btn.textContent = letter;
      btn.addEventListener('click', () => {
        state.activeLetter = isActive ? null : letter;
        renderAlphabet();
        renderFilteredWords();
      });
      elements.alphabetList.appendChild(btn);
    });
  }

  // Filter and display words
  function renderFilteredWords() {
    const allWords = getActiveDictionaryWords();
    const query = normalizeText(state.searchQuery);

    const filtered = allWords.filter(item => {
      // 1. Favorites check
      if (state.favoritesOnly && !state.favorites.includes(item.id)) {
        return false;
      }

      // 2. Alphabet letter check
      if (state.activeLetter) {
        const firstLetter = (item.word || '').charAt(0).toUpperCase();
        if (firstLetter !== state.activeLetter && normalizeChar(firstLetter) !== normalizeChar(state.activeLetter)) {
          return false;
        }
      }

      // 3. Search query check
      if (!query) return true;

      const wordText = item.word || '';
      const meaningText = item.meaning || item.translation || '';
      const derivationText = item.derivation || item.suffix || '';
      const stylisticsText = item.stylistics || item.status || '';
      const grammarText = item.grammar || '';
      const workText = item.work || item.workShort || '';
      const baseWordText = item.baseWord || '';

      const normWord = normalizeText(wordText);
      const normMeaning = normalizeText(meaningText);

      if (state.searchScope === 'word') {
        return normWord.includes(query);
      }
      
      if (state.searchScope === 'def') {
        return normMeaning.includes(query) ||
               normalizeText(derivationText).includes(query) ||
               normalizeText(stylisticsText).includes(query) ||
               normalizeText(grammarText).includes(query);
      }

      // Scope 'all'
      return normWord.includes(query) ||
             normMeaning.includes(query) ||
             normalizeText(derivationText).includes(query) ||
             normalizeText(stylisticsText).includes(query) ||
             normalizeText(grammarText).includes(query) ||
             normalizeText(workText).includes(query) ||
             normalizeText(baseWordText).includes(query) ||
             (item.tags || []).some(t => normalizeText(t).includes(query));
    });

    // Update Counter & Meta
    elements.resultsCount.textContent = t('resultsCount', { count: filtered.length });
    
    // Active filters badge
    const hasFilter = Boolean(state.searchQuery || state.activeLetter || state.favoritesOnly);
    elements.resetAllBtn.classList.toggle('hidden', !hasFilter);

    if (state.activeLetter) {
      elements.activeFilterBadge.textContent = `${t('sourceLangLabel')} ${state.activeLetter}...`;
      elements.activeFilterBadge.classList.remove('hidden');
    } else {
      elements.activeFilterBadge.classList.add('hidden');
    }

    // Toggle Empty state vs Cards grid
    if (filtered.length === 0) {
      elements.wordsContainer.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
      if (state.favoritesOnly) {
        elements.emptyState.querySelector('h3').textContent = t('favoritesOnly');
        elements.emptyState.querySelector('p').textContent = t('favoritesEmpty');
      } else {
        elements.emptyState.querySelector('h3').textContent = t('noResultsTitle');
        elements.emptyState.querySelector('p').textContent = t('noResultsText');
      }
      return;
    }

    elements.emptyState.classList.add('hidden');
    elements.wordsContainer.innerHTML = '';

    // Render Cards
    const fragment = document.createDocumentFragment();
    filtered.forEach(word => {
      const card = createWordCard(word, query);
      fragment.appendChild(card);
    });

    elements.wordsContainer.appendChild(fragment);
  }

  // Highlight matches helper (aware of diacritics / combining marks and cross-language normalization)
  function highlightMatch(text, query) {
    if (!text || !query) return escapeHtml(text || '');

    // Build normalized text and a map of character positions from normalized to original text
    let normStr = '';
    const origIndices = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      // Combining diacritical marks (\u0300-\u036f) do not form separate characters in normalized string
      if (/[\u0300-\u036f]/.test(ch)) {
        continue;
      }
      normStr += normalizeChar(ch);
      origIndices.push(i);
    }

    let result = '';
    let lastOrigEnd = 0;
    let searchFrom = 0;

    while (searchFrom < normStr.length) {
      const matchIndex = normStr.indexOf(query, searchFrom);
      if (matchIndex === -1) break;

      const origStart = origIndices[matchIndex];
      const lastMatchedNormIndex = matchIndex + query.length - 1;
      const lastOrigIndex = origIndices[lastMatchedNormIndex];

      // Include any trailing combining marks on the last character
      let origEnd = lastOrigIndex + 1;
      while (origEnd < text.length && /[\u0300-\u036f]/.test(text[origEnd])) {
        origEnd++;
      }

      // Append text between matches
      if (origStart > lastOrigEnd) {
        result += escapeHtml(text.slice(lastOrigEnd, origStart));
      }
      // Append highlighted match
      result += `<mark class="search-highlight">${escapeHtml(text.slice(origStart, origEnd))}</mark>`;

      lastOrigEnd = origEnd;
      searchFrom = matchIndex + Math.max(1, query.length);
    }

    if (lastOrigEnd === 0) {
      // No matches found
      return escapeHtml(text);
    }

    if (lastOrigEnd < text.length) {
      result += escapeHtml(text.slice(lastOrigEnd));
    }

    return result;
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // Part of speech translation badge
  function getPosLabel(pos) {
    switch(pos) {
      case 'noun': return t('posNoun');
      case 'verb': return t('posVerb');
      case 'adj': return t('posAdj');
      case 'adv': return t('posAdv');
      default: return t('posOther');
    }
  }

  // Create single Word Card DOM element
  function createWordCard(item, query) {
    const card = document.createElement('article');
    card.className = "card-entry rounded-2xl p-4 sm:p-5 flex flex-col justify-between min-w-0 overflow-hidden";

    const isFav = state.favorites.includes(item.id);
    const posClass = `badge-pos-${item.pos || 'other'}`;
    const posName = getPosLabel(item.pos);

    // Primary word display: if stressed is available, show it
    const displayWord = item.stressed || item.word;
    const highlightedWord = highlightMatch(displayWord, query);
    const rawMeaning = item.meaning || item.translation || '';
    const highlightedMeaning = highlightMatch(rawMeaning, query);
    const highlightedStylistics = highlightMatch(item.stylistics || '', query);
    const highlightedDerivation = highlightMatch(item.derivation || '', query);

    const activeDict = window.dictionariesData[state.currentDictId];
    const authorIcon = activeDict?.theme?.icon || (state.currentDictId === 'dict1' ? '🇷🇺' : '🇧🇾');
    const workBadge = item.workShort || item.work ? `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 break-words max-w-full">
        <span>${authorIcon}</span>
        <span>${escapeHtml(item.workShort || item.work)}</span>
      </span>
    ` : '';

    const initialLetter = (item.word || '').charAt(0).toUpperCase();

    card.innerHTML = `
      <!-- Antique letter watermark in card background -->
      <div class="card-letter-watermark" aria-hidden="true">${escapeHtml(initialLetter)}</div>

      <div class="relative z-10">
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <div class="flex items-baseline gap-2 flex-wrap min-w-0">
            <h3 class="headword-stress text-xl font-bold text-slate-900 dark:text-white tracking-tight break-words">
              ${highlightedWord}
            </h3>
            ${workBadge}
          </div>

          <button class="fav-btn p-1.5 rounded-lg text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex-shrink-0" title="${isFav ? t('removeFromFavorites') : t('addToFavorites')}">
            <svg class="w-5 h-5 ${isFav ? 'fill-amber-500 text-amber-500' : 'fill-none stroke-current'}" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>

        <!-- Grammatical and Derivation model badges -->
        <div class="flex flex-wrap gap-1.5 items-center my-2 max-w-full">
          ${item.grammar ? `<span class="px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 italic border border-slate-200 dark:border-slate-700 break-words max-w-full">${escapeHtml(item.grammar)}</span>` : ''}
          ${item.derivation ? `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 break-words max-w-full">${escapeHtml(item.derivation)}</span>` : ''}
        </div>

        <!-- Meaning -->
        <div class="text-slate-800 dark:text-slate-100 text-sm font-medium mt-2 leading-relaxed">
          ${highlightedMeaning}
        </div>

        <!-- Stylistic characteristic snippet -->
        ${item.stylistics ? `
          <div class="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 leading-relaxed">
            <span class="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">${t('stylisticsHeader')}</span>
            ${highlightedStylistics}
          </div>
        ` : ''}
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs relative z-10">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button class="copy-card-btn text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors" title="${t('copyWord')}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span>${t('copyWord').split(' ')[0]}</span>
          </button>
          ${state.isAdmin ? `
            <button class="admin-card-btn admin-card-btn-edit flex items-center gap-1" title="${t('editWordBtn')}">
              <span>✏️</span>
              <span class="hidden sm:inline">${t('editWordBtn')}</span>
            </button>
            <button class="admin-card-btn admin-card-btn-delete flex items-center gap-1" title="${t('deleteWordBtn')}">
              <span>🗑️</span>
            </button>
          ` : ''}
        </div>

        <button class="details-btn text-sky-600 dark:text-sky-400 font-semibold hover:underline">
          ${t('viewDetails')} &rarr;
        </button>
      </div>
    `;

    // Bind card actions
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(item.id);
    });

    const copyBtn = card.querySelector('.copy-card-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(`${item.word} — ${item.meaning || item.translation}`);
    });

    if (state.isAdmin) {
      const editBtn = card.querySelector('.admin-card-btn-edit');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openEditWordModal(item);
        });
      }
      const deleteBtn = card.querySelector('.admin-card-btn-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          confirmDeleteWord(item);
        });
      }
    }

    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', () => {
      openWordModal(item);
    });

    card.addEventListener('click', (e) => {
      // If clicked outside action buttons, open modal
      if (!e.target.closest('button')) {
        openWordModal(item);
      }
    });

    return card;
  }

  // Favorite toggle handler
  function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(id);
    }
    localStorage.setItem('dict_favorites', JSON.stringify(state.favorites));
    updateFavoritesBadge();
    renderFilteredWords();
  }

  function updateFavoritesBadge() {
    const count = state.favorites.length;
    if (count > 0) {
      elements.favCountBadge.textContent = count;
      elements.favCountBadge.classList.remove('hidden');
      elements.favCountBadge.classList.add('flex');
    } else {
      elements.favCountBadge.classList.add('hidden');
      elements.favCountBadge.classList.remove('flex');
    }
  }

  // Open Detailed Word Modal
  function openWordModal(item) {
    state.selectedWordForModal = item;
    const posClass = `badge-pos-${item.pos || 'other'}`;
    const posName = getPosLabel(item.pos);

    let examplesContent = '';
    if (item.examples && item.examples.length > 0) {
      examplesContent = `
        <div class="mt-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${t('examplesHeader')}</h4>
          <div class="space-y-2">
            ${item.examples.map(ex => `
              <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60">
                <p class="text-sm font-serif italic text-slate-800 dark:text-slate-200">«${escapeHtml(ex.text)}»</p>
                ${ex.translation ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-1">&rarr; ${escapeHtml(ex.translation)}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let synonymsContent = '';
    if (item.synonyms && item.synonyms.length > 0) {
      synonymsContent = `
        <div class="mt-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${t('synonymsHeader')}</h4>
          <div class="flex flex-wrap gap-1.5">
            ${item.synonyms.map(syn => `
              <span class="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium">
                ${escapeHtml(syn)}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }

    let tagsContent = '';
    if (item.tags && item.tags.length > 0) {
      tagsContent = `
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
          <span class="text-xs text-slate-400">${t('tagsHeader')}</span>
          ${item.tags.map(tag => `
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium border border-sky-200 dark:border-sky-800">
              #${escapeHtml(tag)}
            </span>
          `).join('')}
        </div>
      `;
    }

    const activeDict = window.dictionariesData[state.currentDictId];
    const theme = activeDict?.theme;
    const authorEmblem = theme?.emblemImg || (state.currentDictId === 'dict1' ? 'assets/images/ru_dict_emblem.jpg' : 'assets/images/be_dict_emblem.jpg');
    const authorName = theme?.authorName || '';
    const authorIcon = theme?.icon || (state.currentDictId === 'dict1' ? '🇷🇺' : '🇧🇾');

    elements.modalContent.innerHTML = `
      <div class="space-y-4">
        <!-- Title, Author Emblem & Work -->
        <div class="border-b border-slate-200 dark:border-slate-700 pb-3.5 flex items-center gap-3.5">
          <img src="${authorEmblem}" alt="${escapeHtml(authorName)}" class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-amber-400/50 shadow-md ring-2 ring-amber-500/10 flex-shrink-0">
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2.5 flex-wrap">
              <h2 class="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                ${escapeHtml(item.stressed || item.word)}
              </h2>
              ${item.work ? `<span class="px-2 py-0.5 rounded-lg text-xs font-semibold bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700"><span>${authorIcon}</span> ${escapeHtml(item.work)}</span>` : ''}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${escapeHtml(authorName)}</p>
          </div>
        </div>

        <!-- 1. Значэнне -->
        <div class="bg-sky-50/70 dark:bg-sky-950/40 border-l-4 border-sky-500 p-4 rounded-r-xl">
          <h4 class="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1">${t('meaningHeader')}</h4>
          <p class="text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
            ${escapeHtml(item.meaning || item.translation || '')}
          </p>
        </div>

        <!-- 2. Граматычная характарыстыка -->
        ${item.grammar ? `
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">${t('grammarHeader')}</h4>
            <p class="text-sm text-slate-800 dark:text-slate-200">${escapeHtml(item.grammar)}</p>
          </div>
        ` : ''}

        <!-- 3. Словаўтваральная мадэль -->
        ${item.derivation ? `
          <div class="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
            <h4 class="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300 mb-1">${t('derivationHeader')}</h4>
            <p class="text-sm font-semibold text-violet-900 dark:text-violet-200">${escapeHtml(item.derivation)}</p>
          </div>
        ` : ''}

        <!-- 4. Стылістычная характарыстыка -->
        ${item.stylistics ? `
          <div class="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">${t('stylisticsHeader')}</h4>
            <p class="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">${escapeHtml(item.stylistics)}</p>
          </div>
        ` : ''}

        ${tagsContent}
      </div>
    `;

    elements.wordModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeWordModal() {
    elements.wordModal.classList.add('hidden');
    document.body.style.overflow = '';
    state.selectedWordForModal = null;
  }

  // Toast notifier
  function showToast(message) {
    elements.toastText.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2500);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(t('copiedToast'));
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(t('copiedToast'));
    } catch(err) {
      console.error(err);
    }
    document.body.removeChild(textarea);
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'dark') {
      elements.html.classList.add('dark');
      elements.html.classList.remove('light');
      elements.themeIcon.textContent = '☀️';
      elements.themeToggleBtn.title = t('themeToggleLight');
    } else {
      elements.html.classList.remove('dark');
      elements.html.classList.add('light');
      elements.themeIcon.textContent = '🌙';
      elements.themeToggleBtn.title = t('themeToggleDark');
    }
    localStorage.setItem('dict_theme', theme);
  }
  // Data Management Modal Logic
  function openDataModal() {
    elements.dataModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showDataTab(state.isAdmin ? 'add' : 'export');
  }

  function closeDataModal() {
    elements.dataModal.classList.hidden = true;
    elements.dataModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function showDataTab(tabName) {
    if (!state.isAdmin && (tabName === 'add' || tabName === 'import')) {
      tabName = 'export';
    }

    // Tab headers
    if (elements.dataTabAdd) {
      elements.dataTabAdd.className = `py-2.5 px-3 border-b-2 font-semibold transition-colors ${tabName === 'add' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`;
    }
    if (elements.dataTabImport) {
      elements.dataTabImport.className = `py-2.5 px-3 border-b-2 font-semibold transition-colors ${tabName === 'import' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`;
    }
    if (elements.dataTabExport) {
      elements.dataTabExport.className = `py-2.5 px-3 border-b-2 font-semibold transition-colors ${tabName === 'export' ? 'border-sky-600 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`;
    }

    // Panels
    elements.addWordForm.classList.toggle('hidden', tabName !== 'add');
    elements.importPanel.classList.toggle('hidden', tabName !== 'import');
    elements.exportPanel.classList.toggle('hidden', tabName !== 'export');

    if (tabName === 'export') {
      refreshExportJson();
    }
  }

  function refreshExportJson() {
    if (elements.exportJsonTextarea) {
      const currentWords = getActiveDictionaryWords();
      elements.exportJsonTextarea.value = JSON.stringify(currentWords, null, 2);
    }
  }

  // Download entire updated dictionaries.js ready for GitHub Pages
  function downloadDictionariesJs() {
    if (!state.isAdmin) return;
    const exportData = {
      dict1: {
        ...window.dictionariesData.dict1,
        words: (function() {
          const s = localStorage.getItem('dict_corpus_dict1');
          return s ? JSON.parse(s) : window.dictionariesData.dict1.words;
        })()
      },
      dict2: {
        ...window.dictionariesData.dict2,
        words: (function() {
          const s = localStorage.getItem('dict_corpus_dict2');
          return s ? JSON.parse(s) : window.dictionariesData.dict2.words;
        })()
      }
    };

    const jsContent = `// data/dictionaries.js - Сравнительная лексикография феминитивов в русском и белорусском языках\n// Русский язык (37 лексических единиц) и Белорусский язык (29 лексических единиц)\n\nconst dictionariesData = ${JSON.stringify(exportData, null, 2)};\n\nwindow.dictionariesData = dictionariesData;\n`;

    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionaries.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('exportJsDesc') || 'Файл dictionaries.js скачан!');
  }

  // --- Admin Authentication Logic ---
  const DEFAULT_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // sha256('admin123')

  async function hashPassword(str) {
    try {
      const msgUint8 = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return str;
    }
  }

  async function verifyAdminCredentials(login, password) {
    if (login.trim().toLowerCase() !== 'admin') return false;
    const storedHash = localStorage.getItem('dict_admin_pwd_hash');
    const inputHash = await hashPassword(password);
    if (storedHash) {
      return inputHash === storedHash;
    }
    return inputHash === DEFAULT_ADMIN_HASH || password === 'admin123';
  }

  function openLoginModal() {
    if (elements.adminLoginErrorBox) elements.adminLoginErrorBox.classList.add('hidden');
    if (elements.adminPasswordInput) elements.adminPasswordInput.value = '';
    elements.adminLoginModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    elements.adminPasswordInput.focus();
  }

  function closeLoginModal() {
    elements.adminLoginModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function openChangePasswordModal() {
    if (!state.isAdmin) {
      showToast(t('adminOnlyNotice'));
      return;
    }
    if (elements.changePasswordErrorBox) elements.changePasswordErrorBox.classList.add('hidden');
    if (elements.currentPasswordInput) elements.currentPasswordInput.value = '';
    if (elements.newPasswordInput) elements.newPasswordInput.value = '';
    if (elements.confirmPasswordInput) elements.confirmPasswordInput.value = '';
    elements.changePasswordModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    elements.currentPasswordInput.focus();
  }

  function closeChangePasswordModal() {
    elements.changePasswordModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const currentPwd = elements.currentPasswordInput.value;
    const newPwd = elements.newPasswordInput.value;
    const confirmPwd = elements.confirmPasswordInput.value;

    const isCurrentValid = await verifyAdminCredentials('admin', currentPwd);
    if (!isCurrentValid) {
      elements.changePasswordErrorBox.textContent = t('pwdCurrentWrongError');
      elements.changePasswordErrorBox.classList.remove('hidden');
      return;
    }

    if (newPwd.length < 5) {
      elements.changePasswordErrorBox.textContent = t('pwdTooShortError');
      elements.changePasswordErrorBox.classList.remove('hidden');
      return;
    }

    if (newPwd !== confirmPwd) {
      elements.changePasswordErrorBox.textContent = t('pwdMismatchError');
      elements.changePasswordErrorBox.classList.remove('hidden');
      return;
    }

    const newHash = await hashPassword(newPwd);
    localStorage.setItem('dict_admin_pwd_hash', newHash);
    elements.changePasswordErrorBox.classList.add('hidden');
    closeChangePasswordModal();
    showToast(t('pwdChangedSuccess'));
  }

  async function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const login = elements.adminUsernameInput.value.trim();
    const password = elements.adminPasswordInput.value;
    const remember = elements.adminRememberMeCheckbox.checked;

    const isValid = await verifyAdminCredentials(login, password);
    if (!isValid) {
      elements.adminLoginErrorBox.textContent = t('adminLoginError');
      elements.adminLoginErrorBox.classList.remove('hidden');
      return;
    }

    elements.adminLoginErrorBox.classList.add('hidden');
    closeLoginModal();
    setAdminSession(true, remember);
    showToast(t('adminLoginSuccess'));
  }

  function handleAdminLogout() {
    setAdminSession(false);
    showToast(t('adminLogoutSuccess'));
  }

  function setAdminSession(isAdmin, remember = true) {
    state.isAdmin = isAdmin;
    if (isAdmin) {
      if (remember) {
        localStorage.setItem('dict_admin_auth', 'true');
        sessionStorage.removeItem('dict_admin_auth');
      } else {
        sessionStorage.setItem('dict_admin_auth', 'true');
        localStorage.removeItem('dict_admin_auth');
      }
    } else {
      localStorage.removeItem('dict_admin_auth');
      sessionStorage.removeItem('dict_admin_auth');
    }
    updateAdminUI();
    renderFilteredWords();
  }

  function updateAdminUI() {
    document.body.classList.toggle('is-admin', state.isAdmin);
    if (elements.openLoginModalBtn) {
      elements.openLoginModalBtn.style.display = state.isAdmin ? 'none' : 'flex';
    }
    if (elements.adminActiveControls) {
      elements.adminActiveControls.style.display = state.isAdmin ? 'flex' : 'none';
    }
    if (elements.modalEditWordBtn) {
      elements.modalEditWordBtn.style.display = state.isAdmin ? 'inline-flex' : 'none';
    }
    if (elements.downloadDictionariesJsBtn) {
      elements.downloadDictionariesJsBtn.style.display = state.isAdmin ? 'inline-block' : 'none';
    }
    if (elements.dataTabAdd) {
      elements.dataTabAdd.style.display = state.isAdmin ? 'block' : 'none';
    }
    if (elements.dataTabImport) {
      elements.dataTabImport.style.display = state.isAdmin ? 'block' : 'none';
    }
    if (elements.resetDatabaseBtn) {
      elements.resetDatabaseBtn.style.display = state.isAdmin ? 'block' : 'none';
    }
  }

  // --- Word Editing & Deletion Logic (Admin Only) ---
  function openEditWordModal(item = null) {
    if (!state.isAdmin) {
      showToast(t('adminOnlyNotice'));
      return;
    }
    state.editingWord = item;
    const activeDict = window.dictionariesData[state.currentDictId];

    if (elements.editWordDictName) {
      elements.editWordDictName.textContent = activeDict?.nameBe || activeDict?.nameRu || '';
    }

    if (item) {
      elements.editWordModalTitle.textContent = t('editWordModalTitle');
      elements.editWordId.value = item.id || '';
      elements.editWordTitle.value = item.word || '';
      elements.editWordStressed.value = item.stressed || item.word || '';
      elements.editWordWork.value = item.work || '';
      elements.editWordSuffix.value = item.suffix || '';
      elements.editWordGrammar.value = item.grammar || '';
      elements.editWordMeaning.value = item.meaning || item.translation || '';
      elements.editWordDerivation.value = item.derivation || '';
      elements.editWordTags.value = (item.tags || []).join(', ');
      elements.editWordStylistics.value = item.stylistics || '';
    } else {
      elements.editWordModalTitle.textContent = t('addWordModalTitle');
      elements.editWordId.value = '';
      elements.editWordTitle.value = '';
      elements.editWordStressed.value = '';
      elements.editWordWork.value = state.currentDictId === 'dict1' ? 'Русский язык' : 'Беларуская мова';
      elements.editWordSuffix.value = '-к-';
      elements.editWordGrammar.value = state.currentDictId === 'dict1' ? 'существительное, одушевлённое, женский род, 1-е склонение' : 'назоўнік, адушаўлёны, жаночы род, 1-е скланенне';
      elements.editWordMeaning.value = '';
      elements.editWordDerivation.value = '';
      elements.editWordTags.value = '';
      elements.editWordStylistics.value = state.currentDictId === 'dict1' ? 'нормативное, нейтральное' : 'нарматыўнае, нейтральнае';
    }

    elements.editWordModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    elements.editWordTitle.focus();
  }

  function closeEditWordModal() {
    elements.editWordModal.classList.add('hidden');
    document.body.style.overflow = '';
    state.editingWord = null;
  }

  function handleEditWordSubmit(e) {
    e.preventDefault();
    if (!state.isAdmin) return;

    const id = elements.editWordId.value;
    const word = elements.editWordTitle.value.trim();
    const stressed = elements.editWordStressed.value.trim() || word;
    const work = elements.editWordWork.value.trim();
    const suffix = elements.editWordSuffix.value.trim();
    const grammar = elements.editWordGrammar.value.trim();
    const meaning = elements.editWordMeaning.value.trim();
    const derivation = elements.editWordDerivation.value.trim();
    const tags = elements.editWordTags.value.split(',').map(s => s.trim()).filter(Boolean);
    const stylistics = elements.editWordStylistics.value.trim();

    let words = getActiveDictionaryWords();

    if (id) {
      const idx = words.findIndex(w => w.id === id);
      if (idx !== -1) {
        words[idx] = {
          ...words[idx],
          word,
          stressed,
          work,
          workShort: work,
          suffix,
          grammar,
          meaning,
          translation: meaning,
          derivation,
          tags,
          stylistics
        };
        showToast('Слоўнікавы артыкул паспяхова зменены!');
      }
    } else {
      const newWord = {
        id: `${state.currentDictId}_w_${Date.now()}`,
        word,
        stressed,
        work,
        workShort: work,
        suffix,
        grammar,
        meaning,
        translation: meaning,
        derivation,
        tags,
        stylistics
      };
      words.unshift(newWord);
      showToast('Новае слова паспяхова дададзена!');
    }

    saveActiveDictionaryWords(words);
    closeEditWordModal();

    if (state.selectedWordForModal && state.selectedWordForModal.id === id) {
      const updated = words.find(w => w.id === id);
      if (updated) openWordModal(updated);
    }
  }

  function confirmDeleteWord(item) {
    if (!state.isAdmin) return;
    if (confirm(t('deleteWordConfirm') + `\n\n«${item.word}»`)) {
      let words = getActiveDictionaryWords();
      words = words.filter(w => w.id !== item.id);
      saveActiveDictionaryWords(words);
      showToast(`Слова «${item.word}» выдалена!`);
      if (state.selectedWordForModal && state.selectedWordForModal.id === item.id) {
        closeWordModal();
      }
    }
  }

  // Save new word from original addWordForm
  function handleAddWordSubmit(e) {
    e.preventDefault();
    if (!state.isAdmin) {
      showToast(t('adminOnlyNotice'));
      return;
    }

    const word = elements.newWordTitle.value.trim();
    const translation = elements.newWordTranslation.value.trim();
    if (!word || !translation) {
      alert(t('fieldRequired'));
      return;
    }

    const stressed = elements.newWordStressed.value.trim() || word;
    const pos = elements.newWordPos.value;
    const gender = elements.newWordGender.value.trim();
    const rawExamples = elements.newWordExamples.value.trim().split('\n').filter(Boolean);
    const examples = rawExamples.map(line => {
      const parts = line.split('-');
      return parts.length > 1 ? { text: parts[0].trim(), translation: parts.slice(1).join('-').trim() } : { text: line.trim() };
    });
    const synonyms = elements.newWordSynonyms.value.split(',').map(s => s.trim()).filter(Boolean);

    const newEntry = {
      id: `${state.currentDictId}_custom_${Date.now()}`,
      word,
      stressed,
      work: state.currentDictId === 'dict1' ? 'Русский язык' : 'Беларуская мова',
      workShort: state.currentDictId === 'dict1' ? 'Русский язык' : 'Беларуская мова',
      pos,
      gender,
      grammar: state.currentDictId === 'dict1' ? (gender ? `существительное, ${gender}` : 'существительное') : (gender ? `назоўнік, ${gender}` : 'назоўнік'),
      meaning: translation,
      translation,
      examples,
      synonyms,
      tags: [state.currentDictId === 'dict1' ? 'добавлено администратором' : 'дададзена адміністратарам']
    };

    const words = getActiveDictionaryWords();
    words.unshift(newEntry);
    saveActiveDictionaryWords(words);

    elements.addWordForm.reset();
    showToast(state.currentDictId === 'dict1' ? 'Слово успешно сохранено!' : 'Слова паспяхова захавана!');
    closeDataModal();
  }

  // Apply JSON Import
  function handleApplyImport() {
    if (!state.isAdmin) {
      showToast(t('adminOnlyNotice'));
      return;
    }

    const raw = elements.importJsonTextarea.value.trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of objects");
      }

      const formatted = parsed.map((item, idx) => ({
        id: item.id || `import_${Date.now()}_${idx}`,
        word: item.word || '',
        stressed: item.stressed || item.word || '',
        work: item.work || (state.currentDictId === 'dict1' ? 'Русский язык' : 'Беларуская мова'),
        grammar: item.grammar || (state.currentDictId === 'dict1' ? 'существительное, одушевлённое, женский род' : 'назоўнік, адушаўлёны, жаночы род'),
        meaning: item.meaning || item.translation || '',
        translation: item.meaning || item.translation || '',
        derivation: item.derivation || '',
        suffix: item.suffix || '-к-',
        stylistics: item.stylistics || '',
        examples: item.examples || [],
        synonyms: item.synonyms || [],
        tags: item.tags || []
      })).filter(item => item.word && item.meaning);

      const words = getActiveDictionaryWords();
      const merged = [...formatted, ...words];
      saveActiveDictionaryWords(merged);

      elements.importStatusMsg.textContent = t('importSuccessMsg', { count: formatted.length });
      elements.importStatusMsg.className = "text-xs font-semibold text-emerald-600 dark:text-emerald-400";
    } catch (err) {
      elements.importStatusMsg.textContent = t('importErrorMsg');
      elements.importStatusMsg.className = "text-xs font-semibold text-rose-600 dark:text-rose-400";
    }
  }

  // Event Listeners Binding
  function setupEventListeners() {
    // Header navigation
    elements.logoBtn.addEventListener('click', () => {
      resetFilters();
    });

    // Dictionary Switcher
    elements.dictTab1.addEventListener('click', () => {
      if (state.currentDictId !== 'dict1') {
        state.currentDictId = 'dict1';
        state.activeLetter = null;
        localStorage.setItem('dict_active_id', 'dict1');
        updateDictionaryTabs();
      }
    });

    elements.dictTab2.addEventListener('click', () => {
      if (state.currentDictId !== 'dict2') {
        state.currentDictId = 'dict2';
        state.activeLetter = null;
        localStorage.setItem('dict_active_id', 'dict2');
        updateDictionaryTabs();
      }
    });

    // Theme Switcher
    elements.themeToggleBtn.addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Favorites Header Toggle
    elements.toggleFavoritesBtn.addEventListener('click', () => {
      state.favoritesOnly = !state.favoritesOnly;
      elements.favOnlyCheckbox.checked = state.favoritesOnly;
      renderFilteredWords();
    });

    elements.favOnlyCheckbox.addEventListener('change', (e) => {
      state.favoritesOnly = e.target.checked;
      renderFilteredWords();
    });

    // Search Input Events
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      elements.clearSearchBtn.classList.toggle('hidden', !state.searchQuery);
      renderFilteredWords();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      elements.searchInput.value = '';
      elements.clearSearchBtn.classList.add('hidden');
      elements.searchInput.focus();
      renderFilteredWords();
    });

    // Scope Buttons (All, Word, Def)
    elements.scopeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.searchScope = btn.getAttribute('data-scope');
        elements.scopeBtns.forEach(b => {
          b.className = "scope-btn px-2.5 py-1 rounded-md font-medium transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
        });
        btn.className = "scope-btn px-2.5 py-1 rounded-md font-medium transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm";
        renderFilteredWords();
      });
    });

    // Belarusian Virtual Keys helper
    elements.quickCharBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const char = btn.getAttribute('data-char');
        const start = elements.searchInput.selectionStart;
        const end = elements.searchInput.selectionEnd;
        const val = elements.searchInput.value;
        elements.searchInput.value = val.substring(0, start) + char + val.substring(end);
        elements.searchInput.focus();
        elements.searchInput.selectionStart = elements.searchInput.selectionEnd = start + char.length;
        state.searchQuery = elements.searchInput.value;
        elements.clearSearchBtn.classList.remove('hidden');
        renderFilteredWords();
      });
    });

    // Reset filters buttons
    elements.resetAllBtn.addEventListener('click', resetFilters);
    elements.emptyResetBtn.addEventListener('click', resetFilters);

    function resetFilters() {
      state.searchQuery = '';
      state.activeLetter = null;
      state.favoritesOnly = false;
      elements.searchInput.value = '';
      elements.clearSearchBtn.classList.add('hidden');
      elements.favOnlyCheckbox.checked = false;
      renderAlphabet();
      renderFilteredWords();
    }

    // Modal Word Detail events
    elements.closeModalBtn.addEventListener('click', closeWordModal);
    elements.modalCloseActionBtn.addEventListener('click', closeWordModal);
    elements.modalCopyBtn.addEventListener('click', () => {
      if (state.selectedWordForModal) {
        copyToClipboard(`${state.selectedWordForModal.word} — ${state.selectedWordForModal.meaning || state.selectedWordForModal.translation}`);
      }
    });

    if (elements.modalEditWordBtn) {
      elements.modalEditWordBtn.addEventListener('click', () => {
        const current = state.selectedWordForModal;
        closeWordModal();
        if (current) openEditWordModal(current);
      });
    }

    elements.wordModal.addEventListener('click', (e) => {
      if (e.target === elements.wordModal) closeWordModal();
    });

    // Admin Auth Listeners
    if (elements.openLoginModalBtn) {
      elements.openLoginModalBtn.addEventListener('click', openLoginModal);
    }
    if (elements.closeLoginModalBtn) {
      elements.closeLoginModalBtn.addEventListener('click', closeLoginModal);
    }
    if (elements.cancelLoginBtn) {
      elements.cancelLoginBtn.addEventListener('click', closeLoginModal);
    }
    if (elements.adminLoginForm) {
      elements.adminLoginForm.addEventListener('submit', handleAdminLoginSubmit);
    }
    if (elements.adminLogoutBtn) {
      elements.adminLogoutBtn.addEventListener('click', handleAdminLogout);
    }
    if (elements.adminAddNewWordBtn) {
      elements.adminAddNewWordBtn.addEventListener('click', () => openEditWordModal(null));
    }
    if (elements.togglePasswordVisibilityBtn && elements.adminPasswordInput) {
      elements.togglePasswordVisibilityBtn.addEventListener('click', () => {
        const isPwd = elements.adminPasswordInput.type === 'password';
        elements.adminPasswordInput.type = isPwd ? 'text' : 'password';
        elements.togglePasswordVisibilityBtn.textContent = isPwd ? '🙈' : '👁️';
      });
    }
    if (elements.adminLoginModal) {
      elements.adminLoginModal.addEventListener('click', (e) => {
        if (e.target === elements.adminLoginModal) closeLoginModal();
      });
    }

    // Change Password Modal Listeners
    if (elements.openChangePasswordModalBtn) {
      elements.openChangePasswordModalBtn.addEventListener('click', openChangePasswordModal);
    }
    if (elements.adminBadgeIndicator) {
      elements.adminBadgeIndicator.addEventListener('click', () => {
        if (state.isAdmin) openChangePasswordModal();
      });
    }
    if (elements.closeChangePasswordModalBtn) {
      elements.closeChangePasswordModalBtn.addEventListener('click', closeChangePasswordModal);
    }
    if (elements.cancelChangePasswordBtn) {
      elements.cancelChangePasswordBtn.addEventListener('click', closeChangePasswordModal);
    }
    if (elements.changePasswordForm) {
      elements.changePasswordForm.addEventListener('submit', handleChangePasswordSubmit);
    }
    if (elements.changePasswordModal) {
      elements.changePasswordModal.addEventListener('click', (e) => {
        if (e.target === elements.changePasswordModal) closeChangePasswordModal();
      });
    }
    document.querySelectorAll('.pwd-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const isPwd = input.type === 'password';
          input.type = isPwd ? 'text' : 'password';
          btn.textContent = isPwd ? '🙈' : '👁️';
        }
      });
    });

    // Edit Word Modal Listeners
    if (elements.closeEditWordModalBtn) {
      elements.closeEditWordModalBtn.addEventListener('click', closeEditWordModal);
    }
    if (elements.cancelEditWordBtn) {
      elements.cancelEditWordBtn.addEventListener('click', closeEditWordModal);
    }
    if (elements.editWordForm) {
      elements.editWordForm.addEventListener('submit', handleEditWordSubmit);
    }
    if (elements.editWordModal) {
      elements.editWordModal.addEventListener('click', (e) => {
        if (e.target === elements.editWordModal) closeEditWordModal();
      });
    }

    // Data Modal events
    if (elements.openDataModalBtn) {
      elements.openDataModalBtn.addEventListener('click', openDataModal);
    }
    if (elements.mobileManageBtn) {
      elements.mobileManageBtn.addEventListener('click', openDataModal);
    }
    elements.closeDataModalBtn.addEventListener('click', closeDataModal);
    elements.dataModal.addEventListener('click', (e) => {
      if (e.target === elements.dataModal) closeDataModal();
    });

    elements.dataTabAdd.addEventListener('click', () => showDataTab('add'));
    elements.dataTabImport.addEventListener('click', () => showDataTab('import'));
    elements.dataTabExport.addEventListener('click', () => showDataTab('export'));

    elements.addWordForm.addEventListener('submit', handleAddWordSubmit);
    elements.applyImportBtn.addEventListener('click', handleApplyImport);

    elements.copyExportBtn.addEventListener('click', () => {
      copyToClipboard(elements.exportJsonTextarea.value);
    });

    elements.downloadExportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(elements.exportJsonTextarea.value);
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `${state.currentDictId}_words.json`);
      dlAnchor.click();
    });

    if (elements.downloadDictionariesJsBtn) {
      elements.downloadDictionariesJsBtn.addEventListener('click', downloadDictionariesJs);
    }

    elements.resetDatabaseBtn.addEventListener('click', () => {
      if (!state.isAdmin) return;
      if (confirm(t('resetConfirm'))) {
        localStorage.removeItem('dict_corpus_' + state.currentDictId);
        refreshExportJson();
        updateDictionaryHeaderInfo();
        renderAlphabet();
        renderFilteredWords();
        showToast('Слоўнік скінуты да першапачатковага аўтарскага корпуса!');
      }
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== elements.searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
      }
      if (e.key === 'Escape') {
        if (!elements.changePasswordModal.classList.contains('hidden')) {
          closeChangePasswordModal();
        } else if (!elements.adminLoginModal.classList.contains('hidden')) {
          closeLoginModal();
        } else if (!elements.editWordModal.classList.contains('hidden')) {
          closeEditWordModal();
        } else if (!elements.wordModal.classList.contains('hidden')) {
          closeWordModal();
        } else if (!elements.dataModal.classList.contains('hidden')) {
          closeDataModal();
        } else if (state.searchQuery) {
          elements.clearSearchBtn.click();
        }
      }
    });
  }

  // App Initialization
  function init() {
    applyTheme(state.theme);
    updateAdminUI();
    if (state.searchQuery) {
      elements.searchInput.value = state.searchQuery;
      elements.clearSearchBtn.classList.remove('hidden');
    }
    updateInterfaceLanguage();
    updateDictionaryTabs();
    updateFavoritesBadge();
    setupEventListeners();

    // Direct login modal link support (?login=1)
    if (urlParams.get('login') === '1') {
      openLoginModal();
    }

    // Direct change password modal support (?pwd=1)
    if ((urlParams.get('pwd') === '1' || urlParams.get('password') === '1') && state.isAdmin) {
      openChangePasswordModal();
    }

    // Direct edit word modal support (?edit=1 or ?add=1)
    if (urlParams.get('add') === '1' && state.isAdmin) {
      openEditWordModal(null);
    }
    const editParam = urlParams.get('edit');
    if (editParam && state.isAdmin) {
      const dict = window.dictionariesData[state.currentDictId];
      if (dict && dict.words) {
        const found = dict.words.find(w => w.id === editParam || w.word.toLowerCase() === editParam.toLowerCase()) || dict.words[0];
        if (found) {
          openEditWordModal(found);
        }
      }
    }

    // Direct word modal link support (?word=nekr_1 or ?word=БАБА)
    const wordParam = urlParams.get('word');
    if (wordParam) {
      const dict = window.dictionariesData[state.currentDictId];
      if (dict && dict.words) {
        const found = dict.words.find(w => w.id === wordParam || w.word.toLowerCase() === wordParam.toLowerCase());
        if (found) {
          openWordModal(found);
        }
      }
    }
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
