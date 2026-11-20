# Rustling — Learn Rust by Doing

An interactive, browser-based introduction to Rust for programmers who already know
another language. Pure HTML/CSS/JavaScript — no build step, no dependencies, no Rust
toolchain required to use it.

## Run it

Just open `index.html` in a browser. Or serve the folder locally:

```bash
# Python
python3 -m http.server 8000
# then visit http://localhost:8000
```

```bash
# Node (npx)
npx serve .
```

## What's inside

- **10 lessons** covering the essentials: tooling, variables, types, functions &
  control flow, ownership & borrowing, structs & enums, error handling, collections,
  traits & generics, and modules & crates.
- **Syntax-highlighted code examples** for every concept, written from scratch with
  no external highlighting library.
- **Quizzes with instant feedback** and explanations for every answer.
- **Progress tracking** (completed lessons + quiz answers) saved in `localStorage`.
- **Full-text search** across all lesson content (press `/` to focus the search box).
- **Dark / light themes** and a responsive layout that works on mobile.
- A printable **Rust cheat sheet**.

## Project structure

```
index.html          App shell
styles.css          Design system + responsive layout
js/highlighter.js   Dependency-free Rust syntax highlighter
js/content.js       Course content (lessons, quizzes, cheat sheet)
js/app.js           Routing, rendering, quiz logic, progress persistence
```

## Customizing the course

All lesson content lives in `js/content.js` as the `LESSONS` array and `CHEAT_SHEET`
object. Each lesson has this shape:

```js
{
  id: "unique-id",
  num: 1,
  title: "Lesson title",
  desc: "One-line description",
  tags: ["tag1", "tag2"],
  readMin: 6,
  intro: "<p>HTML intro…</p>",
  sections: [
    {
      h: "Section heading",
      body: "<p>HTML body…</p>",
      code: [{ file: "main.rs", source: "fn main() {}", note: "Optional note" }],
      callout: { type: "tip|warn|note", title: "…", body: "<p>…</p>" }
    }
  ],
  keypoints: ["…"],
  pitfalls: ["…"],
  quiz: [{ q: "Question?", options: ["…"], answer: 0, explain: "<p>Why…</p>" }]
}
```

Lesson bodies accept HTML, so you can use `<code class="inline">`, `<strong>`, lists,
and more. No build step — edit and refresh.
