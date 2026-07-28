import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloViewState } from '../TrelloViewState/TrelloViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderCardCommentComposer } from '../RenderCardCommentComposer/RenderCardCommentComposer.ts'
import { renderCardDescription } from '../RenderCardDescription/RenderCardDescription.ts'
import { renderCardDetailComments } from '../RenderCardDetailComments/RenderCardDetailComments.ts'
import { renderCardDetailHeader } from '../RenderCardDetailHeader/RenderCardDetailHeader.ts'
import { renderCardDetailImages } from '../RenderCardDetailImages/RenderCardDetailImages.ts'
import { renderCardDetailLabels } from '../RenderCardDetailLabels/RenderCardDetailLabels.ts'
import { renderCardDetailLink } from '../RenderCardDetailLink/RenderCardDetailLink.ts'
import { renderCardListSelect } from '../RenderCardListSelect/RenderCardListSelect.ts'
import { renderListTitle } from '../RenderListTitle/RenderListTitle.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const renderCardLink = (url: string | undefined): readonly VirtualDomNode[] => {
  if (!url) {
    return []
  }
  return renderCardDetailLink(url)
}

const getPanelClassName = (popupEnabled: boolean): string => {
  return popupEnabled
    ? 'TrelloCardDetailPanel TrelloCardDetailPanelPopup'
    : 'TrelloCardDetailPanel'
}

const renderCardDetailPopup = (
  panel: readonly VirtualDomNode[],
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloCardDetailPopup',
      type: VirtualDomElements.Div,
    },
    ...panel,
  ]
}

const renderCardDetailResizeSash = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 0,
      className: 'TrelloCardDetailResizeSash',
      name: 'resizeCardDetail',
      onPointerDown: DomEventListenerFunctions.HandleSashPointerDown,
      type: VirtualDomElements.Div,
    },
  ]
}

const renderCardAttachmentDropArea = (
  uploading: boolean,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'TrelloCardAttachmentDropArea',
      type: VirtualDomElements.Div,
    },
    text(
      uploading
        ? TrelloStrings.uploadingFiles()
        : TrelloStrings.dropFilesToUpload(),
    ),
  ]
}

const getCardDetailPanelChildCount = (
  showDropArea: boolean,
  listSelectChildCount: number,
  imagesChildCount: number,
  hasCardLink: boolean,
): number => {
  if (showDropArea) {
    return 1
  }
  return 6 + listSelectChildCount + imagesChildCount + (hasCardLink ? 1 : 0)
}

export const renderCardDetailPanel = (
  state: Readonly<TrelloViewState>,
): readonly VirtualDomNode[] => {
  const {
    attachmentImageUrls,
    cardAttachmentDropActive,
    cardAttachmentsLoading,
    cardAttachmentsUploading,
    cardCommentsLoading,
    cardDetailLoading,
    cardDetailPopupEnabled,
    failedCardAttachmentImageIds,
    selectedCardDetail,
  } = state
  if (cardDetailLoading && !selectedCardDetail) {
    const panel = [
      {
        childCount: 2,
        className: getPanelClassName(cardDetailPopupEnabled),
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(TrelloStrings.cardDetails()),
      text(TrelloStrings.loadingCard()),
    ]
    return cardDetailPopupEnabled ? renderCardDetailPopup(panel) : panel
  }
  if (!selectedCardDetail) {
    return []
  }
  const { attachments, card, comments } = selectedCardDetail
  const showDropArea = cardAttachmentDropActive || cardAttachmentsUploading
  const dropArea = showDropArea
    ? renderCardAttachmentDropArea(cardAttachmentsUploading)
    : []
  const listSelect = renderCardListSelect(state, card)
  const images = renderCardDetailImages(
    cardAttachmentsLoading,
    attachments,
    attachmentImageUrls,
    failedCardAttachmentImageIds,
  )
  const cardLink = renderCardLink(card.url)
  const content = [
    ...renderCardDetailHeader(state),
    ...renderCardDetailLabels(state, card.labels),
    ...listSelect.dom,
    ...renderCardDescription(state, card.desc || ''),
    ...renderListTitle(TrelloStrings.comments()),
    ...renderCardDetailComments(cardCommentsLoading, comments),
    ...renderCardCommentComposer(state),
    ...images.dom,
    ...cardLink,
  ]
  const visibleContent = showDropArea ? dropArea : content
  const panel = [
    {
      childCount: getCardDetailPanelChildCount(
        showDropArea,
        listSelect.childCount,
        images.childCount,
        cardLink.length > 0,
      ),
      className: getPanelClassName(cardDetailPopupEnabled),
      'data-id': 'cardDetail',
      name: 'cardDetail',
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragLeave: DomEventListenerFunctions.HandleDragLeave,
      onDragOver: DomEventListenerFunctions.HandleDragOver,
      onDrop: DomEventListenerFunctions.HandleDrop,
      onPointerMove: DomEventListenerFunctions.HandleSashPointerMove,
      onPointerUp: DomEventListenerFunctions.HandleSashPointerUp,
      type: VirtualDomElements.Div,
    },
    ...visibleContent,
  ]
  if (cardDetailPopupEnabled) {
    return renderCardDetailPopup(panel)
  }
  return [...renderCardDetailResizeSash(), ...panel]
}
