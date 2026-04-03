import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("interviews")
    .insert([
      {
        user_id: "test-user",
        transcript: "Test transcript",
        score: 85,
        evaluation: "Good performance overall.",
        difficulty: "medium",
      },
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}