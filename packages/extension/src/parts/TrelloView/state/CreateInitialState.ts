import type { TrelloViewState } from './TrelloViewState.ts'

export const createInitialState = (): TrelloViewState => {
  return {
    activeSearchQuery: '',
    boardDetail: undefined,
    boards: [],
    cardDetailLoading: false,
    credentials: undefined,
    draftApiKey: '',
    draftCardDescription: '',
    draftCardTitle: '',
    draftSearchQuery: '',
    draftToken: '',
    error: '',
    loading: false,
    recentBoardViews: [],
    savingCardDetail: false,
    searchEnabled: false,
    searchResults: [],
    selectedCardDetail: undefined,
  }
}
