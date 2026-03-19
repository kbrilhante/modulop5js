const linksList = document.getElementById("p5-links-list");
const chapterFilter = document.getElementById("chapter-filter");

let allProjects = [];

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

  let filteredProjects = [...allProjects];

  if (selected !== "all") {
    const chapterNumber = Number(selected);
    filteredProjects = filteredProjects.filter(
      project => project.chapter === chapterNumber
    );
  }

  renderLinks(filteredProjects);
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
    linksList.appendChild(createLinkItem(project));
  }
}

function createLinkItem(project) {
  const article = document.createElement("article");
  article.className = "p5-link-card";

  const thumb = document.createElement("div");
  thumb.className = "p5-link-thumb";

  if (project.thumbnail) {
    thumb.style.backgroundImage = `url("${project.thumbnail}")`;
  } else {
    thumb.textContent = "Sem thumb";
  }

  const content = document.createElement("div");
  content.className = "p5-link-content";

  const title = document.createElement("h2");
  title.textContent = project.title || "Sem título";

  const meta = document.createElement("p");
  meta.className = "p5-link-meta";
  meta.textContent = `Capítulo ${project.chapter} - ${project.topic || "Sem tema"}`;

  const actions = document.createElement("div");
  actions.className = "p5-link-actions";

  const openBtn = document.createElement("a");
  openBtn.href = project.viewUrl || "#";
  openBtn.target = "_blank";
  openBtn.rel = "noopener noreferrer";
  openBtn.textContent = "Abrir no p5";

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copiar link";
  copyBtn.addEventListener("click", async () => {
    await copyText(project.viewUrl || "", copyBtn, "Copiar link", "Copiado!");
  });

  actions.append(openBtn, copyBtn);
  content.append(title, meta, actions);

  article.append(thumb, content);

  return article;
}

async function copyText(text, button, defaultLabel, successLabel) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = successLabel;

    setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1000);
  } catch (error) {
    console.error("Falha ao copiar:", error);
    button.textContent = "Erro";

    setTimeout(() => {
      button.textContent = defaultLabel;
    }, 1000);
  }
}

chapterFilter.addEventListener("change", applyFilter);

loadProjects();