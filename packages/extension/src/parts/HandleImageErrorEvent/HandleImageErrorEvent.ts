import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../TrelloViewState/TrelloViewState.ts'

export const handleImageErrorEvent = (
  context: Readonly<TrelloViewActionContext>,
  attachmentId: string,
): void => {
  const state = context.state as TrelloViewState
  if (
    !attachmentId ||
    state.failedCardAttachmentImageIds.includes(attachmentId)
  ) {
    return
  }
  state.failedCardAttachmentImageIds = [
    ...state.failedCardAttachmentImageIds,
    attachmentId,
  ]
}
