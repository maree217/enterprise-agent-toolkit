import json
from typing import Any, Literal

import zhipuai
from langchain.tools import StructuredTool
from pydantic import BaseModel, Field

from app.core.tools.response_formatter import format_tool_response
from app.core.tools.tool_manager import get_tool_provider_credential_value

ASSISTANT_IDS = {
    "data_analysis": "65a265419d72d299a9230616",
    "complex_flowchart": "664dd7bd5bb3a13ba0f81668",
    "mind_map": "664e0cade018d633146de0d2",
    "prompt_engineer": "6654898292788e88ce9e7f4c",
    "ai_drawing": "66437ef3d920bdc5c60f338e",
    "ai_search": "659e54b1b8006379b4b2abd6",
}


class QingyanAssistantInput(BaseModel):
    """Input for the Qingyan Assistant tool."""

    query: str = Field(description="User's query or message")
    assistant_type: Literal[
        "data_analysis",
        "complex_flowchart",
        "mind_map",
        "prompt_engineer",
        "ai_drawing",
        "ai_search",
    ] = Field(description="Type of assistant to use", default="ai_search")


def process_response(response: Any) -> dict[str, Any]:
    processed = {"role": "", "content": "", "tool_calls": []}

    if hasattr(response, "choices") and response.choices:
        choice = response.choices[0]
        if hasattr(choice, "delta"):
            delta = choice.delta
            if hasattr(delta, "role"):
                processed["role"] = delta.role
            if hasattr(delta, "content"):
                processed["content"] = delta.content
            if hasattr(delta, "tool_calls"):
                for tool_call in delta.tool_calls or []:
                    if tool_call is None:
                        continue
                    processed_tool_call = {
                        "type": getattr(tool_call, "type", ""),
                        "input": "",
                        "outputs": [],
                    }
                    if hasattr(tool_call, processed_tool_call["type"]):
                        tool_call_attr = getattr(tool_call, processed_tool_call["type"])
                        processed_tool_call["input"] = getattr(
                            tool_call_attr, "input", ""
                        )
                        if processed_tool_call["type"] == "function":
                            processed_tool_call["name"] = getattr(
                                tool_call.function, "name", ""
                            )
                            processed_tool_call["arguments"] = getattr(
                                tool_call.function, "arguments", ""
                            )
                        elif processed_tool_call["type"] in [
                            "web_browser",
                            "drawing_tool",
                            "code_interpreter",
                        ]:
                            outputs = getattr(tool_call_attr, "outputs", [])
                            processed_tool_call["outputs"] = process_outputs(outputs)

                    processed["tool_calls"].append(processed_tool_call)

    return processed


def process_outputs(outputs):
    processed_outputs = []
    for output in outputs or []:
        if hasattr(output, "image"):
            processed_outputs.append({"image": output.image})
        elif hasattr(output, "content"):
            try:
                content = json.loads(output.content)
                processed_outputs.append(content)
            except json.JSONDecodeError:
                processed_outputs.append({"content": output.content})
        elif isinstance(output, dict):
            processed_outputs.append(output)
        elif isinstance(output, str):
            try:
                processed_outputs.append(json.loads(output))
            except json.JSONDecodeError:
                processed_outputs.append({"text": output})
        else:
            processed_outputs.append({"data": str(output)})
    return processed_outputs


def qingyan_assistant_query(query: str, assistant_type: str = "ai_search") -> str:
    """
    Invoke Qingyan Assistant API
    """
    api_key = get_tool_provider_credential_value("zhipuai", "ZHIPUAI_API_KEY")

    if not api_key:
        return format_tool_response(
            False, error="Qingyan Assistant API Key is not set."
        )

    try:
        url = "https://open.bigmodel.cn/api/paas/v4"
        client = zhipuai(api_key=api_key, base_url=url)

        assistant_id = ASSISTANT_IDS.get(assistant_type, ASSISTANT_IDS["ai_search"])

        response = client.assistant.conversation(
            assistant_id=assistant_id,
            conversation_id=None,
            model="glm-4-assistant",
            messages=[{"role": "user", "content": [{"type": "text", "text": query}]}],
            stream=True,
            attachments=None,
            metadata=None,
        )

        full_response: list[dict[str, Any]] = []
        for chunk in response:
            processed = process_response(chunk)
            if (
                processed.get("role")
                or processed.get("content")
                or processed.get("tool_calls")
            ):
                full_response.append(processed)

        # Combine all responses
        combined_response = {"assistant_response": "", "tool_calls": []}

        for resp in full_response:
            if resp["role"] == "assistant":
                combined_response["assistant_response"] += resp["content"]
            elif resp["role"] == "tool":
                combined_response["tool_calls"].extend(resp["tool_calls"])

        print("Final combined response:", combined_response)
        return format_tool_response(True, combined_response)

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return format_tool_response(
            False, error=f"Qingyan Assistant API request failed: {str(e)}"
        )


qingyan_assistant = StructuredTool.from_function(
    func=qingyan_assistant_query,
    name="Qingyan Assistant",
    description="A versatile AI assistant that can help with various tasks including data analysis, creating flowcharts, mind maps, prompt engineering, AI drawing, and AI search.",
    args_schema=QingyanAssistantInput,
    return_direct=False,
)
