import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development only: lets a phone on the home wifi open the dev server
  // at the laptop's address. Update it if the laptop's address changes
  // (check with `ipconfig`). Has no effect on the live Vercel site.
  allowedDevOrigins: ["192.168.1.5"],
};

export default nextConfig;
