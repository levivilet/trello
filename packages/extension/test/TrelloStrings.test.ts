import { expect, test } from '@jest/globals'
import * as TrelloStrings from '../src/parts/TrelloStrings/TrelloStrings.ts'

test('renders every Trello string', () => {
  const stringFunctions = Object.values(
    TrelloStrings as unknown as Readonly<
      Record<string, (value?: string | number) => string>
    >,
  )
  const strings = stringFunctions.map((stringFunction) => {
    return stringFunction('value')
  })

  expect(strings).toHaveLength(stringFunctions.length)
  expect(strings.every(Boolean)).toBe(true)
})

test('renders placeholders', () => {
  expect(TrelloStrings.boardNotFound('board-1')).toBe(
    'Board not found: board-1',
  )
  expect(TrelloStrings.cardComments(2)).toBe('2 comments')
  expect(TrelloStrings.searchResultsFor('roadmap')).toBe(
    'Search results for "roadmap"',
  )
  expect(TrelloStrings.trelloBoard('Roadmap')).toBe('Trello: Roadmap')
})
