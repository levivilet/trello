import type { TrelloViewState } from '../state/TrelloViewState.ts'
import * as TrelloStrings from '../../TrelloStrings/TrelloStrings.ts'

export const renderTitle = (state: Readonly<TrelloViewState>): string => {
  const { boardDetail } = state
  if (boardDetail) {
    return TrelloStrings.trelloBoard(boardDetail.board.name)
  }
  return TrelloStrings.trello()
}
