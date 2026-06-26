import type { Test } from '@lvce-editor/test-with-playwright'
import { connectToMockTrello, selectBoard } from './_TrelloE2e.ts'

export const name = 'trello.virtual-dom-view.board-detail'

export { skip } from './_TrelloE2e.ts'

export const test: Test = async ({ Command, expect, Locator }) => {
  await connectToMockTrello({ Command, expect, Locator })
  await selectBoard({ expect, Locator }, 'board-1')

  const todo = Locator('text=Todo')
  const shipTrelloView = Locator('text=Ship Trello view')

  await expect(todo).toBeVisible()
  await expect(shipTrelloView).toBeVisible()
}
