import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { TrelloCard } from '../TrelloTypes/TrelloTypes.ts'
import { getAssetUrl } from '../AssetBaseUrl/AssetBaseUrl.ts'
import { getCardCoverImageUrl } from '../CardCoverHelpers/CardCoverHelpers.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as TrelloStrings from '../TrelloStrings/TrelloStrings.ts'

const getCardCommentCount = (card: Readonly<TrelloCard>): number => {
  return card.badges?.comments || 0
}

const getCardCommentLabel = (count: number): string => {
  if (count === 1) {
    return TrelloStrings.cardComment()
  }
  return TrelloStrings.cardComments(count)
}

const renderCardCommentIcon = (baseUrl: string): VirtualDomNode => {
  return {
    alt: '',
    'aria-hidden': true,
    childCount: 0,
    className: 'TrelloCardCommentIcon',
    src: getAssetUrl(baseUrl, 'media/comments.svg'),
    type: VirtualDomElements.Img,
  }
}

const renderCardCommentCount = (
  baseUrl: string,
  card: Readonly<TrelloCard>,
): readonly VirtualDomNode[] => {
  const commentCount = getCardCommentCount(card)
  if (commentCount <= 0) {
    return []
  }
  const commentLabel = getCardCommentLabel(commentCount)
  return [
    {
      'aria-label': commentLabel,
      childCount: 2,
      className: 'TrelloCardMeta',
      title: commentLabel,
      type: VirtualDomElements.Div,
    },
    renderCardCommentIcon(baseUrl),
    {
      childCount: 1,
      className: 'TrelloCardCommentCount',
      type: VirtualDomElements.Span,
    },
    text(String(commentCount)),
  ]
}

const renderCardLabel = (
  label: NonNullable<TrelloCard['labels']>[number],
): VirtualDomNode => {
  const labelText = getLabelText(label)
  return {
    'aria-label': labelText,
    childCount: 0,
    className: MergeClassNames.mergeClassNames(
      'TrelloCardLabel',
      'TrelloCardPreviewLabel',
      getLabelColorClassName(label.color),
    ),
    title: labelText,
    type: VirtualDomElements.Div,
  }
}

const renderCardLabels = (
  card: Readonly<TrelloCard>,
): readonly VirtualDomNode[] => {
  const { labels } = card
  if (!labels || labels.length === 0) {
    return []
  }
  return [
    {
      childCount: labels.length,
      className: MergeClassNames.mergeClassNames(
        'TrelloCardLabels',
        'TrelloCardPreviewLabels',
      ),
      type: VirtualDomElements.Div,
    },
    ...labels.map(renderCardLabel),
  ]
}

const renderCardCover = (
  card: Readonly<TrelloCard>,
  coverImageUrl: string,
): readonly VirtualDomNode[] => {
  if (!coverImageUrl) {
    return []
  }
  return [
    {
      alt: TrelloStrings.cardCover(card.name),
      childCount: 0,
      className: 'TrelloCardCoverImage',
      src: coverImageUrl,
      type: VirtualDomElements.Img,
    },
  ]
}

const renderCard = (
  baseUrl: string,
  coverImageUrls: Readonly<Record<string, string>>,
  card: Readonly<TrelloCard>,
): readonly VirtualDomNode[] => {
  const coverSourceUrl = getCardCoverImageUrl(card)
  const coverImageUrl = coverSourceUrl ? coverImageUrls[coverSourceUrl] : ''
  const labelDom = renderCardLabels(card)
  const commentDom = renderCardCommentCount(baseUrl, card)
  const bodyChildCount =
    1 + (labelDom.length > 0 ? 1 : 0) + (commentDom.length > 0 ? 1 : 0)
  return [
    {
      childCount: coverImageUrl ? 2 : 1,
      className: coverImageUrl
        ? MergeClassNames.mergeClassNames('TrelloCard', 'TrelloCardWithCover')
        : 'TrelloCard',
      draggable: true,
      name: `card:${card.id}`,
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragEnd: DomEventListenerFunctions.HandleDragEnd,
      onDragStart: DomEventListenerFunctions.HandleDragStart,
      type: VirtualDomElements.Button,
    },
    ...renderCardCover(card, coverImageUrl),
    {
      childCount: bodyChildCount,
      className: 'TrelloCardBody',
      type: VirtualDomElements.Div,
    },
    ...labelDom,
    {
      childCount: 1,
      className: 'TrelloCardTitle',
      type: VirtualDomElements.Div,
    },
    text(card.name),
    ...commentDom,
  ]
}

export const renderCards = (
  baseUrl: string,
  coverImageUrls: Readonly<Record<string, string>>,
  cards: readonly TrelloCard[],
): readonly VirtualDomNode[] => {
  if (cards.length === 0) {
    return [text(TrelloStrings.noCards())]
  }
  return cards.flatMap((card) => renderCard(baseUrl, coverImageUrls, card))
}
