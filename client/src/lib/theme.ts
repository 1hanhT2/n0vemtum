export type ThemeKey = "blue" | "green" | "purple" | "orange" | "red";

export const applyTheme = (theme: ThemeKey, darkMode: boolean) => {
  const root = document.documentElement;

  if (darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  root.classList.remove(
    "theme-blue",
    "theme-green",
    "theme-purple",
    "theme-orange",
    "theme-red",
  );

  root.classList.add(`theme-${theme}`);

  switch (theme) {
    case "green":
      root.style.setProperty("--primary", "hsl(134, 61%, 41%)");
      root.style.setProperty("--primary-foreground", "hsl(0, 0%, 100%)");
      root.style.setProperty("--ring", "hsl(134, 61%, 41%)");
      break;
    case "purple":
      root.style.setProperty("--primary", "hsl(263, 70%, 50%)");
      root.style.setProperty("--primary-foreground", "hsl(0, 0%, 100%)");
      root.style.setProperty("--ring", "hsl(263, 70%, 50%)");
      break;
    case "orange":
      root.style.setProperty("--primary", "hsl(25, 95%, 53%)");
      root.style.setProperty("--primary-foreground", "hsl(0, 0%, 100%)");
      root.style.setProperty("--ring", "hsl(25, 95%, 53%)");
      break;
    case "red":
      root.style.setProperty("--primary", "hsl(0, 72%, 51%)");
      root.style.setProperty("--primary-foreground", "hsl(0, 0%, 100%)");
      root.style.setProperty("--ring", "hsl(0, 72%, 51%)");
      break;
    default:
      root.style.setProperty("--primary", "hsl(221, 83%, 53%)");
      root.style.setProperty("--primary-foreground", "hsl(0, 0%, 100%)");
      root.style.setProperty("--ring", "hsl(221, 83%, 53%)");
      break;
  }
};

export const getStoredTheme = (): ThemeKey => {
  const savedTheme = localStorage.getItem("theme") as ThemeKey | null;
  return savedTheme ?? "blue";
};

export const getStoredDarkMode = (): boolean => {
  const storedMode = localStorage.getItem("darkMode");
  if (storedMode === null) {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  }
  return storedMode === "true";
};
