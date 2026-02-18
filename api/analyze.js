export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      });
    }
  
    console.log('=== Resume Analysis Request Started ===');
  
    try {
      // Get resume from request body
      const { resume } = req.body;
  
      // Validate resume data
      if (!resume || typeof resume !== 'string') {
        console.error('Invalid resume data:', typeof resume);
        return res.status(400).json({ 
          error: 'Invalid input',
          message: 'Resume text is required'
        });
      }
  
      if (resume.trim().length < 10) {
        return res.status(400).json({ 
          error: 'Resume too short',
          message: 'Please provide a valid resume with at least 10 characters'
        });
      }
  
      console.log('Resume length:', resume.length);
  
      // Check for API key
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      if (!apiKey) {
        console.error('OPENROUTER_API_KEY not configured in environment');
        return res.status(500).json({ 
          error: 'Server configuration error',
          message: 'API key not found. Please set OPENROUTER_API_KEY in Vercel environment variables.'
        });
      }
  
      console.log('API key found, calling OpenRouter...');
  
      // Call OpenRouter API
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://naukri-chakri.vercel.app',
          'X-Title': 'NaukriChakri Resume Analyzer'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert career advisor and resume analyst. Analyze resumes and provide clear, actionable insights about skills, experience, and job recommendations. Be concise and professional.'
            },
            {
              role: 'user',
              content: `Please analyze this resume and provide:
  
  1. KEY SKILLS: List the main technical and soft skills
  2. EXPERIENCE LEVEL: Junior/Mid/Senior and domain
  3. TOP JOB ROLES: 3-5 best-fit positions based on skills
  4. RECOMMENDATIONS: Brief career advice
  
  Resume:
  ${resume.slice(0, 3500)}
  
  Keep your response clear, structured, and under 300 words.`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });
  
      console.log('OpenRouter status:', openRouterResponse.status);
  
      // Check if request was successful
      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error('OpenRouter API error:', openRouterResponse.status, errorText);
        
        return res.status(openRouterResponse.status).json({
          error: 'AI service error',
          message: `OpenRouter returned status ${openRouterResponse.status}. Please check your API key and credits.`,
          details: errorText.substring(0, 200)
        });
      }
  
      // Parse JSON response
      const aiData = await openRouterResponse.json();
      console.log('OpenRouter response received');
  
      // Extract the AI's message
      const aiMessage = aiData.choices?.[0]?.message?.content;
  
      if (!aiMessage) {
        console.error('No content in AI response:', JSON.stringify(aiData));
        return res.status(500).json({
          error: 'Invalid AI response',
          message: 'AI did not return any analysis. Please try again.',
          debug: aiData
        });
      }
  
      console.log('Analysis successful! Length:', aiMessage.length);
      console.log('=== Resume Analysis Request Completed ===');
  
      // Return successful response
      return res.status(200).json({
        result: aiMessage.trim(),
        success: true,
        timestamp: new Date().toISOString()
      });
  
    } catch (error) {
      console.error('=== ERROR in Resume Analysis ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      return res.status(500).json({
        error: 'Server error',
        message: error.message || 'An unexpected error occurred',
        type: error.name || 'Unknown',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
