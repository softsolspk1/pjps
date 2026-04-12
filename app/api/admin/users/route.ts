import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendEmail } from "@/lib/mail";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    const allowedRoles = ["ADMIN", "EDITOR", "EDITOR_IN_CHIEF", "ASSOCIATE_EDITOR"];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { name, email, password, affiliation, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required scholarly profile details" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Scholarly identity already registered in registry" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        affiliation,
        role,
      },
    });

    return NextResponse.json({ 
      message: "Expert account provisioned successfully",
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (err: any) {
    console.error("Admin user creation error:", err);
    return NextResponse.json({ error: "Failed to provision scholarly account" }, { status: 500 });
  }
}
