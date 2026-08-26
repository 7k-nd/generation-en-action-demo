(function (global) {
  const ARTICLES_KEY = "gea_articles";
  const MESSAGES_KEY = "gea_messages";
  const CONTACT_MAIL = "team.generationbrussels@gmail.com";

  function rootPath() {
    const path = (location.pathname || "").replace(/\\/g, "/");
    if (/\/admin(\/|$)/.test(path)) return "../";
    return "";
  }

  function uid(prefix) {
    const id = global.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return prefix + id;
  }

  function slugify(str) {
    const s = String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return s || "article";
  }

  function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paragraphs(text) {
    const chunks = String(text || "")
      .trim()
      .split(/\n\s*\n/);
    if (!chunks.length || (chunks.length === 1 && !chunks[0])) return "";
    return chunks
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function safeCover(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) return value;
    try {
      const u = new URL(value, location.href);
      if (u.protocol === "http:" || u.protocol === "https:") return value;
    } catch (_) {}
    return "";
  }

  function byDateDesc(a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  let seedCache = null;
  let apiOk = null;

  async function loadSeed() {
    if (seedCache) return seedCache;
    try {
      const res = await fetch(rootPath() + "data/articles.json", { cache: "no-store" });
      if (!res.ok) throw new Error("seed");
      const data = await res.json();
      seedCache = Array.isArray(data) ? data : [];
    } catch (_) {
      seedCache = [];
    }
    return seedCache;
  }

  async function probeApi() {
    if (apiOk !== null) return apiOk;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 700);
      const res = await fetch("/api/health", {
        headers: { Accept: "application/json" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      apiOk = res.ok;
    } catch (_) {
      apiOk = false;
    }
    return apiOk;
  }

  function localBundle() {
    const stored = readJson(ARTICLES_KEY, null);
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      return {
        overrides: stored.overrides && typeof stored.overrides === "object" ? stored.overrides : {},
        deleted: Array.isArray(stored.deleted) ? stored.deleted : [],
      };
    }
    return { overrides: {}, deleted: [] };
  }

  function saveLocalBundle(bundle) {
    writeJson(ARTICLES_KEY, bundle);
  }

  async function mergeArticles() {
    const seed = await loadSeed();
    const { overrides, deleted } = localBundle();
    const map = new Map();
    seed.forEach((a) => {
      if (a && a.id && !deleted.includes(a.id)) map.set(a.id, a);
    });
    Object.keys(overrides).forEach((id) => {
      if (deleted.includes(id)) return;
      map.set(id, overrides[id]);
    });
    return [...map.values()].sort(byDateDesc);
  }

  async function apiJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(String(res.status));
    if (res.status === 204) return null;
    return res.json();
  }

  async function listArticles(opts) {
    const publishedOnly = opts && opts.publishedOnly;
    let items;
    if (await probeApi()) {
      try {
        items = await apiJson("/api/articles");
      } catch (_) {
        apiOk = false;
        items = await mergeArticles();
      }
    } else {
      items = await mergeArticles();
    }
    if (!Array.isArray(items)) items = [];
    items.sort(byDateDesc);
    if (publishedOnly) items = items.filter((a) => a && a.published);
    return items;
  }

  async function getArticle(id) {
    const all = await listArticles();
    return all.find((a) => a.id === id) || null;
  }

  async function getBySlug(slug) {
    const all = await listArticles();
    return all.find((a) => a.slug === slug) || null;
  }

  async function uniqueSlug(base, exceptId) {
    const all = await listArticles();
    let slug = base || "article";
    let n = 2;
    const taken = (s) => all.some((a) => a.slug === s && a.id !== exceptId);
    while (taken(slug)) {
      slug = base + "-" + n;
      n += 1;
    }
    return slug;
  }

  async function saveArticle(article) {
    const payload = {
      id: article.id || uid("a-"),
      slug: await uniqueSlug(slugify(article.slug || article.title), article.id),
      title: String(article.title || "").trim(),
      excerpt: String(article.excerpt || "").trim(),
      cover: String(article.cover || "").trim(),
      date: article.date || new Date().toISOString().slice(0, 10),
      published: Boolean(article.published),
      body: String(article.body || "").trim(),
    };
    if (await probeApi()) {
      try {
        const method = article.id ? "PUT" : "POST";
        const url = article.id ? "/api/articles/" + encodeURIComponent(article.id) : "/api/articles";
        return await apiJson(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (_) {
        apiOk = false;
      }
    }
    const bundle = localBundle();
    bundle.overrides[payload.id] = payload;
    bundle.deleted = bundle.deleted.filter((id) => id !== payload.id);
    saveLocalBundle(bundle);
    return payload;
  }

  async function removeArticle(id) {
    if (await probeApi()) {
      try {
        await apiJson("/api/articles/" + encodeURIComponent(id), { method: "DELETE" });
        return;
      } catch (_) {
        apiOk = false;
      }
    }
    const bundle = localBundle();
    delete bundle.overrides[id];
    if (!bundle.deleted.includes(id)) bundle.deleted.push(id);
    saveLocalBundle(bundle);
  }

  async function listMessages() {
    let items;
    if (await probeApi()) {
      try {
        items = await apiJson("/api/messages");
      } catch (_) {
        apiOk = false;
        items = readJson(MESSAGES_KEY, []);
      }
    } else {
      items = readJson(MESSAGES_KEY, []);
    }
    if (!Array.isArray(items)) items = [];
    return items.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  }

  async function addMessage(data) {
    const payload = {
      id: uid("m-"),
      name: String(data.name || "").trim(),
      email: String(data.email || "").trim(),
      subject: String(data.subject || "").trim(),
      message: String(data.message || "").trim(),
      date: data.date || new Date().toISOString(),
      unread: data.unread !== false,
    };
    if (await probeApi()) {
      try {
        return await apiJson("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (_) {
        apiOk = false;
      }
    }
    const all = readJson(MESSAGES_KEY, []);
    all.push(payload);
    writeJson(MESSAGES_KEY, all);
    return payload;
  }

  async function updateMessage(id, patch) {
    if (await probeApi()) {
      try {
        return await apiJson("/api/messages/" + encodeURIComponent(id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch (_) {
        apiOk = false;
      }
    }
    const all = readJson(MESSAGES_KEY, []);
    const next = all.map((m) => (m.id === id ? Object.assign({}, m, patch) : m));
    writeJson(MESSAGES_KEY, next);
    return next.find((m) => m.id === id) || null;
  }

  async function removeMessage(id) {
    if (await probeApi()) {
      try {
        await apiJson("/api/messages/" + encodeURIComponent(id), { method: "DELETE" });
        return;
      } catch (_) {
        apiOk = false;
      }
    }
    writeJson(
      MESSAGES_KEY,
      readJson(MESSAGES_KEY, []).filter((m) => m.id !== id)
    );
  }

  async function unreadCount() {
    const all = await listMessages();
    return all.filter((m) => m.unread).length;
  }

  function mailtoContact({ name, email, subject, message }) {
    const sub = encodeURIComponent("[GEA] " + (subject || "Message"));
    const body = encodeURIComponent(
      "Nom : " + (name || "") + "\nEmail : " + (email || "") + "\n\n" + (message || "")
    );
    return "mailto:" + CONTACT_MAIL + "?subject=" + sub + "&body=" + body;
  }

  const ready = probeApi().then(() => loadSeed()).catch(() => {});

  global.GEA = {
    ready,
    contactMail: CONTACT_MAIL,
    articles: {
      list: listArticles,
      get: getArticle,
      bySlug: getBySlug,
      save: saveArticle,
      remove: removeArticle,
    },
    messages: {
      list: listMessages,
      add: addMessage,
      update: updateMessage,
      remove: removeMessage,
      unreadCount,
    },
    util: {
      slugify,
      formatDate,
      escapeHtml,
      paragraphs,
      safeCover,
      uid,
      mailtoContact,
      rootPath,
    },
  };
})(window);
