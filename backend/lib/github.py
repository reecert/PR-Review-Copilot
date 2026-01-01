import os
from github import Github
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("GITHUB_TOKEN")

class FileDiff(BaseModel):
    filename: string
    status: string
    additions: int
    deletions: int
    patch: Optional[str] = None

class PRMetadata(BaseModel):
    title: string
    body: string
    author: string
    files: List[FileDiff]

def get_pr_details(pr_url: str) -> PRMetadata:
    if not TOKEN:
        raise ValueError("GITHUB_TOKEN is missing")
    g = Github(TOKEN)
    
    # Parse URL: github.com/owner/repo/pull/123
    parts = pr_url.replace("https://", "").replace("http://", "").split("/")
    if "github.com" in parts[0]:
        owner = parts[1]
        repo_name = parts[2]
        pr_number = int(parts[4])
    else:
        raise ValueError("Invalid GitHub URL")

    repo = g.get_repo(f"{owner}/{repo_name}")
    pr = repo.get_pull(pr_number)

    files = []
    for f in pr.get_files():
        files.append(FileDiff(
            filename=f.filename,
            status=f.status,
            additions=f.additions,
            deletions=f.deletions,
            patch=f.patch
        ))

    return PRMetadata(
        title=pr.title,
        body=pr.body or "",
        author=pr.user.login,
        files=files
    )
