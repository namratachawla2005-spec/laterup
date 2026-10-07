import AuthShell from "@/components/AuthShell";
import ForgotForm from "./ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell heading="Forgot your password?" subline="Enter your email and we'll send you a link to set a new one.">
      <ForgotForm />
    </AuthShell>
  );
}
