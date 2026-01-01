import os
from github import Github
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("GITHUB_TOKEN")

class FileDiff(BaseModel):
    filename: str
    status: str
    additions: int
    deletions: int
    patch: Optional[str] = None

class PRMetadata(BaseModel):
    title: str
    body: str
    author: str
    files: List[FileDiff]


def parse_github_url(url: str):
    parts = url.replace("https://", "").replace("http://", "").split("/")
    if "github.com" not in parts[0] or len(parts) < 3:
        raise ValueError("Invalid GitHub URL")
    
    owner = parts[1]
    repo_name = parts[2]
    pr_number = None

    if len(parts) >= 5 and parts[3] == "pull":
        try:
            pr_number = int(parts[4])
        except ValueError:
            pass
            
    return owner, repo_name, pr_number

def get_repo_prs(repo_url: str):
    if not TOKEN:
        raise ValueError("GITHUB_TOKEN is missing")
    g = Github(TOKEN)
    
    owner, repo_name, _ = parse_github_url(repo_url)
    repo = g.get_repo(f"{owner}/{repo_name}")
    
    prs = repo.get_pulls(state='open', sort='updated', direction='desc')
    return [
        {
            "number": pr.number,
            "title": pr.title,
            "user": pr.user.login,
            "updated_at": pr.updated_at.isoformat(),
            "url": pr.html_url
        }
        for pr in prs[:20] # Limit to 20 recent PRs
    ]

def get_pr_details(pr_url: str) -> PRMetadata:
    if not TOKEN:
        raise ValueError("GITHUB_TOKEN is missing")
    g = Github(TOKEN)
    
    owner, repo_name, pr_number = parse_github_url(pr_url)
    
    if not pr_number:
         raise ValueError("URL must point to a specific Pull Request")

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
