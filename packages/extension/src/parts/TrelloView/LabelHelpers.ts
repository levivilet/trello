import type { TrelloLabel } from '../TrelloTypes/TrelloTypes.ts'

export const getLabelText = (label: Readonly<TrelloLabel>): string => {
  return label.name?.trim() || label.color?.trim() || 'Label'
}

export const getLabelColorClassName = (color: string | undefined): string => {
  switch (color) {
    case 'black':
    case 'blue':
    case 'green':
    case 'lime':
    case 'orange':
    case 'pink':
    case 'purple':
    case 'red':
    case 'sky':
    case 'yellow':
      return `TrelloCardLabelColor${color[0].toUpperCase()}${color.slice(1)}`
    default:
      return 'TrelloCardLabelColorNeutral'
  }
}
