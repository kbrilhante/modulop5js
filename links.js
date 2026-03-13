const linksList = document.getElementById("links-list");
const copyAllBtn = document.getElementById("copy-all-btn");
const chapterFilter = document.getElementById("chapter-filter");

let allProjects = [];
let filteredProjects = [];

async function loadProjects() {
  try {
    const response = await fetch("./projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Não foi possível carregar o projects.json");
    }

    allProjects = await response.json();
    populateChapterFilter(allProjects);
    applyFilter();
  } catch (error) {
    console.error(error);
    linksList.innerHTML = `
      <div class="error-box">
        <h2>Erro ao carregar projetos</h2>
        <p>Confira se o arquivo <strong>projects.json</strong> existe e está válido.</p>
      </div>
    `;
  }
}

function populateChapterFilter(projects) {
  const chapters = [...new Set(
    projects
      .map(project => project.chapter)
      .filter(chapter => Number.isInteger(chapter))
  )].sort((a, b) => a - b);

  for (const chapter of chapters) {
    const option = document.createElement("option");
    option.value = String(chapter);
    option.textContent = `Capítulo ${chapter}`;
    chapterFilter.appendChild(option);
  }
}

function applyFilter() {
  const selected = chapterFilter.value;

  if (selected === "all") {
    filteredProjects = sortProjects(allProjects);
  } else {
    const selectedChapter = Number(selected);
    filteredProjects = sortProjects(
      allProjects.filter(project => project.chapter === selectedChapter)
    );
  }

  renderLinks(filteredProjects);
}

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    const chapterA = Number.isInteger(a.chapter) ? a.chapter : Infinity;
    const chapterB = Number.isInteger(b.chapter) ? b.chapter : Infinity;

    return chapterA - chapterB;
  });
}

function renderLinks(projects) {
  linksList.innerHTML = "";

  if (!projects.length) {
    linksList.innerHTML = `
      <div class="error-box">
        <h2>Nenhum projeto encontrado</h2>
        <p>Não há atividades para este filtro.</p>
      </div>
    `;
    return;
  }

  for (const project of projects) {
    const item = createLinkCard(project);
    linksList.appendChild(item);
  }
}

function createLinkCard(project) {
  const article = document.createElement("article");
  article.className = "link-card";

  const title = document.createElement("h2");
  title.className = "link-card-title";
  title.textContent = project.title || "Sem título";

  const meta = document.createElement("p");
  meta.className = "link-card-meta";
  meta.textContent = Number.isInteger(project.chapter)
    ? `Capítulo ${project.chapter}`
    : "Sem capítulo";

  const url = buildViewerUrl(project.id);

  const textarea = document.createElement("textarea");
  textarea.className = "link-card-url";
  textarea.readOnly = true;
  textarea.value = url;
  textarea.rows = 1;

  const actions = document.createElement("div");
  actions.className = "link-card-actions";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copiar link";
  copyBtn.addEventListener("click", async () => {
    await copyText(url, copyBtn, "Copiar link", "Copiado!");
  });

  const copyFullBtn = document.createElement("button");
  copyFullBtn.type = "button";
  copyFullBtn.textContent = "Copiar com título";
  copyFullBtn.addEventListener("click", async () => {
    const fullText = `${project.title || "Sem título"}\n${url}`;
    await copyText(fullText, copyFullBtn, "Copiar com título", "Copiado!");
  });

  actions.append(copyBtn, copyFullBtn);
  article.append(title, meta, textarea, actions);

  return article;
}

function buildViewerUrl(projectId) {
  const url = new URL("./viewer.html", window.location.href);
  url.searchParams.set("id", projectId);
  return url.toString();
}

async function copyText(text, button, defaultLabel, successLabel) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successLabel;

    setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1200);
  } catch (error) {
    console.error("Falha ao copiar:", error);
    button.textContent = "Erro ao copiar";

    setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1200);
  }
}

chapterFilter.addEventListener("change", applyFilter);

copyAllBtn.addEventListener("click", async () => {
  if (!filteredProjects.length) return;

  const text = filteredProjects
    .map((project) => {
      const chapterText = Number.isInteger(project.chapter)
        ? `Capítulo ${project.chapter}`
        : "Sem capítulo";

      return `${project.title || "Sem título"}\n${chapterText}\n${buildViewerUrl(project.id)}`;
    })
    .join("\n\n");

  await copyText(text, copyAllBtn, "Copiar tudo", "Tudo copiado!");
});

loadProjects();