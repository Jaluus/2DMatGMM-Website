import { Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ScanInspector from "./pages/ScanInspector";
import ScanManager from "./pages/ScanManager";
import FlakeManager from "./pages/FlakeManager";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Notifications } from '@mantine/notifications';

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{
          colorScheme,
          focusRing: "never",
        }}
        withGlobalStyles
        withNormalizeCSS
        withCSSVariables
      >
        <Notifications />
        <Routes>
          <Route path="/" element={<ScanManager />} />
          <Route path="/scanInspector" element={<ScanInspector />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/flakeManager" element={<FlakeManager />} />
        </Routes>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
