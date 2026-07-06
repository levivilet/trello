interface DomEventListener {
  readonly name: string | number
  readonly params: readonly string[]
  readonly preventDefault?: boolean
}

export const renderEventListeners = (): readonly DomEventListener[] => {
  return [
    {
      name: 'handleDragStart',
      params: ['handleViewEvent', 'dragstart', 'event.target.name'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleViewEvent', 'dragend', 'event.target.name'],
    },
    {
      name: 'handleDragOver',
      params: ['handleViewEvent', 'dragover', 'event.currentTarget.dataset.id'],
      preventDefault: true,
    },
    {
      name: 'handleDragLeave',
      params: ['handleViewEvent', 'dragleave', 'event.currentTarget.dataset.id'],
    },
    {
      name: 'handleDrop',
      params: ['handleViewEvent', 'drop', 'event.currentTarget.dataset.id'],
      preventDefault: true,
    },
  ]
}
