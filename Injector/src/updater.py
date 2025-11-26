import os
import hashlib
import requests
from pathlib import Path

GITHUB_API_URL = "https://api.github.com/repos/zafazu/My-Discord-Theme/contents/Injector/src"
IGNORED_FILES = {"README.md"}

def get_github_files():
    try:
        response = requests.get(GITHUB_API_URL, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to fetch GitHub files: {e}")
        return {}

    items = response.json()
    
    if not isinstance(items, list):
        print("Unexpected GitHub API response format.")
        return {}

    files = {}
    for item in items:
        name = item.get("name")
        if not name or name in IGNORED_FILES:
            continue
        if item["type"] == "file":
            rel_path = name  
            files[rel_path] = {
                "download_url": item["download_url"],
                "sha": item["sha"]
            }

    return files

def calculate_local_sha(file_path):
    if not Path(file_path).is_file():
        return None
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def download_file(url, path):
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        Path(path).write_bytes(r.content)
        return True
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def main():
    print("Checking for updates from GitHub...")
    remote_files = get_github_files()

    if not remote_files:
        print("No relevant files found on GitHub (empty).")
        return

    updated = False
    for filename, info in remote_files.items():
        local_sha = calculate_local_sha(filename)
        remote_sha = info["sha"]

        if local_sha != remote_sha:
            print(f"Updating: {filename}")
            if download_file(info["download_url"], filename):
                updated = True
            else:
                print(f"Skipped: {filename}")

    if not updated:
        print("✅ All files are up to date")
    else:
        print("✅ Update complete")

if __name__ == "__main__":
    main()




    
