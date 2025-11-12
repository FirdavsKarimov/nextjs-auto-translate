"use client";

import { useState } from "react";
import { languageMap, LanguageCode } from "../../../data/languageMap.js";
import { useAlgebrasIntl } from "../Provider.js";

interface DropdownTriggerProps {
  currentLocale: string;
  isOpen: boolean;
  onClick: () => void;
}

const DropdownTrigger = ({
  currentLocale,
  isOpen,
  onClick
}: DropdownTriggerProps) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 16px",
      backgroundColor: "#ffffff",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "500",
      color: "#374151",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
      minWidth: "140px",
      justifyContent: "space-between"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#3b82f6";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#e5e7eb";
      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
    }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      🌐
      {languageMap[currentLocale as LanguageCode]}
    </span>
    <span
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
        fontSize: "12px"
      }}
    >
      ▼
    </span>
  </button>
);

interface DropdownOptionProps {
  locale: string;
  isSelected: boolean;
  onClick: (locale: string) => void;
}

const DropdownOption = ({
  locale,
  isSelected,
  onClick
}: DropdownOptionProps) => (
  <button
    onClick={() => onClick(locale)}
    disabled={isSelected}
    style={{
      width: "100%",
      padding: "12px 16px",
      backgroundColor: isSelected ? "#f3f4f6" : "#ffffff",
      border: "none",
      fontSize: "14px",
      fontWeight: isSelected ? "600" : "500",
      color: isSelected ? "#6b7280" : "#374151",
      cursor: isSelected ? "default" : "pointer",
      transition: "all 0.15s ease",
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      borderBottom: "1px solid #f3f4f6"
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = "#f8fafc";
        e.currentTarget.style.color = "#1f2937";
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = "#ffffff";
        e.currentTarget.style.color = "#374151";
      }
    }}
  >
    {isSelected && (
      <span style={{ color: "#10b981", fontSize: "12px" }}>✓</span>
    )}
      {languageMap[locale as LanguageCode]}
  </button>
);

const LocaleSwitcher = () => {
  const { locale: currentLocale, setLocale, getLocales } = useAlgebrasIntl();
  const [isOpen, setIsOpen] = useState(false);

  const availableLocales = getLocales();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLocaleChange = (locale: string) => {
    setLocale(locale);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Current Locale Button */}
      <DropdownTrigger
        currentLocale={currentLocale}
        isOpen={isOpen}
        onClick={toggleDropdown}
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            marginTop: "4px",
            backgroundColor: "#ffffff",
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out"
          }}
        >
          {availableLocales.map((locale) => (
            <DropdownOption
              key={locale}
              locale={locale}
              isSelected={locale === currentLocale}
              onClick={handleLocaleChange}
            />
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LocaleSwitcher;
