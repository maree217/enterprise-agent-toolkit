import { 
    Building20Regular,
    Person20Regular, 
    Search20Regular,
    Money20Regular,
    VehicleBus20Regular,
    Headset20Regular,
    Doctor20Regular,
    Scales20Regular,
    Megaphone20Regular,
    Server20Regular
} from "@fluentui/react-icons";

export interface EnterpriseAgent {
    name: string;
    role: string;
    icon: string;
    capabilities: string;
}

export interface WorkflowStep {
    step: number;
    agent: string;
    action: string;
}

export interface EnterpriseMetrics {
    timeReduction: string;
    errorReduction: string;
    costSavings: string;
    satisfaction: string;
}

export interface EnterpriseTemplate {
    id: string;
    title: string;
    icon: React.ReactNode;
    industry: string;
    description: string;
    agents: EnterpriseAgent[];
    useCases: string[];
    metrics: EnterpriseMetrics;
    workflow: WorkflowStep[];
}

export const enterpriseTemplates: EnterpriseTemplate[] = [
    {
        id: "cross-department-orchestrator",
        title: "Cross-Department Task Orchestrator",
        icon: <Building20Regular />,
        industry: "Enterprise Operations",
        description: "Automates complex workflows across HR, IT, Finance, and Operations departments with intelligent task routing and coordination.",
        agents: [
            { name: "Workflow Planner", role: "orchestrator", icon: "🧠", capabilities: "Master coordinator that breaks down complex user requests into executable plans and coordinates agent collaboration." },
            { name: "HR Coordinator", role: "specialist", icon: "👥", capabilities: "Automates human resources processes including employee onboarding, benefits management, and payroll coordination." },
            { name: "IT Systems Manager", role: "specialist", icon: "💻", capabilities: "Handles technical provisioning, system access, security configurations, and infrastructure needs." },
            { name: "Finance Processor", role: "specialist", icon: "💰", capabilities: "Manages budget approvals, purchase orders, expense processing, and financial compliance." },
            { name: "Operations Tracker", role: "monitor", icon: "📊", capabilities: "Monitors workflow progress, ensures SLA compliance, tracks performance metrics." }
        ],
        useCases: [
            "Employee lifecycle management",
            "Budget approval workflows", 
            "System access provisioning",
            "Compliance reporting coordination"
        ],
        metrics: {
            timeReduction: "75%",
            errorReduction: "90%",
            costSavings: "£250K annually",
            satisfaction: "4.8/5"
        },
        workflow: [
            { step: 1, agent: "🧠 Workflow Planner", action: "Analyze incoming request and decompose into department-specific tasks" },
            { step: 2, agent: "👥 HR Coordinator", action: "Process people-related requirements and policy compliance" },
            { step: 3, agent: "💻 IT Systems Manager", action: "Handle technical provisioning and system configurations" },
            { step: 4, agent: "💰 Finance Processor", action: "Manage budget approvals and financial transactions" },
            { step: 5, agent: "📊 Operations Tracker", action: "Monitor progress and ensure SLA compliance" }
        ]
    },
    {
        id: "healthcare-multi-agent-avatar",
        title: "Healthcare Multi-Agent Avatar",
        icon: <Person20Regular />,
        industry: "Healthcare",
        description: "HIPAA-compliant patient care coordination system with specialized medical agents for appointment scheduling, treatment planning, and care management.",
        agents: [
            { name: "Triage Coordinator", role: "orchestrator", icon: "🩺", capabilities: "Assesses patient symptoms, prioritizes care urgency, and coordinates initial care pathways." },
            { name: "Appointment Scheduler", role: "specialist", icon: "📅", capabilities: "Manages complex scheduling across multiple specialists and care providers." },
            { name: "Treatment Planner", role: "specialist", icon: "💊", capabilities: "Develops personalized treatment protocols based on patient needs and medical guidelines." },
            { name: "Insurance Coordinator", role: "specialist", icon: "🏥", capabilities: "Handles insurance verification, pre-authorizations, and claims processing." },
            { name: "Care Manager", role: "monitor", icon: "❤️", capabilities: "Monitors patient progress, adjusts care plans, and ensures continuity of care." }
        ],
        useCases: [
            "Patient intake and triage",
            "Multi-specialist coordination",
            "Treatment plan optimization", 
            "Insurance claims processing"
        ],
        metrics: {
            timeReduction: "65%",
            errorReduction: "85%",
            costSavings: "£180K annually",
            satisfaction: "4.9/5"
        },
        workflow: [
            { step: 1, agent: "🩺 Triage Coordinator", action: "Assess patient symptoms and prioritize care urgency" },
            { step: 2, agent: "📅 Appointment Scheduler", action: "Coordinate availability across multiple specialists" },
            { step: 3, agent: "💊 Treatment Planner", action: "Develop personalized treatment protocols" },
            { step: 4, agent: "🏥 Insurance Coordinator", action: "Verify coverage and process pre-authorizations" },
            { step: 5, agent: "❤️ Care Manager", action: "Monitor patient progress and adjust care plans" }
        ]
    },
    {
        id: "gpt-rag-agent-orchestrator", 
        title: "GPT-RAG Agent Orchestrator",
        icon: <Search20Regular />,
        industry: "Knowledge Management",
        description: "Intelligent document retrieval and analysis system combining GPT capabilities with RAG architecture for enterprise knowledge management.",
        agents: [
            { name: "Query Processor", role: "orchestrator", icon: "🧠", capabilities: "Parses natural language queries and identifies user intent and information needs." },
            { name: "Document Retriever", role: "specialist", icon: "📚", capabilities: "Searches and ranks relevant documents from enterprise knowledge bases using semantic search." },
            { name: "Context Analyzer", role: "specialist", icon: "🔬", capabilities: "Extracts and synthesizes relevant information from retrieved documents." },
            { name: "Response Generator", role: "specialist", icon: "✍️", capabilities: "Crafts comprehensive answers with proper source attribution and citations." },
            { name: "Quality Validator", role: "monitor", icon: "✅", capabilities: "Verifies accuracy, completeness, and relevance of generated responses." }
        ],
        useCases: [
            "Legal research automation",
            "Technical documentation queries",
            "Customer support knowledge base",
            "Regulatory compliance research"
        ],
        metrics: {
            timeReduction: "80%",
            errorReduction: "92%", 
            costSavings: "£320K annually",
            satisfaction: "4.7/5"
        },
        workflow: [
            { step: 1, agent: "🧠 Query Processor", action: "Parse natural language queries and identify intent" },
            { step: 2, agent: "📚 Document Retriever", action: "Search and rank relevant documents from knowledge base" },
            { step: 3, agent: "🔬 Context Analyzer", action: "Extract and synthesize relevant information" },
            { step: 4, agent: "✍️ Response Generator", action: "Craft comprehensive answers with source attribution" },
            { step: 5, agent: "✅ Quality Validator", action: "Verify accuracy and completeness of responses" }
        ]
    },
    {
        id: "financial-services-platform",
        title: "Financial Services Multi-Agent Platform", 
        icon: <Money20Regular />,
        industry: "Financial Services",
        description: "Regulatory-compliant financial operations platform handling trading, risk assessment, compliance monitoring, and client portfolio management.",
        agents: [
            { name: "Portfolio Manager", role: "orchestrator", icon: "📈", capabilities: "Oversees client portfolios, investment strategies, and overall financial planning coordination." },
            { name: "Market Analyst", role: "specialist", icon: "📊", capabilities: "Conducts market research, analyzes trends, and identifies investment opportunities." },
            { name: "Risk Assessor", role: "specialist", icon: "⚖️", capabilities: "Evaluates potential risks, sets limits, and ensures risk management compliance." },
            { name: "Compliance Officer", role: "specialist", icon: "📋", capabilities: "Ensures regulatory compliance, maintains audit trails, and manages reporting requirements." },
            { name: "Trade Executor", role: "monitor", icon: "💱", capabilities: "Executes transactions, monitors performance, and ensures optimal trade execution." }
        ],
        useCases: [
            "Algorithmic trading strategies",
            "Real-time risk monitoring",
            "Regulatory compliance tracking", 
            "Client portfolio optimization"
        ],
        metrics: {
            timeReduction: "70%",
            errorReduction: "95%",
            costSavings: "£450K annually", 
            satisfaction: "4.6/5"
        },
        workflow: [
            { step: 1, agent: "📈 Portfolio Manager", action: "Analyze client objectives and market conditions" },
            { step: 2, agent: "📊 Market Analyst", action: "Research opportunities and market trends" },
            { step: 3, agent: "⚖️ Risk Assessor", action: "Evaluate potential risks and set limits" },
            { step: 4, agent: "📋 Compliance Officer", action: "Ensure regulatory compliance and audit trails" },
            { step: 5, agent: "💱 Trade Executor", action: "Execute transactions and monitor performance" }
        ]
    },
    {
        id: "supply-chain-optimization",
        title: "Supply Chain Optimization Engine",
        icon: <VehicleBus20Regular />,
        industry: "Manufacturing & Logistics", 
        description: "End-to-end supply chain management with predictive analytics, inventory optimization, and supplier coordination automation.",
        agents: [
            { name: "Demand Forecaster", role: "orchestrator", icon: "📈", capabilities: "Predicts demand patterns using historical data, market trends, and seasonal factors." },
            { name: "Inventory Manager", role: "specialist", icon: "📦", capabilities: "Optimizes stock levels, manages reorder points, and minimizes carrying costs." },
            { name: "Supplier Coordinator", role: "specialist", icon: "🤝", capabilities: "Manages supplier relationships, negotiations, and performance monitoring." },
            { name: "Logistics Optimizer", role: "specialist", icon: "🚛", capabilities: "Plans optimal routes, schedules deliveries, and coordinates transportation." },
            { name: "Quality Controller", role: "monitor", icon: "🔍", capabilities: "Monitors quality metrics, supplier performance, and ensures standards compliance." }
        ],
        useCases: [
            "Predictive inventory management",
            "Supplier performance optimization",
            "Route and delivery planning",
            "Quality assurance automation"
        ],
        metrics: {
            timeReduction: "60%",
            errorReduction: "88%",
            costSavings: "£380K annually",
            satisfaction: "4.5/5"
        },
        workflow: [
            { step: 1, agent: "📈 Demand Forecaster", action: "Predict demand patterns using historical data and market trends" },
            { step: 2, agent: "📦 Inventory Manager", action: "Optimize stock levels and reorder points" },
            { step: 3, agent: "🤝 Supplier Coordinator", action: "Manage supplier relationships and negotiations" },
            { step: 4, agent: "🚛 Logistics Optimizer", action: "Plan optimal routes and delivery schedules" },
            { step: 5, agent: "🔍 Quality Controller", action: "Monitor quality metrics and supplier performance" }
        ]
    },
    {
        id: "customer-service-hub",
        title: "Customer Service Orchestration Hub",
        icon: <Headset20Regular />,
        industry: "Customer Experience",
        description: "Multi-channel customer support platform with intelligent routing, escalation management, and satisfaction optimization.",
        agents: [
            { name: "Interaction Router", role: "orchestrator", icon: "🧠", capabilities: "Classifies customer inquiries and routes to appropriate support agents based on complexity and expertise." },
            { name: "First-Line Support", role: "specialist", icon: "🎯", capabilities: "Handles routine inquiries, basic troubleshooting, and standard service requests." },
            { name: "Technical Specialist", role: "specialist", icon: "🔧", capabilities: "Resolves complex technical issues requiring specialized knowledge and advanced troubleshooting." },
            { name: "Escalation Manager", role: "specialist", icon: "📈", capabilities: "Manages high-priority cases, customer complaints, and complex resolution scenarios." },
            { name: "Satisfaction Monitor", role: "monitor", icon: "😊", capabilities: "Tracks resolution quality, customer feedback, and continuous improvement opportunities." }
        ],
        useCases: [
            "Omnichannel support coordination",
            "Intelligent issue categorization", 
            "Expert escalation routing",
            "Customer satisfaction tracking"
        ],
        metrics: {
            timeReduction: "55%",
            errorReduction: "82%",
            costSavings: "£220K annually",
            satisfaction: "4.8/5"
        },
        workflow: [
            { step: 1, agent: "🧠 Interaction Router", action: "Classify customer inquiries and route to appropriate agents" },
            { step: 2, agent: "🎯 First-Line Support", action: "Handle routine inquiries and basic troubleshooting" },
            { step: 3, agent: "🔧 Technical Specialist", action: "Resolve complex technical issues" },
            { step: 4, agent: "📈 Escalation Manager", action: "Manage high-priority cases and customer complaints" },
            { step: 5, agent: "😊 Satisfaction Monitor", action: "Track resolution quality and customer feedback" }
        ]
    }
];

