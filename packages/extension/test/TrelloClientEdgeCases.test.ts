import { expect, test } from '@jest/globals'
import type { TrelloApiCache } from '../src/parts/TrelloClient/TrelloApiCache.ts'
import type {
  FetchLike,
  TrelloResponse,
} from '../src/parts/TrelloClient/TrelloClientTypes.ts'
import type {
  TrelloBoard,
  TrelloCard,
  TrelloCredentials,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import { readCachedBoardDetail } from '../src/parts/TrelloClient/operations/GetBoardDetail.ts'
import { readCachedCardDetail } from '../src/parts/TrelloClient/operations/GetCardDetail.ts'
import { moveCard } from '../src/parts/TrelloClient/operations/MoveCard.ts'
import { readCachedSearch } from '../src/parts/TrelloClient/operations/Search.ts'
import {
  createTrelloRequestUrl,
  deleteCachedJson,
  readCachedJson,
  requestJson,
} from '../src/parts/TrelloClient/RequestJson.ts'
import {
  createMemoryTrelloApiCache,
  createCacheStorageTrelloApiCache,
  createTrelloApiCacheRequestUrl,
  getCredentialFingerprint,
} from '../src/parts/TrelloClient/TrelloApiCache.ts'
import { createTrelloClient } from '../src/parts/TrelloClient/TrelloClient.ts'

const credentials: TrelloCredentials = {
  apiKey: 'abcdefghijklmnopqrstuvwxyz123456',
  token: 'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456',
}

const board: TrelloBoard = {
  id: 'board-1',
  name: 'Roadmap',
}

const card: TrelloCard = {
  id: 'card-1',
  name: 'Ship tests',
}

const withCryptoUnavailable = async (
  run: () => Promise<void>,
): Promise<void> => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: undefined,
  })
  try {
    await run()
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'crypto', descriptor)
    } else {
      delete (globalThis as { crypto?: Crypto }).crypto
    }
  }
}

test('request helpers handle defaults, missing caches, and status text errors', async () => {
  expect(createTrelloRequestUrl('/boards', credentials)).toContain(
    '/1/boards?key=',
  )
  await expect(
    readCachedJson(undefined, '/boards', credentials),
  ).resolves.toBeUndefined()
  await expect(
    deleteCachedJson(undefined, '/boards', credentials),
  ).resolves.toBeUndefined()

  const failedResponse: TrelloResponse = {
    async json(): Promise<unknown> {
      return undefined
    },
    ok: false,
    status: 503,
    statusText: 'Service Unavailable',
    async text(): Promise<string> {
      return ''
    },
  }
  await expect(
    requestJson(async () => failedResponse, '/boards', credentials),
  ).rejects.toThrow('Trello request failed: 503 Service Unavailable')
})

test('requestJson caches explicit GET requests and tolerates cache failures', async () => {
  const writes: string[] = []
  const cache: TrelloApiCache = {
    async delete(): Promise<void> {},
    async read<T>(): Promise<T | undefined> {
      return undefined
    },
    async write(requestUrl: string): Promise<void> {
      writes.push(requestUrl)
      throw new Error('Cache quota exceeded')
    },
  }
  const response: TrelloResponse = {
    async json(): Promise<unknown> {
      return {
        ok: true,
      }
    },
    ok: true,
    status: 200,
    statusText: 'OK',
    async text(): Promise<string> {
      return ''
    },
  }

  await expect(
    requestJson(
      async () => response,
      '/boards',
      credentials,
      undefined,
      { method: 'GET' },
      cache,
    ),
  ).resolves.toEqual({
    ok: true,
  })
  expect(writes).toHaveLength(1)
})

test('cache helpers tolerate read and delete failures', async () => {
  const cache: TrelloApiCache = {
    async delete(): Promise<void> {
      throw new Error('Delete failed')
    },
    async read<T>(): Promise<T | undefined> {
      throw new Error('Read failed')
    },
    async write(): Promise<void> {},
  }

  await expect(
    readCachedJson(cache, '/boards', credentials),
  ).resolves.toBeUndefined()
  await expect(
    deleteCachedJson(cache, '/boards', credentials),
  ).resolves.toBeUndefined()
})

