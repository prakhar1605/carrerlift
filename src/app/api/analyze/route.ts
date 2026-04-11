import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();
    if (!resume || resume.trim().length < 10)
      return NextResponse.json({ error: 'Resume too short' }, { status: 400 });
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization':`Bearer ${apiKey}`, 'Content-Type':'application/json', 'HTTP-Referer':'https://carrerlift.in' },
      body: JSON.stringify({
        model: 'anthropic/claude-haiku-4-5',
        messages: [{ role:'user', content:`Extract from resume in 150 words:\nSKILLS: (list)\nLEVEL: (Junior/Mid/Senior)\nBEST ROLES: (3 roles)\nADVICE: (one line)\n\nResume:\n${resume.slice(0,2000)}` }],
        temperature: 0.3, max_tokens: 200,
      }),
    });
    const data = await res.json();
    const result = data.choices?.[0]?.message?.content;
    if (!result) return NextResponse.json({ error: 'No response' }, { status: 500 });
    return NextResponse.json({ result: result.trim(), success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
