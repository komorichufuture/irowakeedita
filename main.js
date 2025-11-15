// グローバル変数としてエディタインスタンスを保持
let editor;
let currentTheme = "vs-dark"; // 初期はダークテーマ

// Monaco Editor のパス設定（CDN）
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.51.0/min/vs"
  }
});

// Monaco Editor の本体読み込み
require(["vs/editor/editor.main"], function () {
  // --- Lua サポート登録 ---
  // monaco-lua が読み込まれていれば、ここで Monaco に登録する
  if (typeof monacoLua !== "undefined") {
    monaco.languages.register({ id: "lua" });
    monaco.languages.setMonarchTokensProvider("lua", monacoLua.language);
    monaco.languages.setLanguageConfiguration("lua", monacoLua.conf);
  } else {
    console.warn("monaco-lua が読み込まれていません。Lua ハイライトは無効です。");
  }

  const container = document.getElementById("editor-container");

  // エディタ生成
  editor = monaco.editor.create(container, {
    value: `// ここにコードを書いてください。
// 言語を変えると色分けも切り替わります。
// Ctrl+F または 上の「検索」ボタンで検索できます。

// JavaScript 例
function hello() {
  console.log("Hello, world!");
}

// Lua 例
-- language: Lua を選ぶと色分けされます
local function hi(name)
  print("Hello, " .. name .. "!")
end

hi("Lua")
`,
    language: "javascript",
    theme: currentTheme,
    automaticLayout: true, // ウィンドウサイズに合わせて自動リサイズ
    fontSize: 14,
    minimap: {
      enabled: true
    }
  });

  setupUI();
});

// UI 設定
function setupUI() {
  const languageSelect = document.getElementById("language-select");
  const btnFind = document.getElementById("btn-find");
  const btnTheme = document.getElementById("btn-theme");

  // 言語切替
  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, lang);
    }
  });

  // 検索：VSCode と同じ検索パネルを開く
  btnFind.addEventListener("click", () => {
    if (!editor) return;
    editor.getAction("actions.find").run();
  });

  // テーマ切替（ダーク / ライト）
  btnTheme.addEventListener("click", () => {
    if (!editor) return;

    if (currentTheme === "vs-dark") {
      currentTheme = "vs"; // ライトテーマ
    } else {
      currentTheme = "vs-dark"; // ダークテーマ
    }
    monaco.editor.setTheme(currentTheme);
  });
}
