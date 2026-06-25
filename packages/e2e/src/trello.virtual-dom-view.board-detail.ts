import type { Test } from '@lvce-editor/test-with-playwright'
import { connectToMockTrello, selectBoard } from './_TrelloE2e.ts'

export const name = 'trello.virtual-dom-view.board-detail'

export { skip } from './_TrelloE2e.ts'

export const test: Test = async (context) => {
  const { expect, Locator } = context

  await connectToMockTrello(context)
  await selectBoard(context, 'board-1')

  const todo = Locator('text=Todo')
  const shipTrelloView = Locator('text=Ship Trello view')

  await expect(todo).toBeVisible()
  await expect(shipTrelloView).toBeVisible()
}
