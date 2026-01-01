import os
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("LLM_API_KEY"),
    base_url=os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
)
MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo")

# Schema Definitions (Pydantic)
class CitationSchema(BaseModel):
    citation: str = Field(description="Citation in [path/to/file:Lstart-Lend] format")

class SummarySchema(BaseModel):
    overview: str = Field(description="High-level summary of the PR changes")
    key_changes: List[dict] = Field(description="List of key point objects with point and citations") 
    # Flattening for simplicity or we can define a nested class

class KeyChange(BaseModel):
    point: str
    citations: List[str] = Field(description="Evidence for this change")

class RiskRankedFile(BaseModel):
    file: str
    risk: Literal["high", "med", "low"]
    why: str
    citations: List[str]

class TestSuggestion(BaseModel):
    type: Literal["unit", "integration", "e2e"]
    suggestion: str
    citations: List[str]

class CodeSmell(BaseModel):
    issue: str
    impact: str
    citations: List[str]

class SecurityNote(BaseModel):
    issue: str
    severity: Literal["high", "med", "low"]
    recommendation: str
    citations: List[str]

class Review(BaseModel):
    summary: dict # simplified
    risk_ranked_files: List[RiskRankedFile]
    tests: List[TestSuggestion]
    code_smells: List[CodeSmell]
    security_notes: List[SecurityNote]

SYSTEM_PROMPT = """You are a strict code review assistant.
You will analyze a GitHub Pull Request and return a JSON review.
You MUST adhere to the following rules:
1. Every claim key point, risk, test suggestion, smell, or security note MUST have at least one valid citation if evidence exists.
2. CITATION FORMAT: [path/to/file:Lstart-Lend]
   - "path/to/file" is the filename.
   - "Lstart" is the line number in the NEW file (post-change).
   - "Lend" is the end line number.
   - Example: [src/utils.ts:L12-L15] or [src/api.ts:L100-L100]
3. Do not cite deleted lines (Use the surrounding context if needed, or omit citation).
4. If a file is too large or binary and patch is missing, do not hallucinate citations.
5. Focus on substantive issues, not just nitpicks.
6. Return ONLY valid JSON matching the schema.
"""

def analyze_pr(context: dict) -> Review:
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": str(context)},
        ],
        response_format={"type": "json_object"},
    )
    
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("No content returned from LLM")

    # In Python with Pydantic, we usually rely on `client.beta.chat.completions.parse` 
    # for structured output if using new SDKs, but here we can just validate the JSON.
    # For simplicity in this port, we'll try to parse it directly.
    # However, strict structured outputs (parse) is better.
    
    return Review.model_validate_json(content)
