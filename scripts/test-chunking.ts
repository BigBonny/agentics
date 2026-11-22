/**
 * Test hors-ligne de la structuration par blocs (aucun appel réseau, aucune écriture en base).
 * Le LLM est remplacé par un faux `chat`. Usage : npx tsx scripts/test-chunking.ts
 */
import assert from 'node:assert/strict'

// lib/supabase est importé par lib/course-extraction : valeurs factices suffisantes ici.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= 'test'
process.env.SUPABASE_SERVICE_ROLE_KEY ||= 'test'

const norm = (s: string) => s.replace(/\s+/g, '')

async function main() {
  const { splitText, structureDocument } = await import('../lib/course-extraction')

  // Document de ~63k caractères : 7 blocs de 10k, donc au-delà du plafond de 4 blocs LLM.
  const paragraph = (n: number) =>
    `Section ${n}. ` + `La notion numéro ${n} est expliquée ici en détail avec un exemple. `.repeat(12)
  const text = Array.from({ length: 75 }, (_, i) => paragraph(i + 1)).join('\n\n')

  // 1. Le découpage ne perd aucun caractère utile et respecte la taille cible.
  const chunks = splitText(text, 10_000)
  assert.equal(norm(chunks.join('')), norm(text), 'splitText perd du texte')
  assert.ok(chunks.every((c) => c.length <= 11_000), 'bloc trop grand')
  assert.ok(chunks.length > 4, `attendu > 4 blocs, obtenu ${chunks.length}`)
  console.log(`✓ splitText : ${text.length} caractères → ${chunks.length} blocs, rien de perdu`)

  // 2. Sans LLM : tout en sections brutes, document entier couvert.
  const noLlm = await structureDocument(text, { title: 'cours.pdf' }, null)
  assert.equal(noLlm.meta, null)
  assert.equal(noLlm.llmChunks, 0)
  assert.equal(norm(noLlm.chapters.map((c) => c.content).join('')), norm(text))
  assert.ok(noLlm.chapters.every((c, i) => c.title === `Partie ${i + 1}`))
  console.log(`✓ sans LLM : ${noLlm.chapters.length} sections brutes, document entier couvert`)

  // 3. Faux LLM : renvoie une section par bloc reprenant le texte du bloc tel quel.
  //    Le bloc 2 échoue (quota), le bloc 3 renvoie un JSON invalide.
  const seen: Array<{ part: number; model?: string }> = []
  const fakeChat = async (params: any) => {
    const prompt: string = params.messages[0].content
    const body = prompt.split('"""')[1].trim()
    const part = Number(prompt.match(/partie (\d+)\//i)?.[1] ?? 1)
    seen.push({ part, model: params.model })
    if (part === 2) throw Object.assign(new Error('rate limit'), { status: 429 })
    if (part === 3) return { choices: [{ message: { content: '{"chapters": [' } }] }
    const json: any = { chapters: [{ title: `Titre LLM ${part}`, type: 'lesson', duration_minutes: 10, content: body }] }
    if (part === 1) Object.assign(json, { title: 'Cours complet', subject: 'Test', topics: ['a'] })
    return { choices: [{ message: { content: JSON.stringify(json) } }] }
  }
  const doc = await structureDocument(text, { title: 'cours.pdf' }, fakeChat as any)

  assert.equal(doc.totalChunks, chunks.length)
  assert.equal(seen.length, 4, 'le plafond de 4 blocs LLM doit être respecté')
  assert.equal(new Set(seen.map((s) => s.model)).size, 4, 'chaque bloc doit démarrer sur un modèle différent')
  assert.equal(doc.llmChunks, 2, 'blocs 1 et 4 structurés, 2 et 3 en repli')
  assert.equal(doc.meta?.title, 'Cours complet')
  assert.ok(!('chapters' in (doc.meta as object)))
  // Ordre du document conservé et rien de perdu, malgré le mélange LLM / sections brutes.
  assert.equal(norm(doc.chapters.map((c) => c.content).join('')), norm(text), 'contenu perdu ou désordonné')
  assert.equal(doc.chapters[0].title, 'Titre LLM 1')
  assert.ok(doc.chapters.some((c) => c.title === 'Titre LLM 4'))
  assert.ok(doc.chapters.every((c) => c.title.trim()), 'section sans titre')
  const iLlm4 = doc.chapters.findIndex((c) => c.title === 'Titre LLM 4')
  assert.ok(doc.chapters.slice(1, iLlm4).every((c, i) => c.title === `Partie ${i + 2}`))
  console.log(
    `✓ avec LLM : ${doc.llmChunks}/${doc.totalChunks} blocs structurés, ${doc.chapters.length} sections, ordre conservé`
  )

  // 4. Document court : un seul bloc, un seul appel.
  seen.length = 0
  const short = await structureDocument(paragraph(1), {}, fakeChat as any)
  assert.equal(seen.length, 1)
  assert.equal(short.totalChunks, 1)
  assert.equal(short.llmChunks, 1)
  console.log('✓ document court : un seul appel LLM')

  console.log('\nTous les tests passent.')
}

main().catch((e) => {
  console.error('ÉCHEC :', e)
  process.exit(1)
})
