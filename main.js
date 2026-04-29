import "dotenv/config";
import readline from "readline";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { scrapeStatic, scrapeJS, extractData } from "./tools.js";

const llm = new ChatOpenAI({
  model: "openrouter/free",
  temperature: 0,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: { baseURL: "https://openrouter.ai/api/v1" },
});

class ScrapeStaticTool extends StructuredTool {
  name = "scrape_website";
  description = "Scrape a static website URL and return its text content.";
  schema = z.object({ url: z.string().describe("The URL to scrape") });
  async _call(input) { return scrapeStatic(input.url); }
}

class ScrapeJSTool extends StructuredTool {
  name = "scrape_js_website";
  description = "Scrape a JavaScript-heavy or dynamic website. Use only when user explicitly asks for JS rendering.";
  schema = z.object({ url: z.string().describe("The URL to scrape with JS rendering") });
  async _call(input) { return scrapeJS(input.url); }
}

class ExtractDataTool extends StructuredTool {
  name = "extract_data";
  description = "Extract data (emails, links, prices, tables, headings, images) from the last scraped page.";
  schema = z.object({ query: z.string().describe("What to extract, e.g. 'emails', 'links', 'prices'") });
  async _call(input) { return extractData(input.query); }
}

const tools = [new ScrapeStaticTool(), new ScrapeJSTool(), new ExtractDataTool()];

const prompt = ChatPromptTemplate.fromMessages([
  ["system", `You are a web scraping agent. You can:
1. Scrape any static website URL
2. Render JS-heavy sites on demand (only when user asks for JavaScript)
3. Extract data: emails, links, prices, tables, headings, images

Rules:
- Use scrape_website for normal pages
- Use scrape_js_website only when asked for JS rendering
- After scraping, offer to extract data`],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = createToolCallingAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools, verbose: false });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => {
  rl.question(q, (ans) => res(ans ?? ""));
});

process.stdin.on("end", () => { console.log("\nGoodbye!"); rl.close(); process.exit(0); });

console.log("=".repeat(50));
console.log("Web Scraping Agent");
console.log("=".repeat(50));
console.log("  scrape <url>         - Static scrape");
console.log("  scrape js <url>      - JS render scrape");
console.log("  extract <type>       - Extract data");
console.log("  quit                 - Exit");
console.log("=".repeat(50));

while (true) {
  let input;
  try {
    input = (await ask("\nYou: ")).trim();
  } catch {
    console.log("\nGoodbye!");
    break;
  }
  if (!input) continue;
  if (input.toLowerCase().match(/^(quit|exit|q)$/)) {
    console.log("Goodbye!");
    rl.close();
    break;
  }
  try {
    const result = await executor.invoke({ input });
    console.log(`\nAgent: ${result.output}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}
