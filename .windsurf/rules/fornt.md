---
trigger: manual
---

🏗️ Project Architecture
Your project follows a well-organized Next.js structure with clear separation of concerns:

@core/
 - Framework-level components, styles, and utilities
@layouts/ - Layout management system
@menu/ - Navigation and menu components
api/
 - Feature-based API service functions
components/
 - Reusable UI components with 
ui/
 subfolder for generic components
hooks/
 - Custom React hooks for data fetching and state management
views/ - Page-level components organized by features
translations/
 - Persian language internationalization system
🎨 Styling Philosophy
You use a hybrid approach combining:

Material-UI as the primary component library
commonStyles.js
 for consistent styling patterns
sx
 prop for component-specific styling
Responsive design with MUI breakpoints
Modern card designs with hover effects and smooth transitions
🔧 Code Quality Standards
Your project enforces strict quality through:

ESLint with specific import ordering and formatting rules
Prettier with single quotes, no semicolons, 120-char width
Consistent naming: PascalCase for components, camelCase for hooks/functions
Proper error handling with console.error logging
📊 Data Management Patterns
You follow excellent patterns with:

React Query for server state management with prefetching
Custom hooks that encapsulate data fetching logic
Proper cache invalidation after mutations
Consistent API service structure with error handling
🌐 Internationalization
Your translation system uses:

Dot notation for nested translations (
t('shifts.title')
)
Persian language as primary language
Parameter interpolation support
🎯 Key Patterns I Identified
Component Structure: Consistent import order, state management, and JSX organization
Card Design: Elevation 0, hover transforms, consistent spacing
Loading States: Dedicated components for loading and empty states
Modal Patterns: Consistent modal container styling
Responsive Design: Mobile-first approach with grid layouts
