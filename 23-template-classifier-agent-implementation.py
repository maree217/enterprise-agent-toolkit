import os
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import json
import mimetypes
from pathlib import Path

from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.contents import ChatHistory
from semantic_kernel.functions import kernel_function

import PyPDF2
from docx import Document
import pytesseract
from PIL import Image
import yaml

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentClassifier:
    """Production-ready document classifier using Azure OpenAI."""
    
    def __init__(self):
        """Initialize the document classifier."""
        self.kernel = Kernel()
        
        # Configure Azure OpenAI
        service_id = "classifier"
        self.kernel.add_service(
            AzureChatCompletion(
                service_id=service_id,
                deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"),
                endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_KEY"),
            )
        )
        
        # Load configuration
        self.categories = self._load_categories()
        self.extraction_rules = self._load_extraction_rules()
        
        logger.info("Document classifier initialized successfully")
    
    def _load_categories(self) -> Dict[str, Any]:
        """Load document categories configuration."""
        config_path = "config/categories.yaml"
        
        default_categories = {
            "invoice": {
                "description": "Vendor invoices and bills",
                "confidence_threshold": 0.8,
                "routing": "finance_team",
                "required_fields": ["amount", "vendor", "date"],
                "keywords": ["invoice", "bill", "payment", "amount due", "vendor"]
            },
            "contract": {
                "description": "Legal contracts and agreements",
                "confidence_threshold": 0.9,
                "routing": "legal_team",
                "required_fields": ["parties", "terms", "duration"],
                "keywords": ["agreement", "contract", "terms", "party", "whereas"]
            },
            "email": {
                "description": "Email communications",
                "confidence_threshold": 0.7,
                "routing": "communication_team",
                "required_fields": ["subject", "sender", "recipient"],
                "keywords": ["from:", "to:", "subject:", "dear", "sincerely"]
            },
            "resume": {
                "description": "Job applications and resumes",
                "confidence_threshold": 0.8,
                "routing": "hr_team",
                "required_fields": ["name", "experience", "education"],
                "keywords": ["resume", "cv", "experience", "education", "skills"]
            },
            "report": {
                "description": "Business reports and analytics",
                "confidence_threshold": 0.8,
                "routing": "analytics_team",
                "required_fields": ["title", "date", "summary"],
                "keywords": ["report", "analysis", "summary", "findings", "conclusion"]
            }
        }
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                loaded_categories = yaml.safe_load(f)
                default_categories.update(loaded_categories)
        
        return default_categories
    
    def _load_extraction_rules(self) -> Dict[str, Any]:
        """Load data extraction rules."""
        config_path = "config/extraction.yaml"
        
        default_rules = {
            "invoice": {
                "amount": {
                    "patterns": [r"\$?(\d+[,.]?\d*)", r"total[:\s]+\$?(\d+[,.]?\d*)"],
                    "required": True
                },
                "vendor": {
                    "patterns": [r"from[:\s]+([^\n]+)", r"vendor[:\s]+([^\n]+)"],
                    "required": True
                },
                "date": {
                    "patterns": [r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", r"date[:\s]+([^\n]+)"],
                    "required": True
                }
            },
            "contract": {
                "parties": {
                    "patterns": [r"between[:\s]+([^\n]+)", r"party[:\s]+([^\n]+)"],
                    "required": True
                },
                "terms": {
                    "patterns": [r"term[:\s]+([^\n]+)", r"duration[:\s]+([^\n]+)"],
                    "required": False
                }
            }
        }
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                loaded_rules = yaml.safe_load(f)
                default_rules.update(loaded_rules)
        
        return default_rules
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from various document formats."""
        file_extension = Path(file_path).suffix.lower()
        
        try:
            if file_extension == '.pdf':
                return self._extract_pdf_text(file_path)
            elif file_extension in ['.doc', '.docx']:
                return self._extract_word_text(file_path)
            elif file_extension in ['.txt', '.md']:
                return self._extract_text_file(file_path)
            elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                return self._extract_image_text(file_path)
            else:
                logger.warning(f"Unsupported file format: {file_extension}")
                return ""
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return ""
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF files."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
        return text
    
    def _extract_word_text(self, file_path: str) -> str:
        """Extract text from Word documents."""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting Word text: {str(e)}")
            return ""
    
    def _extract_text_file(self, file_path: str) -> str:
        """Extract text from plain text files."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error reading text file: {str(e)}")
            return ""
    
    def _extract_image_text(self, file_path: str) -> str:
        """Extract text from images using OCR."""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""
    
    async def classify_document(
        self,
        file_path: str,
        document_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Classify a document and extract relevant data.
        
        Args:
            file_path: Path to the document file
            document_id: Optional unique identifier for the document
            
        Returns:
            Classification result with category, confidence, and extracted data
        """
        start_time = datetime.utcnow()
        
        try:
            # Generate document ID if not provided
            if not document_id:
                document_id = f"doc_{datetime.utcnow().timestamp()}"
            
            # Extract text from document
            document_text = self.extract_text(file_path)
            if not document_text.strip():
                return {
                    "success": False,
                    "error": "Could not extract text from document",
                    "document_id": document_id
                }
            
            # Classify document
            classification_result = await self._classify_text(document_text)
            
            # Extract structured data if classification is confident
            extracted_data = {}
            if classification_result["confidence"] >= self.categories[classification_result["category"]]["confidence_threshold"]:
                extracted_data = self._extract_structured_data(
                    document_text,
                    classification_result["category"]
                )
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Log classification
            logger.info(
                f"Document {document_id} classified as {classification_result['category']} "
                f"with {classification_result['confidence']*100:.1f}% confidence in {processing_time:.2f}s"
            )
            
            return {
                "success": True,
                "document_id": document_id,
                "category": classification_result["category"],
                "confidence": classification_result["confidence"],
                "extracted_data": extracted_data,
                "routing": self.categories[classification_result["category"]]["routing"],
                "processing_time": processing_time,
                "timestamp": datetime.utcnow().isoformat(),
                "file_path": file_path,
                "text_length": len(document_text)
            }
            
        except Exception as e:
            logger.error(f"Error classifying document {document_id}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "document_id": document_id,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _classify_text(self, text: str) -> Dict[str, Any]:
        """Classify document text using Azure OpenAI."""
        
        # Build category descriptions
        category_descriptions = []
        for category, config in self.categories.items():
            category_descriptions.append(
                f"- {category}: {config['description']} (keywords: {', '.join(config['keywords'])})"
            )
        
        system_prompt = f"""You are a document classification expert. Analyze the following document and classify it into one of these categories:

{chr(10).join(category_descriptions)}

For each document, consider:
1. Content structure and format
2. Keywords and terminology
3. Document purpose and context
4. Language patterns

Respond with JSON in this exact format:
{{
    "category": "category_name",
    "confidence": 0.95,
    "reasoning": "Brief explanation of classification decision"
}}

The confidence should be a number between 0 and 1 representing how certain you are about the classification."""

        user_prompt = f"Please classify this document:\n\n{text[:4000]}..."  # Limit text length
        
        try:
            # Create chat history
            chat_history = ChatHistory()
            chat_history.add_user_message(user_prompt)
            
            # Get classification
            chat_completion = self.kernel.get_service("classifier")
            response = await chat_completion.get_chat_message_content(
                chat_history=chat_history,
                settings={
                    "max_tokens": 200,
                    "temperature": 0.1,
                    "top_p": 0.95,
                },
                kernel=self.kernel,
                system_message=system_prompt
            )
            
            # Parse JSON response
            try:
                result = json.loads(str(response))
                
                # Validate category exists
                if result["category"] not in self.categories:
                    result["category"] = "unknown"
                    result["confidence"] = 0.1
                
                return result
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse classification response: {response}")
                return {
                    "category": "unknown",
                    "confidence": 0.1,
                    "reasoning": "Failed to parse classification response"
                }
                
        except Exception as e:
            logger.error(f"Error in text classification: {str(e)}")
            return {
                "category": "unknown",
                "confidence": 0.1,
                "reasoning": f"Classification error: {str(e)}"
            }
    
    def _extract_structured_data(self, text: str, category: str) -> Dict[str, Any]:
        """Extract structured data based on category."""
        import re
        
        extracted = {}
        
        if category not in self.extraction_rules:
            return extracted
        
        rules = self.extraction_rules[category]
        
        for field_name, field_config in rules.items():
            patterns = field_config.get("patterns", [])
            
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    # Take the first match
                    extracted[field_name] = matches[0].strip()
                    break
            
            # If required field not found, mark as missing
            if field_config.get("required", False) and field_name not in extracted:
                extracted[f"{field_name}_missing"] = True
        
        return extracted
    
    async def classify_batch(
        self,
        file_paths: List[str],
        batch_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Classify multiple documents in batch.
        
        Args:
            file_paths: List of file paths to classify
            batch_id: Optional batch identifier
            
        Returns:
            Batch processing results
        """
        start_time = datetime.utcnow()
        
        if not batch_id:
            batch_id = f"batch_{datetime.utcnow().timestamp()}"
        
        results = []
        errors = []
        
        for i, file_path in enumerate(file_paths):
            try:
                document_id = f"{batch_id}_doc_{i+1}"
                result = await self.classify_document(file_path, document_id)
                results.append(result)
                
                if not result["success"]:
                    errors.append({
                        "file_path": file_path,
                        "error": result.get("error", "Unknown error")
                    })
                    
            except Exception as e:
                error_msg = f"Error processing {file_path}: {str(e)}"
                logger.error(error_msg)
                errors.append({
                    "file_path": file_path,
                    "error": error_msg
                })
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        return {
            "batch_id": batch_id,
            "total_documents": len(file_paths),
            "successful": len([r for r in results if r.get("success", False)]),
            "failed": len(errors),
            "results": results,
            "errors": errors,
            "processing_time": processing_time,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get classifier performance metrics."""
        # In production, these would come from a database/monitoring system
        return {
            "categories": list(self.categories.keys()),
            "total_processed": 0,  # Would be tracked in database
            "accuracy_rate": 0.95,  # Would be calculated from validation data
            "avg_processing_time": 2.3,  # Would be tracked
            "health": "healthy"
        }

# Singleton instance
_classifier_instance = None

def get_classifier() -> DocumentClassifier:
    """Get or create the singleton classifier instance."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = DocumentClassifier()
    return _classifier_instance