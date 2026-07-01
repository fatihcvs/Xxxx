import Link from "next/link";

// Global fallback for unmatched, non-localized paths.
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: 40 }}>
        <h1>Page not found</h1>
        <p>
          <Link href="/en">Go home</Link>
        </p>
      </body>
    </html>
  );
}
