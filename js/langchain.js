
// import { OpenAI } from "langchain/llms/openai";
import { VectorStoreRetrieverMemory } from "langchain/memory";
// import { LLMChain } from "langchain/chains";
// import { PromptTemplate } from "langchain/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings(openAIApiKey="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"));
const memory = new VectorStoreRetrieverMemory({
  // 1 is how many documents to return, you might want to return more, eg. 4
  vectorStoreRetriever: vectorStore.asRetriever(1),
  memoryKey: "history",
});

// First let's save some information to memory, as it would happen when
// used inside a chain.
await memory.saveContext(
  { input: "My favorite food is pizza" },
  { output: "thats good to know" }
);
await memory.saveContext(
  { input: "My favorite sport is soccer" },
  { output: "..." }
);
await memory.saveContext({ input: "I don't the Celtics" }, { output: "ok" });

// Now let's use the memory to retrieve the information we saved.
console.log(
  await memory.loadMemoryVariables({ prompt: "what sport should i watch?" })
);