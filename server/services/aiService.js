import axios from "axios";

const callOpenRouter = async (messages) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

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

  const content =
    response.data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  return content;
};

const generateAIInsights = async (businessData) => {
  try {
    return await callOpenRouter([
      {
        role: "system",
        content: `You are PayPilot, an AI financial assistant for small businesses.
        Analyze the provided invoice and payment data.
        
        Return a concise dashboard insight with:
        1. Business health in one short sentence.
        2. The most important payment issue.
        3. One practical recommended action.
        
        Rules:
        - Maximum 80 words.
        - Use simple, professional language.
        - Do not repeat all financial statistics.
        - Do not invent financial figures.
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
  } catch (error) {
    console.error(
      "AI insights service error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate AI insights.");
  }
};

export const generateAIChatResponse = async (
  message,
  businessData
) => {
  try {
    return await callOpenRouter([
      {
        role: "system",
        content: `You are PayPilot AI, a helpful financial assistant for small businesses and freelancers.
        Answer using only the supplied business data.
        
        You can help with:
        - Pending and overdue invoices.
        - Completed payments and revenue.
        - Customer-wise outstanding balances.
        - Payment performance.
        - Cash-flow analysis.
        - Payment recovery recommendations.
        - Identifying customers who need follow-up.
        - Generating personalized payment reminder drafts.
        
        Rules:
        - Keep normal answers within 40 words.
        - For financial analysis, use a maximum of 5 short bullet points.
        - Give no more than 3-4 recommendations.
        - Use simple, professional language.
        - Never invent invoice numbers, amounts, dates, or statuses.
        - If data is unavailable, clearly say so.
        - Do not expose customer contact information.
        - Never claim to have sent a reminder or performed a transaction.
        - Generate reminder drafts only.
        - Use actual invoice details when generating reminders.`,
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
  } catch (error) {
    console.error(
      "AI chat service error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate AI response.");
  }
};


export const generateAIRecoveryPlan = async (businessData) => {
  try {
    return await callOpenRouter([
      {
        role: "system",
        content: `You are PayPilot Recovery Copilot, an AI payment recovery advisor for small businesses.

Analyze the supplied real business payment data and create a concise recovery strategy.

Use exactly these two sections:

**Overall Assessment**
- Summarize total outstanding amount, number of pending invoices, and overdue situation in 1-2 short sentences.

**Recommended Actions**
- Prioritize overdue invoices first.
- Mention customers who need immediate follow-up.
- For invoices due today, recommend contacting the customer today.
- For upcoming invoices, recommend a friendly reminder before the due date.
- Include the customer's name, invoice amount, and relevant due date.
- Keep each recommendation to one short sentence.

Rules:
- Maximum 90 words.
- Do not repeat the complete invoice list.
- Do not add a separate "Next Step" section.
- Never invent amounts, dates, customer details, or payment history.
- Do not label customers risky or unreliable without evidence.
- Never claim that reminders have been sent or payments collected.
- If there are no unpaid invoices, provide a short positive assessment.
- Use simple, professional language.
- Return plain text with short headings and bullets.`,
      },
      {
        role: "user",
        content: `Analyze this actual business payment data and create a recovery plan:\n${JSON.stringify(
          {
            totalOutstanding: businessData.totalOutstanding,
            totalOverdue: businessData.totalOverdue,
            overdueInvoiceCount: businessData.overdueInvoiceCount,
            pendingInvoiceCount: businessData.pendingInvoiceCount,
            recoveryInvoices: businessData.recoveryInvoices,
            customerOutstanding: businessData.customerOutstanding,
          },
          null,
          2
        )}`,
      },
    ]);
  } catch (error) {
    console.error(
      "AI recovery service error:",
      error.response?.data || error.message
    );

    throw new Error("Failed to generate payment recovery plan.");
  }
};

export default generateAIInsights;
