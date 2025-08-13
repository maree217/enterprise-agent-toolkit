import { VStack } from "@chakra-ui/react";
import type React from "react";
import { useCallback, useState, useEffect } from "react";

import { VariableReference } from "../../FlowVis/variableSystem";
import VariableSelector from "../../Common/VariableSelector";

interface AnswerPropertiesProps {
  node: any;
  onNodeDataChange: (nodeId: string, key: string, value: any) => void;
  availableVariables: VariableReference[];
}

const AnswerProperties: React.FC<AnswerPropertiesProps> = ({
  node,
  onNodeDataChange,
  availableVariables,
}) => {
  const [answerInput, setAnswerInput] = useState("");

  useEffect(() => {
    if (node && node.data.answer !== undefined) {
      setAnswerInput(node.data.answer || "");
    }
  }, [node]);

  const handleAnswerChange = useCallback(
    (value: string) => {
      setAnswerInput(value);
      onNodeDataChange(node.id, "answer", value);
    },
    [node.id, onNodeDataChange],
  );



  return (
    <VStack align="stretch" spacing={4}>
      <VariableSelector
        label="Answer"
        value={answerInput}
        onChange={handleAnswerChange}
        placeholder="Write your answer here. Use 'shift + {' to insert variables."
        availableVariables={availableVariables}
        minHeight="120px"
      />
    </VStack>
  );
};

export default AnswerProperties;
