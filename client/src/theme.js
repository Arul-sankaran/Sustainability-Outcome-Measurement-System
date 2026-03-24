import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#1B2E5E", light: "#2F4A8C", dark: "#111E3D", contrastText: "#fff" },
    secondary:  { main: "#2F7BE8", light: "#5B9AEE", dark: "#1A5CC4", contrastText: "#fff" },
    error:      { main: "#DC2626" },
    warning:    { main: "#D97706" },
    success:    { main: "#16A34A" },
    background: { default: "#F8F9FC", paper: "#FFFFFF" },
    text:       { primary: "#0F1729", secondary: "#64748B" },
    divider:    "#E4E8F0",
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    h1: { fontWeight: 800 }, h2: { fontWeight: 800 },
    h3: { fontWeight: 700 }, h4: { fontWeight: 700 },
    h5: { fontWeight: 700 }, h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { background: "#F8F9FC", scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 #F1F5F9" },
        "*::-webkit-scrollbar": { width: 5 },
        "*::-webkit-scrollbar-track": { background: "#F1F5F9" },
        "*::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: 3 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, textTransform: "none" },
        containedPrimary: {
          background: "linear-gradient(135deg,#1B2E5E,#2F4A8C)",
          boxShadow: "0 2px 8px rgba(27,46,94,0.22)",
          "&:hover": { background: "linear-gradient(135deg,#111E3D,#1B2E5E)", boxShadow: "0 4px 16px rgba(27,46,94,0.3)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { background: "#fff", border: "1px solid #E4E8F0", borderRadius: 12, boxShadow: "0 2px 8px rgba(15,23,41,0.05)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8, background: "#fff",
            "& fieldset": { borderColor: "#E4E8F0" },
            "&:hover fieldset": { borderColor: "#A0AECF" },
            "&.Mui-focused fieldset": { borderColor: "#2F7BE8", borderWidth: "1.5px" },
          },
          "& .MuiInputLabel-root": { color: "#64748B", fontSize: "0.88rem" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#2F7BE8" },
          "& .MuiOutlinedInput-input": { color: "#0F1729", fontSize: "0.9rem" },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.88rem", color: "#0F1729",
          "&:hover": { background: "#EFF3FF" },
          "&.Mui-selected": { background: "#E8EEFF", color: "#1B2E5E", fontWeight: 600 },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, fontSize: "0.76rem" } },
    },
  },
});

export default theme;