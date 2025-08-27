import React from 'react'

import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import GridOnIcon from '@mui/icons-material/GridOn'

const ViewModeToggle = ({ value, onChange }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <ToggleButtonGroup value={value} exclusive onChange={(e, v) => v && onChange(v)} size='small'>
        <Tooltip title='لیستی'>
          <ToggleButton value='list' aria-label='list'>
            <ViewListIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='کارتی کوچک'>
          <ToggleButton value='report' aria-label='report-cards'>
            <GridViewIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='کارتی بزرگ'>
          <ToggleButton value='card' aria-label='card-cards'>
            <GridOnIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  )
}

export default ViewModeToggle
