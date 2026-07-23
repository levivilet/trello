import type { TrelloViewState } from '../state/TrelloViewState.ts'

export const renderTitle = (state: Readonly<TrelloViewState>): string => {
  const { boardDetail } = state
  if (boardDetail) {
    return `Trello: ${boardDetail.board.name}`
  }
  return 'Trello'
}
