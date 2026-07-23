import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-live-update'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  const cards = Locator('.TrelloCard')
  const matchingCard = Locator('button[name="card:card-label"]')
  await input.type('ready')
  await expect(cards).toHaveCount(1)
  await expect(matchingCard).toBeVisible()

  await input.type(' for review')
  await expect(cards).toHaveCount(1)
  await expect(matchingCard).toBeVisible()

  await input.type(' missing')
  await expect(cards).toHaveCount(0)
}
