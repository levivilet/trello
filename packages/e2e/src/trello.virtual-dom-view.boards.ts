import type { Test } from '@lvce-editor/test-with-playwright'
import { connectToMockTrello } from './_TrelloE2e.ts'

export const name = 'trello.virtual-dom-view.boards'

export { skip } from './_TrelloE2e.ts'

export const test: Test = async (context) => {
  const { expect, Locator } = context

  await connectToMockTrello(context)

  const roadmap = Locator('text=Roadmap')

  await expect(roadmap).toBeVisible()
}
