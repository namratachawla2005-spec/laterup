// Shared frame for the Sign up and Log in screens
import Link from "next/link";
import Wordmark from "./Wordmark";
import WellnessNote from "./WellnessNote";
import LeafBackground from "./LeafBackground";

export default function AuthShell({
  heading,
  subline,
  children,
}: {
  heading: string;
  subline?: string;
  children: React.ReactNode;
}) {
  return (
    <LeafBackground>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-10">
        <Link href="/" className="self-start rounded-card-sm" aria-label="LaterUp, back to Welcome">
          <Wordmark />
        </Link>
  
        <h1 className="mt-10 text-3xl font-semibold leading-tight">{heading}</h1>
        {subline && <p className="mt-2 text-text-muted">{subline}</p>}
  
        <div className="mt-8">{children}</div>
  
        <div className="mt-auto pt-12">
          <WellnessNote />
        </div>
      </main>
    </LeafBackground>
  );
}
