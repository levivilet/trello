import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../../state/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../../../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as TrelloStrings from '../../../TrelloStrings/TrelloStrings.ts'
import { renderCardCommentComposer } from '../RenderCardCommentComposer/RenderCardCommentComposer.ts'
import { renderCardDescription } from '../RenderCardDescription/RenderCardDescription.ts'
import { renderCardDetailComments } from '../RenderCardDetailComments/RenderCardDetailComments.ts'
import { renderCardDetailHeader } from '../RenderCardDetailHeader/RenderCardDetailHeader.ts'
import { renderCardDetailImages } from '../RenderCardDetailImages/RenderCardDetailImages.ts'
import { renderCardDetailLabels } from '../RenderCardDetailLabels/RenderCardDetailLabels.ts'
import { renderCardDetailLink } from '../RenderCardDetailLink/RenderCardDetailLink.ts'
import { renderCardListSelect } from '../RenderCardListSelect/RenderCardListSelect.ts'
import { renderListTitle } from '../RenderListTitle/RenderListTitle.ts'

export const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const {
    attachmentImageUrls,
    cardAttachmentsLoading,
    cardCommentsLoading,
    cardDetailLoading,
    failedCardAttachmentImageIds,
    selectedCardDetail,
  } = state
  if (cardDetailLoading && !selectedCardDetail) {
    return [
      {
        childCount: 2,
        className: 'TrelloCardDetailPanel',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(TrelloStrings.cardDetails()),
      text(TrelloStrings.loadingCard()),
    ]
  }
  if (!selectedCardDetail) {
    return []
  }
  const { attachments, card, comments } = selectedCardDetail
  const listSelect = renderCardListSelect(state, card)
  const images = renderCardDetailImages(
    cardAttachmentsLoading,
    attachments,
    attachmentImageUrls,
    failedCardAttachmentImageIds,
  )
  return [
    {
      childCount: 0,
      className: 'TrelloCardDetailResizeSash',
      name: 'resizeCardDetail',
      onPointerDown: DomEventListenerFunctions.HandleSashPointerDown,
      type: VirtualDomElements.Div,
    },
    {
      childCount:
        6 + listSelect.childCount + images.childCount + (card.url ? 1 : 0),
      className: 'TrelloCardDetailPanel',
      name: 'cardDetail',
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onPointerMove: DomEventListenerFunctions.HandleSashPointerMove,
      onPointerUp: DomEventListenerFunctions.HandleSashPointerUp,
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailHeader(state),
    ...renderCardDetailLabels(state, card.labels),
    ...listSelect.dom,
    ...renderCardDescription(state, card.desc || ''),
    ...renderListTitle(TrelloStrings.comments()),
    ...renderCardDetailComments(cardCommentsLoading, comments),
    ...renderCardCommentComposer(state),
    ...images.dom,
    ...(card.url ? renderCardDetailLink(card.url) : []),
  ]
}
