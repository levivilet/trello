import { expect, test } from '@jest/globals'
import { createTrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'

const jsonResponse = (value: unknown): Response => {
  return Response.json(value, {
    status: 200,
  })
}

test('listBoards requests member boards with credentials', async () => {
  const requests: string[] = []
  const client = createTrelloClient(async (url) => {
    requests.push(url)
    return jsonResponse([{ id: 'board-1', name: 'Roadmap' }])
  })

  await expect(
    client.listBoards({
      apiKey: validApiKey,
      token: validToken,
    }),
  ).resolves.toEqual([{ id: 'board-1', name: 'Roadmap' }])

  expect(requests).toHaveLength(1)
  const url = new URL(requests[0])
  expect(url.pathname).toBe('/1/members/me/boards')
  expect(url.searchParams.get('key')).toBe(validApiKey)
  expect(url.searchParams.get('token')).toBe(validToken)
  expect(url.searchParams.get('fields')).toBe(
    'name,url,dateLastView,idOrganization',
  )
  expect(url.searchParams.get('organization')).toBe('true')
  expect(url.searchParams.get('organization_fields')).toBe('name,displayName')
})

test('getBoardDetail requests lists and cards', async () => {
  const requests: string[] = []
  const client = createTrelloClient(async (url) => {
    requests.push(url)
    if (url.includes('/boards/board-1/lists')) {
      return jsonResponse([{ id: 'list-1', name: 'Todo' }])
    }
    return jsonResponse([
      {
        badges: {
          comments: 3,
        },
        id: 'card-1',
        idBoard: 'board-1',
        idList: 'list-1',
        name: 'Ship Trello view',
      },
    ])
  })

  await expect(
    client.getBoardDetail(
      { id: 'board-1', name: 'Roadmap' },
      {
        apiKey: validApiKey,
        token: validToken,
      },
    ),
  ).resolves.toEqual({
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [
          {
            badges: {
              comments: 3,
            },
            id: 'card-1',
            idBoard: 'board-1',
            idList: 'list-1',
            name: 'Ship Trello view',
          },
        ],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  })

  expect(requests.map((request) => new URL(request).pathname)).toEqual([
    '/1/boards/board-1/lists',
    '/1/lists/list-1/cards',
  ])
  expect(new URL(requests[1]).searchParams.get('fields')).toBe(
    'name,url,idBoard,idList,badges',
  )
})

test('getCardDetail requests card detail, attachments, and comments', async () => {
  const requests: string[] = []
  const client = createTrelloClient(async (url) => {
    requests.push(url)
    if (url.includes('/cards/card-1/attachments')) {
      return jsonResponse([
        {
          id: 'attachment-1',
          mimeType: 'image/png',
          name: 'Screenshot',
          previews: [{ url: 'https://example.com/preview.png' }],
          url: 'https://example.com/screenshot.png',
        },
      ])
    }
    if (url.includes('/cards/card-1/actions')) {
      return jsonResponse([
        {
          data: {
            text: 'This should show under the description.',
          },
          date: '2026-07-03T10:11:00.000Z',
          id: 'comment-1',
          memberCreator: {
            fullName: 'Test User',
          },
          type: 'commentCard',
        },
      ])
    }
    return jsonResponse({
      desc: 'Detailed card description',
      id: 'card-1',
      idBoard: 'board-1',
      idList: 'list-1',
      labels: [
        {
          color: 'blue',
          id: 'label-1',
          idBoard: 'board-1',
          name: 'Extension Api',
        },
      ],
      name: 'Ship Trello view',
      url: 'https://trello.com/c/card-1',
    })
  })

  await expect(
    client.getCardDetail(
      { id: 'card-1', name: 'Ship Trello view' },
      {
        apiKey: validApiKey,
        token: validToken,
      },
    ),
  ).resolves.toEqual({
    attachments: [
      {
        id: 'attachment-1',
        mimeType: 'image/png',
        name: 'Screenshot',
        previews: [{ url: 'https://example.com/preview.png' }],
        url: 'https://example.com/screenshot.png',
      },
    ],
    card: {
      desc: 'Detailed card description',
      id: 'card-1',
      idBoard: 'board-1',
      idList: 'list-1',
      labels: [
        {
          color: 'blue',
          id: 'label-1',
          idBoard: 'board-1',
          name: 'Extension Api',
        },
      ],
      name: 'Ship Trello view',
      url: 'https://trello.com/c/card-1',
    },
    comments: [
      {
        data: {
          text: 'This should show under the description.',
        },
        date: '2026-07-03T10:11:00.000Z',
        id: 'comment-1',
        memberCreator: {
          fullName: 'Test User',
        },
        type: 'commentCard',
      },
    ],
  })

  expect(requests.map((request) => new URL(request).pathname)).toEqual([
    '/1/cards/card-1',
    '/1/cards/card-1/attachments',
    '/1/cards/card-1/actions',
  ])
  const cardRequest = requests.find((request) => {
    return new URL(request).pathname === '/1/cards/card-1'
  })
  const attachmentsRequest = requests.find((request) => {
    return new URL(request).pathname === '/1/cards/card-1/attachments'
  })
  const commentsRequest = requests.find((request) => {
    return new URL(request).pathname === '/1/cards/card-1/actions'
  })
  expect(cardRequest).toBeDefined()
  expect(attachmentsRequest).toBeDefined()
  expect(commentsRequest).toBeDefined()
  expect(new URL(cardRequest || '').searchParams.get('fields')).toBe(
    'name,desc,url,idBoard,idList,labels',
  )
  expect(new URL(attachmentsRequest || '').searchParams.get('fields')).toBe(
    'name,url,mimeType,previews',
  )
  expect(new URL(commentsRequest || '').searchParams.get('filter')).toBe(
    'commentCard',
  )
})

test('updateCard sends title and description to trello', async () => {
  const requests: string[] = []
  const requestInits: ({ readonly method?: string } | undefined)[] = []
  const client = createTrelloClient(async (url, init) => {
    requests.push(url)
    requestInits.push(init)
    return jsonResponse({
      desc: 'Updated description',
      id: 'card-1',
      idBoard: 'board-1',
      idList: 'list-1',
      name: 'Updated title',
      url: 'https://trello.com/c/card-1',
    })
  })

  await expect(
    client.updateCard(
      { id: 'card-1', name: 'Ship Trello view' },
      {
        desc: 'Updated description',
        name: 'Updated title',
      },
      {
        apiKey: validApiKey,
        token: validToken,
      },
    ),
  ).resolves.toEqual({
    desc: 'Updated description',
    id: 'card-1',
    idBoard: 'board-1',
    idList: 'list-1',
    name: 'Updated title',
    url: 'https://trello.com/c/card-1',
  })

  expect(requests).toHaveLength(1)
  const url = new URL(requests[0])
  expect(url.pathname).toBe('/1/cards/card-1')
  expect(url.searchParams.get('key')).toBe(validApiKey)
  expect(url.searchParams.get('token')).toBe(validToken)
  expect(url.searchParams.get('name')).toBe('Updated title')
  expect(url.searchParams.get('desc')).toBe('Updated description')
  expect(url.searchParams.get('fields')).toBe('name,desc,url,idBoard,idList')
  expect(requestInits[0]?.method).toBe('PUT')
})

test('search requests trello search with card and board params', async () => {
  const requests: string[] = []
  const client = createTrelloClient(async (url) => {
    requests.push(url)
    return jsonResponse({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cards: [{ id: 'card-1', idBoard: 'board-1', name: 'Ship search' }],
    })
  })

  await expect(
    client.search('ship', {
      apiKey: validApiKey,
      token: validToken,
    }),
  ).resolves.toEqual([
    { id: 'card-1', idBoard: 'board-1', name: 'Ship search', type: 'card' },
    { id: 'board-1', name: 'Roadmap', type: 'board' },
  ])

  expect(requests).toHaveLength(1)
  const url = new URL(requests[0])
  expect(url.pathname).toBe('/1/search')
  expect(url.searchParams.get('key')).toBe(validApiKey)
  expect(url.searchParams.get('token')).toBe(validToken)
  expect(url.searchParams.get('query')).toBe('ship')
  expect(url.searchParams.get('modelTypes')).toBe('cards,boards')
  expect(url.searchParams.get('card_fields')).toBe('name,url,idBoard')
  expect(url.searchParams.get('board_fields')).toBe('name,url')
  expect(url.searchParams.get('cards_limit')).toBe('10')
  expect(url.searchParams.get('boards_limit')).toBe('10')
})

test('listBoards throws useful errors for failed requests', async () => {
  const client = createTrelloClient(async () => {
    return new Response('unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    })
  })

  await expect(
    client.listBoards({
      apiKey: 'bad-key',
      token: 'bad-token',
    }),
  ).rejects.toThrow(new Error('Trello request failed: 401 unauthorized'))
})

test('search throws useful errors for failed requests', async () => {
  const client = createTrelloClient(async () => {
    return new Response('unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    })
  })

  await expect(
    client.search('ship', {
      apiKey: 'bad-key',
      token: 'bad-token',
    }),
  ).rejects.toThrow(new Error('Trello request failed: 401 unauthorized'))
})
