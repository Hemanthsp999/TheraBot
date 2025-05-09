from tqdm.auto import tqdm
import re
import fitz
from spacy.lang.en import English

file_path = "/home/hexa/ai_bhrtya/backend/chatbot_model/mental_dataset.pdf"  # dataset path


class pdf_handler():
    def __init__(self):
        self.nlp = English()
        self.nlp.add_pipe("sentencizer")
        pass

    def text_formater(self, text: str) -> str:
        full = "".join(text)
        clean_txt = full.replace("\n", " ").strip()
        clean_txt = clean_txt.replace("mental_health_dataset", "").strip()
        return clean_txt

    def open_and_process(self, pdf: str) -> dict[str]:
        try:
            open_pdf = fitz.open(pdf)
        except Exception as e:
            print(f"Error while opening file. More details: {e}")
            return []

        pdf_to_dict = []

        for page_no, context in tqdm(enumerate(open_pdf), total=len(open_pdf), desc="Processing pdf ..."):
            string = context.get_text()
            string = self.text_formater(string)
            pdf_to_dict.append({
                "page_no": page_no,
                "char_count": len(string),
                "word_count": len(string.split(" ")),
                "sentence_count": len(string.strip(". ")),
                "Token_size": len(string) // 4,
                "Text": string
            })

        return pdf_to_dict

    def _to_sentence(self, string: list[dict]) -> list[str]:

        for page in tqdm(string, desc="Processing data..."):
            page['sentence'] = list(self.nlp(page['Text']).sents)
            page['sentence'] = [str(sentence) for sentence in page['sentence']]
            page['str_sentence_count'] = len(page['sentence'])

        return string

    def __custom_text_slicer(self, input_str: list[str], split_size: int, over_lap_chunks: int) -> list[list[str]]:
        # NOTE: Custom text splitter, I hope it works as expected!
        step_size = split_size - over_lap_chunks
        chunks = []

        for i in range(0, len(input_str), step_size):
            chunk = input_str[i: i + split_size]

            if len(chunk) == split_size:
                chunks.append(chunk)

        return chunks

    def custom_text_splitter(self, page_content: list[str], split_size: int, chunk_overlap: int) -> list[str]:

        for page in tqdm(page_content, desc="Processing chunks ..."):
            if "sentence" in page and len(page) > 0:
                page['sentence_chunks'] = self.__custom_text_slicer(
                    page['sentence'], split_size=split_size, over_lap_chunks=chunk_overlap)
                page['no_sentence_chunks'] = len(page['sentence_chunks'])
            else:
                page['sentence_chunks'] = []

        return page_content

    def structure_chunks(self, chunks: list[str]) -> str:
        refactored_chunks = []

        for sentence in tqdm(chunks, desc="Processing structure_to_chunks ..."):
            for word in sentence['sentence_chunks']:
                chunk_list = {}
                chunk_list['page_no'] = sentence.get('page_no')
                joined_chunks = " ".join(word).strip()

                joined_chunks = re.sub(r'\.([A-Z|0-9])', r'. \1', joined_chunks)

                chunk_list['sentence_chunks'] = joined_chunks
                chunk_list['chunk_char_count'] = len(joined_chunks)
                chunk_list['chunk_word_count'] = len(joined_chunks.split(" "))
                chunk_list['chunk_token_count'] = len(joined_chunks) // 4

                refactored_chunks.append(chunk_list)

        return refactored_chunks


