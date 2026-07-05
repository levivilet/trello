import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { TrelloCard } from '../../TrelloTypes/TrelloTypes.ts'
import * as Dom from '../../VirtualDom/VirtualDom.ts'

const getCardCommentCount = (card: Readonly<TrelloCard>): number => {
  return card.badges?.comments || 0
}

const getCardCommentCountText = (count: number): string => {
  if (count === 1) {
    return '1 comment'
  }
  return `${count} comments`
}

const renderCardCommentCount = (
  card: Readonly<TrelloCard>,
): readonly Dom.TreeNode[] => {
  const commentCount = getCardCommentCount(card)
  if (commentCount <= 0) {
    return []
  }
  return [
    Dom.div('TrelloCardMeta', [
      Dom.textNode(getCardCommentCountText(commentCount)),
    ]),
  ]
}

const renderCard = (card: Readonly<TrelloCard>): Dom.TreeNode => {
  return Dom.node(
    VirtualDomElements.Button,
    {
      className: 'TrelloCard',
      draggable: true,
      name: `card:${card.id}`,
      onDragEnd: 'handleDragEnd',
      onDragStart: 'handleDragStart',
    },
    [
      Dom.div('TrelloCardTitle', [Dom.textNode(card.name)]),
      ...renderCardCommentCount(card),
    ],
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
