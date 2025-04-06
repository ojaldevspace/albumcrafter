'use client'

import { supabase } from "@/api/utils/supabaseClient";
import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    const checkSupabase = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Supabase Session:", data, error);
    };

    checkSupabase();
  }, []);

  return <div>Check console for Supabase session info</div>;
}
