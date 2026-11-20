/* Minimal, dependency-free Rust syntax highlighter for teaching snippets. */
(function () {
  "use strict";

  const KEYWORDS =
    "as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while";

  // Alternation order matters: earlier branches win at a given position.
  const TOKEN_RE = new RegExp(
    [
      "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)",                                  // 1 comment
      "(\"(?:\\\\.|[^\"\\\\])*\"|r#*\"[\\s\\S]*?\"#*)",                          // 2 string
      "('(?:\\\\.|[^'\\\\])')",                                                 // 3 char literal
      "(\\b\\d[\\d_]*(?:\\.\\d+)?(?:[a-zA-Z_][\\w]*)?\\b)",                      // 4 number
      "(#!?\\[[^\\]]*\\])",                                                      // 5 attribute
      "(\\b[A-Za-z_]\\w*!)",                                                     // 6 macro
      "(\\b(?:" + KEYWORDS + ")\\b)",                                            // 7 keyword
      "(\\b[A-Z][A-Za-z0-9_]*\\b)",                                              // 8 type / variant
      "(\\b[A-Za-z_]\\w*(?=\\s*\\())"                                             // 9 function call
    ].join("|"),
    "g"
  );

  const CLASS = [
    null,
    "tok-comment",
    "tok-string",
    "tok-char",
    "tok-number",
    "tok-attr",
    "tok-macro",
    "tok-keyword",
    "tok-type",
    "tok-fn"
  ];

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlight(code) {
    let out = "";
    let last = 0;
    let m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(code)) !== null) {
      out += escapeHtml(code.slice(last, m.index));
      let cls = "";
      for (let i = 1; i < m.length; i++) {
        if (m[i] !== undefined) {
          cls = CLASS[i];
          break;
        }
      }
      out += '<span class="' + cls + '">' + escapeHtml(m[0]) + "</span>";
      last = m.index + m[0].length;
    }
    out += escapeHtml(code.slice(last));
    return out;
  }

  window.RustHighlight = { highlight: highlight, escapeHtml: escapeHtml };
})();
