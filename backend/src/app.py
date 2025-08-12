from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
from agent.graph import graph
from langchain_core.documents import Document
from pydantic import BaseModel, Field
import os
from tempfile import NamedTemporaryFile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Quiz Generator API",
    description="Generate quizzes from URLs, text, or PDF uploads using LangGraph and LLMs.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    topic: str

class QuizResponse(BaseModel):
    quiz: List[QuizQuestion]
    metadata: Dict

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/generate-quiz", response_model=QuizResponse)
async def generate_quiz(
    content: Optional[List[str]] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
):
    if not content and not files:
        raise HTTPException(status_code=400, detail="You must provide either content (text/URL) or upload PDF files.")

    documents = []

    # Add raw content as Document (ingest node will decide if it's a URL, text, etc.)
    if content:
        for item in content:
            documents.append(Document(page_content=item))

    # Save PDF files temporarily and add their paths as Documents
    temp_paths = []
    if files:
        for file in files:
            if not file.filename.lower().endswith(".pdf"):
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.filename}")
            contents = await file.read()
            with NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(contents)
                temp_paths.append(tmp.name)
                documents.append(Document(page_content=tmp.name))

    if not documents:
        raise HTTPException(status_code=400, detail="No valid documents could be created.")

    try:
        result = graph.invoke({"documents": documents})
    finally:
        for path in temp_paths:
            if os.path.exists(path):
                os.remove(path)

    return QuizResponse(quiz=result["quiz"], metadata=result["metadata"])

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

if __name__ == "__main__":
    import uvicorn

    if not os.environ.get("GOOGLE_API_KEY"):
        logger.error("GOOGLE_API_KEY environment variable not set")
        raise EnvironmentError("GOOGLE_API_KEY environment variable not set")

    uvicorn.run(app, host="0.0.0.0", port=8000)