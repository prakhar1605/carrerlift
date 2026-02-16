export default async function handler(req, res) {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }
  
    try {
  
      const { resume } = req.body;
  
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Extract skills and suggest best tech roles from resume."
            },
            {
              role: "user",
              content: resume
            }
          ]
        })
      });
  
      const data = await response.json();
  
      const result =
        data.choices?.[0]?.message?.content || "No result";
  
      res.status(200).json({
        result
      });
  
    } catch (error) {
  
      res.status(500).json({
        error: error.message
      });
  
    }
  }
  