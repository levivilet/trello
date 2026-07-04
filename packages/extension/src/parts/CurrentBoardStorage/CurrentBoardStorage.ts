export interface CurrentBoardStorage {
  readonly delete: () => Promise<void>
  readonly read: () => Promise<string | undefined>
  readonly write: (boardId: string) => Promise<void>
}

export const cacheName = 'builtin.trello.current-board'
export const currentBoardRequestUrl = '/current-board.json'

const isCurrentBoard = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const createCacheCurrentBoardStorage = (): CurrentBoardStorage => {
  return {
    async delete(): Promise<void> {
      const cache = await caches.open(cacheName)
      await cache.delete(currentBoardRequestUrl)
    },
    async read(): Promise<string | undefined> {
      const cache = await caches.open(cacheName)
      const response = await cache.match(currentBoardRequestUrl)
      if (!response) {
        return undefined
      }
      const value = await response.json()
      if (!isCurrentBoard(value)) {
        return undefined
      }
      return value
    },
    async write(boardId: string): Promise<void> {
      const cache = await caches.open(cacheName)
      await cache.put(currentBoardRequestUrl, Response.json(boardId))
    },
  }
}

export const createMemoryCurrentBoardStorage = (
  initial?: string,
): CurrentBoardStorage => {
  let value = initial
  return {
    async delete(): Promise<void> {
      value = undefined
    },
    async read(): Promise<string | undefined> {
      return value
    },
    async write(boardId: string): Promise<void> {
      value = boardId
    },
  }
}
