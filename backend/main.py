from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from lib.github import get_pr_details
from lib.llm import analyze_pr
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    pr_url: str

@app.post("/analyze")
async def analyze_pull_request(request: AnalyzeRequest):
    logger.info(f"Analyzing PR: {request.pr_url}")
    try:
        # 1. Fetch PR Data
        logger.info("Fetching PR details from GitHub...")
        pr_data = get_pr_details(request.pr_url)
        
        # 2. Construct Context for LLM
        context = {
            "pr": {
                "title": pr_data.title,
                "body": pr_data.body,
                "author": pr_data.author
            },
            "files": [
                {
                    "filename": f.filename,
                    "status": f.status,
                    "additions": f.additions,
                    "deletions": f.deletions,
                    "patch": f.patch
                } for f in pr_data.files
            ]
        }

        # 3. Analyze with LLM
        logger.info("Sending to LLM for analysis...")
        review = analyze_pr(context)
        
        logger.info("Analysis complete.")
        return {
            "review": review,
            "pr": pr_data,
            "files": pr_data.files
        }

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
