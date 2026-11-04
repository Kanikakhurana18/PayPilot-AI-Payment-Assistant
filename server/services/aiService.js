
import axios from "axios";

const callOpenRouter = async (messages) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return response.data.choices?.[0]?.message?.content?.trim();
};

// Existing dashboard AI insights — keep this functionality.
const generateAIInsights = async (businessData) => {
  try {
    const result = await callOpenRouter([
      {
        role: "system",
        content: `You are PayPilot, an AI financial assistant.

Analyze the provided invoice and payment data.

Return a concise dashboard insight with:
1. Business health in one short sentence.
2. The most important payment issue.
3. One practical recommended action.

Rules:
- Maximum 80 words.
- Use simple, professional language.
- Do not repeat all financial statistics.
- Do not use customer details unless necessary.
- Never invent financial figures.
- Return plain text without Markdown formatting.`,
      },
      {
        role: "user",
        content: `Analyze this business data:\n${JSON.stringify(
          businessData,
          null,
          2
        )}`,
      },
    ]);

    return result;
  } catch (error) {
    console.error(
      "AI insights service error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate AI insights");
  }
};

// New conversational AI functionality.
export const generateAIChatResponse = async (message, businessData) => {
  try {
    const result = await callOpenRouter([
      {
        role: "system",
        content: `You are PayPilot AI, a helpful financial assistant for small businesses and freelancers.

Answer the user's questions using the provided business data.

You can help with:
- Pending and overdue invoices.
- Completed payments and total revenue.
- Payment performance.
- Cash-flow analysis.
- Practical suggestions to collect payments faster.
- Identify customers who need payment reminders.
- Recommend which pending invoices should be followed up first.
- Generate polite payment reminder messages using actual invoice details.
- Suggest actions for overdue and upcoming invoices.

Rules:
- Keep normal answers within 40 words.
- For financial analysis, use a maximum of 5 short bullet points.
- Give no more than 3 practical recommendations.
- Use simple, friendly, professional language.
- Use Markdown formatting only when helpful.
- Never invent invoice numbers, amounts, dates, or statuses.
- If data is unavailable, clearly say so.
- Do not expose customer contact information.
- Never claim to have sent reminders or performed transactions.
- When asked to generate a payment reminder, use the actual customer name, invoice number, amount, and due date from business data.
- Generate reminder drafts only. Never claim that an email, SMS, or notification has been sent.`,
      },
      {
        role: "user",
        content: `Business data:\n${JSON.stringify(
          businessData,
          null,
          2
        )}\n\nUser question: ${message}`,
      },
    ]);

    return result;
  } catch (error) {
    console.error(
      "AI chat service error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate AI response");
  }
};

export default generateAIInsights;
