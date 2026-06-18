import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppTheme, ThemeName, themes } from "../../theme/themes";

type ThemeContextType = {
  themeName: ThemeName;
  theme: AppTheme;
  setThemeName: (name: ThemeName) => Promise<void>;
  isReady: boolean;
};

const THEME_STORAGE_KEY = "app_theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("neo");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "neo" || saved === "emerald" || saved === "midnight") {
          setThemeNameState(saved);
        }
      } catch (error) {
        console.log("Theme load error:", error);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setThemeName = async (name: ThemeName) => {
    setThemeNameState(name);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.log("Theme save error:", error);
    }
  };

  const value = useMemo(
    () => ({
      themeName,
      theme: themes[themeName],
      setThemeName,
      isReady,
    }),
    [themeName, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
}