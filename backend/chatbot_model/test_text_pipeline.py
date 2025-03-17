import pytest
from TextPipeline import pdf_handler


@pytest.fixture
def text_pipeline():
    """Fixture to create an instance of pdf_handler."""
    return pdf_handler()


def test_text_formatter(text_pipeline):
    """Test text formatting to ensure newlines are removed and text is cleaned."""
    sample_text = "Hello\nWorld!   mental_health_dataset   "
    formatted_text = text_pipeline.text_formater(sample_text)
    assert formatted_text == "Hello World!", "Text formatting failed"


def test_custom_text_slicer(text_pipeline):
    """Test chunking with overlap to ensure expected chunk generation."""
    input_text = ["Sentence1", "Sentence2", "Sentence3", "Sentence4", "Sentence5"]
    split_size = 3
    overlap = 1
    expected_output = [
        ["Sentence1", "Sentence2", "Sentence3"],
        ["Sentence3", "Sentence4", "Sentence5"]
    ]
    chunks = text_pipeline._pdf_handler__custom_text_slicer(input_text, split_size, overlap)
    assert chunks == expected_output, f"Expected {expected_output}, but got {chunks}"


def test_custom_text_splitter(text_pipeline):
    """Test the full text splitting process."""
    sample_page_content = [
        {"page_no": 1, "sentence": ["Sentence1", "Sentence2",
                                    "Sentence3", "Sentence4", "Sentence5"]}
    ]
    split_size = 3
    chunk_overlap = 1

    result = text_pipeline.custom_text_splitter(sample_page_content, split_size, chunk_overlap)

    expected_output = [
        ["Sentence1", "Sentence2", "Sentence3"],
        ["Sentence3", "Sentence4", "Sentence5"]
    ]

    assert result[0][
        "sentence_chunks"] == expected_output, f"Chunking failed. Expected {expected_output}, got {result[0]['sentence_chunks']}"


def test_structure_chunks(text_pipeline):
    """Test that structured chunks have the expected format and values."""
    sample_chunks = [
        {"page_no": 1, "sentence_chunks": [["Hello", "World"], ["This", "is", "Python"]]}
    ]

    structured_chunks = text_pipeline.structure_chunks(sample_chunks)

    assert isinstance(structured_chunks, list), "Structured chunks should return a list"
    assert len(structured_chunks) == 2, "Expected two structured chunks"
    assert structured_chunks[0]["sentence_chunks"] == "Hello World", "Unexpected chunk content"
    assert structured_chunks[1]["sentence_chunks"] == "This is Python", "Unexpected chunk content"


def test_open_and_process_invalid_pdf(text_pipeline):
    """Test handling of an invalid PDF file."""
    result = text_pipeline.open_and_process("invalid_file.pdf")
    assert result == [], "Function should return an empty list on failure"


if __name__ == "__main__":
    pytest.main()

