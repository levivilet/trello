import { expect, test } from '@jest/globals'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { renderBoardFilter } from '../src/parts/RenderBoardFilter/RenderBoardFilter.ts'

test('renders no board filter popup when closed', () => {
  const dom = renderBoardFilter(createInitialState())

  expect(dom).toEqual([])
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
    dom.find((node) => node.className === 'TrelloBoardFilterOverlay'),
  ).toEqual(
    expect.objectContaining({
      childCount: 0,
      name: 'closeBoardFilter',
      onClick: 'handleClick',
      role: 'none',
    }),
  )
  expect(dom.some((node) => node.name === 'openBoardFilter')).toBe(false)
})
