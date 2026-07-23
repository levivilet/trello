import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

export const getTitle = (state: Readonly<TrelloViewState>): string => {
  const { boardDetail } = state
  if (boardDetail) {
    return TrelloStrings.trelloBoard(boardDetail.board.name)
  }
  return TrelloStrings.trello()
}
