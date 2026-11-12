import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, name, mobile, role } = body;

    if (action === "REGISTER") {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          mobile,
          password: hashedPassword,
          role: role || "CITIZEN",
        }
      });

      const token = signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
      const response = NextResponse.json({ message: "Registration successful", user: { id: user.id, name: user.name, role: user.role } });
      response.cookies.set("cmo_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    if (action === "LOGIN") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const token = signToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId
      });

      const response = NextResponse.json({
        message: "Login successful",
        user: { id: user.id, name: user.name, role: user.role, departmentId: user.departmentId }
      });
      response.cookies.set("cmo_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    if (action === "LOGOUT") {
      const response = NextResponse.json({ message: "Logged out" });
      response.cookies.set("cmo_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}