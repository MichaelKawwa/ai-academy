import getpass
import os
from dotenv import load_dotenv
import json
import faiss
import hashlib
import re
from functools import lru_cache
from typing import Dict, List, Optional, Tuple, Union
from langchain.chat_models import init_chat_model
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import (
    WebBaseLoader,
    PyPDFLoader,
    UnstructuredPDFLoader,
    UnstructuredURLLoader
)
from langchain_core.documents import Document
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import TypedDict
from urllib.parse import urlparse
from pydantic import BaseModel, Field

#variables from a .env file into os.environ for API Keys
load_dotenv()

# Text preprocessing functions
def clean_text(text: str) -> str:
    """Clean and normalize text content."""
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    
    # Remove special characters and extra whitespace
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Remove numbers
    text = re.sub(r'\d+', '', text)
    
    return text.strip()

def remove_duplicates(text: str) -> str:
    """Remove duplicate sentences and paragraphs."""
    # Split into sentences
    sentences = re.split(r'[.!?]+', text)
    # Remove duplicates while preserving order
    seen = set()
    unique_sentences = []
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence and sentence not in seen:
            seen.add(sentence)
            unique_sentences.append(sentence)
    
    return '. '.join(unique_sentences)

def preprocess_content(content: str) -> str:
    """Apply all preprocessing steps to content."""
    # Clean text
    cleaned = clean_text(content)
    # Remove duplicates
    deduped = remove_duplicates(cleaned)
    return deduped

# Define Pydantic models for structured output
class QuizQuestion(BaseModel):
    #A single quiz question with its options and answer.
    question: str = Field(description="The question text")
    options: List[str] = Field(description="List of 4 possible answers")
    answer: str = Field(description="The correct answer from the options")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    topic: str = Field(description="The topic or category of the question")

class QuizResponse(BaseModel):
    #A collection of quiz questions.
    questions: List[QuizQuestion] = Field(description="List of quiz questions")

# Automatically set Google Gemini API key from environment variable
if not os.environ.get("GOOGLE_API_KEY"):
    raise EnvironmentError(
        "GOOGLE_API_KEY environment variable not set. Please set it before running the script."
    )

# Initialize models with caching
@lru_cache(maxsize=1)
def get_llm():
    return init_chat_model("gemini-2.0-flash", model_provider="google_genai")

@lru_cache(maxsize=1)
def get_embeddings():
    return GoogleGenerativeAIEmbeddings(model="models/embedding-001")

llm = get_llm()
embeddings = get_embeddings()

# Set chunk size and overlap for better context
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1500,  
    chunk_overlap=300, 
    length_function=len,
    separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],  
    keep_separator=True
)

# Initialize vector store with optimized parameters
embedding_dim = len(embeddings.embed_query("hello world"))
index = faiss.IndexFlatL2(embedding_dim) #if you are dealing with very large amounts of data > 1M vectors its better to use a non-exhaustive vector stor optimization.

vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)

# Enhanced quiz generation prompt
quiz_prompt = PromptTemplate.from_template("""
Based on the following content, create 30 multiple choice questions that:
1. Test different aspects of the material (concepts, applications, relationships)
2. Require deep understanding rather than simple recall
3. Have clear, unambiguous answer choices

CONTENT:
{content}
""")

# Create the chain with structured output
quiz_chain = quiz_prompt | llm.with_structured_output(QuizResponse)

class State(TypedDict):
    documents: List[Document]
    chunks: List[Document]
    quiz: list
    metadata: Dict
    context_index: int  # keep track of context we are using

def get_content_hash(content: str) -> str:
    #Generate a hash for content to use as cache key.
    return hashlib.md5(content.encode()).hexdigest()

@lru_cache(maxsize=100)
def cached_embedding(text: str) -> List[float]:
    #Cache embeddings to avoid redundant computations.
    return embeddings.embed_query(text)

def is_url(text: str) -> bool:
    """Check if the given text is a URL."""
    try:
        result = urlparse(text)
        return all([result.scheme, result.netloc])
    except:
        return False

