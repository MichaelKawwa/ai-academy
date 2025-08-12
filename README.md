# AI Academy – LLM Quiz Generator

AI Academy is a full-stack web application that allows users to upload study materials (PDF, DOCX, PPTX, images, or plain text) and automatically generates interactive multiple-choice quizzes using a Large Language Model (LLM) pipeline.

## 🚀 Features

- **Multi-format ingestion**: Drag-and-drop support for PDFs, DOCX, PPTX, images, and text input.
- **Interactive quizzes**: Multiple-choice interface with progress tracking, scoring, and review.
- **Custom theming**: Chakra UI with a branded color palette and responsive design.
- **Keyboard shortcuts**: Quick actions like ⌘+Enter to generate quizzes.
- **LangGraph-powered backend**: Orchestrates document parsing, vector embeddings, retrieval, and LLM prompt generation.
- **Optimized retrieval**: Uses cosine similarity, chunk size tuning, and top-k reranking to maximize quiz relevance.
- **Cost & latency optimization**: Prompt compression and context-window optimization reduce token usage without losing accuracy.

---

## 🛠 Tech Stack

**Frontend**
- [React.js](https://react.dev/) – Component-based UI
- [Chakra UI](https://chakra-ui.com/) – Accessible, responsive design system
- [Vite](https://vitejs.dev/) – Fast frontend build tool
- [TypeScript](https://www.typescriptlang.org/) – Static typing for maintainability

**Backend**
- [LangGraph](https://www.langchain.com/langgraph) – LLM orchestration
- [LangChain](https://www.langchain.com/) – Prompt management, chaining, and retrieval
- [Node.js](https://nodejs.org/) / [Python](https://www.python.org/) – Service logic and API endpoints
- [FAISS](https://faiss.ai/) – Vector database for similarity search
- [OpenAI API](https://platform.openai.com/) or other LLMs – Quiz generation

---


## ⚙️ How It Works

1. **Upload & Ingest**
   - User uploads files or pastes text.
   - Backend extracts and preprocesses text (document parsers, OCR if needed).

2. **Vectorization**
   - Text is split into chunks.
   - Chunks are embedded into vectors using an embedding model.

3. **Retrieval**
   - Relevant chunks are fetched using FAISS and cosine similarity search.
   - Top-k reranking ensures only the most relevant context is used.

4. **Quiz Generation**
   - LangGraph orchestrates LLM calls to produce multiple-choice questions.
   - Prompt compression ensures optimal use of the context window.

5. **Interactive Quiz UI**
   - Frontend displays the quiz, tracks progress, and calculates scores.

---

## 🖥 Running Locally

### 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-academy.git
cd ai-academy

### FrontEnd
cd frontend

npm install

npm run dev

### Backend
cd ../backend

npm install  # or pip install -r requirements.txt

npm run dev  
