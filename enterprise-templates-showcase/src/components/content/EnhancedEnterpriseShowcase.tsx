import React, { useState, useEffect } from "react";
import {
    Body1Strong,
    Body1,
    Body2,
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
    Avatar,
    Divider,
    Skeleton,
    SkeletonItem,
    Text,
    tokens
} from "@fluentui/react-components";
import { 
    Dismiss24Regular, 
    Mail24Regular, 
    Eye24Regular,
    ChevronRight20Regular,
    Star20Filled,
    TrophyRegular,
    PersonRunning20Regular,
    MoneyRegular,
    CheckmarkCircle20Filled,
    ArrowRight20Regular
} from "@fluentui/react-icons";
import { enterpriseTemplates, EnterpriseTemplate } from "../../models/enterpriseTemplates";

const EnhancedEnterpriseShowcase: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<EnterpriseTemplate | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        // Simulate loading for smooth entrance animations
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

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

    const cardStyles = {
        card: {
            padding: "24px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: `2px solid transparent`,
            position: "relative" as const,
            overflow: "hidden" as const,
            background: `linear-gradient(145deg, ${tokens.colorNeutralBackground1}, ${tokens.colorNeutralBackground2})`,
            backdropFilter: "blur(10px)",
            boxShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}, 0 0 2px ${tokens.colorNeutralShadowKey}`
        },
        cardHovered: {
            transform: "translateY(-8px) scale(1.02)",
            borderColor: tokens.colorBrandBackground,
            boxShadow: `0 12px 32px ${tokens.colorNeutralShadowAmbient}, 0 2px 8px ${tokens.colorBrandShadowAmbient}`,
            background: `linear-gradient(145deg, ${tokens.colorNeutralBackground1}, ${tokens.colorSubtleBackground})`
        }
    };

    const containerStyles = {
        main: {
            minHeight: "100vh",
            background: `linear-gradient(135deg, 
                ${tokens.colorBrandBackground} 0%, 
                ${tokens.colorBrandBackground2} 35%,
                ${tokens.colorBrandBackgroundInverted} 100%)`,
            position: "relative" as const,
            overflow: "hidden" as const
        },
        overlay: {
            position: "absolute" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none" as const
        },
        content: {
            position: "relative" as const,
            zIndex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "40px 24px"
        }
    };

    if (loading) {
        return (
            <div style={containerStyles.main}>
                <div style={containerStyles.content}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <Skeleton>
                            <SkeletonItem size={64} />
                        </Skeleton>
                        <Skeleton style={{ marginTop: "16px" }}>
                            <SkeletonItem size={32} />
                        </Skeleton>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} style={{ padding: "24px" }}>
                                <Skeleton>
                                    <SkeletonItem size={48} />
                                    <SkeletonItem size={24} style={{ marginTop: "16px" }} />
                                    <SkeletonItem size={16} style={{ marginTop: "8px" }} />
                                </Skeleton>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyles.main}>
            <div style={containerStyles.overlay} />
            <div style={containerStyles.content}>
                {/* Enhanced Header with Animation */}
                <div style={{ 
                    textAlign: "center", 
                    marginBottom: "4rem",
                    animation: "fadeInUp 0.8s ease-out"
                }}>
                    <Badge 
                        appearance="filled" 
                        color="brand" 
                        size="extra-large"
                        style={{ 
                            marginBottom: "1.5rem",
                            padding: "12px 24px",
                            fontSize: "16px",
                            fontWeight: 600,
                            background: `linear-gradient(45deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
                            border: "none",
                            boxShadow: `0 4px 16px ${tokens.colorBrandShadowAmbient}`,
                            animation: "pulse 2s infinite"
                        }}
                        icon={<TrophyRegular />}
                    >
                        Microsoft Solution Accelerator Templates
                    </Badge>
                    
                    <Title1 style={{ 
                        marginBottom: "1.5rem", 
                        color: "white",
                        fontSize: "3.5rem",
                        fontWeight: 700,
                        textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        background: "linear-gradient(45deg, #ffffff, #f0f8ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        Enterprise Multi-Agent Templates
                    </Title1>
                    
                    <Body1 style={{ 
                        maxWidth: "900px", 
                        margin: "0 auto", 
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "1.2rem",
                        lineHeight: "1.6",
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                    }}>
                        Production-ready, industry-specific multi-agent automation templates built on Microsoft's 
                        enterprise-grade architecture. Each template demonstrates specialized AI agents working 
                        together to solve complex organizational challenges with unprecedented efficiency.
                    </Body1>
                </div>

                {/* Enhanced Stats Section */}
                <Card style={{ 
                    marginBottom: "4rem", 
                    padding: "32px", 
                    textAlign: "center",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    animation: "slideInUp 0.8s ease-out 0.2s both"
                }}>
                    <Title2 style={{ 
                        marginBottom: "2rem", 
                        color: tokens.colorBrandBackground,
                        fontWeight: 700,
                        position: "relative"
                    }}>
                        <Star20Filled style={{ marginRight: "8px", color: "#FFD700" }} />
                        Enterprise Template Portfolio Impact
                    </Title2>
                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                        gap: "2rem" 
                    }}>
                        {[
                            { value: "6", label: "Industry Templates", icon: <TrophyRegular />, color: "#0078d4" },
                            { value: "30+", label: "Specialized AI Agents", icon: <PersonRunning20Regular />, color: "#00bcf2" },
                            { value: "£1.8M+", label: "Combined Annual Savings", icon: <MoneyRegular />, color: "#107c10" },
                            { value: "4.7/5", label: "Average Satisfaction", icon: <Star20Filled />, color: "#FFD700" }
                        ].map((stat, index) => (
                            <div key={index} style={{
                                padding: "20px",
                                background: `linear-gradient(145deg, ${tokens.colorNeutralBackground1}, ${tokens.colorSubtleBackground})`,
                                borderRadius: "16px",
                                border: `2px solid ${stat.color}20`,
                                transition: "transform 0.3s ease",
                                cursor: "pointer"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}30`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "";
                            }}>
                                <div style={{ color: stat.color, marginBottom: "8px", fontSize: "24px" }}>
                                    {stat.icon}
                                </div>
                                <Title1 style={{ 
                                    color: stat.color,
                                    fontWeight: 800,
                                    marginBottom: "4px"
                                }}>
                                    {stat.value}
                                </Title1>
                                <Caption1 style={{ 
                                    color: tokens.colorNeutralForeground2,
                                    fontWeight: 500
                                }}>
                                    {stat.label}
                                </Caption1>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Enhanced Templates Grid */}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", 
                    gap: "24px",
                    marginBottom: "2rem"
                }}>
                    {enterpriseTemplates.slice(0, 6).map((template, index) => (
                        <Card 
                            key={template.id}
                            style={{
                                ...cardStyles.card,
                                ...(hoveredCard === template.id ? cardStyles.cardHovered : {}),
                                animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                            }}
                            onMouseEnter={() => setHoveredCard(template.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Gradient Overlay */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "4px",
                                background: `linear-gradient(90deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`
                            }} />

                            {/* Template Header */}
                            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
                                <div style={{ 
                                    fontSize: "2.5rem", 
                                    marginRight: "16px",
                                    padding: "12px",
                                    background: `linear-gradient(145deg, ${tokens.colorBrandBackground}10, ${tokens.colorBrandBackground}20)`,
                                    borderRadius: "16px",
                                    border: `2px solid ${tokens.colorBrandBackground}30`
                                }}>
                                    {template.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Body1Strong style={{ 
                                        fontSize: "1.3rem",
                                        color: tokens.colorNeutralForeground1,
                                        marginBottom: "8px",
                                        display: "block",
                                        lineHeight: "1.3"
                                    }}>
                                        {template.title}
                                    </Body1Strong>
                                    <Badge 
                                        appearance="tint" 
                                        color="brand" 
                                        size="medium"
                                        style={{
                                            background: `${tokens.colorBrandBackground}15`,
                                            color: tokens.colorBrandForeground1,
                                            fontWeight: 600
                                        }}
                                    >
                                        {template.industry}
                                    </Badge>
                                </div>
                                <ChevronRight20Regular style={{ 
                                    color: tokens.colorNeutralForeground3,
                                    transform: hoveredCard === template.id ? "translateX(4px)" : "translateX(0)",
                                    transition: "transform 0.3s ease"
                                }} />
                            </div>

                            {/* Description */}
                            <Body2 style={{ 
                                marginBottom: "20px", 
                                color: tokens.colorNeutralForeground2,
                                lineHeight: "1.5"
                            }}>
                                {template.description}
                            </Body2>

                            {/* Agents Section */}
                            <div style={{ marginBottom: "20px" }}>
                                <Caption1 style={{ 
                                    fontWeight: 700, 
                                    marginBottom: "12px",
                                    color: tokens.colorNeutralForeground1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}>
                                    <PersonRunning20Regular />
                                    Specialized Agents
                                </Caption1>
                                <div style={{ 
                                    display: "flex", 
                                    flexWrap: "wrap", 
                                    gap: "8px" 
                                }}>
                                    {template.agents.slice(0, 3).map((agent, agentIndex) => (
                                        <Badge 
                                            key={agentIndex} 
                                            appearance="filled" 
                                            color="brand" 
                                            size="medium"
                                            style={{
                                                background: `linear-gradient(45deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
                                                color: "white",
                                                fontWeight: 500
                                            }}
                                        >
                                            {agent.icon} {agent.name}
                                        </Badge>
                                    ))}
                                    {template.agents.length > 3 && (
                                        <Badge 
                                            appearance="outline" 
                                            size="medium"
                                            style={{
                                                borderColor: tokens.colorBrandBackground,
                                                color: tokens.colorBrandForeground1
                                            }}
                                        >
                                            +{template.agents.length - 3} more
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Enhanced Metrics */}
                            <Card style={{ 
                                backgroundColor: `${tokens.colorNeutralBackground2}80`, 
                                padding: "16px", 
                                marginBottom: "20px",
                                border: `1px solid ${tokens.colorNeutralStroke2}`,
                                backdropFilter: "blur(5px)"
                            }}>
                                <div style={{ 
                                    display: "grid", 
                                    gridTemplateColumns: "repeat(2, 1fr)", 
                                    gap: "12px" 
                                }}>
                                    {[
                                        { label: "Time Reduction", value: template.metrics.timeReduction, color: "#107c10" },
                                        { label: "Error Reduction", value: template.metrics.errorReduction, color: "#d13438" },
                                        { label: "Cost Savings", value: template.metrics.costSavings, color: "#ca5010" },
                                        { label: "Satisfaction", value: template.metrics.satisfaction, color: "#8764b8" }
                                    ].map((metric, metricIndex) => (
                                        <div key={metricIndex} style={{ textAlign: "center" }}>
                                            <Text style={{ 
                                                fontWeight: 800,
                                                fontSize: "1.1rem",
                                                color: metric.color,
                                                display: "block"
                                            }}>
                                                {metric.value}
                                            </Text>
                                            <Caption1 style={{ 
                                                color: tokens.colorNeutralForeground3,
                                                fontSize: "0.75rem"
                                            }}>
                                                {metric.label}
                                            </Caption1>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Enhanced Action Buttons */}
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Button
                                    appearance="primary"
                                    icon={<Eye24Regular />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetails(template);
                                    }}
                                    style={{ 
                                        flex: 1,
                                        background: `linear-gradient(45deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
                                        border: "none",
                                        fontWeight: 600,
                                        boxShadow: `0 2px 8px ${tokens.colorBrandShadowAmbient}`
                                    }}
                                >
                                    View Details
                                    <ArrowRight20Regular />
                                </Button>
                                <Button
                                    appearance="outline"
                                    icon={<Mail24Regular />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleContactForDemo(template);
                                    }}
                                    style={{ 
                                        flex: 1,
                                        borderColor: tokens.colorBrandBackground,
                                        color: tokens.colorBrandForeground1,
                                        fontWeight: 600
                                    }}
                                >
                                    Request Demo
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Enhanced Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(_, data) => setIsDialogOpen(data.open)}>
                <DialogSurface style={{ 
                    maxWidth: "900px", 
                    maxHeight: "85vh", 
                    overflowY: "auto",
                    background: `linear-gradient(145deg, ${tokens.colorNeutralBackground1}, ${tokens.colorNeutralBackground2})`,
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                    boxShadow: `0 16px 64px ${tokens.colorNeutralShadowAmbient}`
                }}>
                    <DialogTitle 
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="close"
                                icon={<Dismiss24Regular />}
                                onClick={closeDialog}
                                style={{
                                    background: `${tokens.colorNeutralBackground3}80`,
                                    border: `1px solid ${tokens.colorNeutralStroke2}`
                                }}
                            />
                        }
                    >
                        {selectedTemplate && (
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    fontSize: "2rem",
                                    padding: "12px",
                                    background: `linear-gradient(145deg, ${tokens.colorBrandBackground}15, ${tokens.colorBrandBackground}25)`,
                                    borderRadius: "12px"
                                }}>
                                    {selectedTemplate.icon}
                                </div>
                                <div>
                                    <Title2 style={{ color: tokens.colorNeutralForeground1, marginBottom: "4px" }}>
                                        {selectedTemplate.title}
                                    </Title2>
                                    <Badge appearance="tint" color="brand" size="medium">
                                        {selectedTemplate.industry}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </DialogTitle>
                    <DialogBody>
                        {selectedTemplate && (
                            <div>
                                <div style={{ marginBottom: "24px" }}>
                                    <Title3 style={{ 
                                        color: tokens.colorBrandBackground, 
                                        marginBottom: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}>
                                        <CheckmarkCircle20Filled />
                                        Overview
                                    </Title3>
                                    <Body1 style={{ 
                                        lineHeight: "1.6", 
                                        color: tokens.colorNeutralForeground2,
                                        padding: "16px",
                                        background: `${tokens.colorNeutralBackground2}50`,
                                        borderRadius: "8px",
                                        border: `1px solid ${tokens.colorNeutralStroke2}`
                                    }}>
                                        {selectedTemplate.description}
                                    </Body1>
                                </div>

                                <div style={{ marginBottom: "24px" }}>
                                    <Title3 style={{ color: tokens.colorBrandBackground, marginBottom: "12px" }}>
                                        Use Cases
                                    </Title3>
                                    <ul style={{ 
                                        lineHeight: "1.8", 
                                        color: tokens.colorNeutralForeground2, 
                                        paddingLeft: "0",
                                        listStyle: "none"
                                    }}>
                                        {selectedTemplate.useCases.map((useCase, index) => (
                                            <li key={index} style={{
                                                padding: "8px 0",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px"
                                            }}>
                                                <CheckmarkCircle20Filled style={{ 
                                                    color: tokens.colorPaletteGreenForeground1,
                                                    flexShrink: 0
                                                }} />
                                                {useCase}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <Title3 style={{ color: tokens.colorBrandBackground, marginBottom: "12px" }}>
                                        Agent Workflow
                                    </Title3>
                                    <Accordion>
                                        {selectedTemplate.workflow.map((step, index) => (
                                            <AccordionItem key={index} value={step.step.toString()}>
                                                <AccordionHeader>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div style={{
                                                            background: `linear-gradient(45deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
                                                            color: "white",
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "50%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontWeight: "bold",
                                                            fontSize: "0.9rem",
                                                            boxShadow: `0 2px 8px ${tokens.colorBrandShadowAmbient}`
                                                        }}>
                                                            {step.step}
                                                        </div>
                                                        <Body1Strong>{step.agent}</Body1Strong>
                                                    </div>
                                                </AccordionHeader>
                                                <AccordionPanel>
                                                    <Body1 style={{ 
                                                        color: tokens.colorNeutralForeground2, 
                                                        lineHeight: "1.5",
                                                        marginLeft: "44px"
                                                    }}>
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
                    <DialogActions style={{ padding: "24px" }}>
                        <Button
                            appearance="primary"
                            icon={<Mail24Regular />}
                            onClick={() => selectedTemplate && handleContactForDemo(selectedTemplate)}
                            style={{
                                background: `linear-gradient(45deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
                                border: "none",
                                fontWeight: 600,
                                boxShadow: `0 2px 8px ${tokens.colorBrandShadowAmbient}`
                            }}
                        >
                            Request Implementation Demo
                        </Button>
                        <Button 
                            appearance="secondary" 
                            onClick={closeDialog}
                            style={{
                                borderColor: tokens.colorNeutralStroke1,
                                color: tokens.colorNeutralForeground1
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </DialogSurface>
            </Dialog>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }

                .template-card {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .template-card:hover {
                    transform: translateY(-8px) scale(1.02);
                }
            `}</style>
        </div>
    );
};

export default EnhancedEnterpriseShowcase;