import AuthShell from "@/components/AuthShell";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthShell heading="Welcome back" subline="Log in to your private space.">
      <LoginForm />
    </AuthShell>
  );
}
