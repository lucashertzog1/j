import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, login, password } = body;
    if (!email || !login || !password) return NextResponse.json({ error: 'Preencha tudo!' }, { status: 400 });

    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows && rows.length) return NextResponse.json({ error: 'Email já cadastrado!' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, login, password) VALUES (?, ?, ?)', [email, login, hash]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 });
  }
}
