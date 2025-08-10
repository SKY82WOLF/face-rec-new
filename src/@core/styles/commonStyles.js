// Common styles used across the application
// This eliminates inline style duplication and provides consistent styling

export const commonStyles = {
  // Layout styles
  pageContainer: {
    pt: 3
  },

  // Header styles
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 4,
    flexWrap: 'wrap',
    gap: 2
  },

  // Title styles with underline
  pageTitle: {
    fontWeight: 600,
    color: 'primary.main',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',
    marginBottom: '10px',
    flexGrow: 1,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: 157,
      height: 3,
      backgroundColor: 'primary.main',
      borderRadius: '2px',
      marginBottom: 1
    }
  },

  // Centered title styles
  centeredTitle: {
    fontWeight: 600,
    color: 'primary.main',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',
    marginBottom: '1rem',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80px',
      height: '3px',
      backgroundColor: 'primary.main',
      borderRadius: '5px',
      marginBottom: '0.4rem'
    }
  },

  // Loading states
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap:'15px',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  },

  // Empty state
  emptyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200
  },

  // Card styles
  transparentCard: {
    elevation: 0,
    
    // backgroundColor: { xs: '#00000000' }
  },

  // Table styles
  tableCellCenter: {
    textAlign: 'center'
  },

  // Action buttons container
  actionButtonsContainer: {
    display: 'flex',
    gap: 1,
    justifyContent: 'center'
  },

  // Pagination container
  paginationContainer: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'space-between',
    alignItems: 'center',
    mt: 3,
    gap: 2,
    p: 2
  },

  // Pagination controls
  paginationControls: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    width: { xs: '100%', sm: 'auto' }
  },

  // Form control styles
  formControl: {
    minWidth: 120,
    width: { xs: '100%', sm: 'auto' }
  },

  // Modal styles
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  },

  // Image upload styles
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    mb: 3
  },

  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: '10%',
    objectFit: 'cover',
    mb: 2
  },

  // Scrollbar styles
  customScrollbar: {
    '&::-webkit-scrollbar': {
      width: '8px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0,0,0,0.1)',
      borderRadius: '4px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '4px',
      '&:hover': {
        background: 'rgba(0,0,0,0.3)'
      }
    }
  },

  // Live stream container
  liveStreamContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1
  },

  // Live stream image
  liveStreamImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'inherit',
    cursor: 'pointer'
  }
}

// Responsive breakpoints
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536
}

// Spacing system
export const spacing = {
  xs: 0.5,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4
}

// Color system
export const colors = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  error: 'error.main',
  warning: 'warning.main',
  info: 'info.main'
}
