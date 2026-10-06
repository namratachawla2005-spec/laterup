// The LaterUp name in terracotta. One word, capital U.
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <p className={`text-2xl font-semibold tracking-tight text-accent ${className}`}>
      LaterUp
    </p>
  );
}
