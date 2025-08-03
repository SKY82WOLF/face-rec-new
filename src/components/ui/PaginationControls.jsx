import { Box, FormControl, InputLabel, Select, MenuItem, Pagination } from '@mui/material'

import { commonStyles } from '@/@core/styles/commonStyles'

const PaginationControls = ({
  page,
  total,
  per_page,
  per_pageOptions = [5, 10, 15, 20],
  onPageChange,
  onPerPageChange,
  itemsPerPageLabel = 'Items per page'
}) => {
  return (
    <Box sx={commonStyles.paginationContainer}>
      <FormControl size='medium' sx={commonStyles.formControl}>
        <InputLabel>{itemsPerPageLabel}</InputLabel>
        <Select value={per_page} onChange={onPerPageChange} label={itemsPerPageLabel}>
          {per_pageOptions.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={commonStyles.paginationControls}>
        <Pagination
          count={Math.ceil((total || 0) / per_page)}
          page={page}
          onChange={onPageChange}
          color='primary'
          showFirstButton
          showLastButton
          size='small'
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        />
      </Box>
      <Box sx={{ width: { xs: 0, sm: 120 } }} /> {/* Spacer to balance the layout */}
    </Box>
  )
}

export default PaginationControls
