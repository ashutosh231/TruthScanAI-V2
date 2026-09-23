import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { TextractClient } from "@aws-sdk/client-textract";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const credentials =
  accessKeyId && secretAccessKey
    ? {
        accessKeyId,
        secretAccessKey,
      }
    : undefined;

export const bedrockClient = new BedrockRuntimeClient({
  region,
  credentials,
});

export const textractClient = new TextractClient({
  region,
  credentials,
});

export const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || "deepseek.v3.2";

