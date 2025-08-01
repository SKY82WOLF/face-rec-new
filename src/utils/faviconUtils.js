/**
 * Generates a dynamic SVG favicon based on a given color
 * @param {string} color - Hex color code
 * @returns {string} - Data URL containing the SVG favicon
 */
export const generateFavicon = color => {
  // Create SVG with the given color replacing currentColor
  const svg = `
    <svg width="1.4583em" height="1em" viewBox="0 0 35 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-2xl">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0.00188479 0V7.47707C0.00188479 7.47707 -0.145285 9.83135 2.161 11.8242L14.9358 23.9961L21.5792 23.9107L20.5136 10.7809L17.9947 7.82497L10.0778 0H0.00188479Z" fill="${color}"></path>
      <path opacity="0.06" fill-rule="evenodd" clip-rule="evenodd" d="M8.39807 17.9307L13.6581 3.53127L18.059 7.91564L8.39807 17.9307Z" fill="#161616"></path>
      <path opacity="0.06" fill-rule="evenodd" clip-rule="evenodd" d="M8.81183 17.3645L15.2093 5.06165L18.0926 7.94695L8.81183 17.3645Z" fill="#161616"></path>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M8.47955 17.8436L25.8069 0H34.9091V7.50963C34.9091 7.50963 34.7195 10.0128 33.4463 11.3517L21.5808 24H14.9387L8.47955 17.8436Z" fill="${color}"></path>
    </svg>
  `

  // Convert SVG to data URL
  const svgBase64 = btoa(svg)

  return `data:image/svg+xml;base64,${svgBase64}`
}

/**
 * Updates the favicon in the document head
 * @param {string} color - Hex color code
 */
export const updateFavicon = color => {
  if (typeof document === 'undefined') return

  // Generate favicon data URL
  const faviconUrl = generateFavicon(color)

  // Get existing favicon or create a new one
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link')

  link.type = 'image/svg+xml'
  link.rel = 'shortcut icon'
  link.href = faviconUrl

  // Update the document head
  document.getElementsByTagName('head')[0].appendChild(link)
}
