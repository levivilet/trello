import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  openCard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.card-description-list'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const card = {
    desc: '- First item\n- Second item',
    id: 'card-1',
    name: 'Plan work',
  }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowTrello(Command, {
    ...createMockData(boards, boardDetails),
    cardDetails: {
      'card-1': {
        attachments: [],
        card,
        comments: [],
      },
    },
  })
  await connectWithCredentials({ expect, Locator })
  await openBoard(Locator, expect)
  await openCard(Locator, expect)

  const list = Locator('.TrelloMarkdownList')
  const items = Locator('.TrelloMarkdownListItem')
  await expect(list).toBeVisible()
  await expect(list).toHaveCSS('list-style-position', 'inside')
  await expect(list).toHaveCSS('list-style-type', 'disc')
  await expect(items).toHaveCount(2)
  await expect(items.first()).toHaveText('First item')
  await expect(items.nth(1)).toHaveText('Second item')
}
