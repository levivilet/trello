import { expect, test } from '@jest/globals'
import { createTrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'

const jsonResponse = (value: unknown): Response => {
  return new Response(JSON.stringify(value), {
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
      apiKey: 'key',
      token: 'token',
    }),
  ).resolves.toEqual([{ id: 'board-1', name: 'Roadmap' }])

  expect(requests).toHaveLength(1)
  const url = new URL(requests[0])
  expect(url.pathname).toBe('/1/members/me/boards')
  expect(url.searchParams.get('key')).toBe('key')
  expect(url.searchParams.get('token')).toBe('token')
  expect(url.searchParams.get('fields')).toBe('name,url')
})

test('getBoardDetail requests lists and cards', async () => {
  const requests: string[] = []
  const client = createTrelloClient(async (url) => {
    requests.push(url)
    if (url.includes('/boards/board-1/lists')) {
      return jsonResponse([{ id: 'list-1', name: 'Todo' }])
    }
    return jsonResponse([{ id: 'card-1', name: 'Ship Trello view' }])
  })

  await expect(
    client.getBoardDetail(
      { id: 'board-1', name: 'Roadmap' },
      {
        apiKey: 'key',
        token: 'token',
      },
    ),
  ).resolves.toEqual({
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship Trello view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  })

  expect(requests.map((request) => new URL(request).pathname)).toEqual(['/1/boards/board-1/lists', '/1/lists/list-1/cards'])
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
