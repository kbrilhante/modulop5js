const iframe = document.getElementById("viewer");
const titleEl = document.getElementById("project-title");
const descriptionEl = document.getElementById("project-description");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const topShield = document.getElementById("top-shield");

const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

async function initViewer() {
  hardenOuterPage();

  if (!projectId) {
    showError("Projeto não informado na URL.");
    return;
  }

  try {
    const response = await fetch("./projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Falha ao carregar o arquivo de projetos.");
    }

    const projects = await response.json();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      showError("Projeto não encontrado.");
      return;
    }

    titleEl.textContent = project.title || "Projeto";
    descriptionEl.textContent = project.description || "";
    document.title = project.title || "Visualizador";

    iframe.src = project.viewUrl;

    // Se quiser desligar o escudo em alguns projetos:
    // if (project.disableTopShield) {
    //   topShield.classList.add("disabled");
    // }
  } catch (error) {
    console.error(error);
    showError("Não foi possível carregar este projeto.");
  }
}

function showError(message) {
  titleEl.textContent = "Erro";
  descriptionEl.textContent = message;
  iframe.remove();
  topShield.remove();
}

function hardenOuterPage() {
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  document.addEventListener("dragstart", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    const blocked =
      key === "f12" ||
      (e.ctrlKey && key === "u") ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key));

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      fullscreenBtn.textContent = "Sair da tela cheia";
    } else {
      await document.exitFullscreen();
      fullscreenBtn.textContent = "Tela cheia";
    }
  } catch (error) {
    console.error("Fullscreen falhou:", error);
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenBtn.textContent = document.fullscreenElement
    ? "Sair da tela cheia"
    : "Tela cheia";
});

initViewer();
