// @ts-nocheck

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view.list-create'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  // arrange
  await Command.executeExtensionCommand('trello.test.useMockData', {
    boardDetails: {},
    boards: [],
    cardDetails: {},
  })

  // act
  await Command.executeExtensionCommand('trello.openMockBoard', {
    id: 'abc',
    name: 'abc',
  })

  // assert
  const boards = Locator('.TrelloBoards')
  await expect(boards).toBeVisible()
  await expect(boards).toHaveText(`RefreshSign outBoardsNo boards found`)
}
