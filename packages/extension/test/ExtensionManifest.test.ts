import { expect, test } from '@jest/globals'
import { readFile } from 'node:fs/promises'

test('extension contributes opt-in settings', async () => {
  const text = await readFile(
    new URL('../extension.json', import.meta.url),
    'utf8',
  )
  const manifest = JSON.parse(text) as {
    readonly configuration: Readonly<Record<string, unknown>>
  }

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
