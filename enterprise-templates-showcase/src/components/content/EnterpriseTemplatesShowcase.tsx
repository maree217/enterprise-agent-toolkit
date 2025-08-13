import React, { useState } from "react";
import {
    Body1Strong,
    Body1,
    Button,
    Card,
    Caption1,
    Title1,
    Title2,
    Title3,
    Badge,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Avatar
} from "@fluentui/react-components";
import { Dismiss24Regular, Mail24Regular, Eye24Regular } from "@fluentui/react-icons";
import { enterpriseTemplates, EnterpriseTemplate } from "../../models/enterpriseTemplates";
import "./../../styles/HomeInput.css";

const EnterpriseTemplatesShowcase: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<EnterpriseTemplate | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewDetails = (template: EnterpriseTemplate) => {
        setSelectedTemplate(template);
        setIsDialogOpen(true);
    };

    const handleContactForDemo = (template: EnterpriseTemplate) => {
        const subject = `Demo Request: ${template.title}`;
        const body = `Hello,\n\nI'm interested in seeing a demonstration of the ${template.title} template.\n\nIndustry: ${template.industry}\n\nPlease schedule a demo at your earliest convenience.\n\nBest regards`;
        
        window.location.href = `mailto:ram@aicapabilitybuilder.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedTemplate(null);
    };

    return (
        <div className="home-input-container">
            <div className="home-input-content">
                <div className="home-input-center-content">
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <Badge 
                            appearance="filled" 
                            color="brand" 
                            size="extra-large"
                            style={{ marginBottom: "1rem" }}
                        >
                            🏢 Microsoft Solution Accelerator Templates
                        </Badge>
                        
                        <Title1 style={{ marginBottom: "1rem", color: "#0078d4" }}>
                            Enterprise Multi-Agent Templates
                        </Title1>
                        
                        <Body1 style={{ maxWidth: "800px", margin: "0 auto", color: "#605e5c" }}>
                            Production-ready, industry-specific multi-agent automation templates built on Microsoft's 
                            enterprise-grade architecture. Each template demonstrates specialized AI agents working 
                            together to solve complex organizational challenges.
                        </Body1>
                    </div>

                    {/* Overall Stats */}
                    <Card style={{ marginBottom: "3rem", padding: "2rem", textAlign: "center" }}>
                        <Title2 style={{ marginBottom: "2rem", color: "#0078d4" }}>
                            Enterprise Template Portfolio Impact
                        </Title2>
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                            gap: "2rem" 
                        }}>
                            <div>
                                <Title1 style={{ color: "#0078d4" }}>6</Title1>
                                <Caption1 style={{ color: "#605e5c" }}>Industry Templates</Caption1>
                            </div>
                            <div>
                                <Title1 style={{ color: "#0078d4" }}>30+</Title1>
                                <Caption1 style={{ color: "#605e5c" }}>Specialized AI Agents</Caption1>
                            </div>
                            <div>
                                <Title1 style={{ color: "#0078d4" }}>£1.8M+</Title1>
                                <Caption1 style={{ color: "#605e5c" }}>Combined Annual Savings</Caption1>
                            </div>
                            <div>
                                <Title1 style={{ color: "#0078d4" }}>4.7/5</Title1>
                                <Caption1 style={{ color: "#605e5c" }}>Average Satisfaction</Caption1>
                            </div>
                        </div>
                    </Card>

                    {/* Templates Grid */}
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
                        gap: "1.5rem",
                        marginBottom: "2rem"
                    }}>
                        {enterpriseTemplates.slice(0, 6).map((template) => (
                            <Card 
                                key={template.id}
                                style={{ 
                                    padding: "2rem",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    border: "2px solid transparent"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.borderColor = "#0078d4";
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 120, 212, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = "transparent";
                                    e.currentTarget.style.boxShadow = "";
                                }}
                            >
                                {/* Template Header */}
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                                    <div style={{ fontSize: "2rem", marginRight: "1rem" }}>
                                        {template.icon}
                                    </div>
                                    <div>
                                        <Body1Strong>{template.title}</Body1Strong>
                                        <div style={{ marginTop: "0.5rem" }}>
                                            <Badge appearance="tint" color="brand" size="small">
                                                {template.industry}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <Body1 style={{ 
                                    marginBottom: "1.5rem", 
                                    color: "#605e5c",
                                    lineHeight: "1.5",
                                    fontSize: "0.95rem"
                                }}>
                                    {template.description}
                                </Body1>

                                {/* Agents */}
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <Caption1 style={{ fontWeight: "600", marginBottom: "0.8rem" }}>
                                        Specialized Agents:
                                    </Caption1>
                                    <div style={{ 
                                        display: "flex", 
                                        flexWrap: "wrap", 
                                        gap: "0.5rem" 
                                    }}>
                                        {template.agents.slice(0, 3).map((agent, index) => (
                                            <Badge 
                                                key={index} 
                                                appearance="filled" 
                                                color="brand" 
                                                size="small"
                                            >
                                                {agent.icon} {agent.name}
                                            </Badge>
                                        ))}
                                        {template.agents.length > 3 && (
                                            <Badge appearance="outline" size="small">
                                                +{template.agents.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Metrics */}
                                <Card style={{ 
                                    backgroundColor: "#f8f9fa", 
                                    padding: "1rem", 
                                    marginBottom: "1.5rem" 
                                }}>
                                    <Caption1 style={{ fontWeight: "600", marginBottom: "0.8rem" }}>
                                        Key Performance Metrics:
                                    </Caption1>
                                    <div style={{ 
                                        display: "grid", 
                                        gridTemplateColumns: "repeat(2, 1fr)", 
                                        gap: "0.8rem" 
                                    }}>
                                        <div style={{ textAlign: "center" }}>
                                            <Body1Strong style={{ color: "#0078d4" }}>
                                                {template.metrics.timeReduction}
                                            </Body1Strong>
                                            <Caption1 style={{ display: "block", color: "#605e5c" }}>
                                                Time Reduction
                                            </Caption1>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <Body1Strong style={{ color: "#0078d4" }}>
                                                {template.metrics.errorReduction}
                                            </Body1Strong>
                                            <Caption1 style={{ display: "block", color: "#605e5c" }}>
                                                Error Reduction
                                            </Caption1>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <Body1Strong style={{ color: "#0078d4" }}>
                                                {template.metrics.costSavings}
                                            </Body1Strong>
                                            <Caption1 style={{ display: "block", color: "#605e5c" }}>
                                                Cost Savings
                                            </Caption1>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <Body1Strong style={{ color: "#0078d4" }}>
                                                {template.metrics.satisfaction}
                                            </Body1Strong>
                                            <Caption1 style={{ display: "block", color: "#605e5c" }}>
                                                Satisfaction
                                            </Caption1>
                                        </div>
                                    </div>
                                </Card>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Button
                                        appearance="primary"
                                        icon={<Eye24Regular />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(template);
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        appearance="outline"
                                        icon={<Mail24Regular />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContactForDemo(template);
                                        }}
                                        style={{ flex: 1 }}
                                    >
                                        Request Demo
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Template Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(_, data) => setIsDialogOpen(data.open)}>
                <DialogSurface style={{ maxWidth: "800px", maxHeight: "80vh", overflowY: "auto" }}>
                    <DialogTitle 
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="close"
                                icon={<Dismiss24Regular />}
                                onClick={closeDialog}
                            />
                        }
                    >
                        {selectedTemplate && (
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ fontSize: "1.5rem" }}>
                                    {selectedTemplate.icon}
                                </div>
                                <div>
                                    <div>{selectedTemplate.title}</div>
                                    <Badge appearance="tint" color="brand" size="small">
                                        {selectedTemplate.industry}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </DialogTitle>
                    <DialogBody>
                        {selectedTemplate && (
                            <div>
                                {/* Overview */}
                                <div style={{ marginBottom: "2rem" }}>
                                    <Title3 style={{ color: "#0078d4", marginBottom: "1rem" }}>
                                        Overview
                                    </Title3>
                                    <Body1 style={{ lineHeight: "1.6", color: "#605e5c" }}>
                                        {selectedTemplate.description}
                                    </Body1>
                                </div>

                                {/* Use Cases */}
                                <div style={{ marginBottom: "2rem" }}>
                                    <Title3 style={{ color: "#0078d4", marginBottom: "1rem" }}>
                                        Use Cases
                                    </Title3>
                                    <ul style={{ lineHeight: "1.8", color: "#605e5c", paddingLeft: "1.5rem" }}>
                                        {selectedTemplate.useCases.map((useCase, index) => (
                                            <li key={index}>{useCase}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Agent Workflow */}
                                <div>
                                    <Title3 style={{ color: "#0078d4", marginBottom: "1rem" }}>
                                        Agent Workflow
                                    </Title3>
                                    <Accordion>
                                        {selectedTemplate.workflow.map((step, index) => (
                                            <AccordionItem key={index} value={step.step.toString()}>
                                                <AccordionHeader>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                        <div style={{
                                                            backgroundColor: "#0078d4",
                                                            color: "white",
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: "bold",
                                                            fontSize: "0.9rem"
                                                        }}>
                                                            {step.step}
                                                        </div>
                                                        <Body1Strong>{step.agent}</Body1Strong>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionPanel>
                                                    <Body1 style={{ color: "#605e5c", lineHeight: "1.4" }}>
                                                        {step.action}
                                                    </Body1>
                                                </AccordionPanel>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </div>
                        )}
                    </DialogBody>
                    <DialogActions>
                        <Button
                            appearance="primary"
                            icon={<Mail24Regular />}
                            onClick={() => selectedTemplate && handleContactForDemo(selectedTemplate)}
                        >
                            Request Implementation Demo
                        </Button>
                        <Button appearance="secondary" onClick={closeDialog}>
                            Close
                        </Button>
                    </DialogActions>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default EnterpriseTemplatesShowcase;