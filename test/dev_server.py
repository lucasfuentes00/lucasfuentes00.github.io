import subprocess
import webbrowser
import sys
import os

def main():
    # Get the project root directory
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)

    print("\n--- 🚀 Step 1: Updating data from GitHub ---")
    try:
        # Run the update script
        subprocess.run([sys.executable, "update_repos.py"], check=True)
        print("✅ profile.json and repos.json updated successfully.")
    except Exception as e:
        print(f"❌ Error updating data: {e}")
        print("💡 Hint: Run 'pip install requests beautifulsoup4' first.")

    print("\n--- 🌐 Step 2: Opening your website in the browser ---")
    webbrowser.open("http://localhost:8000")

    print("\n--- 📌 Step 3: Starting local server on port 8000 ---")
    print("Press Ctrl+C (once or twice) to stop the server.")
    
    try:
        # Run the Python built-in HTTP server
        subprocess.run([sys.executable, "-m", "http.server", "8000"])
    except KeyboardInterrupt:
        print("\n👋 Local server stopped.")

if __name__ == "__main__":
    main()
