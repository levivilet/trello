import { expect, test } from '@jest/globals'
import { createMemoryCurrentBoardStorage } from '../src/parts/CurrentBoardStorage/CurrentBoardStorage.ts'

test('memory current board storage reads and writes board id', async () => {
  const storage = createMemoryCurrentBoardStorage()
  await expect(storage.read()).resolves.toBeUndefined()

  await storage.write('board-1')

  await expect(storage.read()).resolves.toBe('board-1')
})

test('memory current board storage deletes board id', async () => {
  const storage = createMemoryCurrentBoardStorage('board-1')

  await storage.delete()

  await expect(storage.read()).resolves.toBeUndefined()
})
