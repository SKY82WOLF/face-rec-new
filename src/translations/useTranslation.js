// Importing translation data for Persian
import fa from './languages/fa'

// useTranslation hook for handling translations
export function useTranslation() {
  // We're only using Persian for now as requested
  const translations = fa

  // Translation function
  const t = (key, params = {}) => {
    // Split the key by dot notation to access nested properties
    const keys = key.split('.')

    // Navigate through the nested translation object
    let result = translations

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k]
      } else {
        // If translation is missing, return the key itself
        return key
      }
    }

    // Handle interpolation if params are provided
    if (typeof result === 'string' && Object.keys(params).length > 0) {
      return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match
      })
    }

    return result
  }

  return { t }
}
