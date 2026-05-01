export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
