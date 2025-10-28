type LangchainChain = {
  invoke(input: { mensagem: string }): Promise<unknown>;
};

let cachedChain: LangchainChain | null = null;
let initializationError: Error | null = null;

async function buildChain(): Promise<LangchainChain> {
  try {
    const [{ ChatOllama }, { ChatPromptTemplate }, { RunnableSequence }] =
      await Promise.all([
        import("@langchain/community/chat_models/ollama"),
        import("langchain/prompts"),
        import("langchain/runnables"),
      ]);

    const model: any = new ChatOllama({
      model: process.env.OLLAMA_MODEL ?? "gemma3:1b",
    });

    const prompt: any = ChatPromptTemplate.fromMessages([
      ["system", "Voce e um assistente direto e claro."],
      ["human", "{mensagem}"],
    ]);

    const chain = RunnableSequence.from([prompt, model]) as unknown as LangchainChain;
    cachedChain = chain as LangchainChain;
    initializationError = null;
    return chain;
  } catch (error) {
    const normalized =
      error instanceof Error ? error : new Error(String(error ?? "unknown error"));
    initializationError = normalized;
    console.warn(
      "[Langchain] Failed to initialize optional Langchain integration:",
      normalized.message,
    );
    throw normalized;
  }
}

export async function getLangchainChain(): Promise<LangchainChain> {
  if (cachedChain) return cachedChain;
  if (initializationError) throw initializationError;
  return buildChain();
}

export async function runLangchainPrompt(mensagem: string) {
  const chain = await getLangchainChain();
  return chain.invoke({ mensagem });
}
