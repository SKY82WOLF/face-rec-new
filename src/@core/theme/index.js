// Next Imports
// import { Public_Sans, Vazirmatn, El_Messiri } from 'next/font/google'
import '../../../public/fonts/vazirmatn/vazirmatn.css'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

// const public_sans = Public_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })
// const vazirmatn = Vazirmatn({ subsets: ['arabic'], weight: ['300', '400', '500', '600', '700', '800', '900'] })
// const el_messiri = El_Messiri({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] })

const theme = (settings, mode, direction) => {
  return {
    direction,
    components: overrides(settings.skin),
    colorSchemes: colorSchemes(settings.skin),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography('Vazirmatn'),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '47 43 61',
      dark: '225 222 245',
      lightShadow: '47 43 61',
      darkShadow: '19 17 32'
    }
  }
}

export default theme
