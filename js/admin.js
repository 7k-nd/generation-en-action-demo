(function () {
  const page = document.body.dataset.admin || "";
  const $ = (sel, root) => (root || document).querySelector(sel);

  const footerHTML =
    '<footer class="admin-foot"><div class="wrap">' +
    "<p>Espace de démonstration. En production, l'administration doit s'appuyer sur un serveur authentifié — pas sur un mot de passe dans le navigateur, ni sur le localStorage.</p>" +
    "</div></footer>";

  async function unreadBadge() {
    try {
      return await GEA.messages.unreadCount();
    } catch (_) {
      return 0;
    }
  }

  function navLink(href, id, label, extra) {
    const active = page === id ? " is-active" : "";
    return '<a href="' + href + '" class="' + active + '">' + label + (extra || "") + "</a>";
  }

  async function mountChrome() {
    const foot = document.getElementById("admin-footer");
    if (foot) foot.innerHTML = footerHTML;
    if (page === "login") return;

    const unread = await unreadBadge();
    const badge = unread > 0 ? '<span class="admin-badge">' + unread + "</span>" : "";
    const header = document.getElementById("admin-header");
    if (!header) return;
    header.innerHTML =
      '<header class="admin-top">' +
      '<div class="wrap admin-bar">' +
      '<a class="brand" href="dashboard.html">' +
      '<span class="brand-stamp">G·A</span>' +
      '<span class="brand-text"><strong>Administration</strong><small>Génération en Action</small></span>' +
      "</a>" +
      '<nav class="admin-links" aria-label="Administration">' +
      navLink("dashboard.html", "dashboard", "Tableau de bord") +
      navLink("articles.html", "articles", "Articles") +
      navLink("messages.html", "messages", "Messages", badge) +
      '<a href="../index.html">Voir le site</a>' +
      '<button type="button" class="btn btn-sm" id="admin-logout">Déconnexion</button>' +
      "</nav>" +
      '<button class="menu-btn" id="admin-menu-btn" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>' +
      "</div>" +
      '<div class="admin-mobile" id="admin-mobile">' +
      navLink("dashboard.html", "dashboard", "Tableau de bord") +
      navLink("articles.html", "articles", "Articles") +
      navLink("messages.html", "messages", "Messages" + (unread ? " (" + unread + ")" : "")) +
      '<a href="../index.html">Voir le site</a>' +
      '<button type="button" class="btn" id="admin-logout-mobile">Déconnexion</button>' +
      "</div></header>";
  }

  function bindChromeOnce() {
    document.addEventListener("click", (e) => {
      if (e.target.closest("#admin-logout, #admin-logout-mobile")) {
        sessionStorage.removeItem("gea_admin");
        location.href = "index.html";
        return;
      }
      const btn = e.target.closest("#admin-menu-btn");
      if (!btn) return;
      const panel = document.getElementById("admin-mobile");
      if (!panel) return;
      const open = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "✕" : "☰";
    });
  }

  function statusPill(published) {
    return published
      ? '<span class="pill pill-on">Publié</span>'
      : '<span class="pill pill-off">Brouillon</span>';
  }

  async function renderDashboard() {
    const articles = await GEA.articles.list();
    const messages = await GEA.messages.list();
    const published = articles.filter((a) => a.published).length;
    const drafts = articles.length - published;
    const unread = messages.filter((m) => m.unread).length;
    const box = document.getElementById("dash-stats");
    if (box) {
      box.innerHTML =
        '<div class="stat"><b>' +
        articles.length +
        "</b><span>Articles</span></div>" +
        '<div class="stat"><b>' +
        published +
        "</b><span>Publiés</span></div>" +
        '<div class="stat"><b>' +
        drafts +
        "</b><span>Brouillons</span></div>" +
        '<div class="stat"><b>' +
        unread +
        "</b><span>Messages non lus</span></div>";
    }
    const recent = document.getElementById("dash-messages");
    if (recent) {
      if (!messages.length) {
        recent.innerHTML = '<p class="muted">Aucun message pour le moment.</p>';
      } else {
        recent.innerHTML = messages
          .slice(0, 4)
          .map(
            (m) =>
              '<a class="dash-row' +
              (m.unread ? " is-unread" : "") +
              '" href="messages.html?id=' +
              encodeURIComponent(m.id) +
              '"><strong>' +
              GEA.util.escapeHtml(m.name) +
              "</strong><span>" +
              GEA.util.escapeHtml(m.subject) +
              "</span><em>" +
              GEA.util.formatDate(m.date) +
              "</em></a>"
          )
          .join("");
      }
    }
  }

  async function renderArticles() {
    const list = document.getElementById("articles-table");
    if (!list) return;

    async function paint() {
      const articles = await GEA.articles.list();
      if (!articles.length) {
        list.innerHTML = '<p class="notice">Aucun article. Créez le premier depuis le bouton ci-dessus.</p>';
        return;
      }
      list.innerHTML =
        '<div class="table-wrap"><table class="admin-table"><thead><tr>' +
        "<th>Titre</th><th>Date</th><th>État</th><th>Actions</th>" +
        "</tr></thead><tbody>" +
        articles
          .map(
            (a) =>
              '<tr data-id="' +
              GEA.util.escapeHtml(a.id) +
              '">' +
              '<td data-label="Titre"><strong>' +
              GEA.util.escapeHtml(a.title) +
              '</strong><div class="muted">' +
              GEA.util.escapeHtml(a.slug) +
              "</div></td>" +
              '<td data-label="Date">' +
              GEA.util.formatDate(a.date) +
              "</td>" +
              '<td data-label="État">' +
              statusPill(a.published) +
              "</td>" +
              '<td data-label="Actions" class="table-actions">' +
              '<button type="button" class="btn btn-sm btn-ghost js-toggle">' +
              (a.published ? "Dépublier" : "Publier") +
              "</button>" +
              '<a class="btn btn-sm btn-paper" href="article-edit.html?id=' +
              encodeURIComponent(a.id) +
              '">Modifier</a>' +
              '<button type="button" class="btn btn-sm btn-ghost js-del">Supprimer</button>' +
              "</td></tr>"
          )
          .join("") +
        "</tbody></table></div>";
    }

    list.addEventListener("click", async (e) => {
      const row = e.target.closest("tr[data-id]");
      if (!row) return;
      const id = row.getAttribute("data-id");
      if (e.target.closest(".js-del")) {
        if (!confirm("Supprimer cet article ? Cette action est locale à ce navigateur (démo).")) return;
        await GEA.articles.remove(id);
        await paint();
        return;
      }
      if (e.target.closest(".js-toggle")) {
        const article = await GEA.articles.get(id);
        if (!article) return;
        article.published = !article.published;
        await GEA.articles.save(article);
        await paint();
      }
    });

    await paint();
  }

  async function renderEditor() {
    const form = document.getElementById("article-form");
    if (!form) return;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const title = $("#title");
    const slug = $("#slug");
    const excerpt = $("#excerpt");
    const cover = $("#cover");
    const body = $("#body");
    const published = $("#published");
    const preview = $("#cover-preview");
    const heading = $("#edit-heading");
    let slugTouched = false;
    let current = null;

    function refreshPreview() {
      const url = GEA.util.safeCover(cover.value);
      if (!url) {
        preview.hidden = true;
        preview.removeAttribute("src");
        return;
      }
      preview.hidden = false;
      preview.src = url;
    }

    if (id) {
      current = await GEA.articles.get(id);
      if (!current) {
        form.innerHTML =
          '<p class="notice">Article introuvable.</p><p><a class="btn" href="articles.html">Retour à la liste</a></p>';
        return;
      }
      if (heading) heading.textContent = "Modifier l'article";
      title.value = current.title;
      slug.value = current.slug;
      excerpt.value = current.excerpt;
      cover.value = current.cover;
      body.value = current.body;
      published.checked = Boolean(current.published);
      slugTouched = true;
      refreshPreview();
    } else {
      published.checked = true;
    }

    title.addEventListener("input", () => {
      if (!slugTouched) slug.value = GEA.util.slugify(title.value);
    });
    slug.addEventListener("input", () => {
      slugTouched = true;
    });
    cover.addEventListener("input", refreshPreview);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const saved = await GEA.articles.save({
        id: current ? current.id : "",
        title: title.value,
        slug: slug.value,
        excerpt: excerpt.value,
        cover: cover.value,
        body: body.value,
        published: published.checked,
        date: current ? current.date : new Date().toISOString().slice(0, 10),
      });
      location.href = "articles.html?saved=" + encodeURIComponent(saved.id);
    });
  }

  async function renderMessages() {
    const listEl = document.getElementById("inbox-list");
    const detailEl = document.getElementById("inbox-detail");
    if (!listEl || !detailEl) return;
    const params = new URLSearchParams(location.search);
    let selectedId = params.get("id");

    async function paint(keepId) {
      const messages = await GEA.messages.list();
      selectedId = keepId || selectedId;
      if (selectedId && !messages.some((m) => m.id === selectedId)) selectedId = null;

      const selected = messages.find((m) => m.id === selectedId);
      if (selected && selected.unread) {
        await GEA.messages.update(selected.id, { unread: false });
        selected.unread = false;
      }

      if (!messages.length) {
        listEl.innerHTML = '<p class="muted">La boîte est vide.</p>';
        detailEl.innerHTML = '<p class="muted">Aucun message à afficher.</p>';
        await mountChrome();
        return;
      }

      listEl.innerHTML = messages
        .map(
          (m) =>
            '<button type="button" class="inbox-item' +
            (m.unread ? " is-unread" : "") +
            (m.id === selectedId ? " is-on" : "") +
            '" data-id="' +
            GEA.util.escapeHtml(m.id) +
            '"><strong>' +
            GEA.util.escapeHtml(m.name) +
            "</strong><span>" +
            GEA.util.escapeHtml(m.subject) +
            "</span><em>" +
            GEA.util.formatDate(m.date) +
            "</em></button>"
        )
        .join("");

      const msg = messages.find((m) => m.id === selectedId);
      if (!msg) {
        detailEl.innerHTML = '<p class="muted">Sélectionnez un message.</p>';
        await mountChrome();
        return;
      }
      detailEl.innerHTML =
        '<div class="letterhead">' +
        '<div><span class="eyebrow">Message reçu</span><strong>' +
        GEA.util.escapeHtml(msg.subject) +
        "</strong></div>" +
        '<div><span class="muted">' +
        GEA.util.formatDate(msg.date) +
        "</span></div></div>" +
        "<p><strong>" +
        GEA.util.escapeHtml(msg.name) +
        '</strong><br><a href="mailto:' +
        GEA.util.escapeHtml(msg.email) +
        '">' +
        GEA.util.escapeHtml(msg.email) +
        "</a></p>" +
        '<div class="message-body">' +
        GEA.util.paragraphs(msg.message) +
        "</div>" +
        '<div class="btn-row mt">' +
        '<a class="btn" href="mailto:' +
        GEA.util.escapeHtml(msg.email) +
        "?subject=" +
        encodeURIComponent("Re: " + msg.subject) +
        '">Répondre</a>' +
        '<button type="button" class="btn btn-ghost" id="msg-unread">Marquer non lu</button>' +
        '<button type="button" class="btn btn-ink" id="msg-del">Supprimer</button>' +
        "</div>";

      $("#msg-unread").addEventListener("click", async () => {
        await GEA.messages.update(msg.id, { unread: true });
        await paint(msg.id);
      });
      $("#msg-del").addEventListener("click", async () => {
        if (!confirm("Supprimer ce message ?")) return;
        await GEA.messages.remove(msg.id);
        selectedId = null;
        await paint();
      });
      await mountChrome();
    }

    listEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".inbox-item");
      if (!btn) return;
      selectedId = btn.getAttribute("data-id");
      history.replaceState(null, "", "messages.html?id=" + encodeURIComponent(selectedId));
      await paint(selectedId);
    });

    await paint(selectedId);
  }

  function bindLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("password");
      const err = document.getElementById("login-error");
      const expected = String(window.ADMIN_PASSWORD || "");
      if (input.value === expected && expected) {
        sessionStorage.setItem("gea_admin", "1");
        location.href = "dashboard.html";
        return;
      }
      if (err) {
        err.hidden = false;
        err.textContent = "Mot de passe incorrect.";
      }
      input.value = "";
      input.focus();
    });
  }

  async function init() {
    bindChromeOnce();
    bindLogin();
    if (page !== "login") await GEA.ready;
    await mountChrome();
    if (page === "dashboard") await renderDashboard();
    if (page === "articles") await renderArticles();
    if (page === "edit") await renderEditor();
    if (page === "messages") await renderMessages();
  }

  init();
})();
