import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0d6c8c",
      light: "#4e9bb5",
      dark: "#064b63",
    },
    secondary: {
      main: "#cb7a17",
    },
    success: {
      main: "#2f7d32",
    },
    warning: {
      main: "#c77700",
    },
    background: {
      default: "#edf3f7",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.04em",
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 18px 45px rgba(14, 41, 55, 0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
