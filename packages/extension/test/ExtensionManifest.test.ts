import { expect, test } from '@jest/globals'
import { readFile } from 'node:fs/promises'

test('extension has expected metadata, connect sources, and opt-in settings', async () => {
  const text = await readFile(
    new URL('../extension.json', import.meta.url),
    'utf8',
  )
  const manifest = JSON.parse(text) as {
    readonly configuration: Readonly<Record<string, unknown>>
    readonly contentSecurityPolicy: readonly string[]
    readonly repository: string
  }

  expect(manifest.repository).toBe('https://github.com/levivilet/trello')
  expect(manifest.contentSecurityPolicy).toContain(
    'connect-src https://api.trello.com https://trello.com',
  )
  expect(manifest.configuration['trello.batchRequestsEnabled']).toEqual({
    default: false,
    description: "Use Trello's batch API for supported read requests.",
    type: 'boolean',
  })
  expect(manifest.configuration['trello.cardDetailPopupEnabled']).toEqual({
    default: false,
    description:
      'Open card details in a centered popup instead of a right-side panel.',
    type: 'boolean',
  })
})
