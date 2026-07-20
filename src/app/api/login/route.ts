import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const validEmail = process.env.AUTH_EMAIL
  const validPassword = process.env.AUTH_PASSWORD

  if (email !== validEmail || password !== validPassword) {
    return NextResponse.json({ ok: false, error: 'Email atau password salah.' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('neuverse_session', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  })
  return res
}
