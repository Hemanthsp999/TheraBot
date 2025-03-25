# Imports
import os
from unsloth import is_bfloat16_supported, FastLanguageModel
import torch
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from trl import SFTTrainer
from transformers import TrainingArguments, AutoTokenizer
from datasets import Dataset
import warnings

warnings.filterwarnings("ignore")
plt.style.use('ggplot')

# Load Tokenizer
tokenizer = AutoTokenizer.from_pretrained("unsloth/Llama-3.2-1B-bnb-4bit")

# Disable Triton optimization for CPU training
os.environ["DISABLE_TORCH_TRITON"] = "1"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"  # ✅ Forces PyTorch to ignore GPU


class dataset_handler():
    def __init__(self):
        self.data = pd.read_json(
            "hf://datasets/Amod/mental_health_counseling_conversations/combined_dataset.json", lines=True
        )

    def exploratory_data_analysis(self):
        # Add Context Length Column
        self.data["Context_length"] = self.data["Context"].apply(len)

        # Debugging Output
        print(self.data[["Context", "Context_length"]])

        # Filter Context Length
        filtered_data = self.data[self.data["Context_length"] <= 1500]

        # Filter Response Length
        filtered_data = filtered_data[filtered_data["Response"].apply(len) <= 4000]

        # Plot Context Length Distribution
        plt.figure(figsize=(10, 3))
        sns.histplot(filtered_data["Context_length"], bins=50, kde=True)
        plt.title("Distribution of Context Length")
        plt.xlabel("Length of Context")
        plt.ylabel("Frequency")
        plt.savefig('Context.png')

        # Plot Response Length Distribution
        plt.figure(figsize=(10, 3))
        sns.histplot(filtered_data["Response"].apply(len), bins=50, kde=True, color='teal')
        plt.title("Distribution of Response Length")
        plt.xlabel("Length of Response")
        plt.ylabel("Frequency")
        plt.savefig('Response.png')

        return filtered_data


class fine_tune_dataset():
    def __init__(self, filtered_data):
        self.max_seq_length = 5020
        self.model_name = "unsloth/Llama-3.2-1B-bnb-4bit"
        # self.load_in_4bit = True
        self.dtype = torch.float16

        # Define Prompt Template
        self.data_prompt = """Analyze the provided text from a mental health perspective.
            ### Input:
            {}
            ### Response:
            {}"""

        self.EOS_TOKEN = tokenizer.eos_token
        self.training_data = Dataset.from_pandas(filtered_data)
        self.training_data = self.training_data.map(self.formatting_prompt, batched=True)
        self.text = "I'm going through some things with my feelings and myself. I barely sleep..."

    def fine_tune(self):
        # ✅ Load quantized model properly
        model, tokenizer = FastLanguageModel.from_pretrained(
            self.model_name,
            max_seq_length=self.max_seq_length,
            load_in_4bit=False,
            dtype=self.dtype
        )

    # ✅ Attach LoRA adapters (Required for fine-tuning)
        model = FastLanguageModel.get_peft_model(
            model,
            r=16,  # Rank of LoRA
            lora_alpha=16,
            lora_dropout=0.05,
            target_modules=["q_proj", "k_proj", "v_proj",
                            "up_proj", "down_proj", "o_proj", "gate_proj"],  # Apply LoRA to these layers
            use_rslora=True,  # ✅ Enables Resilient LoRA
            use_gradient_checkpointing="unsloth",
            random_state=32,
            loftq_config=None,
        )

    # ✅ Save model **AFTER** attaching LoRA
        self.model = model.to("cpu")

        print(model.print_trainable_parameters())  # ✅ Debugging: Print trainable parameters

    def formatting_prompt(self, examples):
        inputs = examples["Context"]
        outputs = examples["Response"]
        texts = []
        for input_, output in zip(inputs, outputs):
            text = self.data_prompt.format(input_, output) + self.EOS_TOKEN
            texts.append(text)
        return {"text": texts}

    def train(self):
        trainer = SFTTrainer(
            model=self.model,  # ✅ Use self.model
            tokenizer=tokenizer,
            train_dataset=self.training_data,
            dataset_text_field="text",
            max_seq_length=self.max_seq_length,
            dataset_num_proc=1,  # reduce for cpu
            packing=False,
            args=TrainingArguments(
                learning_rate=3e-4,
                lr_scheduler_type="linear",
                per_device_train_batch_size=8,
                gradient_accumulation_steps=16,
                num_train_epochs=40,
                # fp16=not is_bfloat16_supported(),
                # bf16=is_bfloat16_supported(),
                fp16=False,
                bf16=False,
                logging_steps=1,
                optim="adamw_torch",
                weight_decay=0.01,
                warmup_steps=10,
                output_dir="output",
                seed=0,
                no_cuda=True
            ),
        )

        trainer.train()

        # Ensure directory exists before saving
        save_path = "model/1B_finetuned_llama3.2"
        os.makedirs(save_path, exist_ok=True)

        self.model.save_pretrained(save_path)
        tokenizer.save_pretrained(save_path)


df = dataset_handler()
filtered_data = df.exploratory_data_analysis()

fineTune = fine_tune_dataset(filtered_data)
fineTune.fine_tune()
fineTune.train()
