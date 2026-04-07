# Kalvium Challenge #4 — Vibe vs Pair Coding

## Live Deployments
- Vibe version: https://tranquil-tapioca-8086b0.netlify.app
- Pair version: https://tranquil-tapioca-8086b0.netlify.app/
## Comparison Table

| Dimension      | Vibe Version (Lovable)                              | Pair Version (Cursor)                           | Verdict |
|----------------|-----------------------------------------------------|-------------------------------------------------|---------|
| Speed          | Generated full app in ~10 mins with 1 prompt        | Took ~40 mins building file by file             | Vibe    |
| Control        | Tool chose all components and file structure        | I decided every function and file name          | Pair    |
| Code Quality   | 12+ files generated, some components over 150 lines | 2 files, longest component under 80 lines       | Pair    |
| Explainability | Had to re-read generated hooks multiple times       | Could explain every single line I wrote         | Pair    |
| Editability    | Filter logic spread across multiple generated files | Filter logic in one place in App.jsx line 13    | Pair    |

## When I Would Use Each Tool

**Vibe coding tool for:** Quick client demos and prototypes — because
Lovable generated a full working UI in under 10 minutes, perfect when
you need something visual fast before committing to a structure.

**AI pair programming for:** Production and maintainable code — because
with Cursor I understood every line, making future changes and
debugging significantly faster when requirements changed.