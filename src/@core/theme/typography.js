const typography = fontFamily => ({
  fontFamily:
    typeof fontFamily === 'undefined' || fontFamily === ''
      ? [
          '"Vazirmatn"',
          '"El Messiri"',
          '"Public Sans"',
          'sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"'
        ].join(',')
      : fontFamily,
  fontSize: 13.125,
  h1: {
    fontSize: '2.875rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  h2: {
    fontSize: '2.375rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  h6: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  subtitle1: {
    fontSize: '0.9375rem',
    lineHeight: 1.6
  },
  subtitle2: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    lineHeight: 1.6
  },
  body1: {
    fontSize: '0.9375rem',
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.8125rem',
    lineHeight: 1.6
  },
  button: {
    fontSize: '0.9375rem',
    lineHeight: 1.6,
    textTransform: 'none'
  },
  caption: {
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    letterSpacing: '0.4px'
  },
  overline: {
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.8px'
  }
})

export default typography
