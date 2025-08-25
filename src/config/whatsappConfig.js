import dotenv from "dotenv";

dotenv.config();

export const whatsappConfig = {
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  templateName: process.env.TEMPLATE_NAME,
  languageCode: process.env.LANGUAGE_CODE || "en",
  graphApiVersion: process.env.GRAPH_API_VERSION || "v21.0",
  concurrency: parseInt(process.env.CONCURRENCY || "5", 10),
  throttleMs: parseInt(process.env.THROTTLE_MS || "200", 10),
};

