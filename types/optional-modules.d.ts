declare module "@langchain/community/chat_models/ollama" {
  export class ChatOllama {
    constructor(options: Record<string, unknown>);
    invoke(input: unknown): Promise<unknown>;
  }
}

declare module "langchain/prompts" {
  export class ChatPromptTemplate {
    static fromMessages(messages: Array<[string, string]>): ChatPromptTemplate;
  }
}

declare module "langchain/runnables" {
  export class RunnableSequence<TInput = unknown, TOutput = unknown> {
    static from(steps: unknown[]): RunnableSequence;
    invoke(input: TInput): Promise<TOutput>;
  }
}
