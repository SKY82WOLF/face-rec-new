# Styling System Documentation

## Overview

This document outlines the styling approach and best practices for the face recognition application.

## Architecture

### 1. Centralized Styles (`commonStyles.js`)

- **Purpose**: Eliminate inline style duplication
- **Location**: `src/@core/styles/commonStyles.js`
- **Usage**: Import and use in components

### 2. Reusable UI Components

- **Location**: `src/components/ui/`
- **Components**: PageHeader, LoadingState, EmptyState, PaginationControls
- **Purpose**: Provide consistent UI patterns

### 3. Custom Hooks

- **Location**: `src/hooks/`
- **Hooks**: usePagination, useSorting
- **Purpose**: Encapsulate common logic

## Best Practices

### 1. Style Priority Order

1. **Reusable Components** - Use existing UI components first
2. **Common Styles** - Import from `commonStyles.js`
3. **Inline Styles** - Only for component-specific styling
4. **Styled Components** - For complex, reusable styled elements

### 2. Naming Conventions

- Use camelCase for style object keys
- Use descriptive names that indicate purpose
- Group related styles together

### 3. Responsive Design

- Use MUI's responsive breakpoints
- Mobile-first approach
- Test on multiple screen sizes

### 4. Theme Integration

- Use theme colors and spacing
- Avoid hardcoded values
- Leverage MUI's design tokens

## Usage Examples

### Using Common Styles

```jsx
import { commonStyles } from '@/@core/styles/commonStyles'
;<Box sx={commonStyles.pageContainer}>
  <Box sx={commonStyles.loadingContainer}>
    <CircularProgress />
  </Box>
</Box>
```

### Using Reusable Components

```jsx
import PageHeader from '@/components/ui/PageHeader'
import LoadingState from '@/components/ui/LoadingState'

<PageHeader
  title="Users"
  actionButton="Add User"
  actionButtonProps={{ onClick: handleAddUser }}
/>

<LoadingState message="Loading users..." />
```

### Using Custom Hooks

```jsx
import usePagination from '@/hooks/usePagination'

const { page, per_page, handlePageChange, handlePerPageChange } = usePagination()
```

## Migration Guide

### Before (Inline Styles)

```jsx
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 4,
    flexWrap: 'wrap',
    gap: 2
  }}
>
  <Typography
    sx={{
      fontWeight: 600,
      color: 'primary.main',
      textTransform: 'uppercase'
      // ... more inline styles
    }}
  >
    Title
  </Typography>
</Box>
```

### After (Using Common Styles)

```jsx
import PageHeader from '@/components/ui/PageHeader'
;<PageHeader title='Title' actionButton='Action' />
```

## Benefits

1. **Consistency**: All components use the same styling patterns
2. **Maintainability**: Changes to common styles update everywhere
3. **Performance**: Reduced bundle size through style reuse
4. **Developer Experience**: Faster development with reusable components
5. **Scalability**: Easy to add new components following established patterns

## Future Improvements

1. **CSS-in-JS Optimization**: Consider using emotion or styled-components for complex styling
2. **Design System**: Create a comprehensive design system with tokens
3. **Storybook Integration**: Document components with Storybook
4. **Theme Variants**: Support multiple theme variants
5. **Animation System**: Centralized animation patterns
