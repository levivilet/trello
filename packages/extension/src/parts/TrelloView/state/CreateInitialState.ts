import type { TrelloViewState } from './TrelloViewState.ts'

export const createInitialState = (): TrelloViewState => {
  return {
    activeSearchQuery: '',
    addingCardListId: '',
    boardBackgroundEnabled: false,
    boardDetail: undefined,
    boards: [],
    cardDetailLoading: false,
    credentials: undefined,
    draftApiKey: '',
    draftCardDescription: '',
    draftCardTitle: '',
    draftListTitles: {},
    draftNewCardTitle: '',
    draftSearchQuery: '',
    draftToken: '',
    draggedCardId: '',
    dragTargetListId: '',
    editingCardDescription: false,
    editingCardTitle: false,
    error: '',
    loading: false,
    recentBoardViews: [],
    savingCardDetail: false,
    savingNewCard: false,
    searchEnabled: false,
    searchResults: [],
    selectedCardDetail: undefined,
  }
}
