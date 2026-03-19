// Select containers
const projectsContainer = document.getElementById("projects-container");
const avatarImg = document.getElementById("avatar");
const nameHeading = document.getElementById("name");
const bioPara = document.getElementById("bio");

// Fetch profile data
fetch("profile.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load profile.json");
    return res.json();
  })
  .then(profile => {
    if (profile.name) nameHeading.textContent = profile.name;
    if (profile.bio) bioPara.textContent = profile.bio;
    if (profile.avatar_url) {
      avatarImg.src = profile.avatar_url;
      avatarImg.style.display = "block";
    }
  })
  .catch(err => {
    console.warn("Could not load profile data:", err);
  });

// Fetch projects data
fetch("repos.json")
  .then(res => {
    if (!res.ok) throw new Error("Failed to load repos.json");
    return res.json();
  })
  .then(repos => {
    projectsContainer.innerHTML = ""; // Clear existing content

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

        projectsContainer.appendChild(card);
      });
  })
  .catch(err => {
    console.error(err);
    projectsContainer.innerHTML = "<p>Unable to load projects.</p>";
  });
