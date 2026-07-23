import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-title'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  await Locator('input[name="boardFilter"]').type('IMPLEMENT')

  const cards = Locator('.TrelloCard')
  const matchingCard = Locator('button[name="card:card-title"]')
  const hiddenCard = Locator('button[name="card:card-description"]')
  await expect(cards).toHaveCount(1)
  await expect(matchingCard).toBeVisible()
  await expect(hiddenCard).toHaveCount(0)
}
