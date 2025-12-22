import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PATCH(req) {
  try {
    const { username, password } = await req.json();

    await prisma.user.update({
      where: { id: "690a3cd97e9ec99cd4826509" }, // ✅ force update only this record
      data: {
        username,
        password: password ? await hash(password, 10) : undefined,
      },
    });

    return NextResponse.json({ message: "Updated successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
}
