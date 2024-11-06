import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { getProfileUrlTavily } from "./tools";
import * as hub from "langchain/hub";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentExecutor, createReactAgent } from "langchain/agents";

export async function scrapeLinkedinProfile(
  profileUrl: string,
  mock: boolean = true
) {
  let data: any = {};
  if (mock) {
    const resp = await fetch(
      "https://gist.githubusercontent.com/emarco177/0d6a3f93dd06634d95e46a2782ed7490/raw/fad4d7a87e3e934ad52ba2a968bad9eb45128665/eden-marco.json"
    );
    data = await resp.json();
  } else {
    // todo: proxy curl
  }

  const keys = Object.keys(data);
  for (const key of keys) {
    const value = data[key];
    if (
      value === "" ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete data[key];
    }
  }

  return data;
}

export async function lookupLinkedinProfileByName(name: string) {
  const llm = new ChatOpenAI(
    {
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0,
    },
    {
      baseURL: process.env.OPENAI_BASE_URL,
    }
  );

  const template = new PromptTemplate({
    template:
      "given the full name {name_of_person} I want you to get it me a link to their Linkedin profile page. Your answer should contain only a URL",
    inputVariables: ["name_of_person"],
  });

  await getProfileUrlTavily("eden-marco");

  const tools = [
    tool(getProfileUrlTavily, {
      name: "Crawl Google 4 LinkedIn profile page",
      description: "Useful for when you need get the LinkedIn Page URL",
      schema: z.string().describe("The name of the person to search for"),
    }),
  ];

  const react_prompt = await hub.pull<PromptTemplate>("hwchase17/react");

  const agent = await createReactAgent({
    llm,
    tools,
    prompt: react_prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  const res = await agentExecutor.invoke({
    input: {
      input: await template.format({ name_of_person: name }),
    },
  });

  return res["output"];
}
