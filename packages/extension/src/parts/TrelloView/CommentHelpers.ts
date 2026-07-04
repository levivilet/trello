import type { TrelloComment } from '../TrelloTypes/TrelloTypes.ts'

export const getCommentAuthor = (comment: Readonly<TrelloComment>): string => {
  return comment.memberCreator?.fullName?.trim() || 'Unknown member'
}

export const getCommentText = (comment: Readonly<TrelloComment>): string => {
  return comment.data.text?.trim() || 'No comment text'
}
