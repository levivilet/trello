import { expect, test } from '@jest/globals'
import {
  cacheName,
  createCacheCredentialStorage,
  createMemoryCredentialStorage,
} from '../src/parts/CredentialStorage/CredentialStorage.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'

test('memory credential storage reads and writes credentials', async () => {
  const storage = createMemoryCredentialStorage()
  await expect(storage.read()).resolves.toBeUndefined()

  await storage.write({
    apiKey: validApiKey,
    token: validToken,
  })

  await expect(storage.read()).resolves.toEqual({
    apiKey: validApiKey,
    token: validToken,
  })
})

test('memory credential storage deletes credentials', async () => {
  const storage = createMemoryCredentialStorage({
    apiKey: validApiKey,
    token: validToken,
  })

  await storage.delete()

  await expect(storage.read()).resolves.toBeUndefined()
})

test('cache credential storage uses the production cache name by default', async () => {
  const openedCacheNames: string[] = []
  const originalCaches = globalThis.caches
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: {
      async open(selectedCacheName: string): Promise<Cache> {
        openedCacheNames.push(selectedCacheName)
        return {
          async match(): Promise<undefined> {
            return undefined
          },
        } as unknown as Cache
      },
    },
  })

  try {
    await createCacheCredentialStorage().read()
  } finally {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: originalCaches,
    })
  }

  expect(openedCacheNames).toEqual([cacheName])
})

test('cache credential storage can use an isolated cache name', async () => {
  const openedCacheNames: string[] = []
  const originalCaches = globalThis.caches
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: {
      async open(selectedCacheName: string): Promise<Cache> {
        openedCacheNames.push(selectedCacheName)
        return {
          async match(): Promise<undefined> {
            return undefined
          },
        } as unknown as Cache
      },
    },
  })

  try {
    await createCacheCredentialStorage('test-cache-name').read()
  } finally {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: originalCaches,
    })
  }

  expect(openedCacheNames).toEqual(['test-cache-name'])
})
