import { NextResponse } from "next/server";
import { supabase } from '@/api/utils/supabaseClient';

export async function POST() {
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
