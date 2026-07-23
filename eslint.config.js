import * as config from '@lvce-editor/eslint-config'
import * as actions from '@lvce-editor/eslint-plugin-github-actions'

export default [
  ...config.default,
  ...config.recommendedRegex,
  ...config.recommendedTsconfig,
  ...config.recommendedVirtualDom,
  ...actions.default,
  {
    files: ['packages/extension/**/*.ts'],
    rules: {
      'virtual-dom/prefer-state-destructuring': 'off',
    },
  },
  {
    files: ['packages/extension/src/parts/TrelloView/render/**/*.ts'],
    rules: {
      'virtual-dom/hoist-static-nodes': 'off',
      'virtual-dom/prefer-state-destructuring': 'error',
    },
  },
  {
    files: [
      'packages/extension/src/parts/TrelloView/render/RenderBoardDetail.ts',
      'packages/extension/src/parts/TrelloView/render/RenderCardDetailPanel/RenderCardDetailPanel.ts',
    ],
    rules: {
      'virtual-dom/no-inline-style': 'off',
    },
  },
  {
    files: ['packages/extension/test/**/*.ts'],
    rules: {
      'virtual-dom/no-inline-event-handlers': 'off',
      'virtual-dom/no-object-attribute-values': 'off',
      'virtual-dom/prefer-merge-class-names': 'off',
    },
  },
  {
    rules: {
      'github-actions/ci-versions': 'off',
      'github-actions/action-versions': 'off',
      'sonarjs/void-use': 'off',
      'e2e/no-imports': 'off',
    },
  },
]
