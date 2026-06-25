import type { Test } from '@lvce-editor/test-with-playwright'

type TestContext = Parameters<Test>[0]

// TODO enable when @lvce-editor/server includes virtual-DOM extension view rendering.
export const skip = true

const mockData = {
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
}

export const openMockTrelloView = async ({
  ActivityBar,
  Command,
}: TestContext): Promise<void> => {
  await Command.executeExtensionCommand('trello.test.useMockData', mockData)
  await ActivityBar.toggleActivityBarItem('trello.views.boards')
}

export const connectToMockTrello = async (
  context: TestContext,
): Promise<void> => {
  const { Command } = context

  await openMockTrelloView(context)
  await Command.execute(
    'Extensions.dispatchViewEvent',
    'trello.views.boards',
    1,
    {
      name: 'apiKey',
      type: 'input',
      value: 'key',
    },
  )
  await Command.execute(
    'Extensions.dispatchViewEvent',
    'trello.views.boards',
    1,
    {
      name: 'token',
      type: 'input',
      value: 'token',
    },
  )
  await Command.execute(
    'Extensions.dispatchViewEvent',
    'trello.views.boards',
    1,
    {
      name: 'connect',
      type: 'click',
    },
  )
}

export const selectBoard = async (
  { Command }: TestContext,
  boardId: string,
): Promise<void> => {
  await Command.execute(
    'Extensions.dispatchViewEvent',
    'trello.views.boards',
    1,
    {
      name: `board:${boardId}`,
      type: 'click',
    },
  )
}
