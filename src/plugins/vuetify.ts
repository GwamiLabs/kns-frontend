// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import { ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/lib/iconsets/mdi'

const knsTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#00CC33',
    secondary: '#A1A1A1',
  }
}

export default createVuetify({
    theme: {
      defaultTheme: 'knsTheme',
      themes: {
        knsTheme,
      }
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      }
    }
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
