import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "../../../constants";

const prisma = new PrismaClient();

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const payload = verify(token, process.env.JWT_SECRET);

    if (!payload?.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: "Token invalid" }, { status: 401 });
  }
}
