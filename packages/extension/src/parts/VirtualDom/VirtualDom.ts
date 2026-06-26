import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'

export interface TreeNode {
  readonly children: readonly TreeNode[]
  readonly node: VirtualDomNode
}

export const textNode = (value: string): TreeNode => {
  return {
    children: [],
    node: text(value),
  }
}

export const node = (
  type: number,
  properties: Readonly<Record<string, unknown>> = {},
  children: readonly TreeNode[] = [],
): TreeNode => {
  return {
    children,
    node: {
      ...properties,
      childCount: children.length,
      type,
    },
  }
}

export const div = (
  className: string,
  children: readonly TreeNode[],
): TreeNode => {
  return node(VirtualDomElements.Div, { className }, children)
}

export const button = (
  name: string,
  label: string,
  className = 'TrelloButton',
): TreeNode => {
  return node(
    VirtualDomElements.Button,
    {
      className,
      name,
      onClick: 'handleClick',
    },
    [textNode(label)],
  )
}

export const input = (
  name: string,
  value: string,
  placeholder: string,
): TreeNode => {
  return node(VirtualDomElements.Input, {
    className: 'TrelloInput',
    name,
    onInput: 'handleInput',
    placeholder,
    value,
  })
}

export const flatten = (tree: TreeNode): readonly VirtualDomNode[] => {
  return [tree.node, ...tree.children.flatMap(flatten)]
}
