const fs = require("fs");
const path = require("path");
const express = require("express");

const PORT = 3847;
const ROOT = path.join(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "db.json");
const SEED_PATH = path.join(ROOT, "data", "articles.json");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/node_modules") || req.path.startsWith("/.git")) {
    return res.status(404).end();
  }
  next();
});
app.use(express.static(ROOT));

function readSeed() {
  try {
    const data = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    const db = { articles: readSeed(), messages: [] };
    saveDb(db);
    return db;
  }
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    if (!Array.isArray(db.articles)) db.articles = readSeed();
    if (!Array.isArray(db.messages)) db.messages = [];
    return db;
  } catch (_) {
    return { articles: readSeed(), messages: [] };
  }
}

function saveDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/articles", (_req, res) => {
  res.json(loadDb().articles);
});

app.post("/api/articles", (req, res) => {
  const db = loadDb();
  const article = req.body || {};
  if (!article.id) article.id = "a-" + Date.now().toString(36);
  db.articles = db.articles.filter((a) => a.id !== article.id);
  db.articles.push(article);
  saveDb(db);
  res.status(201).json(article);
});

app.put("/api/articles/:id", (req, res) => {
  const db = loadDb();
  const article = Object.assign({}, req.body, { id: req.params.id });
  const idx = db.articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) db.articles.push(article);
  else db.articles[idx] = article;
  saveDb(db);
  res.json(article);
});

app.delete("/api/articles/:id", (req, res) => {
  const db = loadDb();
  db.articles = db.articles.filter((a) => a.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

app.get("/api/messages", (_req, res) => {
  res.json(loadDb().messages);
});

app.post("/api/messages", (req, res) => {
  const db = loadDb();
  const message = req.body || {};
  if (!message.id) message.id = "m-" + Date.now().toString(36);
  db.messages.push(message);
  saveDb(db);
  res.status(201).json(message);
});

app.patch("/api/messages/:id", (req, res) => {
  const db = loadDb();
  const idx = db.messages.findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "introuvable" });
  db.messages[idx] = Object.assign({}, db.messages[idx], req.body);
  saveDb(db);
  res.json(db.messages[idx]);
});

app.delete("/api/messages/:id", (req, res) => {
  const db = loadDb();
  db.messages = db.messages.filter((m) => m.id !== req.params.id);
  saveDb(db);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log("API + site : http://localhost:" + PORT + "/");
  console.log("Admin      : http://localhost:" + PORT + "/admin/");
  console.log("Blog       : http://localhost:" + PORT + "/blog.html");
});
