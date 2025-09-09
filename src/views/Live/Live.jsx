'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { Typography, Box, Card } from '@mui/material'
import TextField from '@mui/material/TextField'

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

import SEO from '@/components/SEO'
import { useTranslation } from '@/translations/useTranslation'
import LiveSection from './LiveSection'
import { commonStyles } from '@/@core/styles/commonStyles'
import EmptyState from '@/components/ui/EmptyState'
import LoadingState from '@/components/ui/LoadingState'
import DraggableAutocomplete from '@/components/ui/DraggableAutocomplete'
import useCameras from '@/hooks/useCameras'

// Sortable item wrapper for each LiveSection tile
const SortableLiveSection = ({ id, camera, reports }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const transformStyle = transform
    ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scaleX(${transform.scaleX ?? 1}) scaleY(${transform.scaleY ?? 1})`
    : undefined

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: transformStyle, transition, zIndex: isDragging ? 10 : 'auto' }}
      {...attributes}
      {...listeners}
      sx={{
        display: 'flex',
        width: { xs: '100%', md: '50%' },
        flexDirection: 'column',
        flex: { xs: '1 1 100%', md: '1 1 45%' },
        minHeight: 0,
        boxSizing: 'border-box',
        p: 1,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <LiveSection camera={camera} reports={reports} />
    </Box>
  )
}

const LiveContent = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { reports, isConnected, error } = useSelector(state => state.websocket)
  const [selectedCameraIds, setSelectedCameraIds] = useState([])
  const [activeId, setActiveId] = useState(null)

  // Fetch cameras to populate selector
  const { cameras = [], isLoading: isCamerasLoading } = useCameras({ page: 1, per_page: 100 })

  // Select the first camera by default when cameras load
  useEffect(() => {
    if (cameras.length > 0 && selectedCameraIds.length === 0) {
      const firstCamera = cameras[0]

      if (firstCamera?.id != null) {
        setSelectedCameraIds([String(firstCamera.id)])
      }
    }
  }, [cameras, selectedCameraIds.length])

  useEffect(() => {
    // Connect to WebSocket when component mounts
    dispatch({ type: 'websocket/connect' })

    // Disconnect when component unmounts
    return () => {
      dispatch({ type: 'websocket/disconnect' })
    }
  }, [dispatch])

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = event => {
    setActiveId(event?.active?.id ?? null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleDragEnd = event => {
    const { active, over } = event || {}

    setActiveId(null)

    if (!active || !over || active.id === over.id) {
      return
    }

    setSelectedCameraIds(prevIds => {
      const oldIndex = prevIds.indexOf(String(active.id))
      const newIndex = prevIds.indexOf(String(over.id))

      if (oldIndex === -1 || newIndex === -1) {
        return prevIds
      }

      // Swap the two items instead of reordering (exchange positions)
      const next = [...prevIds]
      const tmp = next[oldIndex]

      next[oldIndex] = next[newIndex]
      next[newIndex] = tmp

      return next
    })
  }

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <SEO
        title='داشبورد | سیستم تشخیص چهره دیانا'
        description='داشبورد اصلی سیستم تشخیص چهره دیانا'
        keywords='داشبورد, صفحه اصلی, تشخیص چهره دیانا'
      />

      {/* Selector Card */}
      <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 2 }}>
            {/* Camera Selector (multi-select with drag and drop) */}
            <DraggableAutocomplete
              size='medium'
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'primary.main' }
                }
              }}
              options={cameras}
              loading={isCamerasLoading}
              value={selectedCameraIds.map(id => cameras.find(cam => String(cam.id) === id)).filter(Boolean)}
              getOptionLabel={option => option?.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              maxVisibleTags={3}
              onChange={(_, newValues) => {
                const ids = Array.isArray(newValues) ? newValues.map(v => String(v.id)) : []

                setSelectedCameraIds(ids)
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={'انتخاب دوربین‌ها'}
                  placeholder={'انتخاب دوربین‌ها'}
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    sx: {
                      color: 'primary.main',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 'calc(100% - 20px)'
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      color: 'primary.main',
                      '& .MuiInputBase-input::placeholder': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }
                    }
                  }}
                />
              )}
            />
          </Box>
        </Box>
      </Card>
      {isCamerasLoading ? (
        <LoadingState message={t('live.loadingCameras') || 'در حال بارگذاری...'} minHeight={400} />
      ) : (
        <>
          {cameras.length === 0 ? (
            <Card sx={{ p: 4, pt: 2 }}>
              <Box sx={{ p: 2 }}>
                <EmptyState
                  message={t('live.noCameras') || t('cameras.noData') || 'هیچ دوربینی موجود نیست'}
                  minHeight={300}
                />
              </Box>
            </Card>
          ) : selectedCameraIds.length <= 1 ? (
            (() => {
              const cam = cameras.find(c => String(c.id) === String(selectedCameraIds[0]))

              if (!cam) {
                return (
                  <Card sx={{ p: 4, pt: 2 }}>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                        <Typography
                          textAlign={'center'}
                          variant='h5'
                          sx={{ ...commonStyles.centeredTitle, width: '100%' }}
                        >
                          {t('live.reports')}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )
              }

              return <LiveSection camera={cam} reports={reports} />
            })()
          ) : (
            (() => {
              const selectedCameras = selectedCameraIds
                .map(id => cameras.find(c => String(c.id) === String(id)))
                .filter(Boolean)

              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragCancel={handleDragCancel}
                  onDragEnd={handleDragEnd}
                  modifiers={[snapCenterToCursor]}
                  activationConstraint={{
                    delay: 250,
                    tolerance: 5
                  }}
                >
                  <SortableContext items={selectedCameraIds} strategy={rectSwappingStrategy}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                        flexGrow: 1,
                        alignItems: 'stretch',
                        minHeight: 0
                      }}
                    >
                      {selectedCameras.map(cam => (
                        <SortableLiveSection
                          key={`live_section_${cam.id}`}
                          id={String(cam.id)}
                          camera={cam}
                          reports={reports}
                        />
                      ))}
                    </Box>
                  </SortableContext>
                </DndContext>
              )
            })()
          )}
        </>
      )}
    </Box>
  )
}

export default function Live() {
  return <LiveContent />
}

//       {cameras.length === 0 ? (
//         <Card sx={{ p: 4, pt: 2 }}>
//           <Box sx={{ p: 2 }}>
//             <EmptyState
//               message={t('live.noCameras') || t('cameras.noData') || 'هیچ دوربینی موجود نیست'}
//               minHeight={300}
//             />
//           </Box>
//         </Card>
//       ) : selectedCameraIds.length <= 1 ? (
//         (() => {
//           const cam = cameras.find(c => String(c.id) === String(selectedCameraIds[0]))

//           if (!cam) {
//             return (
//               <Card sx={{ p: 4, pt: 2 }}>
//                 <Box sx={{ p: 2 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
//                     <Typography textAlign={'center'} variant='h5' sx={{ ...commonStyles.centeredTitle, width: '100%' }}>
//                       {t('live.reports')}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </Card>
//             )
//           }

//           return <LiveSection camera={cam} reports={reports} />
//         })()
//       ) : (
//         <Box
//           sx={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 2,
//             flexGrow: 1,
//             alignItems: 'stretch',
//             minHeight: 0
//           }}
//         >
//           {cameras
//             .filter(cam => selectedCameraIds.includes(String(cam.id)))
//             .map(cam => (
//               <Box
//                 key={`live_section_${cam.id}`}
//                 sx={{
//                   display: 'flex',
//                   width: { xs: '100%', md: '50%' },
//                   flexDirection: 'column',
//                   flex: { xs: '1 1 100%', md: '1 1 45%' },
//                   minHeight: 0,
//                   boxSizing: 'border-box',
//                   p: 1
//                 }}
//               >
//                 <LiveSection camera={cam} reports={reports} />
//               </Box>
//             ))}
//         </Box>
//       )}
//     </Box>
//   )
// }

// export default function Live() {
//   return <LiveContent />
// }
