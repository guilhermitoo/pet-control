// app/api/register/route.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Dados incompletos", { status: 400 });
    }

    // Verificar se o email já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUserByEmail) {
      return new NextResponse("Email já cadastrado", { status: 400 });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERRO AO REGISTRAR:", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}