(function () {
  function emptyState(title, text, href, label) {
    return (
      '<div class="wrap center article-empty">' +
      '<span class="eyebrow">Blog</span>' +
      "<h1>" +
      title +
      "</h1>" +
      '<p class="lede">' +
      text +
      "</p>" +
      '<a class="btn mt" href="' +
      href +
      '">' +
      label +
      "</a></div>"
    );
  }

  async function renderList() {
    const root = document.getElementById("blog-list");
    if (!root) return;
    await GEA.ready;
    const articles = await GEA.articles.list({ publishedOnly: true });
    if (!articles.length) {
      root.innerHTML = emptyState(
        "Aucun article pour le moment.",
        "Revenez bientôt — ou écrivez-nous si vous voulez raconter une rencontre.",
        "index.html",
        "Retour à l'accueil"
      );
      return;
    }
    root.innerHTML = articles
      .map((a) => {
        const cover = GEA.util.safeCover(a.cover);
        const img = cover
          ? '<img src="' + GEA.util.escapeHtml(cover) + '" alt="">'
          : '<div class="blog-card-ph" aria-hidden="true"></div>';
        return (
          '<article class="blog-card">' +
          img +
          '<div class="blog-card-body">' +
          '<span class="pp-kicker">' +
          GEA.util.formatDate(a.date) +
          "</span>" +
          "<h2>" +
          GEA.util.escapeHtml(a.title) +
          "</h2>" +
          "<p>" +
          GEA.util.escapeHtml(a.excerpt) +
          "</p>" +
          '<a class="btn" href="article.html?slug=' +
          encodeURIComponent(a.slug) +
          '">Lire l\'article</a>' +
          "</div></article>"
        );
      })
      .join("");
  }

  async function renderArticle() {
    const root = document.getElementById("article-root");
    if (!root) return;
    await GEA.ready;
    const slug = new URLSearchParams(location.search).get("slug") || "";
    const article = slug ? await GEA.articles.bySlug(slug) : null;
    if (!article || !article.published) {
      document.title = "Article introuvable — Génération en Action";
      root.innerHTML = emptyState(
        "Article introuvable.",
        "L'article demandé n'existe pas, ou n'est plus publié.",
        "blog.html",
        "Retour au blog"
      );
      return;
    }
    document.title = article.title + " — Génération en Action";
    const cover = GEA.util.safeCover(article.cover);
    root.innerHTML =
      '<header class="page-hero article-hero">' +
      (cover
        ? '<img class="hero-bg" src="' + GEA.util.escapeHtml(cover) + '" alt="">'
        : "") +
      '<div class="wrap"><span class="eyebrow">' +
      GEA.util.formatDate(article.date) +
      "</span><h1>" +
      GEA.util.escapeHtml(article.title) +
      "</h1></div></header>" +
      '<section class="section"><div class="wrap article-layout">' +
      '<div class="article-body">' +
      GEA.util.paragraphs(article.body) +
      "</div>" +
      '<div class="btn-row mt"><a class="btn btn-ghost" href="blog.html">Tous les articles</a>' +
      '<a class="btn" href="contact.html">Écrire à l\'équipe</a></div>' +
      "</div></section>";
  }

  const page = document.body.dataset.page;
  if (page === "blog" && document.getElementById("blog-list")) renderList();
  if (document.getElementById("article-root")) renderArticle();
})();
