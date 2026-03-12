async function loadProjects() {
  const container = document.getElementById("project-list");

  try {
    const response = await fetch("./projects.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Não foi possível carregar o projects.json");
    }

    const projects = await response.json();
    container.innerHTML = "";

    for (const project of projects) {
      const card = createProjectCard(project);
      container.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="error-box">
        <h2>Erro ao carregar projetos</h2>
        <p>Confira se o arquivo <strong>projects.json</strong> existe e está válido.</p>
      </div>
    `;
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

  const description = document.createElement("p");
  description.textContent = project.description || "Sem descrição.";

  const link = document.createElement("a");
  link.href = `./viewer.html?id=${encodeURIComponent(project.id)}`;
  link.textContent = "Abrir desafio";

  content.append(title, description, link);
  article.append(thumb, content);

  return article;
}

loadProjects();
