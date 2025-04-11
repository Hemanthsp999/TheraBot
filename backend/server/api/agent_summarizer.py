from pydantic import BaseModel, Field
from pydantic_ai.models.mistral import MistralModel


class PatientHealthInfoSchema(BaseModel):
    user_id: int
    health_history: str
    curr_medications: str
    family_history: str
    present_health_issues: str


class PatientSummary(BaseModel):
    summary: str = Field(description="Concise health summary of the patient")


# Prompt template
SUMMARY_PROMPT_TEMPLATE = """
You are a helpful medical assistant summarizing a patient's mental health history for a therapist.

Based on the following patient data:
- Health History: {health_history}
- Current Medications: {curr_medications}
- Family History: {family_history}
- Present Health Issues: {present_health_issues}

Generate a concise summary highlighting:
- Key historical concerns
- Current issues and medications
- Family history impact
- Any points for therapist attention

Summary:
"""


def generate_patient_summary(patient_info: PatientHealthInfoSchema) -> PatientSummary:
    prompt = SUMMARY_PROMPT_TEMPLATE.format(
        health_history=patient_info.health_history,
        curr_medications=patient_info.curr_medications,
        family_history=patient_info.family_history,
        present_health_issues=patient_info.present_health_issues,
    )

    # Set up the model with schema output
    model = MistralModel(
        provider="ollama",  # make sure Ollama is running with Mistral
        model_name="mistral-small-latest",
        # temperature=0.7,
        json_mode_schema_prompt="Answer in JSON Object, respect the format:\n```\n{schema}\n```\n"
    )

    # Run the model using the AIModelRunner
    result = model(PatientSummary, prompt)

    return result
