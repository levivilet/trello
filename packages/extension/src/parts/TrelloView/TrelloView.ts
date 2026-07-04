import type { View } from '@lvce-editor/api'
import { viewId } from './Constants.ts'
import { createInstance } from './CreateInstance.ts'

export const view: View = {
  create: createInstance,
  // @ts-ignore
  displayName: 'Trello',
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  title: 'Trello',
}

export {
  resetTrelloViewDependencyFactory,
  setTrelloViewDependencyFactory,
} from './state/DependencyFactory.ts'
export { searchEnabledPreference, viewId } from './Constants.ts'
