import type {
  TrelloAttachment,
  TrelloCard,
  TrelloCardDetail,
  TrelloComment,
} from '../../TrelloTypes/TrelloTypes.ts'
import type {
  TrelloViewActionContext,
  TrelloViewState,
} from '../state/TrelloViewState.ts'
import { getErrorMessage } from '../GetErrorMessage.ts'
import { applyCardDetail, isSameJson } from './CacheFirstHelpers.ts'
import { findBoardCard } from './FindBoardCard.ts'

const isCurrentCardLoad = (
  state: Readonly<TrelloViewState>,
  cardId: string,
): boolean => {
  return state.cardDetailLoadingCardId === cardId
}

const getCurrentDetailForCard = (
  state: Readonly<TrelloViewState>,
  cardId: string,
): TrelloCardDetail | undefined => {
  const selectedCardDetail = state.selectedCardDetail
  if (selectedCardDetail?.card.id === cardId) {
    return selectedCardDetail
  }
  return undefined
}

const applyFreshCard = (
  state: TrelloViewState,
  freshCard: TrelloCard,
): void => {
  const current = getCurrentDetailForCard(state, freshCard.id)
  if (!current) {
    applyCardDetail(state, {
      attachments: [],
      card: freshCard,
      comments: [],
    })
    return
  }
  state.selectedCardDetail = {
    ...current,
    card: freshCard,
  }
  if (!state.editingCardTitle) {
    state.draftCardTitle = freshCard.name
  }
  if (!state.editingCardDescription) {
    state.draftCardDescription = freshCard.desc || ''
  }
}

const applyFreshComments = (
  state: TrelloViewState,
  cardId: string,
  comments: readonly TrelloComment[],
): void => {
  const current = getCurrentDetailForCard(state, cardId)
  if (!current) {
    return
  }
  state.selectedCardDetail = {
    ...current,
    comments,
  }
}

const applyFreshAttachments = (
  state: TrelloViewState,
  cardId: string,
  attachments: readonly TrelloAttachment[],
): void => {
  const current = getCurrentDetailForCard(state, cardId)
  if (!current) {
    return
  }
  state.selectedCardDetail = {
    ...current,
    attachments,
  }
}

const loadCardComments = async (
  context: TrelloViewActionContext,
  cardId: string,
  commentsPromise: Promise<TrelloCardDetail['comments']>,
  cardPromise: Promise<TrelloCard>,
): Promise<void> => {
  const state = context.state as TrelloViewState
  try {
    const comments = await commentsPromise
    await cardPromise
    if (!getCurrentDetailForCard(state, cardId)) {
      await Promise.resolve()
    }
    if (isCurrentCardLoad(state, cardId)) {
      applyFreshComments(state, cardId, comments)
    }
  } catch (error) {
    if (isCurrentCardLoad(state, cardId)) {
      state.error = getErrorMessage(error)
    }
  } finally {
    if (isCurrentCardLoad(state, cardId)) {
      state.cardCommentsLoading = false
      context.requestRerender()
    }
  }
}

const loadCardAttachments = async (
  context: TrelloViewActionContext,
  cardId: string,
  attachmentsPromise: Promise<TrelloCardDetail['attachments']>,
  cardPromise: Promise<TrelloCard>,
): Promise<void> => {
  const state = context.state as TrelloViewState
  try {
    const attachments = await attachmentsPromise
    await cardPromise
    if (!getCurrentDetailForCard(state, cardId)) {
      await Promise.resolve()
    }
    if (isCurrentCardLoad(state, cardId)) {
      applyFreshAttachments(state, cardId, attachments)
    }
  } catch (error) {
    if (isCurrentCardLoad(state, cardId)) {
      state.error = getErrorMessage(error)
    }
  } finally {
    if (isCurrentCardLoad(state, cardId)) {
      state.cardAttachmentsLoading = false
      context.requestRerender()
    }
  }
}

export const openCard = async (
  context: TrelloViewActionContext,
  cardId: string,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as TrelloViewState
  if (!state.credentials || !state.boardDetail) {
    return
  }
  const card = findBoardCard(state, cardId)
  if (!card) {
    state.error = `Card not found: ${cardId}`
    requestRerender()
    return
  }
  state.cardDetailLoading = true
  state.cardDetailLoadingCardId = card.id
  state.cardCommentsLoading = true
  state.cardAttachmentsLoading = true
  state.selectedCardDetail = undefined
  state.addingCardLabelId = ''
  state.cardLabelPickerOpen = false
  state.draftLabelSearchQuery = ''
  state.error = ''
  requestRerender()
  try {
    const result = await client.getCardDetailPartsCacheFirst(
      card,
      state.credentials,
    )
    if (result.cached) {
      applyCardDetail(state, result.cached)
      state.cardDetailLoading = false
      requestRerender()
    }
    const freshCardPromise = result.fresh.card
    const commentsPromise = loadCardComments(
      context,
      card.id,
      result.fresh.comments,
      freshCardPromise,
    )
    const attachmentsPromise = loadCardAttachments(
      context,
      card.id,
      result.fresh.attachments,
      freshCardPromise,
    )
    const freshCard = await freshCardPromise
    const selectedCardDetail = state.selectedCardDetail as
      | TrelloCardDetail
      | undefined
    if (
      isCurrentCardLoad(state, card.id) &&
      (state.cardDetailLoading || selectedCardDetail?.card.id === card.id)
    ) {
      if (!isSameJson(selectedCardDetail?.card, freshCard)) {
        applyFreshCard(state, freshCard)
      }
      state.cardDetailLoading = false
      requestRerender()
    }
    await Promise.all([commentsPromise, attachmentsPromise])
  } catch (error) {
    if (isCurrentCardLoad(state, card.id)) {
      state.error = getErrorMessage(error)
      state.cardAttachmentsLoading = false
      state.cardCommentsLoading = false
      state.cardDetailLoading = false
      requestRerender()
    }
  }
}