export const getTemplateById = (id: string): EnterpriseTemplate | undefined => {
    return enterpriseTemplates.find(template => template.id === id);
};

export const getTemplatesByIndustry = (industry: string): EnterpriseTemplate[] => {
    return enterpriseTemplates.filter(template => template.industry === industry);
};

export const getAllIndustries = (): string[] => {
    return [...new Set(enterpriseTemplates.map(template => template.industry))];
};

// Quick task interface for HomeInput component
export interface EnterpriseQuickTask {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    templateId: string;
}

export const enterpriseQuickTasks: EnterpriseQuickTask[] = [
    {
        id: "cross-dept-onboarding",
        title: "Employee Onboarding",
        description: "Orchestrate cross-department onboarding for new employee Sarah Johnson.",
        icon: <Building20Regular />,
        templateId: "cross-department-orchestrator"
    },
    {
        id: "healthcare-patient-care",
        title: "Patient Care Coordination",
        description: "Coordinate multi-specialist care plan for complex patient case.",
        icon: <Person20Regular />,
        templateId: "healthcare-multi-agent-avatar"
    },
    {
        id: "knowledge-research",
        title: "Enterprise Research",
        description: "Research regulatory compliance requirements using knowledge base.",
        icon: <Search20Regular />,
        templateId: "gpt-rag-agent-orchestrator"
    },
    {
        id: "financial-portfolio",
        title: "Portfolio Optimization", 
        description: "Optimize client investment portfolio with risk management.",
        icon: <Money20Regular />,
        templateId: "financial-services-platform"
    },
    {
        id: "supply-chain-planning",
        title: "Supply Chain Planning",
        description: "Optimize inventory and logistics for Q4 demand forecast.",
        icon: <VehicleBus20Regular />,
        templateId: "supply-chain-optimization"
    },
    {
        id: "customer-support", 
        title: "Customer Issue Resolution",
        description: "Route and resolve complex customer technical support case.",
        icon: <Headset20Regular />,
        templateId: "customer-service-hub"
    }
];