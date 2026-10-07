/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
import AuthShell from "@/components/AuthShell";
import ResetForm from "./ResetForm";

export default function ResetPasswordPage() {
  return (
    <AuthShell heading="Choose a new password">
      <ResetForm />
    </AuthShell>
  );
}
