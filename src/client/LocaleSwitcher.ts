// src/client/LocaleSwitcher.ts

interface LocaleSwitcherOptions {
  availableLocales?: string[];
  defaultLocale?: string;
  onLocaleChange?: (locale: string) => void;
}

export class LocaleSwitcher {
  private availableLocales: string[];
  private currentLocale: string;
  private onLocaleChange?: (locale: string) => void;

  constructor(options: LocaleSwitcherOptions = {}) {
    this.availableLocales = options.availableLocales || [
      "en",
      "es",
      "fr",
      "de"
    ];
    this.currentLocale = this.getCurrentLocale(options.defaultLocale);
    this.onLocaleChange = options.onLocaleChange;
  }

  private getCurrentLocale(defaultLocale = "en"): string {
    if (typeof window !== "undefined") {
      // Check URL params first
      const urlParams = new URLSearchParams(window.location.search);
      const urlLocale = urlParams.get("locale");
      if (urlLocale && this.availableLocales.includes(urlLocale)) {
        return urlLocale;
      }

      // Check localStorage
      const savedLocale = localStorage.getItem("algebras-auto-intl-locale");
      if (savedLocale && this.availableLocales.includes(savedLocale)) {
        return savedLocale;
      }
    }

    return defaultLocale;
  }

  public setLocale(locale: string): void {
    if (!this.availableLocales.includes(locale)) {
      console.warn(
        `[LocaleSwitcher] Locale "${locale}" is not available. Available locales: ${this.availableLocales.join(
          ", "
        )}`
      );
      return;
    }

    this.currentLocale = locale;

    if (typeof window !== "undefined") {
      localStorage.setItem("algebras-auto-intl-locale", locale);

      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set("locale", locale);
      window.history.replaceState({}, "", url.toString());
    }

    if (this.onLocaleChange) {
      this.onLocaleChange(locale);
    } else {
      // Default behavior: reload the page
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  }

  public getLocale(): string {
    return this.currentLocale;
  }

  public getAvailableLocales(): string[] {
    return [...this.availableLocales];
  }

  public createSwitcherHTML(containerId: string): void {
    if (typeof document === "undefined") return;

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(
        `[LocaleSwitcher] Container with ID "${containerId}" not found`
      );
      return;
    }

    // Create label
    const label = document.createElement("label");
    label.textContent = "Language: ";
    label.setAttribute("for", "locale-select");
    label.style.marginRight = "8px";
    label.style.fontWeight = "500";

    // Create select element
    const select = document.createElement("select");
    select.id = "locale-select";
    select.style.padding = "8px 12px";
    select.style.borderRadius = "6px";
    select.style.border = "1px solid #ccc";
    select.style.backgroundColor = "white";
    select.style.fontSize = "14px";
    select.style.cursor = "pointer";
    select.style.minWidth = "140px";

    // Locale display names
    const localeNames: Record<string, string> = {
      en: "🇺🇸 English",
      es: "🇪🇸 Español",
      fr: "🇫🇷 Français",
      de: "🇩🇪 Deutsch"
    };

    // Add options
    this.availableLocales.forEach((locale) => {
      const option = document.createElement("option");
      option.value = locale;
      option.textContent = localeNames[locale] || locale.toUpperCase();
      if (locale === this.currentLocale) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Add event listener
    select.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      this.setLocale(target.value);
    });

    // Clear container and add elements
    container.innerHTML = "";
    container.appendChild(label);
    container.appendChild(select);
  }
}

// Create a default instance for easy usage
export const defaultLocaleSwitcher = new LocaleSwitcher();

// Utility functions for direct usage
export const setLocale = (locale: string) =>
  defaultLocaleSwitcher.setLocale(locale);
export const getLocale = () => defaultLocaleSwitcher.getLocale();
export const getAvailableLocales = () =>
  defaultLocaleSwitcher.getAvailableLocales();
export const createSwitcher = (containerId: string) =>
  defaultLocaleSwitcher.createSwitcherHTML(containerId);
