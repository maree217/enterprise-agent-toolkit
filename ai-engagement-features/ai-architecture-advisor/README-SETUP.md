# AI Architecture Advisor Setup

## Overview
This is a customized RAG-powered AI advisor that provides expert guidance on AI architecture decisions based on real enterprise implementations worth £18.5M+.

## Features
- **Smart Search**: RAG-powered Q&A using enterprise knowledge base
- **Expert Guidance**: Based on real case studies and implementations
- **Technology Focus**: Multi-agent systems, RAG architectures, Semantic Kernel, Microsoft Copilot
- **Professional UI**: Customized for AI Capability Builder branding

## Quick Demo Setup

### Prerequisites
- Node.js 18+
- OpenAI API key
- Supabase account (optional for full setup)

### Local Development (Demo Mode)
1. **Install Dependencies**
   ```bash
   cd ai-architecture-advisor
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   OPENAI_KEY=your-api-key-here
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Knowledge Base Content
The advisor includes expert knowledge on:
- **Case Studies**: Financial services loan processing, healthcare orchestration
- **Implementation Levels**: 3-tier maturity framework (Quick Wins, Analytics, Transformation)
- **Technology Patterns**: Multi-agent orchestration, RAG architectures, Semantic Kernel patterns
- **Best Practices**: Security, scaling, cost optimization

### Example Questions to Try
- "What is the best architecture for a RAG system?"
- "How do I implement multi-agent systems?"
- "What are the AI maturity levels?"
- "How should I approach Level 2 AI analytics implementation?"
- "What security patterns should I use for enterprise AI?"

### Architecture
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **AI**: OpenAI GPT-4 with RAG (Retrieval Augmented Generation)
- **Database**: Supabase with pgvector for embeddings
- **Deployment**: Vercel-ready with automatic embedding generation

### Customizations Made
1. **Branding**: AI Capability Builder theme and messaging
2. **Knowledge Base**: Enterprise AI implementation expertise
3. **UI/UX**: Architecture-focused examples and prompts
4. **Content**: Real case studies and proven patterns

## Production Deployment
For full production setup with Supabase backend:
1. Set up Supabase project with pgvector extension
2. Configure environment variables
3. Run embedding generation: `npm run embeddings`
4. Deploy to Vercel with automatic Supabase integration

## Next Steps
- Add more case studies and implementation patterns
- Integrate with Microsoft Copilot Studio for enhanced capabilities
- Add user session management and conversation history
- Implement feedback collection and continuous learning