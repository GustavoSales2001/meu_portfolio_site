(function () {
  const reveals = document.querySelectorAll(".reveal");

  if (!reveals.length) return;

  const showElement = (el) => {
    el.classList.add("show");
  };

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    reveals.forEach(showElement);
    return;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showElement(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach((el) => io.observe(el));
  } else {
    setTimeout(() => {
      reveals.forEach(showElement);
    }, 300);
  }

  setTimeout(() => {
    reveals.forEach(showElement);
  }, 1000);
})();

(function () {
  const form = document.getElementById("formContato");

  if (!form) return;

  const btn = document.getElementById("btnEnviar");
  const feedbackEl = document.getElementById("feedback");

  const nomeEl = document.getElementById("nome");
  const emailEl = document.getElementById("email");
  const mensagemEl = document.getElementById("mensagem");
  const honeypotEl = document.getElementById("company");

  try {
    const savedNome = localStorage.getItem("contato_nome");
    const savedEmail = localStorage.getItem("contato_email");

    if (savedNome) nomeEl.value = savedNome;
    if (savedEmail) emailEl.value = savedEmail;
  } catch (_) {}

  function setFeedback(type, text) {
    feedbackEl.className = "feedback " + (type || "");
    feedbackEl.textContent = text || "";
    feedbackEl.style.display = text ? "block" : "none";

    if (text) {
      try {
        feedbackEl.focus();
      } catch (_) {}
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function normalizeApiBase(v) {
    return String(v || "").trim().replace(/\/+$/, "");
  }

  function setLoading(isLoading) {
    btn.disabled = isLoading;
    btn.setAttribute("aria-busy", isLoading ? "true" : "false");
    btn.textContent = isLoading ? "Enviando..." : "Enviar";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const apiBase = normalizeApiBase(form.getAttribute("data-api-base"));
    const nome = nomeEl.value.trim();
    const email = emailEl.value.trim();
    const mensagem = mensagemEl.value.trim();

    if (honeypotEl && honeypotEl.value.trim()) {
      setFeedback("err", "Falha na validação. Tente novamente.");
      return;
    }

    if (!nome || !email || !mensagem) {
      setFeedback("err", "Preencha todos os campos.");
      return;
    }

    if (nome.length < 2) {
      setFeedback("err", "Nome muito curto. Digite pelo menos 2 caracteres.");
      return;
    }

    if (!isValidEmail(email)) {
      setFeedback("err", "E-mail inválido. Verifique e tente novamente.");
      return;
    }

    if (nome.length > 255 || email.length > 255) {
      setFeedback("err", "Nome ou e-mail muito longos.");
      return;
    }

    if (mensagem.length < 10) {
      setFeedback("err", "Mensagem muito curta. Escreva pelo menos 10 caracteres.");
      return;
    }

    if (mensagem.length > 2000) {
      setFeedback("err", "Mensagem muito longa (máx 2000 caracteres).");
      return;
    }

    if (!apiBase) {
      setFeedback("err", "API não configurada (data-api-base).");
      return;
    }

    try {
      localStorage.setItem("contato_nome", nome);
      localStorage.setItem("contato_email", email);
    } catch (_) {}

    setLoading(true);
    setFeedback("", "");

    const controller = new AbortController();
    const timeoutMs = 12000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(apiBase + "/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, mensagem }),
        signal: controller.signal
      });

      const contentType = res.headers.get("content-type") || "";

      const payload = contentType.includes("application/json")
        ? await res.json()
        : { mensagem: await res.text() };

      if (!res.ok) {
        throw new Error(payload.mensagem || "Erro ao enviar mensagem.");
      }

      setFeedback("ok", payload.mensagem || "Mensagem enviada com sucesso!");
      form.reset();

    } catch (err) {
      const msg =
        err && err.name === "AbortError"
          ? "Tempo limite excedido. Verifique sua conexão e tente novamente."
          : (err && err.message)
            ? err.message
            : "Erro ao enviar mensagem.";

      console.error("Erro:", err);
      setFeedback("err", msg);

    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  });
})();
// ===== MODAL IMAGEM =====
const modal = document.getElementById("imgModal");
const modalImg = document.getElementById("modalImg");
const captionText = document.getElementById("modalCaption");
const closeBtn = document.querySelector(".close-modal");

document.querySelectorAll(".case-card img").forEach(img => {
  img.addEventListener("click", () => {
    modal.classList.add("show");
    modalImg.src = img.src;
    captionText.innerText = img.alt;
  });
});

closeBtn.onclick = () => modal.classList.remove("show");

modal.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
};