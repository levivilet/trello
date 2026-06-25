import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'trello.virtual-dom-view'

// TODO unskip when @lvce-editor/server includes virtual-DOM extension view rendering.
export const skip = true

export const test: Test = async ({ ActivityBar, Command, expect, Locator }) => {
  await Command.executeExtensionCommand('trello.test.useMockData', {
    boardDetails: {
      'board-1': {
        board: {
          id: 'board-1',
          name: 'Roadmap',
        },
        lists: [
          {
            cards: [
              {
                id: 'card-1',
                name: 'Ship Trello view',
              },
            ],
            id: 'list-1',
            name: 'Todo',
          },
        ],
      },
    },
    boards: [
      {
        id: 'board-1',
        name: 'Roadmap',
      },
    ],
  })

  await ActivityBar.toggleActivityBarItem('trello.views.boards')
  await expect(Locator('text=API key')).toBeVisible()
  await expect(Locator('text=Token')).toBeVisible()

  await Command.execute('Extensions.dispatchViewEvent', 'trello.views.boards', 1, {
    name: 'apiKey',
    type: 'input',
    value: 'key',
  })
  await Command.execute('Extensions.dispatchViewEvent', 'trello.views.boards', 1, {
    name: 'token',
    type: 'input',
    value: 'token',
  })
  await Command.execute('Extensions.dispatchViewEvent', 'trello.views.boards', 1, {
    name: 'connect',
    type: 'click',
  })

  await expect(Locator('text=Roadmap')).toBeVisible()

  await Command.execute('Extensions.dispatchViewEvent', 'trello.views.boards', 1, {
    name: 'board:board-1',
    type: 'click',
  })

  await expect(Locator('text=Todo')).toBeVisible()
  await expect(Locator('text=Ship Trello view')).toBeVisible()
}
