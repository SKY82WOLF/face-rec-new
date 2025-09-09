import { useState, useRef, useEffect } from 'react'

import { Box, Chip, TextField, Autocomplete, Typography } from '@mui/material'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSwappingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { snapCenterToCursor } from '@dnd-kit/modifiers'

// Draggable chip component
const DraggableChip = ({ id, label, onDelete, isOverflow = false, ...chipProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isDragging ? 0.5 : 1
  }

  if (isOverflow) {
    return (
      <Chip
        ref={setNodeRef}
        style={style}
        label={label}
        size='medium'
        sx={{
          backgroundColor: 'primary.main',
          color: '#fff'
        }}
        {...chipProps}
      />
    )
  }

  return (
    <Chip
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      label={label}
      onDelete={onDelete}
      size='medium'
      sx={{
        backgroundColor: 'primary.main',
        color: '#fff',
        '& .MuiChip-deleteIcon': {
          color: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            color: 'rgba(255, 255, 255, 1)'
          }
        },
        cursor: isDragging ? 'grabbing' : 'grab',
        '&:hover': {
          backgroundColor: 'primary.dark'
        }
      }}
      {...chipProps}
    />
  )
}

const DraggableAutocomplete = ({
  options = [],
  value = [],
  onChange,
  getOptionLabel,
  isOptionEqualToValue,
  renderInput,
  loading = false,
  maxVisibleTags = 3,
  sx = {},
  ...autocompleteProps
}) => {
  const [activeId, setActiveId] = useState(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(maxVisibleTags)
  const containerRef = useRef(null)
  const chipsContainerRef = useRef(null)

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Calculate how many tags can fit
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (!chipsContainerRef.current || !containerRef.current) return

      const container = containerRef.current
      const containerWidth = container.getBoundingClientRect().width

      // Account for input field padding and other elements
      const availableWidth = Math.max(containerWidth - 160, 120) // Minimum space
      const chipWidth = 120 // Approximate chip width including margin
      const calculated = Math.floor(availableWidth / chipWidth)

      setVisibleCount(Math.max(1, Math.min(calculated, value.length, maxVisibleTags)))
    }

    calculateVisibleCount()

    const resizeObserver = new ResizeObserver(calculateVisibleCount)

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [value.length, maxVisibleTags, containerWidth])

  const handleDragStart = event => {
    setActiveId(event.active.id)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleDragEnd = event => {
    const { active, over } = event

    setActiveId(null)

    if (!active || !over || active.id === over.id) {
      return
    }

    const oldIndex = value.findIndex(item => String(item.id) === String(active.id))
    const newIndex = value.findIndex(item => String(item.id) === String(over.id))

    if (oldIndex !== -1 && newIndex !== -1) {
      // perform a swap (exchange) instead of reordering
      const next = [...value]
      const tmp = next[oldIndex]

      next[oldIndex] = next[newIndex]
      next[newIndex] = tmp

      onChange?.(null, next)
    }
  }

  const handleChipDelete = itemToDelete => {
    const newValue = value.filter(item => item.id !== itemToDelete.id)

    onChange?.(null, newValue)
  }

  const visibleItems = value.slice(0, visibleCount)
  const hiddenCount = Math.max(0, value.length - visibleCount)
  const draggedItem = activeId ? value.find(item => String(item.id) === String(activeId)) : null

  return (
    <Box ref={containerRef} sx={{ width: '100%', ...sx }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        <Autocomplete
          {...autocompleteProps}
          multiple
          options={options}
          value={value}
          onChange={onChange}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          loading={loading}
          renderTags={() => null} // We'll render tags ourselves
          renderInput={params => (
            <Box>
              {renderInput({
                ...params,
                InputProps: {
                  ...params.InputProps,
                  startAdornment: (
                    <Box
                      ref={chipsContainerRef}
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: 0.5,
                        mr: 1,
                        overflow: 'hidden',
                        alignItems: 'center'
                      }}
                    >
                      <SortableContext
                        items={visibleItems.map(item => String(item.id))}
                        strategy={rectSwappingStrategy}
                      >
                        {visibleItems.map(item => (
                          <DraggableChip
                            key={item.id}
                            id={String(item.id)}
                            label={getOptionLabel(item)}
                            onDelete={() => handleChipDelete(item)}
                          />
                        ))}
                      </SortableContext>

                      {hiddenCount > 0 && (
                        <Chip
                          label={`+${hiddenCount}`}
                          size='medium'
                          variant='outlined'
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            cursor: 'default',
                            minWidth: 'auto',
                            '& .MuiChip-label': {
                              padding: '0 12px'
                            },
                            '&:hover': {
                              backgroundColor: 'primary.main',
                              color: '#fff'
                            }
                          }}
                        />
                      )}
                    </Box>
                  )
                }
              })}
            </Box>
          )}
        />

        <DragOverlay>
          {draggedItem && (
            <DraggableChip
              id={String(draggedItem.id)}
              label={getOptionLabel(draggedItem)}
              sx={{
                transform: 'rotate(5deg)',
                boxShadow: 3
              }}
            />
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  )
}

export default DraggableAutocomplete
