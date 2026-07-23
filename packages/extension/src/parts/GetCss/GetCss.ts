import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import { getBoardBackgroundCss } from '../BoardBackground/BoardBackground.ts'

const getCardDetailCss = (state: Readonly<TrelloViewState>): string => {
  return `.TrelloCardDetailPanel {
  --TrelloCardDetailWidth: ${state.cardDetailWidth}px;
}`
}

export const getCss = (state: Readonly<TrelloViewState>): string => {
  const boardBackgroundCss = state.boardDetail
    ? getBoardBackgroundCss(
        state.boardDetail.board,
        state.boardBackgroundEnabled,
      )
    : ''
  return [getCardDetailCss(state), boardBackgroundCss]
    .filter(Boolean)
    .join('\n\n')
}
