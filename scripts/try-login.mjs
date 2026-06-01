#!/usr/bin/env node
import 'dotenv/config'

const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '')
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!base || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env')
  process.exit(1)
}

const roles = [
  { label: 'ADMIN', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  { label: 'AGENT', email: process.env.AGENT_EMAIL, password: process.env.AGENT_PASSWORD },
  { label: 'OWNER', email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD },
  { label: 'USER', email: process.env.USER_EMAIL, password: process.env.USER_PASSWORD },
]

async function tryForm(email, password) {
  const url = `${base}/auth/v1/token?grant_type=password`
  const headers = { apikey: anonKey, 'Content-Type': 'application/x-www-form-urlencoded' }
  const body = new URLSearchParams({ email, password }).toString()
  try {
    const res = await fetch(url, { method: 'POST', headers, body })
    const text = await res.text()
    return { status: res.status, ok: res.ok, text }
  } catch (e) {
    return { error: e.message }
  }
}

async function tryJson(email, password) {
  const url = `${base}/auth/v1/token?grant_type=password`
  const headers = { apikey: anonKey, 'Content-Type': 'application/json' }
  const body = JSON.stringify({ email, password })
  try {
    const res = await fetch(url, { method: 'POST', headers, body })
    const text = await res.text()
    return { status: res.status, ok: res.ok, text }
  } catch (e) {
    return { error: e.message }
  }
}

async function main() {
  console.log('Supabase base:', base)
  for (const r of roles) {
    console.log('\n----', r.label, r.email)
    if (!r.email || !r.password) {
      console.log('Missing credentials in env')
      continue
    }

    console.log('Trying form-encoded request...')
    const formRes = await tryForm(r.email, r.password)
    console.log('FORM =>', formRes)

    console.log('Trying JSON request...')
    const jsonRes = await tryJson(r.email, r.password)
    console.log('JSON =>', jsonRes)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
