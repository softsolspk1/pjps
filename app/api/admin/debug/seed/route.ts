import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const password = await bcrypt.hash("Softsols@123", 10);
    
    const accounts = [
      { name: "PJPS Editor-in-Chief", email: "eic@pjps.pk", role: "EDITOR_IN_CHIEF", institution: "Pakistan Journal of Pharmaceutical Sciences" },
      { name: "PJPS Finance Admin", email: "finance@pjps.pk", role: "FINANCE_ADMIN", institution: "PJPS Fiscal Office" },
      { name: "PJPS Associate Editor", email: "editor@pjps.pk", role: "ASSOCIATE_EDITOR", institution: "University of Karachi" },
      { name: "Guest Reviewer", email: "reviewer@pjps.pk", role: "REVIEWER", institution: "Independent Scholar" },
      { name: "Demo Author", email: "author@pjps.pk", role: "AUTHOR", institution: "Research Institute" }
    ];

    const results = [];

    for (const acc of accounts) {
      const existing = await prisma.user.findUnique({ where: { email: acc.email } });
      if (!existing) {
        const user = await prisma.user.create({
          data: {
            name: acc.name,
            email: acc.email,
            password,
            role: acc.role,
            affiliation: acc.institution
          }
        });
        results.push({ email: acc.email, status: "Created" });
      } else {
        // Update role if exists (for re-calibration)
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: acc.role }
        });
        results.push({ email: acc.email, status: "Verified/Updated" });
      }
    }

    return NextResponse.json({ 
      message: "Scholarly trial accounts provisioned successfully.",
      accounts: results,
      credentials: "Password for all accounts is: Softsols@123"
    });
  } catch (err) {
    console.error("Seed API Error:", err);
    return NextResponse.json({ error: "Failed to provision trial accounts" }, { status: 500 });
  }
}
