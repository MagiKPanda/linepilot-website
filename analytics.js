(function () {
  "use strict";

  const MEASUREMENT_ID = "G-V9FW2FNCJP";
  const CONSENT_KEY = "linepilot_analytics_consent_v1";
  const PLAY_STORE_URL_PART = "play.google.com/store/apps/details?id=app.linepilot.android";

  const copy = {
    en: {
      title: "Optional website analytics",
      text: "With your permission, LinePilot uses Google Analytics to understand visits and Google Play clicks. The tag stays blocked until you accept.",
      accept: "Accept analytics",
      decline: "Decline",
      privacy: "Read the Privacy Policy",
      preferences: "Analytics preferences"
    },
    hi: {
      title: "वैकल्पिक वेबसाइट एनालिटिक्स",
      text: "आपकी अनुमति से LinePilot वेबसाइट विज़िट और Google Play क्लिक समझने के लिए Google Analytics का उपयोग करता है। स्वीकार करने तक टैग बंद रहता है।",
      accept: "एनालिटिक्स स्वीकार करें",
      decline: "अस्वीकार करें",
      privacy: "गोपनीयता नीति पढ़ें",
      preferences: "एनालिटिक्स प्राथमिकताएँ"
    },
    id: {
      title: "Analitik situs opsional",
      text: "Dengan izin Anda, LinePilot menggunakan Google Analytics untuk memahami kunjungan dan klik ke Google Play. Tag tetap diblokir sampai Anda menyetujuinya.",
      accept: "Izinkan analitik",
      decline: "Tolak",
      privacy: "Baca Kebijakan Privasi",
      preferences: "Preferensi analitik"
    },
    pt: {
      title: "Análise opcional do site",
      text: "Com a sua autorização, o LinePilot utiliza o Google Analytics para compreender visitas e cliques no Google Play. A etiqueta permanece bloqueada até aceitar.",
      accept: "Aceitar análise",
      decline: "Recusar",
      privacy: "Ler a Política de Privacidade",
      preferences: "Preferências de análise"
    }
  };

  const language = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  const labels = copy[language] || copy.en;
  let analyticsLoaded = false;
  let banner;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  function readConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (_) {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (_) {
      // The choice still applies for the current page if storage is unavailable.
    }
  }

  function loadGoogleAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      const name = cookie.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0) {
        document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
        document.cookie = name + "=; Max-Age=0; path=/; domain=.linepilotapp.com; SameSite=Lax";
      }
    });
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    document.body.classList.remove("consent-open");
  }

  function chooseConsent(value) {
    const previouslyLoaded = analyticsLoaded;
    saveConsent(value);

    if (value === "granted") {
      hideBanner();
      loadGoogleAnalytics();
      return;
    }

    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    clearAnalyticsCookies();
    hideBanner();

    // Reload removes an already-loaded Google tag after consent is withdrawn.
    if (previouslyLoaded) window.location.reload();
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    document.body.classList.add("consent-open");
    banner.querySelector(".consent-accept").focus();
  }

  function buildBanner() {
    banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.hidden = true;
    banner.innerHTML =
      '<div class="consent-card">' +
        '<div class="consent-copy">' +
          '<h2 id="consent-title"></h2>' +
          '<p class="consent-text"></p>' +
          '<a class="consent-policy" href="/privacy.html"></a>' +
        '</div>' +
        '<div class="consent-actions">' +
          '<button class="consent-button consent-decline" type="button"></button>' +
          '<button class="consent-button consent-accept" type="button"></button>' +
        '</div>' +
      '</div>';

    banner.querySelector("#consent-title").textContent = labels.title;
    banner.querySelector(".consent-text").textContent = labels.text;
    banner.querySelector(".consent-policy").textContent = labels.privacy;
    banner.querySelector(".consent-decline").textContent = labels.decline;
    banner.querySelector(".consent-accept").textContent = labels.accept;
    banner.querySelector(".consent-decline").addEventListener("click", function () {
      chooseConsent("denied");
    });
    banner.querySelector(".consent-accept").addEventListener("click", function () {
      chooseConsent("granted");
    });
    document.body.appendChild(banner);

    document.querySelectorAll(".analytics-preferences").forEach(function (link) {
      link.textContent = labels.preferences;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showBanner();
      });
    });
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");
    if (!link || !link.href.includes(PLAY_STORE_URL_PART) || readConsent() !== "granted") return;
    window.gtag("event", "play_store_click", {
      link_url: link.href,
      link_text: (link.textContent || "").trim(),
      page_language: language,
      transport_type: "beacon"
    });
  });

  buildBanner();
  if (readConsent() === "granted") {
    loadGoogleAnalytics();
  } else if (readConsent() !== "denied") {
    showBanner();
  }
})();

