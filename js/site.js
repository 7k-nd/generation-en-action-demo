(function () {
  const page = document.body.dataset.page || "";

  const nav = [
    { href: "index.html", id: "accueil", label: "Accueil" },
    { href: "a-propos.html", id: "apropos", label: "L'ASBL" },
    { href: "activites.html", id: "activites", label: "Activités" },
    { href: "projets.html", id: "projets", label: "Projets" },
    { href: "galerie.html", id: "galerie", label: "Galerie" },
    { href: "contact.html", id: "contact", label: "Contact" },
  ];

  function headerHTML() {
    const links = nav
      .map(
        (n) =>
          `<a href="${n.href}" class="${page === n.id ? "is-active" : ""}">${n.label}</a>`
      )
      .join("");
    return `
      <header class="site-header">
        <div class="wrap nav-bar">
          <a class="brand" href="index.html">
            <span class="brand-stamp">G·A</span>
            <span class="brand-text">
              <strong>Génération en Action</strong>
              <small>Koekelberg · Bruxelles</small>
            </span>
          </a>
          <nav class="nav-links" aria-label="Navigation principale">
            ${links}
            <a class="btn nav-cta" href="faire-un-don.html">Soutenir</a>
          </nav>
          <button class="menu-btn" id="menu-btn" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
        </div>
        <div class="mobile-panel" id="mobile-panel">
          ${nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}
          <a href="reve-junior.html">Rêve junior</a>
          <a href="reve-senior.html">Rêve senior</a>
          <a href="un-arbre-un-sourire.html">Un arbre, un sourire</a>
          <a class="btn" href="faire-un-don.html">Faire un don</a>
        </div>
      </header>`;
  }

  function footerHTML() {
    return `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <div class="brand" style="margin-bottom:1rem">
                <span class="brand-stamp">G·A</span>
                <span class="brand-text">
                  <strong style="color:#faf6ee">Génération en Action</strong>
                  <small>ASBL · Bruxelles</small>
                </span>
              </div>
              <p>Solidarité intergénérationnelle à Koekelberg. Des lettres, des dessins, des rêves qui deviennent réalité.</p>
            </div>
            <div>
              <h3>Le site</h3>
              <ul>
                <li><a href="a-propos.html">Qui sommes-nous</a></li>
                <li><a href="activites.html">Stages & workshops</a></li>
                <li><a href="projets.html">Tous les projets</a></li>
                <li><a href="faire-un-don.html">Faire un don</a></li>
                <li><a href="contact.html">Nous rejoindre</a></li>
              </ul>
            </div>
            <div>
              <h3>Écrire</h3>
              <p>Rue Herkolier 89<br>1081 Koekelberg</p>
              <p class="mt"><a href="mailto:team.generationbrussels@gmail.com">team.generationbrussels@gmail.com</a></p>
              <p><a href="https://www.instagram.com/team.generation_action" target="_blank" rel="noopener">@team.generation_action</a></p>
            </div>
          </div>
          <div class="legal">
            <span>© 2026 ASBL Génération en Action — Koekelberg.</span>
            <span>Site de présentation — version provisoire.</span>
          </div>
        </div>
      </footer>
      <a class="insta-float" href="https://www.instagram.com/team.generation_action" target="_blank" rel="noopener" aria-label="Instagram">
        <i class="fa-brands fa-instagram"></i>
      </a>`;
  }

  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.innerHTML = headerHTML();
  if (footerMount) footerMount.innerHTML = footerHTML();

  const menuBtn = document.getElementById("menu-btn");
  const panel = document.getElementById("mobile-panel");
  if (menuBtn && panel) {
    menuBtn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "✕" : "☰";
    });
  }

  /* Hero crossfade — children photos */
  const heroSlides = document.querySelectorAll(".hero-slide");
  if (heroSlides.length > 1) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      let current = 0;
      setInterval(() => {
        const next = (current + 1) % heroSlides.length;
        heroSlides[next].classList.add("is-on");
        heroSlides[current].classList.remove("is-on");
        current = next;
      }, 6200);
    }
  }

  /* Zipper */
  if (document.querySelector(".zipper-section") && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".zipper-section",
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.1,
        },
      });
      tl.to(".zipper-pull", { top: "100%", ease: "none" }, 0)
        .to(".zipper-panel.left", { xPercent: -100, ease: "power2.inOut" }, 0.12)
        .to(".zipper-panel.right", { xPercent: 100, ease: "power2.inOut" }, 0.12)
        .from(
          ".hero-copy",
          { y: 40, opacity: 0, ease: "power2.out" },
          0.28
        );
    } else {
      document.querySelectorAll(".zipper-panel").forEach((p) => (p.style.display = "none"));
      const pull = document.querySelector(".zipper-pull");
      if (pull) pull.style.display = "none";
    }
  }

  /* Donation */
  const amounts = document.querySelectorAll(".amount");
  const impact = document.getElementById("donation-impact");
  const customWrap = document.getElementById("custom-amount");
  const messages = {
    "10": "10 € — une semaine de repas ou un colis de douceurs pour un enfant ou un aîné.",
    "25": "25 € — un kit créatif, une visite d'accompagnement, ou une part de stage vacances.",
    "50": "50 € — une sortie culturelle, une journée de fête en pouponnière, ou un arbre fruitier.",
    "100": "100 € — un atelier workshop complet, ou plusieurs arbres plantés en Côte d'Ivoire.",
    autre: "Indiquez le montant qui vous convient. Chaque euro part sur le terrain.",
  };
  amounts.forEach((btn) => {
    btn.addEventListener("click", () => {
      amounts.forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      const key = btn.dataset.amount;
      if (impact) impact.textContent = messages[key] || messages.autre;
      if (customWrap) customWrap.classList.toggle("open", key === "autre");
    });
  });
  if (amounts.length) {
    const def = document.querySelector('.amount[data-amount="25"]');
    if (def) def.click();
  }
  const donateSubmit = document.getElementById("donate-submit");
  if (donateSubmit) {
    donateSubmit.addEventListener("click", () => {
      window.location.href = "mailto:team.generationbrussels@gmail.com?subject=Don%20%C3%A0%20G%C3%A9n%C3%A9ration%20en%20Action&body=Bonjour%2C%20je%20souhaite%20faire%20un%20don.";
    });
  }

  /* Forms */
  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form-ok");
      if (ok) ok.classList.add("show");
      form.reset();
    });
  });
})();
