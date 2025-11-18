// Monaco の読み込み設定
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs",
  },
});

window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      self.MonacoEnvironment = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/' };
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs/base/worker/workerMain.js');
    `)}`;
  },
};

require(["vs/editor/editor.main"], function () {
  // Lua サポート（pluginが読み込まれていれば反映）
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
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: "on",
    cursorBlinking: "smooth",
    smoothScrolling: true,
    lineNumbersMinChars: isMobile ? 2 : 3,
    contextmenu: true,
  });

  // 言語ごとにローカルストレージで保存
  const STORAGE_PREFIX = "simple-code-editor-v1-";
  let currentLanguage = "javascript";
  let wrapOn = true;
  let isDark = true;

  const languageSelect = document.getElementById("languageSelect");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const findBtn = document.getElementById("findBtn");
  const replaceBtn = document.getElementById("replaceBtn");
  const wrapToggleBtn = document.getElementById("wrapToggleBtn");

  // デフォルトテンプレ（言語切り替え時に何も保存がない場合用）
  const defaultSnippets = {
    javascript: `// JavaScript
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
    plaintext: `ここにテキストを書いてください。`,
  };

  function storageKey(lang) {
    return STORAGE_PREFIX + lang;
  }

  function loadCodeForLanguage(lang) {
    const stored = localStorage.getItem(storageKey(lang));
    if (stored !== null) {
      return stored;
    }
    return defaultSnippets[lang] || "";
  }

  function saveCurrentLanguageCode() {
    if (!currentLanguage) return;
    try {
      const value = editor.getValue();
      localStorage.setItem(storageKey(currentLanguage), value);
    } catch (e) {
      console.warn("ローカルストレージ保存失敗:", e);
    }
  }

  // 初期コード読み込み
  editor.setValue(loadCodeForLanguage(currentLanguage));

  // 言語切り替え
  languageSelect.addEventListener("change", () => {
    const newLang = languageSelect.value;
    if (newLang === currentLanguage) return;

    saveCurrentLanguageCode();

    currentLanguage = newLang;
    const newValue = loadCodeForLanguage(newLang);

    monaco.editor.setModelLanguage(editor.getModel(), newLang === "plaintext" ? "plaintext" : newLang);
    editor.setValue(newValue);
    editor.setScrollTop(0);
  });

  // テーマ切り替え（明・暗）
  function applyTheme() {
    monaco.editor.setTheme(isDark ? "vs-dark" : "vs");
    themeToggleBtn.textContent = isDark ? "🌙 ダーク" : "☀ ライト";
  }

  themeToggleBtn.addEventListener("click", () => {
    isDark = !isDark;
    applyTheme();
  });

  applyTheme();

  // 折り返し切り替え
  function updateWrapLabel() {
    wrapToggleBtn.textContent = wrapOn ? "↩ 折り返し: ON" : "↩ 折り返し: OFF";
  }

  wrapToggleBtn.addEventListener("click", () => {
    wrapOn = !wrapOn;
    editor.updateOptions({
      wordWrap: wrapOn ? "on" : "off",
    });
    updateWrapLabel();
  });

  updateWrapLabel();

  // 検索ボタン → Monaco標準の検索ウィジェットを開く
  findBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("actions.find").run();
  });

  // 置換ボタン → Monaco標準の 検索+置換ウィジェット を開く
  replaceBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("editor.action.startFindReplaceAction").run();
  });

  // ウィンドウサイズ変更時、モバイルならフォント大きめ
  window.addEventListener("resize", () => {
    const isNowMobile =
      window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    editor.updateOptions({
      fontSize: isNowMobile ? 16 : 14,
      lineNumbersMinChars: isNowMobile ? 2 : 3,
    });
  });

  // ページ離脱前に保存
  window.addEventListener("beforeunload", () => {
    saveCurrentLanguageCode();
  });
});
