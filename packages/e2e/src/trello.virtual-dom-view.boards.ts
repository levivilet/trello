import type { Test } from '@lvce-editor/test-with-playwright'
import { connectToMockTrello } from './_TrelloE2e.ts'

export const name = 'trello.virtual-dom-view.boards'

export { skip } from './_TrelloE2e.ts'

export const test: Test = async ({ Command, expect, Locator }) => {
  await connectToMockTrello({ Command, expect, Locator })

  const roadmap = Locator('text=Roadmap')

  await expect(roadmap).toBeVisible()
}
