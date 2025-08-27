import React from 'react'

import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'

const ViewModeToggle = ({ value, onChange }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <ToggleButtonGroup value={value} exclusive onChange={(e, v) => v && onChange(v)} size='small'>
        <Tooltip title='کارتی'>
          <ToggleButton value='grid' aria-label='کارتی'>
            <GridViewIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='لیستی'>
          <ToggleButton value='list' aria-label='لیستی'>
            <ViewListIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  )
}

export default ViewModeToggle
