from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig

from app.core.model_providers.model_provider_manager import \
    model_provider_manager
from app.core.workflow.utils.db_utils import get_model_info

from ...state import (ReturnWorkflowState, WorkflowState, parse_variables,
                      update_node_outputs)

PARAMETER_EXTRACTOR_SYSTEM_PROMPT = """You are a helpful assistant tasked with extracting structured information based on specific criteria provided. Follow the guidelines below to ensure consistency and accuracy.

### Task
Always extract parameters from the input text according to the provided schema. Your output must be a valid JSON object that matches the schema requirements.

### Instructions
Some additional information is provided below. Always adhere to these instructions as closely as possible:
<instruction>
{instruction}
</instruction>

Steps:
1. Review the input text carefully and understand the schema requirements
2. Extract relevant parameters based on the schema definition
3. Ensure extracted values match the required data types
4. Generate a well-formatted JSON output
5. Do not include any explanations or additional text in the output
6. Return ONLY the JSON object, no XML tags in the output

### Structure
Here is the structure of the expected output, you MUST always follow this output structure:
{{
    "parameter_name1": "value matching schema type",
    "parameter_name2": "value matching schema type",
    ...
}}
The output must:
1. Contain all required parameters defined in the schema
2. Match the exact data types specified in the schema
3. Be a valid JSON object without any additional text or XML tags
4. Follow the exact parameter names from the schema

### Example Output
To illustrate, here are some examples of valid parameter extraction:
<example>
Input: {{"text": "Book a flight from NYC to London on July 15th", "schema": {{"departure": {{"type": "string", "required": true, "description": "The departure city"}}, "destination": {{"type": "string", "required": true, "description": "The destination city"}}, "date": {{"type": "string", "required": true, "description": "The date of the flight"}}}}}}
Output: {{"departure": "NYC", "destination": "London", "date": "July 15th"}}

Input: {{"text": "Room temperature is 23.5°C with 45 percent humidity", "schema": {{"temperature": {{"type": "number", "required": true, "description": "The temperature in degrees Celsius"}}, "humidity": {{"type": "number", "required": true, "description": "The humidity in percent"}}}}}}
Output: {{"temperature": 23.5, "humidity": 45}}
</example>

### Final Output
Produce well-formatted JSON object without XML tags, strictly following the schema structure.
"""

PARAMETER_EXTRACTOR_USER_PROMPT = """Extract structured parameters from the input text inside <text></text> XML tags according to the schema inside <schema></schema> XML tags.

### Input Text
<text>
{input_text}
</text>

### Parameter Schema
<schema>
{parameter_schema}
</schema>

### Task
1. Extract all required parameters from the input text
2. Format them according to the schema definition
3. Return only a valid JSON object containing the extracted parameters
4. Do not include any explanations or XML tags in the output
"""


class ParameterExtractorNode:
    """Parameter Extractor Node for extracting structured parameters from text"""

    def __init__(
        self,
        node_id: str,
        model_name: str,
        parameter_schema: list[dict],
        input: str = "",
        instruction: str = "",
    ):
        self.node_id = node_id
        self.parameter_schema = self._convert_schema_format(parameter_schema)
        self.input = input
        self.model_info = get_model_info(model_name)
        self.instruction = instruction

    def _convert_schema_format(self, schema_list: list[dict]) -> dict:
        """Convert schema from list format to single object format

        Args:
            schema_list: List of schema objects from frontend
            e.g. [
                {"name": {"type": "str", "required": true, "description": "名字"}},
                {"age": {"type": "str", "required": true, "description": "年龄"}}
            ]

        Returns:
            Combined schema object
            e.g. {
                "name": {"type": "str", "required": true, "description": "名字"},
                "age": {"type": "str", "required": true, "description": "年龄"}
            }
        """
        combined_schema = {}
        for item in schema_list:
            combined_schema.update(item)
        return combined_schema

    async def work(
        self, state: WorkflowState, config: RunnableConfig
    ) -> ReturnWorkflowState:
        """Execute parameter extraction work"""
        if "node_outputs" not in state:
            state["node_outputs"] = {}

        # Parse input variable if exists
        input_text = (
            parse_variables(self.input, state["node_outputs"]) if self.input else None
        )

        parsed_instruction = (
            parse_variables(self.instruction, state["node_outputs"])
            if self.instruction
            else None
        )
        if not input_text and state.get("messages"):
            input_text = state["messages"][-1].content

        # Initialize LLM with provider info
        llm = model_provider_manager.init_model(
            provider_name=self.model_info["provider_name"],
            model=self.model_info["ai_model_name"],
            temperature=0.1,
            api_key=self.model_info["api_key"],
            base_url=self.model_info["base_url"],
        )

        # Prepare input in JSON format
        input_json = {
            "input_text": input_text,
            "parameter_schema": self.parameter_schema,
            "instruction": parsed_instruction,
        }

        # Prepare prompt and get extraction result
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", PARAMETER_EXTRACTOR_SYSTEM_PROMPT),
                ("user", PARAMETER_EXTRACTOR_USER_PROMPT),
            ]
        )
        outputparser = JsonOutputParser()
        chain = prompt | llm | outputparser

        result = await chain.ainvoke(input_json)

        # Update node outputs
        new_output = {self.node_id: result}
        state["node_outputs"] = update_node_outputs(state["node_outputs"], new_output)

        return_state: ReturnWorkflowState = {
            "node_outputs": state["node_outputs"],
        }

        return return_state
