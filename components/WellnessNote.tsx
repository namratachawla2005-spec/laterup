// Shown on every page (CLAUDE.md safety rules)
export default function WellnessNote({ withEmergency = false }: { withEmergency?: boolean }) {
  return (
    <p className="text-helper text-text-muted">
      LaterUp is a wellness guide, not medical advice.
      {withEmergency && " In an emergency, call 112."}
    </p>
  );
}
