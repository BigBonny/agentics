/**
 * Donne le tier premium aux comptes admin (Supabase + metadata Clerk).
 * Usage : npx tsx scripts/grant-admin-premium.ts
 */
import fs from 'node:fs'
import path from 'node:path'

for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const ADMIN_IDS = [
  'user_3BCVh2jkLqNoCZbFCLI0kfK8Dol',
  'user_3DEggFUNlD2npcMAheiWXk0kVFY',
]

async function main() {
  const { supabaseAdmin } = await import('../lib/supabase')

  for (const clerkId of ADMIN_IDS) {
    // 1) Supabase : tier premium actif
    const { data: u, error } = await supabaseAdmin
      .from('users')
      .update({ subscription_tier: 'premium', subscription_status: 'active' })
      .eq('clerk_id', clerkId)
      .select('id, clerk_id, email, subscription_tier')
    console.log(`Supabase ${clerkId}:`, error ? `ERREUR ${error.message}` : u)

    // 2) Clerk : publicMetadata.subscription pour les checks côté client
    const res = await fetch(`https://api.clerk.com/v1/users/${clerkId}/metadata`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: { subscription: { tier: 'premium', status: 'active' } },
      }),
    })
    console.log(`Clerk ${clerkId}:`, res.ok ? 'OK' : `ERREUR ${res.status} ${await res.text()}`)
  }
}

main().catch((e) => {
  console.error('ÉCHEC:', e)
  process.exit(1)
})
