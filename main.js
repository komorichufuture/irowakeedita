// Internationalization (i18n) support
const i18n = {
  en: {
    title: "Simple Code Editor",
    language: "Language:",
    plaintext: "Plain Text",
    darkTheme: "Dark",
    lightTheme: "Light",
    search: "Search",
    replace: "Replace",
    wrapOn: "Wrap: ON",
    wrapOff: "Wrap: OFF",
    textEdit: "Text Edit",
    save: "Save",
    open: "Open",
    cancel: "Cancel",
    applyClose: "Apply & Close",
    filenamePlaceholder: "filename (e.g., script.js)",
    footerText: "Use the buttons above to save/open files, search/replace text, and toggle word wrap. On mobile, use \"Text Edit\" for native selection and copy.",
    mobileHint: "On mobile, long press here to use native selection, copy, and paste.",
    defaultSnippets: {
      javascript: `// JavaScript Example
function hello(name) {
  console.log("Hello, " + name + "!");
}

hello("world");
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sample HTML</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Write your content here.</p>
</body>
</html>
`,
      css: `/* CSS Sample */
body {
  font-family: system-ui, sans-serif;
  background: #111;
  color: #eee;
}
`,
      json: `{
  "name": "sample",
  "version": "1.0.0",
  "private": true
}
`,
      lua: `-- Lua Sample
local message = "Hello Lua"
print(message)
`,
      python: `# Python Sample
def hello(name: str) -> None:
    print(f"Hello, {name}!")

hello("world")
`,
      plaintext: `Write your text here.`
    }
  },
  ja: {
    title: "シンプルコードエディタ",
    language: "言語:",
    plaintext: "テキスト",
    darkTheme: "ダーク",
    lightTheme: "ライト",
    search: "検索",
    replace: "置換",
    wrapOn: "折り返し: ON",
    wrapOff: "折り返し: OFF",
    textEdit: "テキスト編集",
    save: "保存",
    open: "開く",
    cancel: "キャンセル",
    applyClose: "適用して閉じる",
    filenamePlaceholder: "ファイル名（例: script.js）",
    footerText: "保存/開く＋検索/置換＋折り返しは上部ボタンから。スマホで長押し選択・コピーしたいときは「テキスト編集」を使うとネイティブ選択が使えます。",
    mobileHint: "スマホではここを長押しすると範囲選択・コピー・ペーストが使えます。",
    defaultSnippets: {
      javascript: `// JavaScript サンプル
function hello(name) {
  console.log("Hello, " + name + "!");
}

hello("world");
`,
      html: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>サンプルHTML</title>
</head>
<body>
  <h1>こんにちは</h1>
  <p>ここに内容を書いてください。</p>
</body>
</html>
`,
      css: `/* CSSサンプル */
body {
  font-family: system-ui, sans-serif;
  background: #111;
  color: #eee;
}
`,
      json: `{
  "name": "sample",
  "version": "1.0.0",
  "private": true
}
`,
      lua: `-- Lua サンプル
local message = "Hello Lua"
print(message)
`,
      python: `# Python サンプル
def hello(name: str) -> None:
    print(f"Hello, {name}!")

hello("world")
`,
      plaintext: `ここにテキストを書いてください。`
    }
  }
};

// Detect user's preferred language
function detectUserLanguage() {
  const savedLang = localStorage.getItem('editor-ui-language');
  if (savedLang && (savedLang === 'en' || savedLang === 'ja')) {
    return savedLang;
  }
  
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

let currentUILanguage = detectUserLanguage();

// Apply language to UI
function applyLanguage(lang) {
  currentUILanguage = lang;
  const translations = i18n[lang] || i18n['en'];
  
  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      element.placeholder = translations[key];
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Update active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
  
  // Save preference
  localStorage.setItem('editor-ui-language', lang);
}

// Monaco configuration
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs",
  },
});

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/'
      };
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs/base/worker/workerMain.js');
    `)}`;
  },
};

require(["vs/editor/editor.main"], function () {
  // Lua support (if plugin is loaded)
  if (window.monacoLua && typeof window.monacoLua.setupMonaco === "function") {
    window.monacoLua.setupMonaco(monaco);
  }

  const isMobile =
    window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const editorElement = document.getElementById("editor");

  const editor = monaco.editor.create(editorElement, {
    value: "",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: isMobile ? 16 : 14,
    lineHeight: isMobile ? 22 : 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    cursorBlinking: "smooth",
    smoothScrolling: true,
    lineNumbersMinChars: isMobile ? 2 : 3,
    contextmenu: true,
  });

  // Mobile optimization: adjust touchAction
  const domNode = editor.getDomNode();
  if (domNode) {
    domNode.style.touchAction = "manipulation";
  }

  // Storage keys
  const STORAGE_PREFIX = "simple-code-editor-v1-";
  const FILENAME_KEY = "simple-code-editor-v1-filename";

  let currentLanguage = "javascript";
  let wrapOn = true;
  let isDark = true;

  const languageSelect = document.getElementById("languageSelect");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const findBtn = document.getElementById("findBtn");
  const replaceBtn = document.getElementById("replaceBtn");
  const wrapToggleBtn = document.getElementById("wrapToggleBtn");
  const filenameInput = document.getElementById("filenameInput");
  const downloadBtn = document.getElementById("downloadBtn");
  const openBtn = document.getElementById("openBtn");
  const fileInput = document.getElementById("fileInput");

  // Mobile text edit mode
  const mobileEditBtn = document.getElementById("mobileEditBtn");
  const mobilePanel = document.getElementById("mobilePanel");
  const mobileTextarea = document.getElementById("mobileTextarea");
  const mobileApplyBtn = document.getElementById("mobileApplyBtn");
  const mobileCancelBtn = document.getElementById("mobileCancelBtn");

  // Mobile edit info (selection or full text)
  let mobileEditInfo = null;

  // Language switching
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      applyLanguage(lang);
      
      // Reload default snippet if empty
      if (editor.getValue().trim() === '' || 
          editor.getValue() === i18n[lang === 'en' ? 'ja' : 'en'].defaultSnippets[currentLanguage]) {
        editor.setValue(i18n[lang].defaultSnippets[currentLanguage]);
      }
    });
  });

  // Apply initial language
  applyLanguage(currentUILanguage);

  // Default snippets
  function getDefaultSnippets() {
    return i18n[currentUILanguage].defaultSnippets;
  }

  function storageKey(lang) {
    return STORAGE_PREFIX + lang;
  }

  function loadCodeForLanguage(lang) {
    const stored = localStorage.getItem(storageKey(lang));
    if (stored !== null) {
      return stored;
    }
    return getDefaultSnippets()[lang] || "";
  }

  function saveCurrentLanguageCode() {
    if (!currentLanguage) return;
    try {
      const value = editor.getValue();
      localStorage.setItem(storageKey(currentLanguage), value);
    } catch (e) {
      console.warn("LocalStorage save failed:", e);
    }
  }

  // File extensions
  function getExtensionForLanguage(lang) {
    switch (lang) {
      case "javascript":
        return "js";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "lua":
        return "lua";
      case "python":
        return "py";
      case "plaintext":
      default:
        return "txt";
    }
  }

  // Detect language from filename
  function detectLanguageFromFilename(name) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".ts") || lower.endsWith(".tsx")) {
      return "javascript";
    }
    if (lower.endsWith(".html") || lower.endsWith(".htm")) {
      return "html";
    }
    if (lower.endsWith(".css")) {
      return "css";
    }
    if (lower.endsWith(".json")) {
      return "json";
    }
    if (lower.endsWith(".lua")) {
      return "lua";
    }
    if (lower.endsWith(".py")) {
      return "python";
    }
    return "plaintext";
  }

  function getDefaultFilename(lang) {
    const ext = getExtensionForLanguage(lang);
    return `code.${ext}`;
  }

  // Initialize filename
  (function initFilename() {
    const savedName = localStorage.getItem(FILENAME_KEY);
    if (savedName) {
      filenameInput.value = savedName;
    } else {
      filenameInput.value = getDefaultFilename(currentLanguage);
    }
  })();

  function saveFilename(name) {
    try {
      localStorage.setItem(FILENAME_KEY, name);
    } catch (e) {
      console.warn("Failed to save filename:", e);
    }
  }

  // Load initial code
  editor.setValue(loadCodeForLanguage(currentLanguage));

  // Language switcher for code
  languageSelect.addEventListener("change", () => {
    const newLang = languageSelect.value;
    if (newLang === currentLanguage) return;

    // Save current language code
    saveCurrentLanguageCode();

    currentLanguage = newLang;
    const newValue = loadCodeForLanguage(newLang);

    monaco.editor.setModelLanguage(
      editor.getModel(),
      newLang === "plaintext" ? "plaintext" : newLang
    );
    editor.setValue(newValue);
    editor.setScrollTop(0);

    // Update filename if empty
    if (!filenameInput.value.trim()) {
      filenameInput.value = getDefaultFilename(currentLanguage);
    }
  });

  // Theme toggle (light/dark)
  function applyTheme() {
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
    const themeIcon = themeToggleBtn.querySelector('span:first-child');
    const themeText = themeToggleBtn.querySelector('.btn-text');
    themeIcon.textContent = isDark ? "🌙" : "☀";
    themeText.setAttribute('data-i18n', isDark ? 'darkTheme' : 'lightTheme');
    themeText.textContent = i18n[currentUILanguage][isDark ? 'darkTheme' : 'lightTheme'];
  }

  themeToggleBtn.addEventListener("click", () => {
    isDark = !isDark;
    applyTheme();
  });

  applyTheme();

  // Word wrap toggle
  function updateWrapLabel() {
    const wrapIcon = wrapToggleBtn.querySelector('span:first-child');
    const wrapText = wrapToggleBtn.querySelector('.btn-text');
    wrapText.setAttribute('data-i18n', wrapOn ? 'wrapOn' : 'wrapOff');
    wrapText.textContent = i18n[currentUILanguage][wrapOn ? 'wrapOn' : 'wrapOff'];
  }

  wrapToggleBtn.addEventListener("click", () => {
    wrapOn = !wrapOn;

    const isNowMobile =
      window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;

    editor.updateOptions({
      wordWrap: wrapOn ? "on" : "off",
      lineHeight: wrapOn
        ? (isNowMobile ? 20 : 18)
        : (isNowMobile ? 22 : 20),
    });

    updateWrapLabel();
  });

  updateWrapLabel();

  // Search button → Monaco's search widget
  findBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("actions.find").run();
  });

  // Replace button → Search + Replace
  replaceBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("editor.action.startFindReplaceAction").run();
  });

  // Download/Save functionality
  downloadBtn.addEventListener("click", () => {
    const code = editor.getValue();
    let filename = filenameInput.value.trim();
    const ext = getExtensionForLanguage(currentLanguage);

    if (!filename) {
      filename = getDefaultFilename(currentLanguage);
    } else if (!filename.includes(".")) {
      filename = `${filename}.${ext}`;
    }

    saveFilename(filename);

    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // File open functionality
  openBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result || "";

      // Save current language code
      saveCurrentLanguageCode();

      // Update filename input
      filenameInput.value = file.name;
      saveFilename(file.name);

      // Detect language from filename
      const lang = detectLanguageFromFilename(file.name);
      currentLanguage = lang;
      languageSelect.value = lang;

      monaco.editor.setModelLanguage(
        editor.getModel(),
        lang === "plaintext" ? "plaintext" : lang
      );
      editor.setValue(String(text));
      editor.setScrollTop(0);

      // Save loaded content to localStorage
      saveCurrentLanguageCode();

      // Re-apply lineHeight (to prevent occasional issues)
      const nowMobile =
        window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      editor.updateOptions({
        lineHeight: nowMobile ? 22 : 20,
      });
    };
    reader.readAsText(file);

    // Reset value to allow same file selection
    fileInput.value = "";
  });

  // Window resize handler
  window.addEventListener("resize", () => {
    const isNowMobile =
      window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    editor.updateOptions({
      fontSize: isNowMobile ? 16 : 14,
      lineHeight: isNowMobile ? 22 : 20,
      lineNumbersMinChars: isNowMobile ? 2 : 3,
    });
  });

  // Save before page unload
  window.addEventListener("beforeunload", () => {
    saveCurrentLanguageCode();
    if (filenameInput.value.trim()) {
      saveFilename(filenameInput.value.trim());
    }
  });

  // === Mobile text edit mode (for long-press selection/copy) ===

  // Open mobile edit panel with selection or full text
  function openMobileEditPanel() {
    const model = editor.getModel();
    const selection = editor.getSelection();

    if (selection && !selection.isEmpty()) {
      // Edit only the selected range
      mobileEditInfo = {
        type: "selection",
        range: selection
      };
      mobileTextarea.value = model.getValueInRange(selection);
    } else {
      // Edit full text
      mobileEditInfo = {
        type: "full"
      };
      mobileTextarea.value = model.getValue();
    }

    mobilePanel.style.display = "flex";
    mobileTextarea.focus();
  }

  function closeMobileEditPanel(applyChanges) {
    if (applyChanges) {
      const newText = mobileTextarea.value;
      const model = editor.getModel();

      if (mobileEditInfo && mobileEditInfo.type === "selection" && mobileEditInfo.range) {
        const range = mobileEditInfo.range;

        // Replace selected range with new text
        model.pushEditOperations(
          [range],
          [{ range, text: newText }],
          () => {
            // Calculate new selection range after replacement
            const lines = newText.split("\n");
            const startLine = range.startLineNumber;
            const startColumn = range.startColumn;

            const endLineNumber = startLine + lines.length - 1;
            const endColumn =
              lines.length === 1
                ? startColumn + newText.length
                : lines[lines.length - 1].length + 1;

            return [
              new monaco.Selection(
                startLine,
                startColumn,
                endLineNumber,
                endColumn
              ),
            ];
          }
        );

        const newSelection = editor.getSelection();
        if (newSelection) {
          editor.revealRangeInCenter(newSelection);
        }

        // Update localStorage
        saveCurrentLanguageCode();

      } else {
        // Full text mode: replace entire content
        editor.setValue(newText);
        saveCurrentLanguageCode();
      }
    }

    mobilePanel.style.display = "none";
    editor.focus();
    mobileEditInfo = null;
  }

  // Auto-scroll for mobile keyboard visibility
  function scrollCaretIntoView() {
    const textarea = mobileTextarea;
    const caretPos = textarea.selectionStart;
    const before = textarea.value.slice(0, caretPos);
    const lineCount = before.split("\n").length;
    const lineHeight = 22; // Mobile assumption
    const targetScroll = Math.max(0, (lineCount - 1) * lineHeight - 10);
    textarea.scrollTop = targetScroll;
  }

  mobileTextarea.addEventListener("input", scrollCaretIntoView);
  mobileTextarea.addEventListener("click", scrollCaretIntoView);
  mobileTextarea.addEventListener("keyup", scrollCaretIntoView);

  mobileEditBtn.addEventListener("click", () => {
    openMobileEditPanel();
  });

  mobileApplyBtn.addEventListener("click", () => {
    closeMobileEditPanel(true);
  });

  mobileCancelBtn.addEventListener("click", () => {
    closeMobileEditPanel(false);
  });
});