test('trello api caches gracefully disable themselves without Web Crypto', async () => {
  await withCryptoUnavailable(async () => {
    expect(await getCredentialFingerprint(credentials)).toBeUndefined()
    expect(
      await createTrelloApiCacheRequestUrl(
        createTrelloRequestUrl('/boards', credentials),
        credentials,
      ),
    ).toBeUndefined()

    const cacheStorage = {
      async open(): Promise<Cache> {
        throw new Error('Cache Storage should not be opened')
      },
    } as unknown as CacheStorage
    const cache = createCacheStorageTrelloApiCache(cacheStorage)
    expect(cache).toBeDefined()
    await expect(
      cache?.read(createTrelloRequestUrl('/boards', credentials), credentials),
    ).resolves.toBeUndefined()
    await expect(
      cache?.write(
        createTrelloRequestUrl('/boards', credentials),
        credentials,
        [],
      ),
    ).resolves.toBeUndefined()
    await expect(
      cache?.delete(
        createTrelloRequestUrl('/boards', credentials),
        credentials,
      ),
    ).resolves.toBeUndefined()

    const memoryCache = createMemoryTrelloApiCache()
    await expect(
      memoryCache.read(
        createTrelloRequestUrl('/boards', credentials),
        credentials,
      ),
    ).resolves.toBeUndefined()
    await memoryCache.write(
      createTrelloRequestUrl('/boards', credentials),
      credentials,
      [],
    )
    await memoryCache.delete(
      createTrelloRequestUrl('/boards', credentials),
      credentials,
    )
    expect(memoryCache.keys()).toEqual([])
  })
})

test('cache storage factory and reads handle unavailable data', async () => {
  const originalCaches = globalThis.caches
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: undefined,
  })
  try {
    expect(createCacheStorageTrelloApiCache()).toBeUndefined()
  } finally {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: originalCaches,
    })
  }

  const cacheStorage = {
    async open(): Promise<Cache> {
      return {
        async match(): Promise<undefined> {
          return undefined
        },
      } as unknown as Cache
    },
  } as unknown as CacheStorage
  const cache = createCacheStorageTrelloApiCache(cacheStorage)
  await expect(
    cache?.read(createTrelloRequestUrl('/boards', credentials), credentials),
  ).resolves.toBeUndefined()

  const memoryCache = createMemoryTrelloApiCache()
  await expect(
    memoryCache.read(
      createTrelloRequestUrl('/missing', credentials),
      credentials,
    ),
  ).resolves.toBeUndefined()
})

test('cached compound requests require every response part', async () => {
  const missingCache: TrelloApiCache = {
    async delete(): Promise<void> {},
    async read<T>(): Promise<T | undefined> {
      return undefined
    },
    async write(): Promise<void> {},
  }
  await expect(
    readCachedBoardDetail(missingCache, board, credentials),
  ).resolves.toBeUndefined()
  await expect(
    readCachedSearch(missingCache, 'ship', credentials),
  ).resolves.toBeUndefined()
  await expect(
    readCachedCardDetail(missingCache, card, credentials),
  ).resolves.toBeUndefined()

  const partialBoardCache: TrelloApiCache = {
    async delete(): Promise<void> {},
    async read<T>(requestUrl: string): Promise<T | undefined> {
      if (new URL(requestUrl).pathname.endsWith('/lists')) {
        return [{ id: 'list-1', name: 'Todo' }] as T
      }
      return undefined
    },
    async write(): Promise<void> {},
  }
  await expect(
    readCachedBoardDetail(partialBoardCache, board, credentials),
  ).resolves.toBeUndefined()
})

test('moveCard supports cards that have no source list', async () => {
  const requests: string[] = []
  const fetchLike: FetchLike = async (url) => {
    requests.push(url)
    return {
      async json(): Promise<unknown> {
        return {
          ...card,
          idList: 'list-2',
        }
      },
      ok: true,
      status: 200,
      statusText: 'OK',
      async text(): Promise<string> {
        return ''
      },
    }
  }

  await expect(
    moveCard(fetchLike, card, { idList: 'list-2', pos: 'bottom' }, credentials),
  ).resolves.toMatchObject({
    idList: 'list-2',
  })
  expect(requests).toHaveLength(1)
})

test('createTrelloClient can use the global fetch default', async () => {
  const originalFetch = globalThis.fetch
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: async (): Promise<Response> => Response.json([]),
  })
  try {
    await expect(createTrelloClient().listBoards(credentials)).resolves.toEqual(
      [],
    )
  } finally {
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: originalFetch,
    })
  }
})
