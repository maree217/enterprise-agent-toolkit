from ...state import WorkflowState


def InputNode(state: WorkflowState):
    if "node_outputs" not in state:
        state["node_outputs"] = {}
    human_message = None
    if isinstance(state, list):
        human_message = state[-1].content
    elif messages := state.get("input_msg", []):
        human_message = messages[-1].content
    inputnode_outputs = {"start": {"query": human_message}}
    state["node_outputs"] = inputnode_outputs
    return state
