export function FormError({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-sm border border-danger/30 bg-danger-dim px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
