from typing import TypedDict, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
# from deepseek import DeepSeek
from pydantic import BaseModel
import os

load_dotenv()

my_Key = os.getenv("GOOGLE_API_KEY")


class PatientData(BaseModel):
    """Data model for patient information retrieved from DB"""
    patient_id: str
    patient_name: str
    patient_age: str
    patient_gender: str
    health_history: str
    family_history: str
    curr_medications: str
    present_issues: str
    error: Optional[str] = None


class GraphState(TypedDict):
    """State for the LangGraph workflow"""
    patient_data: PatientData  # holds patient health history
    summary: Optional[str]  # returns patient health summary
    error: Optional[str]


def generate_summary(state: GraphState) -> Dict:
    """Generate summary using DeepSeek LLM"""
    if state.get("error"):
        return state

    patient = state["patient_data"]
    # llm = DeepSeek(model="deepseek-chat")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.5,
        max_tokens=None,
        timeout=None,
        max_retries=5,
    )

    prompt = f"""
    You are a medical assistant preparing a patient summary for a therapist.
    Please provide a concise yet comprehensive summary of the patient's health history.

    Patient Information:
        - Name: {patient.patient_name}
        - Age: {patient.patient_age}
        - Gender: {patient.patient_gender}

    Health History: {patient.health_history}
    Present Medications: {patient.curr_medications}
    Family History: {patient.family_history}
    Present Health Issues: {patient.present_issues}

    Please organize the summary with these sections:
        1. Patient Overview
        2. Key Medical History
        3. Current Treatment Plan
        4. Potential Therapy Considerations
    
    Write professionally but in a way that's easy to quickly scan.
    Include relevant connections between conditions and treatments.
    Highlight any important patterns or concerns for therapy.
    """

    try:
        response = llm.invoke(prompt)
        summary = response.content if hasattr(response, "content") else str(response)
        return {"summary": summary}
    except Exception as e:
        print(f"Exception: {str(e)}")
        return {"error": f"LLM error: {str(e)}"}


def create_workflow() -> StateGraph:
    """Create and configure the LangGraph workflow"""
    workflow = StateGraph(GraphState)

    # Add nodes to the workflow
    workflow.add_node("generate_summary", generate_summary)

    # Set entry point
    workflow.set_entry_point("generate_summary")

    # Define the end point
    workflow.add_edge("generate_summary", END)

    return workflow.compile()


# Initialize the workflow
app = create_workflow()


def summarize_patient_data(patient_data: Dict) -> Dict:
    """
    Main function to summarize patient data
    Args:
        patient_data: Dictionary containing patient data from server
    Returns:
        Dictionary with summary or error message
    """
    try:
        # Validate and convert input data
        patient = PatientData(**patient_data)

        # Run the workflow
        result = app.invoke({"patient_data": patient})

        if result.get("error"):
            return {"status": "error", "message": result["error"]}

        return {
            # "status": "success",
            "summary": result["summary"],
            # "patient_id": patient.patient_id
        }
    except Exception as e:
        return {"status": "error", "message": f"Processing error: {str(e)}"}


