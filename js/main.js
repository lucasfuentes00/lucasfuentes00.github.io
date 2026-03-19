// Select containers
const featuredContainer = document.getElementById("featured-container");
const avatarImg = document.getElementById("avatar");
const nameHeading = document.getElementById("name");
const bioPara = document.getElementById("bio");

// Fetch profile data
fetch("profile.json")
  .then(res => res.json())
  .then(profile => {
    if (profile.name) nameHeading.textContent = profile.name;
    if (profile.bio) bioPara.textContent = profile.bio;
    if (profile.avatar_url) {
      avatarImg.src = profile.avatar_url;
      avatarImg.style.display = "block";
    }
  })
  .catch(err => console.warn("Could not load profile:", err));

// Fetch and display featured projects (Top 3)
fetch("repos.json")
  .then(res => res.json())
  .then(repos => {
    if (featuredContainer) {
      featuredContainer.innerHTML = "";
      
      // Sort by stars or just take the first 3
      const featured = repos
        .filter(repo => !repo.fork && repo.name !== "lucasfuentes00.github.io")
        .slice(0, 3);

      featured.forEach(repo => {
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
        featuredContainer.appendChild(card);
      });
    }
  })
  .catch(err => console.error("Could not load featured projects:", err));
