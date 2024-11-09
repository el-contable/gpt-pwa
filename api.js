export async function sendMessage(userMessage) {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const apiKey = process.env.OPENAI_API_KEY; // Accessing environment variable

  if (!apiKey) {
    throw new Error("API key is not set.");
  }

  const requestBody = {
    model: "gpt-4",
    messages: [{ role: "user", content: userMessage }],
    temperature: 0.7,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Error with OpenAI API request");
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, something went wrong. Please try again.";
  }
}
