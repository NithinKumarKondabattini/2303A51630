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
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Aptos", "Trebuchet MS", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 10px 24px rgba(14, 41, 55, 0.06)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          borderColor: "rgba(20, 33, 43, 0.12)",
          paddingInline: 16,
          textTransform: "none",
          "&.Mui-selected": {
            color: "#ffffff",
            borderColor: "#0d6c8c",
            background: "linear-gradient(135deg, #0d6c8c, #2b8cab)",
          },
          "&.Mui-selected:hover": {
            background: "linear-gradient(135deg, #0b5f7b, #257b97)",
          },
        },
      },
    },
  },
});
