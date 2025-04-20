import { NextRequest, NextResponse } from "next/server";
import { supabase } from '@/app/api/utils/supabaseClient';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

  return NextResponse.json({ success: true, session: data.session });
}
