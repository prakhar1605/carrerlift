export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
  }

  try {
    const { resume } = req.body;

    // Validate input
    if (!resume || typeof resume !== 'string' || !resume.trim()) {
      return res.status(400).json({ 
        error: 'Invalid resume data',
        message: 'Please provide valid resume text'
      });
    }

    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not found');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'API key not configured in environment variables'
      });
    }

    console.log('Calling OpenRouter API...');

    // Call OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://naukri-chakri.vercel.app',
        'X-Title': 'NaukriChakri'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor. Analyze the resume and provide: 1) Key skills identified, 2) Experience level, 3) Top 3 recommended job roles, 4) Brief suggestions. Keep it concise and helpful.'
          },
          {
            role: 'user',
            content: `Analyze this resume:\n\n${resume.slice(0, 3000)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    });

    console.log('OpenRouter response status:', response.status);

    // Check response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      
      return res.status(500).json({
        error: 'AI service error',
        message: `OpenRouter API returned status ${response.status}`,
        details: errorText.slice(0, 200)
      });
    }

    // Parse response
    const data = await response.json();
    console.log('OpenRouter data received');

    // Extract result
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      console.error('No content in response:', JSON.stringify(data));
      return res.status(500).json({
        error: 'Invalid response',
        message: 'AI did not return analysis'
      });
    }

    console.log('Analysis successful, length:', result.length);

    // Return success
    return res.status(200).json({
      result: result.trim(),
      success: true
    });

  } catch (error) {
    console.error('Handler error:', error);
    
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Unknown error occurred'
    });
  }
}
