import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/runnables";

const model = new ChatOllama({ model: "gemma3:1b" });
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Você é um assistente direto e claro."],
  ["human", "{mensagem}"]
]);

export const chain = RunnableSequence.from([prompt, model]);
