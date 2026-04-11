import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, skills } = await req.json();
    if (!email?.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    const SB_URL = process.env.SUPABASE_URL, SB_KEY = process.env.SUPABASE_ANON_KEY, RE_KEY = process.env.RESEND_API_KEY;
    if (!SB_URL || !SB_KEY) return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    const r = await fetch(`${SB_URL}/rest/v1/job_alerts`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey':SB_KEY, 'Authorization':`Bearer ${SB_KEY}`, 'Prefer':'resolution=merge-duplicates' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), name:name||'', skills:skills||'', is_active:true }),
    });
    if (!r.ok) return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    if (RE_KEY) {
      await fetch('https://api.resend.com/emails', {
        method:'POST', headers:{ 'Authorization':`Bearer ${RE_KEY}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ from:'CareerLift <onboarding@resend.dev>', to:email, subject:'🎉 Subscribed to CareerLift!', html:`<p>Hi ${name||'there'}, you're subscribed to daily job alerts!</p><a href="https://carrerlift.in/jobs">Browse Jobs →</a>` }),
      });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
