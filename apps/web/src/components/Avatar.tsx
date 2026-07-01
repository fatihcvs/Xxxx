/**
 * Deterministic, asset-free avatar: initials on a colour derived from the name.
 * Original implementation (no third-party images).
 */
const COLORS = [
  "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#4f46e5", "#ca8a04", "#dc2626",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({
  firstName,
  lastName,
  size = 40,
}: {
  firstName: string;
  lastName: string;
  size?: number;
}) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  const color = COLORS[hash(firstName + lastName) % COLORS.length];
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold text-white select-none"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
