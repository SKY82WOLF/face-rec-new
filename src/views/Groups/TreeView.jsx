import * as React from 'react'

import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SearchIcon from '@mui/icons-material/Search'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import CollapseAllIcon from '@mui/icons-material/KeyboardArrowUp'
import SelectAllIcon from '@mui/icons-material/SelectAll'
import ClearIcon from '@mui/icons-material/Clear'

import { useTranslation } from '@/translations/useTranslation'

// Helper to build tree structure from flattened permissions list
function buildTreeItems(permissions) {
  const map = {}
  const roots = []

  permissions.forEach(p => {
    map[p.id] = { ...p, children: [] }
  })

  permissions.forEach(p => {
    if (p.parent_id && map[p.parent_id]) {
      map[p.parent_id].children.push(map[p.id])
    } else {
      roots.push(map[p.id])
    }
  })

  return roots
}

// Helper to filter tree to only show nodes in onlyShowIds (and their ancestors)
function filterTree(items, onlyShowIds) {
  if (!onlyShowIds) return items

  const filterRecursive = node => {
    if (onlyShowIds.includes(node.id)) return { ...node }

    if (node.children) {
      const filteredChildren = node.children.map(filterRecursive).filter(Boolean)

      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren }
      }
    }

    return null
  }

  return items.map(filterRecursive).filter(Boolean)
}

// Helper to search in tree items
function searchTreeItems(items, searchTerm) {
  if (!searchTerm) return items

  const searchRecursive = node => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.codename && node.codename.toLowerCase().includes(searchTerm.toLowerCase()))

    if (node.children && node.children.length > 0) {
      const matchingChildren = node.children.map(searchRecursive).filter(Boolean)

      if (matchingChildren.length > 0 || matchesSearch) {
        return { ...node, children: matchingChildren }
      }
    }

    return matchesSearch ? node : null
  }

  return items.map(searchRecursive).filter(Boolean)
}

// Format permission name for display
const formatPermissionName = permission => {
  const readableName = permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return permission.codename ? `${readableName} (${permission.codename})` : readableName
}

