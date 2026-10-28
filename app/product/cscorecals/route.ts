import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex, nofollow">
  <title>Page Removed | VCM Suite</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #18181b; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .container { text-align: center; max-width: 400px; padding: 24px; }
    h1 { font-size: 72px; color: #71717a; margin: 0 0 16px; }
    h2 { font-size: 24px; margin: 0 0 16px; }
    p { color: #a1a1aa; margin: 0 0 32px; }
    a { display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; }
    a:hover { background: #ea580c; }
  </style>
</head>
<body>
  <div class="container">
    <h1>410</h1>
    <h2>Page Removed</h2>
    <p>This page has been permanently removed and is no longer available.</p>
    <a href="/store">Browse Store</a>
  </div>
</body>
</html>`,
    {
      status: 410,
      headers: {
        "Content-Type": "text/html",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
