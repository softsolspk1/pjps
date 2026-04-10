import { ReactNode } from "react";
import RoleLayout from "@/components/RoleLayout";

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="REVIEWER">
      {children}
    </RoleLayout>
  );
}
