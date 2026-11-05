/**
 * Keeps admin segment transitions from feeling like a full document swap.
 * Layout chrome stays mounted; this wraps page children only.
 */
export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-w-0">{children}</div>;
}
