const projectsContainer = document.getElementById("projects-container");

fetch("repos.json")
  .then(res => res.json())
  .then(repos => {
    if (projectsContainer) {
      projectsContainer.innerHTML = "";
      
      repos
        .filter(repo => !repo.fork)
        .forEach(repo => {
          const card = document.createElement("div");
          card.className = "card";
          
          const imgHtml = repo.image_url 
            ? `<div class="card-image" style="background-image: url('${repo.image_url}')"></div>`
            : `<div class="card-image placeholder"></div>`;

          card.innerHTML = `
            ${imgHtml}
            <div class="card-content">
              <h3>${repo.name}</h3>
              <p>${repo.description || "No description provided."}</p>
              <div class="meta">
                <span>${repo.language || ""}</span>
                <a href="${repo.html_url}" target="_blank">View →</a>
              </div>
            </div>
          `;
          projectsContainer.appendChild(card);
        });
    }
  })
  .catch(err => {
    console.error("Could not load projects:", err);
    projectsContainer.innerHTML = "<p>Unable to load projects.</p>";
  });
