import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TrelloCard } from '../../TrelloTypes/TrelloTypes.ts'
import * as Dom from '../../VirtualDom/VirtualDom.ts'
import { getCardCoverImageUrl } from '../CardCoverHelpers.ts'

const getCardCommentCount = (card: Readonly<TrelloCard>): number => {
  return card.badges?.comments || 0
}

const getCardCommentLabel = (count: number): string => {
  if (count === 1) {
    return '1 comment'
  }
  return `${count} comments`
}

const renderCardCommentIcon = (): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Svg,
    {
      'aria-hidden': true,
      className: 'TrelloCardCommentIcon',
      fill: 'none',
      height: 14,
      viewBox: '0 0 24 24',
      width: 14,
    },
    [
      Dom.node(VirtualDomElements.Path, {
        d: 'M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z',
        stroke: 'currentColor',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }),
    ],
  )
}

const renderCardCommentCount = (
  card: Readonly<TrelloCard>,
): readonly Dom.TreeNode[] => {
  const commentCount = getCardCommentCount(card)
  if (commentCount <= 0) {
    return []
  }
  const commentLabel = getCardCommentLabel(commentCount)
  const commentCountNode = Dom.node(
    VirtualDomElements.Span,
    { className: 'TrelloCardCommentCount' },
    [Dom.textNode(String(commentCount))],
  )
  return [
    Dom.node(
      VirtualDomElements.Div,
      {
        'aria-label': commentLabel,
        className: 'TrelloCardMeta',
        title: commentLabel,
      },
      [renderCardCommentIcon(), commentCountNode],
    ),
  ]
}

const renderCard = (card: Readonly<TrelloCard>): Dom.TreeNode => {
  const coverImageUrl = getCardCoverImageUrl(card)
  const cardBody = Dom.div('TrelloCardBody', [
    Dom.div('TrelloCardTitle', [Dom.textNode(card.name)]),
    ...renderCardCommentCount(card),
  ])
  const children = coverImageUrl
    ? [
        Dom.image('TrelloCardCoverImage', coverImageUrl, `${card.name} cover`),
        cardBody,
      ]
    : [cardBody]
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: coverImageUrl
        ? 'TrelloCard TrelloCardWithCover'
        : 'TrelloCard',
      draggable: true,
      name: `card:${card.id}`,
      onContextMenu: 'handleContextMenu',
      onDragEnd: 'handleDragEnd',
      onDragStart: 'handleDragStart',
    },
    children,
  )
}

export const renderCards = (
  cards: readonly TrelloCard[],
): readonly Dom.TreeNode[] => {
  if (cards.length === 0) {
    return [Dom.textNode('No cards')]
  }
  return cards.map(renderCard)
}
