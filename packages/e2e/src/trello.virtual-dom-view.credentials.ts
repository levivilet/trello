import type { Test } from '@lvce-editor/test-with-playwright'
import { openMockTrelloView } from './_TrelloE2e.ts'

export const name = 'trello.virtual-dom-view.credentials'

export { skip } from './_TrelloE2e.ts'

export const test: Test = async (context) => {
  const { expect, Locator } = context

  await openMockTrelloView(context)

  const apiKey = Locator('text=API key')
  const token = Locator('text=Token')

  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
}
