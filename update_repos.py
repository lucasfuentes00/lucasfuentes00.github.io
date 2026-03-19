import os
import requests
import json
import base64
import re
from bs4 import BeautifulSoup

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

def get_readme_image(repo_name):
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
    
    # Try to find first image in Markdown ![]()
    # Match both Markdown and HTML img tags
    md_img_match = re.search(r'!\[.*?\]\((.*?)\)', readme_content)
    if md_img_match:
        img_url = md_img_match.group(1)
        if not img_url.startswith("http"):
            img_url = f"https://raw.githubusercontent.com/{GITHUB_USERNAME}/{repo_name}/main/{img_url.lstrip('./')}"
        return img_url
    
    # Try to find first <img> tag
    html_img_match = re.search(r'<img [^>]*src="([^"]+)"', readme_content)
    if html_img_match:
        img_url = html_img_match.group(1)
        if not img_url.startswith("http"):
            img_url = f"https://raw.githubusercontent.com/{GITHUB_USERNAME}/{repo_name}/main/{img_url.lstrip('./')}"
        return img_url
    
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
        
        print(f"  Processing {repo['name']}...")
        image_url = get_readme_image(repo["name"])
        repo["image_url"] = image_url
        enriched_repos.append(repo)
        
    with open("repos.json", "w") as f:
        json.dump(enriched_repos, f, indent=2)
    
    print("Successfully updated profile.json and repos.json")

if __name__ == "__main__":
    main()
