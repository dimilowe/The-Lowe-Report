import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { AdminSessionData, sessionOptions } from "@/lib/admin-session";
import { query } from "@/lib/db";

async function ensureFeedbackTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      feedback_type VARCHAR(100) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      email VARCHAR(255),
      priority VARCHAR(50) DEFAULT 'medium',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      author_name VARCHAR(255),
      author_bio TEXT
    )
  `);
}

export async function GET() {
  const session = await getIronSession<AdminSessionData>(await cookies(), sessionOptions);

  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureFeedbackTable();
    const result = await query(
      `SELECT id, feedback_type, subject, message, email, priority, author_name, author_bio, created_at
       FROM feedback
       ORDER BY created_at DESC NULLS LAST, id DESC`
    );
    return NextResponse.json({ feedback: result.rows });
  } catch (error) {
    console.error("Failed to load feedback:", error);
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}
