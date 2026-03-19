import os
import requests
import json
import base64
import re

# Configuration
GITHUB_USERNAME = "lucasfuentes00"
# Use GITHUB_TOKEN if available (set in GitHub Actions)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

headers = {}
if GITHUB_TOKEN:
    headers["Authorization"] = f"token {GITHUB_TOKEN}"

def get_repos():
    url = f"https://api.github.com/users/{GITHUB_USERNAME}/repos?per_page=100&sort=updated"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching repos: {response.status_code}")
        return []
    return response.json()

def get_profile():
    url = f"https://api.github.com/users/{GITHUB_USERNAME}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching profile: {response.status_code}")
        return {}
    return response.json()

def get_readme_image(repo_name, default_branch="main"):
    url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/readme"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None
    
    content_data = response.json()
    if "content" not in content_data:
        return None
    
    try:
        readme_content = base64.b64decode(content_data["content"]).decode("utf-8")
    except Exception:
        return None
    
    # Try to find first image in Markdown ![]() or HTML <img>
    # Match both Markdown and HTML img tags
    # Markdown: ![alt](url)
    md_img_match = re.search(r'!\[.*?\]\((.*?)\)', readme_content)
    if md_img_match:
        img_url = md_img_match.group(1)
        if not img_url.startswith("http"):
            img_url = f"https://raw.githubusercontent.com/{GITHUB_USERNAME}/{repo_name}/{default_branch}/{img_url.lstrip('./')}"
        return img_url
    
    # HTML: <img src="url">
    html_img_match = re.search(r'<img [^>]*src="([^"]+)"', readme_content)
    if html_img_match:
        img_url = html_img_match.group(1)
        if not img_url.startswith("http"):
            img_url = f"https://raw.githubusercontent.com/{GITHUB_USERNAME}/{repo_name}/{default_branch}/{img_url.lstrip('./')}"
        return img_url
    
    return None

def find_image_in_folders(repo_name, default_branch="main"):
    """Look for images in common folders like assets/, img/, etc."""
    folders = ["assets", "img", "images", "screenshots"]
    common_names = ["thumb", "cover", "screenshot", "preview", "logo"]
    extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"]

    for folder in folders:
        url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/contents/{folder}"
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            files = response.json()
            # Sort to prioritize files containing common names
            for name in common_names:
                for file in files:
                    if any(file["name"].lower().startswith(name) and file["name"].lower().endswith(ext) for ext in extensions):
                        return file["download_url"]
            
            # If no common names found, take the first image
            for file in files:
                if any(file["name"].lower().endswith(ext) for ext in extensions):
                    return file["download_url"]
    
    # Also check root for common names
    url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/contents/"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        files = response.json()
        for name in common_names:
            for file in files:
                if any(file["name"].lower().startswith(name) and file["name"].lower().endswith(ext) for ext in extensions):
                    return file["download_url"]
                    
    return None

def main():
    print("Fetching profile...")
    profile = get_profile()
    with open("profile.json", "w") as f:
        json.dump(profile, f, indent=2)
    
    print("Fetching repositories...")
    repos = get_repos()
    enriched_repos = []
    
    for repo in repos:
        if repo["fork"]:
            continue
        
        repo_name = repo["name"]
        default_branch = repo.get("default_branch", "main")
        print(f"  Processing {repo_name}...")
        
        # 1. Try README
        image_url = get_readme_image(repo_name, default_branch)
        
        # 2. Try common folders
        if not image_url:
            image_url = find_image_in_folders(repo_name, default_branch)
            
        repo["image_url"] = image_url
        enriched_repos.append(repo)
        
    with open("repos.json", "w") as f:
        json.dump(enriched_repos, f, indent=2)
    
    print("Successfully updated profile.json and repos.json")

if __name__ == "__main__":
    main()
