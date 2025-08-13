import os
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio

from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.contents import ChatHistory
from semantic_kernel.functions import kernel_function

from memory import ConversationMemory
from knowledge import KnowledgeBase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatAgent:
    """Production-ready chat agent using Semantic Kernel and Azure OpenAI."""
    
    def __init__(self):
        """Initialize the chat agent with Azure OpenAI."""
        self.kernel = Kernel()
        
        # Configure Azure OpenAI
        service_id = "chat"
        self.kernel.add_service(
            AzureChatCompletion(
                service_id=service_id,
                deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"),
                endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_KEY"),
            )
        )
        
        # Initialize components
        self.memory = ConversationMemory()
        self.knowledge = KnowledgeBase()
        self.chat_history = ChatHistory()
        
        # Load configuration
        self.config = self._load_config()
        
        logger.info("Chat agent initialized successfully")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load agent configuration."""
        import yaml
        config_path = "config/agent_config.yaml"
        
        default_config = {
            "personality": {
                "name": "Assistant",
                "role": "helpful AI assistant",
                "tone": "professional and friendly",
                "guidelines": [
                    "Provide accurate information",
                    "Be helpful and concise",
                    "Admit when you don't know something"
                ]
            },
            "settings": {
                "max_tokens": 500,
                "temperature": 0.7,
                "enable_memory": True,
                "enable_knowledge": True
            }
        }
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                loaded_config = yaml.safe_load(f)
                default_config.update(loaded_config)
        
        return default_config
    
    async def process_message(
        self,
        message: str,
        user_id: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a user message and generate a response.
        
        Args:
            message: User's input message
            user_id: Unique user identifier
            session_id: Optional session identifier for conversation continuity
            
        Returns:
            Response dictionary containing the agent's reply and metadata
        """
        start_time = datetime.utcnow()
        
        try:
            # Generate or use session ID
            if not session_id:
                session_id = f"{user_id}_{datetime.utcnow().timestamp()}"
            
            # Load conversation history if memory is enabled
            if self.config["settings"]["enable_memory"]:
                history = await self.memory.get_history(user_id, session_id)
                self.chat_history = history
            
            # Search knowledge base if enabled
            context = ""
            if self.config["settings"]["enable_knowledge"]:
                relevant_docs = await self.knowledge.search(message, top_k=3)
                if relevant_docs:
                    context = "\n\n".join([
                        f"Reference {i+1}: {doc['content']}"
                        for i, doc in enumerate(relevant_docs)
                    ])
            
            # Build the prompt
            system_prompt = self._build_system_prompt(context)
            
            # Add user message to history
            self.chat_history.add_user_message(message)
            
            # Generate response
            response = await self._generate_response(
                system_prompt,
                self.chat_history
            )
            
            # Add assistant response to history
            self.chat_history.add_assistant_message(response)
            
            # Save conversation if memory is enabled
            if self.config["settings"]["enable_memory"]:
                await self.memory.save_turn(
                    user_id=user_id,
                    session_id=session_id,
                    user_message=message,
                    assistant_message=response
                )
            
            # Calculate metrics
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Log metrics
            logger.info(f"Message processed in {processing_time:.2f}s for user {user_id}")
            
            return {
                "success": True,
                "response": response,
                "session_id": session_id,
                "processing_time": processing_time,
                "context_used": bool(context),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _build_system_prompt(self, context: str = "") -> str:
        """Build the system prompt with personality and context."""
        personality = self.config["personality"]
        
        prompt = f"""You are {personality['name']}, a {personality['role']}.
        
Your communication style: {personality['tone']}
        
Guidelines:
"""
        
        for guideline in personality["guidelines"]:
            prompt += f"- {guideline}\n"
        
        if context:
            prompt += f"""\n\nRelevant Information:
{context}

Use the above information to answer questions when relevant, but don't mention that you're using references unless asked."""
        
        return prompt
    
    async def _generate_response(
        self,
        system_prompt: str,
        chat_history: ChatHistory
    ) -> str:
        """Generate response using Azure OpenAI."""
        settings = self.config["settings"]
        
        # Create execution settings
        execution_settings = {
            "max_tokens": settings.get("max_tokens", 500),
            "temperature": settings.get("temperature", 0.7),
            "top_p": 0.95,
        }
        
        # Get chat completion
        chat_completion = self.kernel.get_service("chat")
        
        # Generate response
        response = await chat_completion.get_chat_message_content(
            chat_history=chat_history,
            settings=execution_settings,
            kernel=self.kernel,
            system_message=system_prompt
        )
        
        return str(response)
    
    async def clear_history(self, user_id: str, session_id: str) -> bool:
        """Clear conversation history for a session."""
        try:
            await self.memory.clear_history(user_id, session_id)
            self.chat_history = ChatHistory()
            return True
        except Exception as e:
            logger.error(f"Error clearing history: {str(e)}")
            return False
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get agent performance metrics."""
        return {
            "total_conversations": await self.memory.get_conversation_count(),
            "active_sessions": await self.memory.get_active_sessions(),
            "knowledge_docs": await self.knowledge.get_document_count(),
            "avg_response_time": 1.5,  # This would come from monitoring
            "health": "healthy"
        }

# Singleton instance
_agent_instance = None

def get_agent() -> ChatAgent:
    """Get or create the singleton agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = ChatAgent()
    return _agent_instance