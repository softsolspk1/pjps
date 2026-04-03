import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, affiliation } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required scholarly details" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Scholarly identity already registered" }, { status: 400 });
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
        role: "AUTHOR",
      },
    });

    return NextResponse.json({ 
      message: "Scholarly account registered successfully",
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to register scholarly identity" }, { status: 500 });
  }
}
