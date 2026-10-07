import AuthShell from "@/components/AuthShell";
import ResetForm from "./ResetForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell heading="Choose a new password">
      <ResetForm />
    </AuthShell>
  );
}
