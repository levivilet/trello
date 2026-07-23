import type { VirtualDomNode } from '@lvce-editor/virtual-dom-worker'

export interface VirtualDomSegment {
  readonly childCount: number
  readonly dom: readonly VirtualDomNode[]
}
