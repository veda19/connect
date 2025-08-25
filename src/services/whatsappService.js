import fetch from "node-fetch";
import { whatsappConfig } from "../config/whatsappConfig.js";

export async function sendTemplateMessage(to, message) {
  const url = `https://graph.facebook.com/${whatsappConfig.graphApiVersion}/${whatsappConfig.phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: whatsappConfig.templateName,
      language: { code: whatsappConfig.languageCode },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: message }
          ]
        }
      ]
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${whatsappConfig.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send: ${errText}`);
  }

  return res.json();
}