function PermissionTreeView({
  permissions,
  selected = [],
  onChange,
  readOnly = false,
  onlyShowIds = null,
  rtl = false,
  height = 300,
  showControls = true
}) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [expandedItems, setExpandedItems] = React.useState([])

  const items = React.useMemo(() => buildTreeItems(permissions), [permissions])

  const filteredItems = React.useMemo(() => {
    let filtered = filterTree(items, onlyShowIds)

    if (searchTerm) {
      filtered = searchTreeItems(filtered, searchTerm)
    }

    return filtered
  }, [items, onlyShowIds, searchTerm])

  // Convert selected IDs to strings for RichTreeView
  const selectedItems = React.useMemo(() => selected.map(String), [selected])

  // Handle selection change
  const handleSelectedItemsChange = React.useCallback(
    (event, newSelectedItems) => {
      if (onChange) {
        // Convert back to numbers
        const numericIds = newSelectedItems.map(id => parseInt(id, 10))

        onChange(numericIds)
      }
    },
    [onChange]
  )

  // Handle expansion change
  const handleExpandedItemsChange = React.useCallback((event, newExpandedItems) => {
    setExpandedItems(newExpandedItems)
  }, [])

  // Expand all items
  const handleExpandAll = React.useCallback(() => {
    const getAllIds = items => {
      let ids = []

      items.forEach(item => {
        ids.push(String(item.id))

        if (item.children && item.children.length > 0) {
          ids = ids.concat(getAllIds(item.children))
        }
      })

      return ids
    }

    setExpandedItems(getAllIds(filteredItems))
  }, [filteredItems])

  // Collapse all items
  const handleCollapseAll = React.useCallback(() => {
    setExpandedItems([])
  }, [])

  // Select all items
  const handleSelectAll = React.useCallback(() => {
    if (onChange) {
      const getAllIds = items => {
        let ids = []

        items.forEach(item => {
          ids.push(item.id)

          if (item.children && item.children.length > 0) {
            ids = ids.concat(getAllIds(item.children))
          }
        })

        return ids
      }

      onChange(getAllIds(filteredItems))
    }
  }, [filteredItems, onChange])

  // Deselect all items
  const handleDeselectAll = React.useCallback(() => {
    if (onChange) {
      onChange([])
    }
  }, [onChange])

  // Clear search
  const handleClearSearch = React.useCallback(() => {
    setSearchTerm('')
  }, [])

  // Custom item rendering for better RTL support
  const getItemLabel = React.useCallback(item => {
    const label = formatPermissionName(item)

    // Add count for category items
    if (item.isCategory && item.children && item.children.length > 0) {
      return `${label} (${item.children.length})`
    }

    return label
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: '0px' }}>
      {/* Controls */}
      {showControls && !readOnly && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Search */}
          <TextField
            size='small'
            placeholder={t('groups.treeView.searchPermissions')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start' sx={{ mr: 0, marginRight: '0.5rem' }}>
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end' sx={{ ml: 0 }}>
                    <Button size='small' onClick={handleClearSearch} sx={{ minWidth: 'auto', p: 0.5 }}>
                      <ClearIcon fontSize='small' />
                    </Button>
                  </InputAdornment>
                )
              }
            }}
            inputProps={{
              style: {
                textAlign: rtl ? 'right' : 'left',
                direction: rtl ? 'rtl' : 'ltr'
              }
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size='small' startIcon={<UnfoldMoreIcon />} onClick={handleExpandAll} variant='outlined'>
              {t('groups.treeView.expandAll')}
            </Button>
            <Button size='small' startIcon={<CollapseAllIcon />} onClick={handleCollapseAll} variant='outlined'>
              {t('groups.treeView.collapseAll')}
            </Button>
            <Button size='small' startIcon={<SelectAllIcon />} onClick={handleSelectAll} variant='outlined'>
              {t('groups.treeView.selectAll')}
            </Button>
            <Button size='small' startIcon={<ClearIcon />} onClick={handleDeselectAll} variant='outlined'>
              {t('groups.treeView.deselectAll')}
            </Button>
          </Box>

          {/* Selection Count */}
          {selected.length > 0 && (
            <Chip
              label={`${selected.length} ${t('groups.treeView.selectedPermissions')}`}
              color='primary'
              size='small'
              variant='outlined'
            />
          )}
        </Box>
      )}

      {/* Tree View */}
      <Box
        sx={{
          direction: rtl ? 'rtl' : 'ltr',
          height: 'auto',
          overflow: 'auto',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          bgcolor: 'background.paper',
          '& .MuiTreeItem-content': {
            flexDirection: rtl ? 'row-reverse' : 'row',
            justifyContent: rtl ? 'flex-end' : 'flex-start',
            padding: '4px 8px',
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          },
          '& .MuiTreeItem-iconContainer': {
            order: rtl ? 2 : 1,
            marginRight: rtl ? 0 : 1,
            marginLeft: rtl ? 1 : 0
          },
          '& .MuiTreeItem-label': {
            order: rtl ? 1 : 2,
            textAlign: rtl ? 'right' : 'left',
            fontWeight: theme => item => (item.isCategory ? 600 : 400),
            color: theme => item => (item.isCategory ? 'primary.main' : 'text.primary'),
            fontStyle: theme => item => (item.isCategory ? 'italic' : 'normal')
          },
          '& .MuiTreeItem-group': {
            marginLeft: rtl ? '0' : '17px',
            marginRight: rtl ? '17px' : '0'
          },
          '& .MuiTreeItem-selected': {
            bgcolor: 'primary.light',
            '&:hover': {
              bgcolor: 'primary.light'
            }
          }
        }}
      >
        {filteredItems.length > 0 ? (
          <RichTreeView
            items={filteredItems}
            getItemId={item => String(item.id)}
            getItemLabel={getItemLabel}
            getItemChildren={item => item.children || []}
            selectedItems={readOnly ? [] : selectedItems}
            onSelectedItemsChange={readOnly ? undefined : handleSelectedItemsChange}
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            multiSelect={!readOnly}
            checkboxSelection={!readOnly}
            disableSelection={readOnly}
            selectionPropagation={{
              descendants: true,
              parents: true
            }}
            collapseIcon={<ExpandMoreIcon />}
            expandIcon={rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            sx={{
              flexGrow: 1,
              '& .MuiTreeItem-content': {
                flexDirection: rtl ? 'row-reverse' : 'row',
                justifyContent: rtl ? 'flex-end' : 'flex-start'
              },
              '& .MuiTreeItem-iconContainer': {
                order: rtl ? 2 : 1
              },
              '& .MuiTreeItem-label': {
                order: rtl ? 1 : 2,
                textAlign: rtl ? 'right' : 'left'
              },
              '& .MuiTreeItem-group': {
                marginLeft: rtl ? '0' : '17px',
                marginRight: rtl ? '17px' : '0'
              }
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <Typography variant='body2'>
              {searchTerm ? t('groups.treeView.noPermissionsFound') : t('groups.noPermissionsAvailable')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

PermissionTreeView.propTypes = {
  permissions: PropTypes.array.isRequired,
  selected: PropTypes.array,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  onlyShowIds: PropTypes.array,
  rtl: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showControls: PropTypes.bool
}

export default PermissionTreeView
