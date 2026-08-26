(function () {
  const page = document.body.dataset.page || "";

  const nav = [
    { href: "index.html", id: "accueil", label: "Accueil" },
    { href: "a-propos.html", id: "apropos", label: "L'ASBL" },
    { href: "projets.html", id: "projets", label: "Projets" },
    { href: "blog.html", id: "blog", label: "Blog" },
    { href: "contact.html", id: "contact", label: "Contact" },
  ];

  const projectLinks = [
    { href: "reve-junior.html", label: "J'ai un rêve" },
    { href: "reve-senior.html", label: "J'ai un rêve senior" },
    { href: "sport-pour-tous.html", label: "Sport pour tous" },
    { href: "les-liens-du-temps.html", label: "Les liens du temps" },
    { href: "generation-sans-frontieres.html", label: "Génération sans frontières" },
    { href: "enfants-places.html", label: "Enfants placés" },
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
          ${projectLinks.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}
          <a class="btn" href="faire-un-don.html">Soutenir</a>
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
              <p>Ensemble, nous créons des rêves. Ensemble, nous créons du lien.</p>
            </div>
            <div>
              <h3>Le site</h3>
              <ul>
                <li><a href="a-propos.html">L'ASBL</a></li>
                <li><a href="projets.html">Tous les projets</a></li>
                <li><a href="activites.html">Créer du lien</a></li>
                <li><a href="galerie.html">Galerie</a></li>
                <li><a href="blog.html">Le blog</a></li>
                <li><a href="faire-un-don.html">Soutenir</a></li>
                <li><a href="contact.html">Nous rejoindre</a></li>
              </ul>
            </div>
            <div>
              <h3>Contact</h3>
              <p>Rue Herkolier 89<br>1081 Koekelberg</p>
              <p class="mt"><a href="mailto:team.generationbrussels@gmail.com">team.generationbrussels@gmail.com</a></p>
              <p><a href="https://www.instagram.com/team.generation_action" target="_blank" rel="noopener">@team.generation_action</a></p>
            </div>
          </div>
          <div class="legal">
            <span>© 2026 ASBL Génération en Action — Koekelberg.</span>
            <span>Ensemble, nous créons des rêves.</span>
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
  const header = document.querySelector(".site-header");
  const zipper = document.querySelector(".zipper-section");

  function closeMobileMenu() {
    if (!panel || !menuBtn) return;
    panel.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.textContent = "☰";
  }

  if (menuBtn && panel) {
    menuBtn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "✕" : "☰";
    });
  }

  function navShouldShow() {
    if (!zipper) return true;
    if (window.scrollY > 72) return true;
    if (window.ScrollTrigger) {
      const st = ScrollTrigger.getAll().find((t) => t.trigger === zipper);
      if (st && st.progress > 0.05) return true;
    }
    return false;
  }

  function updateNavVisibility() {
    if (!header) return;
    const show = navShouldShow();
    header.classList.toggle("is-shown", show);
    if (!show) closeMobileMenu();
  }

  window.addEventListener("scroll", updateNavVisibility, { passive: true });
  updateNavVisibility();

  document.documentElement.classList.add("has-motion");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canParallax = !reduceMotion && window.matchMedia("(min-width: 861px)").matches && window.matchMedia("(hover: hover)").matches;

  const veil = document.createElement("div");
  veil.className = "page-veil";
  document.body.appendChild(veil);

  document.querySelectorAll('a[href$=".html"], a[href^="index.html"], a[href="index.html"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank") return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto")) return;
      e.preventDefault();
      veil.classList.add("is-on");
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  const revealTargets = [
    ".section-head",
    ".letterhead",
    ".manifesto h2",
    ".manifesto p",
    ".manifesto .btn-row",
    ".stamp",
    ".split > *",
    ".project-panel",
    ".value",
    ".activity",
    ".gallery figure",
    ".form",
    ".donate-box",
    ".notice",
    ".stat",
    ".numbered li",
    ".two-col > *",
    ".blog-card",
    ".article-body",
    ".contact-grid > *",
    ".footer-grid > *",
    ".pullquote",
    ".info-row",
    ".page-hero .wrap",
    ".activity-body",
    ".pp-copy",
  ];
  document.querySelectorAll(revealTargets.join(",")).forEach((el, i) => {
    el.classList.add("reveal");
    const parent = el.parentElement;
    if (parent) {
      const siblings = [...parent.children].filter((c) => c.classList.contains("reveal"));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.style.setProperty("--delay", `${Math.min(idx, 6) * 80}ms`);
    } else {
      el.style.setProperty("--delay", `${(i % 5) * 60}ms`);
    }
  });
  document.querySelectorAll(".rule").forEach((el) => el.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const parallaxEls = canParallax
    ? document.querySelectorAll(".stamp img, .page-hero .hero-bg, .project-panel img")
    : [];
  let ticking = false;
  function applyParallax() {
    ticking = false;
    const vh = window.innerHeight / 2;
    parallaxEls.forEach((el) => {
      const box = el.getBoundingClientRect();
      if (box.bottom < -80 || box.top > window.innerHeight + 80) return;
      const shift = ((box.top + box.height / 2) - vh) * -0.07;
      el.style.setProperty("--par", `${shift.toFixed(1)}px`);
    });
  }
  if (parallaxEls.length) {
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(applyParallax);
        }
      },
      { passive: true }
    );
    applyParallax();
  }

  /* Hero crossfade — children photos */
  const heroSlides = document.querySelectorAll(".hero-slide");
  if (heroSlides.length > 1) {
    if (!reduceMotion) {
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
    if (!reduceMotion) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".zipper-section",
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: 1.1,
          onUpdate: updateNavVisibility,
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
    "10": "10 € — un goûter, un petit geste pour un enfant hospitalisé ou un aîné.",
    "25": "25 € — une part d'un rêve HUDERF ou d'un rêve senior.",
    "50": "50 € — une sortie, une activité en maison de repos, ou une fête avec des enfants placés.",
    "100": "100 € — un rêve plus ambitieux : une rencontre, un voyage, un souvenir qui reste.",
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

  const contactForm = document.getElementById("contact-form");
  if (contactForm && window.GEA) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = contactForm.nom.value.trim();
      const email = contactForm.email.value.trim();
      const subject = contactForm.sujet.value;
      const message = contactForm.message.value.trim();
      await GEA.ready;
      await GEA.messages.add({
        name,
        email,
        subject,
        message,
        date: new Date().toISOString(),
        unread: true,
      });
      const ok = contactForm.querySelector(".form-ok");
      if (ok) ok.classList.add("show");
      const mailto = GEA.util.mailtoContact({ name, email, subject, message });
      const mailLink = document.createElement("a");
      mailLink.href = mailto;
      mailLink.style.display = "none";
      document.body.appendChild(mailLink);
      mailLink.click();
      mailLink.remove();
      contactForm.reset();
    });
  }
})();
