const projectList = document.getElementById("project-list");
const chapterFilter = document.getElementById("chapter-filter");
const typeCheckboxes = document.querySelectorAll('input[name="type-filter"]');

let allProjects = [];

async function loadProjects() {
  try {
    const response = await fetch("./projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Não foi possível carregar o projects.json");
    }

    allProjects = await response.json();

    populateChapterFilter(allProjects);
    applyFilters();
  } catch (error) {
    console.error(error);
    projectList.innerHTML = `
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

function getSelectedTypes() {
  return [...typeCheckboxes]
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
}

function applyFilters() {
  const selectedChapter = chapterFilter.value;
  const selectedTypes = getSelectedTypes();

  let filteredProjects = [...allProjects];

  if (selectedChapter !== "all") {
    const chapterNumber = Number(selectedChapter);
    filteredProjects = filteredProjects.filter(
      project => project.chapter === chapterNumber
    );
  }

  filteredProjects = filteredProjects.filter(project =>
    selectedTypes.includes(project.type)
  );

  renderProjects(filteredProjects);
}

function renderProjects(projects) {
  projectList.innerHTML = "";

  if (projects.length === 0) {
    projectList.innerHTML = `
      <div class="error-box">
        <h2>Nenhuma atividade encontrada</h2>
        <p>Não há projetos para os filtros selecionados.</p>
      </div>
    `;
    return;
  }

  for (const project of projects) {
    const card = createProjectCard(project);
    projectList.appendChild(card);
  }
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const thumb = document.createElement("div");
  thumb.className = "project-thumb";

  if (project.thumbnail) {
    thumb.style.backgroundImage = `url("${project.thumbnail}")`;
    thumb.textContent = "";
  } else {
    thumb.textContent = "Sem thumbnail";
  }

  const content = document.createElement("div");
  content.className = "project-content";

  const title = document.createElement("h2");
  title.textContent = project.title || "Sem título";

  const meta = document.createElement("p");
  meta.className = "project-meta";
  meta.textContent = buildMetaText(project);

  const description = document.createElement("p");
  description.textContent = project.description || "Sem descrição.";

  const type = document.createElement("p");
  type.className = "project-type";
  type.textContent = buildTypeLabel(project.type);

  const link = document.createElement("a");
  link.href = `./viewer.html?id=${encodeURIComponent(project.id)}`;
  link.textContent = "Visualizar atividade";

  content.append(title, meta, description, type, link);
  article.append(thumb, content);

  return article;
}

function buildMetaText(project) {
  const chapterText = Number.isInteger(project.chapter)
    ? `Capítulo ${project.chapter}`
    : "Sem capítulo";

  const topicText = project.topic?.trim()
    ? project.topic.trim()
    : "Sem tema";

  return `${chapterText} - ${topicText}`;
}

function buildTypeLabel(type) {
  switch (type) {
    case "activity":
      return "Atividade";
    case "challenge":
      return "Desafio";
    case "rework":
      return "Rework";
    default:
      return "Tipo desconhecido";
  }
}

chapterFilter.addEventListener("change", applyFilters);

typeCheckboxes.forEach(checkbox => {
  checkbox.addEventListener("change", applyFilters);
});

loadProjects();