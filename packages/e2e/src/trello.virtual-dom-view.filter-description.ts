import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_trello.virtual-dom-view.filtering.shared.ts'

export const name = 'trello.virtual-dom-view.filter-description'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  await input.type('PRODUCTION')

  const cards = Locator('.TrelloCard')
  const matchingCard = Locator('button[name="card:card-description"]')
  const hiddenCard = Locator('button[name="card:card-title"]')
  const firstList = Locator('input[name="listTitle:list-1"]')
  const secondList = Locator('input[name="listTitle:list-2"]')
  await expect(cards).toHaveCount(1)
  await expect(matchingCard).toBeVisible()
  await expect(hiddenCard).toHaveCount(0)
  await expect(firstList).toBeVisible()
  await expect(secondList).toBeVisible()
}
