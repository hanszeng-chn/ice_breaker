import {
  lookupLinkedinProfileByName,
  scrapeLinkedinProfile,
} from "@/support/linkedin";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // get the name from the query params
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  const url = await lookupLinkedinProfileByName(name as string);
  const information = await scrapeLinkedinProfile(url, true);

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const promptTemplate = new PromptTemplate({
    template: `
      given the information {information} about a person from I want you to create:
      1. a short summary
      2. two interesting facts about them
    `,
    inputVariables: ["information"],
  });
  const parser = new StringOutputParser();
  const chain = promptTemplate.pipe(model).pipe(parser);

  const result = await chain.invoke({
    information,
  });

  return Response.json(result);
}
