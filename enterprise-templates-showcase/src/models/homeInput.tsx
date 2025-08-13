import { enterpriseQuickTasks, EnterpriseQuickTask } from "./enterpriseTemplates";

export interface QuickTask {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

// Use enterprise templates for quick tasks
export const quickTasks: QuickTask[] = enterpriseQuickTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    icon: task.icon
}));

export interface HomeInputProps {
    onInputSubmit: (input: string) => void;
    onQuickTaskSelect: (taskDescription: string) => void;
}
