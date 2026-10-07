import AuthShell from "@/components/AuthShell";
import ForgotForm from "./ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <AuthShell heading="Forgot your password?">
      <ForgotForm />
    </AuthShell>
  );
}
