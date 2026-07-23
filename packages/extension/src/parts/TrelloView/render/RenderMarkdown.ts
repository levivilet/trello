import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as MergeClassNames from '../../MergeClassNames/MergeClassNames.ts'

const headingTypes = [
  VirtualDomElements.H1,
  VirtualDomElements.H2,
  VirtualDomElements.H3,
  VirtualDomElements.H4,
  VirtualDomElements.H5,
  VirtualDomElements.H6,
] as const

const escapedMarkdownTextPattern = /\\([\\`*_{}()[\]#+\-.!])/g

const allowedLinkProtocols = ['http:', 'https:', 'mailto:']

const breakNode: VirtualDomNode = {
  childCount: 0,
  type: VirtualDomElements.Br,
}

export interface VirtualDomSegment {
  readonly childCount: number
  readonly dom: readonly VirtualDomNode[]
}

interface InlineMatch {
  readonly end: number
  readonly node: VirtualDomSegment
  readonly start: number
}

const sanitizeHref = (href: string): string => {
  try {
    const url = new URL(href)
    if (allowedLinkProtocols.includes(url.protocol)) {
      return href
    }
  } catch {
    return ''
  }
  return ''
}

const findDelimited = (
  value: string,
  delimiter: string,
  type: number,
  className: string,
): InlineMatch | undefined => {
  const start = value.indexOf(delimiter)
  if (start === -1) {
    return undefined
  }
  const end = value.indexOf(delimiter, start + delimiter.length)
  if (end === -1) {
    return undefined
  }
  const innerValue = value.slice(start + delimiter.length, end)
  const children = parseInline(innerValue)
  return {
    end: end + delimiter.length,
    node: {
      childCount: 1,
      dom: [
        {
          childCount: children.childCount,
          className,
          type,
        },
        ...children.dom,
      ],
    },
    start,
  }
}

const findInlineCode = (value: string): InlineMatch | undefined => {
  const start = value.indexOf('`')
  if (start === -1) {
    return undefined
  }
  const end = value.indexOf('`', start + 1)
  if (end === -1) {
    return undefined
  }
  return {
    end: end + 1,
    node: {
      childCount: 1,
      dom: [
        {
          childCount: 1,
          className: 'TrelloMarkdownCode',
          type: VirtualDomElements.Code,
        },
        text(value.slice(start + 1, end)),
      ],
    },
    start,
  }
}

const findItalic = (value: string): InlineMatch | undefined => {
  for (let i = 0; i < value.length; i++) {
    if (value[i] !== '*' || value[i + 1] === '*' || value[i - 1] === '*') {
      continue
    }
    const end = value.indexOf('*', i + 1)
    if (end === -1 || value[end + 1] === '*') {
      return undefined
    }
    const children = parseInline(value.slice(i + 1, end))
    return {
      end: end + 1,
      node: {
        childCount: 1,
        dom: [
          {
            childCount: children.childCount,
            className: 'TrelloMarkdownEmphasis',
            type: VirtualDomElements.Em,
          },
          ...children.dom,
        ],
      },
      start: i,
    }
  }
  return undefined
}

const findLink = (value: string): InlineMatch | undefined => {
  let start = value.indexOf('[')
  while (start !== -1) {
    const labelEnd = value.indexOf(']', start + 1)
    if (labelEnd === -1) {
      return undefined
    }
    if (value[labelEnd + 1] !== '(') {
      start = value.indexOf('[', start + 1)
      continue
    }
    const hrefStart = labelEnd + 2
    const hrefEnd = value.indexOf(')', hrefStart)
    if (hrefEnd === -1) {
      return undefined
    }
    const label = value.slice(start + 1, labelEnd)
    const hrefText = value.slice(hrefStart, hrefEnd)
    if (!label || !hrefText || hrefText.includes(' ')) {
      start = value.indexOf('[', start + 1)
      continue
    }
    const href = sanitizeHref(hrefText)
    const children = parseInline(label)
    if (!href) {
      return {
        end: hrefEnd + 1,
        node: {
          childCount: 1,
          dom: [
            {
              childCount: children.childCount,
              type: VirtualDomElements.Span,
            },
            ...children.dom,
          ],
        },
        start,
      }
    }
    return {
      end: hrefEnd + 1,
      node: {
        childCount: 1,
        dom: [
          {
            childCount: children.childCount,
            className: 'TrelloMarkdownLink',
            href,
            target: '_blank',
            type: VirtualDomElements.A,
          },
          ...children.dom,
        ],
      },
      start,
    }
  }
  return undefined
}

const getFirstInlineMatch = (value: string): InlineMatch | undefined => {
  const matches = [
    findInlineCode(value),
    findLink(value),
    findDelimited(
      value,
      '**',
      VirtualDomElements.Strong,
      'TrelloMarkdownStrong',
    ),
    findItalic(value),
  ].filter((match): match is InlineMatch => Boolean(match))
  let first: InlineMatch | undefined
  for (const match of matches) {
    if (!first || match.start < first.start) {
      first = match
    }
  }
  return first
}

const unescapeMarkdownText = (value: string): string => {
  return value.replaceAll(escapedMarkdownTextPattern, '$1')
}

const parseInline = (value: string): VirtualDomSegment => {
  if (!value) {
    return { childCount: 0, dom: [] }
  }
  const match = getFirstInlineMatch(value)
  if (!match) {
    return {
      childCount: 1,
      dom: [text(unescapeMarkdownText(value))],
    }
  }
  const before = parseInline(value.slice(0, match.start))
  const after = parseInline(value.slice(match.end))
  return {
    childCount: before.childCount + match.node.childCount + after.childCount,
    dom: [...before.dom, ...match.node.dom, ...after.dom],
  }
}

const renderInlineLines = (lines: readonly string[]): VirtualDomSegment => {
  let childCount = 0
  const dom: VirtualDomNode[] = []
  for (const [index, line] of lines.entries()) {
    const lineDom = parseInline(line)
    if (index > 0) {
      childCount++
      dom.push(breakNode)
    }
    childCount += lineDom.childCount
    dom.push(...lineDom.dom)
  }
  return { childCount, dom }
}

const getHeadingLevel = (line: string): number => {
  let level = 0
  while (level < line.length && level < 6 && line[level] === '#') {
    level++
  }
  if (level === 0 || line[level] !== ' ') {
    return 0
  }
  return level
}

const isHeading = (line: string): boolean => {
  const level = getHeadingLevel(line)
  return level > 0 && line.slice(level).trim().length > 0
}

const isListItem = (line: string): boolean => {
  const value = line.trimStart()
  return (
    (value.startsWith('- ') || value.startsWith('* ')) &&
    value.slice(2).trim().length > 0
  )
}

const renderHeading = (line: string): readonly VirtualDomNode[] => {
  const level = getHeadingLevel(line)
  if (level === 0) {
    return renderParagraph([line])
  }
  const children = parseInline(line.slice(level + 1))
  return [
    {
      childCount: children.childCount,
      className: MergeClassNames.mergeClassNames(
        'TrelloMarkdownHeading',
        `TrelloMarkdownHeading${level}`,
      ),
      type: headingTypes[level - 1],
    },
    ...children.dom,
  ]
}

const renderListItem = (line: string): readonly VirtualDomNode[] => {
  const children = parseInline(line.trimStart().slice(2))
  return [
    {
      childCount: children.childCount,
      className: 'TrelloMarkdownListItem',
      type: VirtualDomElements.Li,
    },
    ...children.dom,
  ]
}

const renderParagraph = (
  lines: readonly string[],
): readonly VirtualDomNode[] => {
  const children = renderInlineLines(lines)
  return [
    {
      childCount: children.childCount,
      className: 'TrelloMarkdownParagraph',
      type: VirtualDomElements.P,
    },
    ...children.dom,
  ]
}

export const renderMarkdown = (markdown: string): VirtualDomSegment => {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const nodes: VirtualDomNode[] = []
  let childCount = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) {
      continue
    }
    if (isHeading(line)) {
      nodes.push(...renderHeading(line))
      childCount++
      continue
    }
    if (isListItem(line)) {
      const items: VirtualDomNode[] = []
      let itemCount = 0
      while (i < lines.length && isListItem(lines[i])) {
        items.push(...renderListItem(lines[i]))
        itemCount++
        i++
      }
      i--
      nodes.push(
        {
          childCount: itemCount,
          className: 'TrelloMarkdownList',
          type: VirtualDomElements.Ul,
        },
        ...items,
      )
      childCount++
      continue
    }
    const paragraphLines = [line]
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !isHeading(lines[i + 1]) &&
      !isListItem(lines[i + 1])
    ) {
      i++
      paragraphLines.push(lines[i])
    }
    nodes.push(...renderParagraph(paragraphLines))
    childCount++
  }
  return { childCount, dom: nodes }
}
