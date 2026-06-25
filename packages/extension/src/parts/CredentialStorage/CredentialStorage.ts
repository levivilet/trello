import type { TrelloCredentials } from '../TrelloTypes/TrelloTypes.ts'

export interface CredentialStorage {
  readonly delete: () => Promise<void>
  readonly read: () => Promise<TrelloCredentials | undefined>
  readonly write: (credentials: TrelloCredentials) => Promise<void>
}

export const cacheName = 'builtin.trello.credentials'
export const credentialsRequestUrl = '/credentials.json'

const isCredentials = (value: unknown): value is TrelloCredentials => {
  if (!value || typeof value !== 'object') {
    return false
  }
  const record = value as Record<string, unknown>
  return typeof record.apiKey === 'string' && typeof record.token === 'string'
}

export const createCacheCredentialStorage = (): CredentialStorage => {
  return {
    async read(): Promise<TrelloCredentials | undefined> {
      const cache = await caches.open(cacheName)
      const response = await cache.match(credentialsRequestUrl)
      if (!response) {
        return undefined
      }
      const value = await response.json()
      if (!isCredentials(value)) {
        return undefined
      }
      return value
    },
    async write(credentials: TrelloCredentials): Promise<void> {
      const cache = await caches.open(cacheName)
      await cache.put(
        credentialsRequestUrl,
        new Response(JSON.stringify(credentials), {
          headers: {
            'content-type': 'application/json',
          },
        }),
      )
    },
    async delete(): Promise<void> {
      const cache = await caches.open(cacheName)
      await cache.delete(credentialsRequestUrl)
    },
  }
}

export const createMemoryCredentialStorage = (initial?: TrelloCredentials): CredentialStorage => {
  let value = initial
  return {
    async read(): Promise<TrelloCredentials | undefined> {
      return value
    },
    async write(credentials: TrelloCredentials): Promise<void> {
      value = credentials
    },
    async delete(): Promise<void> {
      value = undefined
    },
  }
}
