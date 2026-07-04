import type { TrelloComment } from '../TrelloTypes/TrelloTypes.ts'

const commentDateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'Europe/Berlin',
  timeStyle: 'short',
})

const getDerivedInitials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
  if (parts.length === 0) {
    return ''
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const getCommentAuthor = (comment: Readonly<TrelloComment>): string => {
  return (
    comment.memberCreator?.fullName?.trim() ||
    comment.memberCreator?.username?.trim() ||
    'Unknown member'
  )
}

export const getCommentText = (comment: Readonly<TrelloComment>): string => {
  return comment.data.text?.trim() || 'No comment text'
}

export const getCommentInitials = (
  comment: Readonly<TrelloComment>,
): string => {
  const memberName =
    comment.memberCreator?.fullName?.trim() ||
    comment.memberCreator?.username?.trim() ||
    ''
  return (
    comment.memberCreator?.initials?.trim() ||
    getDerivedInitials(memberName) ||
    '?'
  )
}

export const getCommentDateText = (
  comment: Readonly<TrelloComment>,
): string => {
  if (!comment.date) {
    return ''
  }
  const time = Date.parse(comment.date)
  if (Number.isNaN(time)) {
    return ''
  }
  return commentDateFormatter.format(new Date(time))
}

export const getCommentAvatarUrl = (
  comment: Readonly<TrelloComment>,
): string => {
  return comment.memberCreator?.avatarUrl?.trim() || ''
}
