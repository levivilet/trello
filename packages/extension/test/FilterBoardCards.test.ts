import { expect, test } from '@jest/globals'
import type {
  TrelloCard,
  TrelloList,
} from '../src/parts/TrelloTypes/TrelloTypes.ts'
import {
  cardMatchesFilter,
  filterListCards,
} from '../src/parts/FilterBoardCards/FilterBoardCards.ts'

const card: TrelloCard = {
  desc: 'Deploy the extension to production',
  id: 'card-1',
  labels: [
    {
      color: 'green',
      id: 'label-1',
      name: 'Ready for review',
    },
  ],
  name: 'Ship Trello filtering',
}

test('matches card titles case-insensitively', () => {
  expect(cardMatchesFilter(card, 'TRELLO')).toBe(true)
})

test('matches card descriptions case-insensitively', () => {
  expect(cardMatchesFilter(card, 'PRODUCTION')).toBe(true)
})

test('matches label names case-insensitively', () => {
  expect(cardMatchesFilter(card, 'ready FOR')).toBe(true)
})

test('does not match unrelated values or unnamed labels', () => {
  expect(
    cardMatchesFilter(
      {
        id: 'card-2',
        labels: [{ id: 'label-2' }],
        name: 'Write documentation',
      },
      'blocked',
    ),
  ).toBe(false)
})

test('an empty or whitespace-only filter matches every card', () => {
  expect(cardMatchesFilter(card, '')).toBe(true)
  expect(cardMatchesFilter(card, ' '.repeat(3))).toBe(true)
})

test('filters a list without mutating the original list', () => {
  const list: TrelloList = {
    cards: [
      card,
      {
        desc: 'Investigate a flaky test',
        id: 'card-2',
        name: 'Fix tests',
      },
    ],
    id: 'list-1',
    name: 'Todo',
  }

  const filtered = filterListCards(list, 'deploy')

  expect(filtered).not.toBe(list)
  expect(filtered.cards).toEqual([card])
  expect(list.cards).toHaveLength(2)
})

test('returns the original list when the filter is empty', () => {
  const list: TrelloList = {
    cards: [card],
    id: 'list-1',
    name: 'Todo',
  }

  expect(filterListCards(list, '  ')).toBe(list)
})
