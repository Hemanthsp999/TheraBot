# NOTE still wrok in progress
from tqdm.auto import tqdm
import fitz
# import pandas as pd
from spacy.lang.en import English

# English data
nlp = English()
nlp.add_pipe("sentencizer")

# df = pd.read_json(
# "hf://datasets/Amod/mental_health_counseling_conversations/combined_dataset.json", lines = True)

# df = pd.read_csv("/home/hexa/ai_bhrtya/backend/mental_health_dataset.csv")
path = "/home/hexa/ai_bhrtya/backend/mental_health_dataset.pdf"


class pdf_handler():
    def __init__(self):
        pass

    def text_formater(self, text: str) -> str:
        full = "".join(text)
        clean_txt = full.replace("\n", " ").strip()
        clean_txt = clean_txt.replace("mental_health_dataset", "").strip()
        return clean_txt

    def open_and_process(self, pdf: str) -> list[dict]:
        open_pdf = fitz.open(pdf)

        pdf_to_dict = []

        for page_no, context in tqdm(enumerate(open_pdf), desc="Processing pdf ..."):
            string = context.get_text()
            string = self.text_formater(string)
            pdf_to_dict.append({
                "page_no": page_no,
                "char_count": len(string),
                "word_count": len(string.split(" ")),
                "sentence_count": len(string.strip(". ")),
                "Token_size": len(string) / 4,
                "Text": string
            })

        return pdf_to_dict

    def _to_sentence(self, string: list[dict]) -> list[str]:

        for page in tqdm(string, desc="Processing data..."):
            page['sentence'] = list(nlp(page['Text']).sents)
            page['sentence'] = [str(sentence) for sentence in page['sentence']]
            page['str_sentence_count'] = len(page['sentence'])

        return string

    def custom_text_splitter(self, input_str: list[str], split_size: int, over_lap_chunks: int) -> list[list[str]]:
        # NOTE: Custom text splitter, I hope it works as expected!
        step_size = split_size - over_lap_chunks
        chunks = []

        for i in range(0, len(input_str), step_size):
            chunk = input_str[i: i + split_size]

            if len(chunk) > 0:
                chunks.append(chunk)
            else:
                return "No chunks"

        return chunk

    def _to_chunks(self, page_content: list[str], split_size: int, chunk_overlap: int) -> list[str]:

        for page in tqdm(page_content, desc="Processing chunks ..."):
            page['sentence_chunks'] = self.custom_text_splitter(
                page['sentence'], split_size=split_size, over_lap_chunks=chunk_overlap)

            page['no_sentence_chunks'] = len(page['sentence_chunks'])

        return page_content


txt_process = pdf_handler()
res = txt_process.open_and_process(pdf=path)

sen = txt_process._to_sentence(res)
chunks = txt_process._to_chunks(sen, split_size=150, chunk_overlap=50)

print(chunks)
