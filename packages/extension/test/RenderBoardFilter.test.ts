import { expect, test } from '@jest/globals'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { renderBoardFilter } from '../src/parts/RenderBoardFilter/RenderBoardFilter.ts'

test('renders a closed board filter button', () => {
  const dom = renderBoardFilter(createInitialState())

  expect(
    dom.find((node) => node.name === 'openBoardFilter')?.['aria-expanded'],
  ).toBe(false)
  expect(dom.some((node) => node.className === 'TrelloBoardFilterPopup')).toBe(
    false,
  )
})

test('renders an open board filter popup with its current value', () => {
  const dom = renderBoardFilter({
    ...createInitialState(),
    boardFilterOpen: true,
    draftBoardFilter: 'ready',
  })

  expect(dom.some((node) => node.className === 'TrelloBoardFilterPopup')).toBe(
    true,
  )
  expect(dom.find((node) => node.name === 'boardFilter')?.value).toBe('ready')
  expect(dom.some((node) => node.name === 'closeBoardFilter')).toBe(true)
  expect(
    dom
      .find((node) => node.name === 'openBoardFilter')
      ?.className?.includes('TrelloBoardFilterButtonActive'),
  ).toBe(true)
})
