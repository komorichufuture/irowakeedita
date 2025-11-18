
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
    // ★ 行間はやや詰め気味に固定（wrap時の伸び防止）
    lineHeight: isMobile ? 22 : 20,
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

  // デフォルトテンプレ
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

  // 拡張子決定
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

  // ファイル名→言語推定
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

  // ファイル名初期化
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
      console.warn("ファイル名の保存に失敗:", e);
    }
  }

  // 初期コード読み込み
  editor.setValue(loadCodeForLanguage(currentLanguage));

  // 言語切り替え
  languageSelect.addEventListener("change", () => {
    const newLang = languageSelect.value;
    if (newLang === currentLanguage) return;

    // いまの言語のコードを保存
    saveCurrentLanguageCode();

    currentLanguage = newLang;
    const newValue = loadCodeForLanguage(newLang);

    monaco.editor.setModelLanguage(
      editor.getModel(),
      newLang === "plaintext" ? "plaintext" : newLang
    );
    editor.setValue(newValue);
    editor.setScrollTop(0);

    // ファイル名が空なら、デフォルトを挿入
    if (!filenameInput.value.trim()) {
      filenameInput.value = getDefaultFilename(currentLanguage);
    }
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

  // 検索ボタン → Monaco標準の検索ウィジェット
  findBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("actions.find").run();
  });

  // 置換ボタン → 検索+置換
  replaceBtn.addEventListener("click", () => {
    editor.focus();
    editor.getAction("editor.action.startFindReplaceAction").run();
  });

  // ▼ ダウンロード保存機能
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

  // ▼ ファイル読み込み機能
  openBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result || "";

      // 今の言語のコードを保存しておく
      saveCurrentLanguageCode();

      // ファイル名を入力欄に反映
      filenameInput.value = file.name;
      saveFilename(file.name);

      // ファイル名から言語推定
      const lang = detectLanguageFromFilename(file.name);
      currentLanguage = lang;
      languageSelect.value = lang;

      monaco.editor.setModelLanguage(
        editor.getModel(),
        lang === "plaintext" ? "plaintext" : lang
      );
      editor.setValue(String(text));
      editor.setScrollTop(0);

      // 読み込んだ内容もローカルストレージに保存
      saveCurrentLanguageCode();

      // もう一度 lineHeight を適用（まれに崩れる対策）
      const nowMobile =
        window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      editor.updateOptions({
        lineHeight: nowMobile ? 20 : 18,
      });
    };
    reader.readAsText(file);

    // 同じファイルでも次回選べるようにvalueをリセット
    fileInput.value = "";
  });

  // ウィンドウサイズ変更時、モバイルならフォントと行間調整
  window.addEventListener("resize", () => {
    const isNowMobile =
      window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;
    editor.updateOptions({
      fontSize: isNowMobile ? 16 : 14,
      lineHeight: isNowMobile ? 20 : 18,
      lineNumbersMinChars: isNowMobile ? 2 : 3,
    });
  });

  // ページ離脱前に保存
  window.addEventListener("beforeunload", () => {
    saveCurrentLanguageCode();
    if (filenameInput.value.trim()) {
      saveFilename(filenameInput.value.trim());
    }
  });
});
