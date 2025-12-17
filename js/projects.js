const container = document.getElementById("projects");

fetch("repos.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load repos.json");
    return res.json();
  })
  .then(repos => {
    repos
      .filter(repo => !repo.fork)
      .forEach(repo => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <h3>${repo.name}</h3>
          <p>${repo.description || "No description provided."}</p>
          <div class="meta">
            <span>${repo.language || ""}</span>
            <a href="${repo.html_url}" target="_blank" rel="noopener">
              View →
            </a>
          </div>
        `;

        container.appendChild(card);
      });
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p>Unable to load projects.</p>";
  });