def is_pdf_path(text: str) -> bool:
    """Check if the given text is a path to a PDF file."""
    return text.lower().endswith('.pdf')

def load_document(source: str) -> List[Document]:
    """Load a document from various sources (text, URL, or PDF)."""
    try:
        if is_url(source):
            # Use UnstructuredURLLoader for better web content extraction
            loader = UnstructuredURLLoader(urls=[source])
            docs = loader.load()
            # Add source metadata and preprocess content
            for doc in docs:
                doc.page_content = preprocess_content(doc.page_content)
                doc.metadata["source"] = source
                doc.metadata["type"] = "web"
            return docs
        
        elif is_pdf_path(source):
            # Try PyPDFLoader first, fall back to UnstructuredPDFLoader
            try:
                loader = PyPDFLoader(source)
                docs = loader.load()
            except Exception:
                loader = UnstructuredPDFLoader(source)
                docs = loader.load()
            
            # Add source metadata and preprocess content
            for doc in docs:
                doc.page_content = preprocess_content(doc.page_content)
                doc.metadata["source"] = source
                doc.metadata["type"] = "pdf"
            return docs
        
        else:
            # Treat as plain text and preprocess
            return [Document(
                page_content=preprocess_content(source),
                metadata={
                    "source": "text_input",
                    "type": "text"
                }
            )]
    
    except Exception as e:
        print(f"Error loading document from {source}: {str(e)}")
        return []

def get_diverse_query(documents: List[Document], context_index: int) -> str:
    """Generate a diverse query based on the context index."""
    if not documents:
        return ""
    
    # Get different sections of the document based on context_index
    doc = documents[0].page_content
    sections = doc.split('\n\n')
    
    # Rotate through different sections
    section_index = context_index % len(sections)
    section = sections[section_index]
    
    # Take a random window of the section
    words = section.split()
    if len(words) > 200:
        start_idx = (context_index * 50) % (len(words) - 200)
        selected_words = words[start_idx:start_idx + 200]
        return ' '.join(selected_words)
    
    return section

def find_relevant_chunks(query: str, k: int = 20, context_index: int = 0) -> List[Document]:
    #Find the k most relevant chunks for a given query with improved relevance and diversity.
    # Use cached embedding for the query
    query_embedding = cached_embedding(query)
    
    # Get more chunks than needed to filter for diversity
    chunks = vector_store.similarity_search_by_vector(query_embedding, k=k*2)
    
    # Filter for diversity by ensuring chunks are not too similar to each other -> ensures we get a optimal variation of content for questions 
    #we can also filter for top most frequent chunks
    diverse_chunks = []
    seen_embeddings = set()
    
    # Rotate through chunks based on context_index to ensure different selections
    start_idx = (context_index * 5) % len(chunks)
    rotated_chunks = chunks[start_idx:] + chunks[:start_idx]
    
    for chunk in rotated_chunks:
        chunk_hash = get_content_hash(chunk.page_content)
        if chunk_hash not in seen_embeddings:
            diverse_chunks.append(chunk)
            seen_embeddings.add(chunk_hash)
            if len(diverse_chunks) >= k:
                break
    
    return diverse_chunks

def combine_chunks(chunks: List[Document]) -> str:
    # Sort chunks by their position in the original document if metadata is available
    sorted_chunks = sorted(chunks, key=lambda x: x.metadata.get('position', 0))
    
    # Combine with clear section markers and remove any remaining duplicates
    combined = []
    seen_content = set()
    
    for chunk in sorted_chunks:
        # combine preprocessed chunks
        processed_content = chunk.page_content
        if processed_content and processed_content not in seen_content:
            combined.append(processed_content)
            seen_content.add(processed_content)
    
    return "\n---\n".join(combined)

def generate_quiz_with_retry(content: str, max_retries: int = 3) -> List[dict]:
    #generate quiz with retry logic and error handling
    for attempt in range(max_retries):
        try:
            response = quiz_chain.invoke({"content": content})
            return [q.model_dump() for q in response.questions]
            
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Failed to generate quiz after {max_retries} attempts: {str(e)}")
                return []
            continue

