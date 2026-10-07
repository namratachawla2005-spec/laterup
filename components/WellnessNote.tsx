// Shown on every page (CLAUDE.md safety rules), with the copyright line.
// Under each Talk answer it appears without the copyright (once per page is enough).
export default function WellnessNote({ withEmergency = false, copyright = true }: { withEmergency?: boolean; copyright?: boolean }) {
  return (
    <div className="text-helper text-text-muted">
      <p>
        LaterUp is a wellness guide, not medical advice.
        {withEmergency && " In an emergency, call 112."}
      </p>
      {copyright && <p className="mt-1">© 2026 Namrata Chawla. All rights reserved.</p>}
    </div>
  );
}
