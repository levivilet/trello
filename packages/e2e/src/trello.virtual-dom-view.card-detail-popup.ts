import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  openBoard,
  openCard,
  useMockDataAndShowTrello,
} from './_trello.virtual-dom-view.shared.ts'

export const name = 'trello.virtual-dom-view.card-detail-popup'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('Preferences.update', {
    'trello.cardDetailPopupEnabled': true,
  })

  const boards = createBoards(1)
  const card = { id: 'card-1', name: 'Plan work' }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowTrello(Command, {
    boardDetails,
    boards,
    cardDetails: {
      'card-1': {
        attachments: [],
        card,
        comments: [],
      },
    },
  })
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)
  await openCard(Command, Locator, expect)

  const popup = Locator('.TrelloCardDetailPopup')
  const popupPanel = Locator('.TrelloCardDetailPanelPopup')
  const resizeSash = Locator('.TrelloCardDetailResizeSash')
  await expect(popup).toBeVisible()
  await expect(popupPanel).toBeVisible()
  await expect(resizeSash).toHaveCount(0)

  await Command.execute('Preferences.update', {
    'trello.cardDetailPopupEnabled': false,
  })
}
