import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "../../../constants";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  const { username, password } = await req.json();

  // ✅ Always fetch ONLY this user, not by username
  const user = await prisma.user.findUnique({
    where: { id: "690a3cd97e9ec99cd4826509" },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // ✅ Check username
  if (user.username !== username) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  let isValidPassword = false;

  // ✅ If password in DB is plain text (like "admin")
  if (user.password === password) {
    isValidPassword = true;
  } else {
    // ✅ Check bcrypt hash
    isValidPassword = await compare(password, user.password);
  }

  if (!isValidPassword) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // ✅ Sign JWT token
  const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "30d" });

  // ✅ Set login cookie
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ message: "Logged in!" }, { status: 200 });
}
