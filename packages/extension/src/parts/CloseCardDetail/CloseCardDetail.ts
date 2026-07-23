import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'

export const closeCardDetail = (context: TrelloViewActionContext): void => {
  const { requestRerender } = context
  const state = context.state as TrelloViewState
  state.selectedCardDetail = undefined
  state.cardAttachmentsLoading = false
  state.cardCommentsLoading = false
  state.cardDetailLoading = false
  state.cardDetailLoadingCardId = ''
  state.addingCardLabelId = ''
  state.cardLabelCreateOpen = false
  state.cardLabelPickerOpen = false
  state.draftCardDescription = ''
  state.draftCardTitle = ''
  state.draftComment = ''
  state.draftLabelSearchQuery = ''
  state.draftNewLabelColor = 'green'
  state.draftNewLabelName = ''
  state.editingCardDescription = false
  state.editingCardTitle = false
  state.failedCardAttachmentImageIds = []
  state.savingComment = false
  state.savingNewLabel = false
  state.writingComment = false
  state.error = ''
  requestRerender()
}
