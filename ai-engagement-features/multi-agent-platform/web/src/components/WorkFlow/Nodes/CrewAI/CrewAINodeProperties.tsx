import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Radio,
  RadioGroup,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import { FaEdit, FaPlus, FaTrash, FaRobot, FaListAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";

import ModelSelect from "@/components/Common/ModelProvider";
import { useModelQuery } from "@/hooks/useModelQuery";
import { AgentConfig, CrewAINodeData, TaskConfig } from "../../types";
import { DEFAULT_MANAGER } from "./constants";
import AgentModal from "./AgentModal";
import TaskModal from "./TaskModal";
import {
  VariableReference,
  getAvailableVariables,
} from "../../FlowVis/variableSystem";
import { useReactFlow } from "reactflow";

interface CrewAINodePropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

const CrewAINodeProperties: React.FC<CrewAINodePropertiesProps> = ({
  node,
  onNodeDataChange,
}) => {
  const { t } = useTranslation();
  const data = node.data as CrewAINodeData;
  const { data: models } = useModelQuery();
  const toast = useToast();
  const { control } = useForm({
    defaultValues: {
      model: data.llm_config?.model || "",
    },
  });

  // Modal controls
  const {
    isOpen: isAgentModalOpen,
    onOpen: onAgentModalOpen,
    onClose: onAgentModalClose,
  } = useDisclosure();

  const {
    isOpen: isTaskModalOpen,
    onOpen: onTaskModalOpen,
    onClose: onTaskModalClose,
  } = useDisclosure();

  // Edit states
  const [editingAgent, setEditingAgent] = useState<AgentConfig | undefined>();
  const [editingTask, setEditingTask] = useState<TaskConfig | undefined>();
  const [useCustomManager, setUseCustomManager] = useState(
    !!data.manager_config?.agent,
  );

  // 检查是否已经存在Manager Agent
  const hasManagerAgent = useMemo(() => {
    return data.agents?.some((agent) => agent.role === "Team Manager");
  }, [data.agents]);

  // Handlers for agents
  const handleAddAgent = (agent: AgentConfig) => {
    // 如果是Manager Agent，确保只能有一个
    if (agent.role === "Team Manager" && hasManagerAgent && !editingAgent) {
      toast({
        title: "Error",
        description: "Only one Manager Agent is allowed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedAgents = [...(data.agents || [])];
    const existingIndex = updatedAgents.findIndex((a) => a.id === agent.id);

    if (existingIndex >= 0) {
      updatedAgents[existingIndex] = {
        ...agent,
        tools: agent.tools || [],
      };
    } else {
      updatedAgents.push({
        ...agent,
        tools: agent.tools || [],
      });
    }

    onNodeDataChange(node.id, "agents", updatedAgents);
    onAgentModalClose();
    setEditingAgent(undefined);
  };

  // Handler for manager agent configuration
  const handleManagerAgentConfig = (agent: AgentConfig) => {
    // 确保manager agent的必要属性
    const managerAgent = {
      ...agent,
      role: "Team Manager",
      allow_delegation: true,
      tools: agent.tools || [],
    };

    onNodeDataChange(node.id, "manager_config", {
      agent: managerAgent,
    });
    setUseCustomManager(true);
  };

  const handleDeleteAgent = (agentId: string) => {
    const agent = data.agents.find((a) => a.id === agentId);
    if (agent?.role === "Team Manager") {
      // 如果删除的是Manager Agent，清除manager_config
      onNodeDataChange(node.id, "manager_config", {});
      setUseCustomManager(false);
    }

    const updatedAgents = data.agents.filter((a) => a.id !== agentId);
    onNodeDataChange(node.id, "agents", updatedAgents);

    // 删除关联的tasks
    const updatedTasks = data.tasks.filter((t) => t.agent_id !== agentId);
    onNodeDataChange(node.id, "tasks", updatedTasks);
  };

  // Handlers for tasks
  const handleAddTask = (task: TaskConfig) => {
    const updatedTasks = [...(data.tasks || [])];
    const existingIndex = updatedTasks.findIndex(
      (t) => t.description === task.description && t.agent_id === task.agent_id,
    );

    if (existingIndex >= 0) {
      updatedTasks[existingIndex] = task;
    } else {
      updatedTasks.push(task);
    }

    onNodeDataChange(node.id, "tasks", updatedTasks);
    onTaskModalClose();
    setEditingTask(undefined);
  };

  const handleEditTask = (task: TaskConfig) => {
    setEditingTask(task);
    onTaskModalOpen();
  };

  const handleDeleteTask = (taskIndex: number) => {
    const updatedTasks = data.tasks.filter((_, index) => index !== taskIndex);
    onNodeDataChange(node.id, "tasks", updatedTasks);
  };

  // Handler for process type
  const handleProcessTypeChange = (value: "sequential" | "hierarchical") => {
    onNodeDataChange(node.id, "process_type", value);
    if (value === "sequential") {
      onNodeDataChange(node.id, "manager_config", {});
      setUseCustomManager(false);
    } else {
      if (!useCustomManager) {
        onNodeDataChange(node.id, "manager_config", {
          agent: {
            id: uuidv4(),
            ...DEFAULT_MANAGER,
            allow_delegation: true,
          },
        });
      }
    }
  };

  // Handler for LLM selection
  const handleLLMSelect = (modelName: string) => {
    onNodeDataChange(node.id, "llm_config", {
      model: modelName,
    });
  };

  // 验证是否可以添加新的task
  const canAddTask = useMemo(() => {
    if (data.process_type === "sequential") {
      return data.agents?.length > 0;
    } else {
      // hierarchical 模式下需要确保有 manager_config.agent
      return (
        data.agents?.length > 0 &&
        (useCustomManager ? !!data.manager_config?.agent : true)
      );
    }
  }, [data.agents, data.process_type, data.manager_config, useCustomManager]);

  // 添加 handleEditAgent 函数
  const handleEditAgent = (agent: AgentConfig) => {
    // 如果是Manager Agent，确保只能有一个
    if (agent.role === "Team Manager" && !editingAgent) {
      toast({
        title: "Error",
        description: "Cannot add another Manager Agent",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setEditingAgent(agent);
    onAgentModalOpen();
  };

  // 获取现有 Agent 名称列表
  const existingAgentNames = useMemo(() => {
    return data.agents?.map((agent) => agent.name) || [];
  }, [data.agents]);

  // 获取现有任务名称列表
  const existingTaskNames = useMemo(() => {
    return data.tasks?.map((task) => task.name) || [];
  }, [data.tasks]);

  // 获取 ReactFlow 实例以访问所有节点和边
  const { getNodes, getEdges } = useReactFlow();

  // 获取可用变量
  const availableVariables = useMemo(() => {
    return getAvailableVariables(node.id, getNodes(), getEdges());
  }, [node.id, getNodes, getEdges]);

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel fontWeight="500" color="gray.700">
          {t("workflow.nodes.crewai.processType")}
        </FormLabel>
        <RadioGroup
          value={data.process_type}
          onChange={handleProcessTypeChange}
        >
          <HStack spacing={4}>
            <Radio
              value="sequential"
              colorScheme="blue"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
            >
              {t("workflow.nodes.crewai.sequential")}
            </Radio>
            <Radio
              value="hierarchical"
              colorScheme="blue"
              borderColor="gray.300"
              _hover={{ borderColor: "blue.400" }}
            >
              {t("workflow.nodes.crewai.hierarchical")}
            </Radio>
          </HStack>
        </RadioGroup>
      </FormControl>

      <FormControl>
        <FormLabel fontWeight="500" color="gray.700">
          {t("workflow.nodes.crewai.model")}
        </FormLabel>
        <ModelSelect
          models={models}
          control={control}
          name="model"
          value={data.llm_config?.model}
          onModelSelect={handleLLMSelect}
        />
      </FormControl>

      {data.process_type === "hierarchical" && (
        <FormControl>
          <FormLabel fontWeight="500" color="gray.700">
            {t("workflow.nodes.crewai.manager")}
          </FormLabel>
          <RadioGroup
            value={useCustomManager ? "custom" : "default"}
            onChange={(value) => {
              setUseCustomManager(value === "custom");
              if (value === "default") {
                onNodeDataChange(node.id, "manager_config", {
                  agent: {
                    id: uuidv4(),
                    ...DEFAULT_MANAGER,
                    allow_delegation: true,
                  },
                });
              }
            }}
          >
            <HStack spacing={4}>
              <Radio
                value="default"
                colorScheme="blue"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
              >
                {t("workflow.nodes.crewai.defaultManager")}
              </Radio>
              <Radio
                value="custom"
                colorScheme="blue"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
              >
                {t("workflow.nodes.crewai.customManager")}
              </Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
      )}

      <Box>
        <HStack justify="space-between" align="center" mb={3}>
          <HStack spacing={2}>
            <Box
              p={2}
              borderRadius="lg"
              bg="blue.50"
              color="blue.500"
              transition="all 0.2s"
              _hover={{ bg: "blue.100" }}
            >
              <FaRobot size="14px" />
            </Box>
            <Text fontSize="md" fontWeight="600" color="gray.700">
              {t("workflow.nodes.crewai.agents")}
            </Text>
            <Text fontSize="xs" color="gray.500">
              ({data.agents?.length || 0})
            </Text>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FaPlus size="12px" />}
            onClick={() => {
              setEditingAgent(undefined);
              onAgentModalOpen();
            }}
            colorScheme="blue"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-1px)",
              shadow: "sm",
            }}
          >
            {t("workflow.common.add")}
          </Button>
        </HStack>

        <VStack align="stretch" spacing={2}>
          {data.agents?.map((agent) => (
            <Box
              key={agent.id}
              p={3}
              bg="ui.inputbgcolor"
              borderRadius="lg"
              borderLeft="3px solid"
              borderLeftColor="blue.400"
              transition="all 0.2s"
              _hover={{
                bg: "gray.100",
                borderLeftColor: "blue.500",
                transform: "translateX(2px)",
                shadow: "sm",
              }}
            >
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="500" color="gray.700">
                    {agent.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {agent.role}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit agent"
                    icon={<FaEdit size="12px" />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEditAgent(agent)}
                    transition="all 0.2s"
                    _hover={{
                      transform: "scale(1.1)",
                    }}
                  />
                  <IconButton
                    aria-label="Delete agent"
                    icon={<FaTrash size="12px" />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteAgent(agent.id)}
                    transition="all 0.2s"
                    _hover={{
                      transform: "scale(1.1)",
                    }}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box>
        <HStack justify="space-between" align="center" mb={3}>
          <HStack spacing={2}>
            <Box
              p={2}
              borderRadius="lg"
              bg="blue.50"
              color="blue.500"
              transition="all 0.2s"
              _hover={{ bg: "blue.100" }}
            >
              <FaListAlt size="14px" />
            </Box>
            <Text fontSize="md" fontWeight="600" color="gray.700">
              {t("workflow.nodes.crewai.tasks")}
            </Text>
            <Text fontSize="xs" color="gray.500">
              ({data.tasks?.length || 0})
            </Text>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FaPlus size="12px" />}
            onClick={() => {
              setEditingTask(undefined);
              onTaskModalOpen();
            }}
            isDisabled={!canAddTask}
            colorScheme="blue"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-1px)",
              shadow: "sm",
            }}
          >
            {t("workflow.common.add")}
          </Button>
        </HStack>

        <VStack align="stretch" spacing={2}>
          {data.tasks?.map((task, index) => (
            <Box
              key={index}
              p={3}
              bg="ui.inputbgcolor"
              borderRadius="lg"
              borderLeft="3px solid"
              borderLeftColor="blue.400"
              transition="all 0.2s"
              _hover={{
                bg: "gray.100",
                borderLeftColor: "blue.500",
                transform: "translateX(2px)",
                shadow: "sm",
              }}
            >
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="500" color="gray.700">
                    {task.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={2}>
                    {task.description}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit task"
                    icon={<FaEdit size="12px" />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEditTask(task)}
                    transition="all 0.2s"
                    _hover={{
                      transform: "scale(1.1)",
                    }}
                  />
                  <IconButton
                    aria-label="Delete task"
                    icon={<FaTrash size="12px" />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleDeleteTask(index)}
                    transition="all 0.2s"
                    _hover={{
                      transform: "scale(1.1)",
                    }}
                  />
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Modals */}
      {isAgentModalOpen && (
        <AgentModal
          isOpen={isAgentModalOpen}
          onClose={onAgentModalClose}
          onSubmit={handleAddAgent}
          initialData={editingAgent}
          isManager={false}
          existingAgentNames={existingAgentNames}
          availableVariables={availableVariables}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={onTaskModalClose}
          onSubmit={handleAddTask}
          initialData={editingTask}
          agents={data.agents || []}
          existingTaskNames={existingTaskNames}
          availableVariables={availableVariables}
        />
      )}
    </VStack>
  );
};

export default CrewAINodeProperties;
