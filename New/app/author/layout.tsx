import { ReactNode } from "react";
import RoleLayout from "@/components/RoleLayout";

export default function AuthorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="AUTHOR">
      {children}
    </RoleLayout>
  );
}