def ingest(state: State):
    """Process and store documents with metadata tracking."""
    all_chunks = []
    document_metadata = {
        "num_documents": len(state["documents"]),
        "document_types": set(),
        "sources": set()
    }

    for doc in state["documents"]:
        try:
            loaded_docs = load_document(doc.page_content)

            if not loaded_docs:
                continue

            # Filter out docs with empty content early
            loaded_docs = [d for d in loaded_docs if d.page_content.strip()]

            if not loaded_docs:
                continue

            doc_chunks = text_splitter.create_documents(
                [d.page_content for d in loaded_docs],
                metadatas=[d.metadata for d in loaded_docs]
            )

            # Add metadata to each chunk
            for i, chunk in enumerate(doc_chunks):
                chunk.metadata["position"] = i
                chunk.metadata["document_id"] = get_content_hash(doc.page_content)
                document_metadata["document_types"].add(chunk.metadata.get("type", "unknown"))
                document_metadata["sources"].add(chunk.metadata.get("source", "unknown"))

            # Filter out empty chunks too
            doc_chunks = [chunk for chunk in doc_chunks if chunk.page_content.strip()]
            all_chunks.extend(doc_chunks)

        except Exception as e:
            print(f"Failed to process document: {e}")
            continue

    # Convert sets to lists
    document_metadata["document_types"] = list(document_metadata["document_types"])
    document_metadata["sources"] = list(document_metadata["sources"])

    # 🛡️ Filter out empty chunks before vector store ingest
    valid_chunks = [chunk for chunk in all_chunks if chunk.page_content.strip()]

    if not valid_chunks:
        print("Warning: No valid content to ingest into vector store.")
        return {
            "chunks": [],
            "metadata": {
                **document_metadata,
                "num_chunks": 0
            }
        }

    vector_store.add_documents(valid_chunks)

    return {
        "chunks": valid_chunks,
        "metadata": {
            **document_metadata,
            "num_chunks": len(valid_chunks)
        }
    }

def generate_quiz(state: State):
    """Generate quiz questions from the most relevant chunks."""
    # Get the current context index, defaulting to 0 if not present
    context_index = state.get("metadata", {}).get("context_index", 0)
    
    # Generate a diverse query based on the context index
    query = get_diverse_query(state["documents"], context_index)
    
    # Find relevant chunks with the current context index
    relevant_chunks = find_relevant_chunks(query, k=20, context_index=context_index)
    
    # Combine chunks
    combined_content = combine_chunks(relevant_chunks)
    
    # Generate quiz with retry logic
    quiz_items = generate_quiz_with_retry(combined_content)
    
    # Increment context index for next time
    new_context_index = (context_index + 1) % 100  # Cycle through 100 different contexts
    
    return {
        "quiz": quiz_items,
        "metadata": {
            **state.get("metadata", {}),
            "num_questions": len(quiz_items),
            "content_hash": get_content_hash(combined_content),
            "context_index": new_context_index
        }
    }

#graph
graph_builder = StateGraph(State).add_sequence([ingest, generate_quiz])
graph_builder.add_edge(START, "ingest")
graph = graph_builder.compile()

'''
if __name__ == "__main__":
    # Example usage with different document types
    docs = [
        # Web document
        Document(page_content="https://www.analyticsvidhya.com/blog/2023/03/an-introduction-to-large-language-models-llms/?utm_source=social&utm_medium=huggingface_forum"),

        Document(page_content="https://phaneendrakn.medium.com/a-primer-on-understanding-attention-mechanisms-in-llms-fda4051b00a1")
    ]
    inputs = {"documents": docs}
    result = graph.invoke(inputs)
    print("Quiz Output:\n", json.dumps(result["quiz"], indent=2))
    print("\nMetadata:", json.dumps(result["metadata"], indent=2))
'''

