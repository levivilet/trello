import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.refresh-boards-repeated'

export const test: Test = async ({ Command, expect, Locator }) => {
  await useMockDataAndShowTrello(Command, {
    boards: [{ id: 'board-3', name: 'Board 3' }],
    listBoardsResponses: [
      [{ id: 'board-1', name: 'Board 1' }],
      [{ id: 'board-2', name: 'Board 2' }],
      [{ id: 'board-3', name: 'Board 3' }],
    ],
  })
  await connectWithCredentials({ expect, Locator })

  const refreshIcon = Locator('button[title="Refresh Boards"] .MaskIconRefresh')
  const secondBoard = Locator('button[name="board:board-2"]')
  const thirdBoard = Locator('button[name="board:board-3"]')
  await expect(refreshIcon).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await refreshIcon.click()
  await expect(secondBoard).toBeVisible()

  // eslint-disable-next-line e2e/no-direct-click
  await refreshIcon.click()

  await expect(thirdBoard).toBeVisible()
  await expect(secondBoard).not.toBeVisible()
}
