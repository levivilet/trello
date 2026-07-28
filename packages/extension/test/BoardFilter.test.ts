import { expect, test } from '@jest/globals'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../src/parts/TrelloViewState/TrelloViewState.ts'
import {
  closeBoardFilter,
  openBoardFilter,
} from '../src/parts/BoardFilter/BoardFilter.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'

const createContext = (): {
  readonly context: TrelloViewActionContext
  readonly getRerenderCount: () => number
} => {
  const state = createInitialState()
  let rerenderCount = 0
  return {
    context: {
      requestRerender(): void {
        rerenderCount++
      },
      state,
    } as TrelloViewActionContext,
    getRerenderCount(): number {
      return rerenderCount
    },
  }
}

test('opens the board filter and requests focus', () => {
  const { context, getRerenderCount } = createContext()

  openBoardFilter(context)

  expect(context.state.boardFilterOpen).toBe(true)
  expect(context.state.focusedName).toBe('boardFilter')
  expect(getRerenderCount()).toBe(1)
})

test('closes the board filter without clearing its value', () => {
  const { context, getRerenderCount } = createContext()
  const state = context.state as TrelloViewState
  state.boardFilterOpen = true
  state.draftBoardFilter = 'ready'
  state.focusedName = 'boardFilter'

  closeBoardFilter(context)

  expect(state.boardFilterOpen).toBe(false)
  expect(state.draftBoardFilter).toBe('ready')
  expect(state.focusedName).toBe('')
  expect(getRerenderCount()).toBe(1)
})

test('closing the board filter preserves unrelated focus', () => {
  const { context } = createContext()
  const state = context.state as TrelloViewState
  state.boardFilterOpen = true
  state.focusedName = 'other'

  closeBoardFilter(context)

  expect(state.focusedName).toBe('other')
})
