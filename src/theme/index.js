import { createTheme } from '@mui/material/styles';
import { typography } from './typography';
import { palette } from './palette';
import { components } from './components';

const theme = createTheme({
  typography,
  palette,
  shape: {
    borderRadius: 12,
  },
  components,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  spacing: 8, // Base spacing unit in pixels
  zIndex: {
    appBar: 1200,
    drawer: 1100,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
});

export default theme; 