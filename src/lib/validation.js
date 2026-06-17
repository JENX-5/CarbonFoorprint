// src/lib/validation.js
/**
 * Utility functions for validating calculator input fields.
 * Centralizes the logic so multiple modules can reuse the same validation rules.
 */
import { FIELD_BOUNDS } from "./calculations.js";

/**
 * Validate a single field by its identifier.
 *
 * @param {string} id - The field identifier (must be present in FIELD_BOUNDS).
 * @param {any} value - The raw value supplied by the user.
 * @returns {string} Empty string if the value is valid, otherwise an error message.
 */
export function validateField(id, value) {
  const bounds = FIELD_BOUNDS[id];
  if (!bounds) return "";
  if (value === "" || value === null || typeof value === "undefined") {
    return `${bounds.label} is required.`;
  }
  const num = Number(value);
  if (!isFinite(num)) return `${bounds.label} must be a number.`;
  if (num < bounds.min || num > bounds.max) {
    return `Enter a value between ${bounds.min} and ${bounds.max}.`;
  }
  return "";
}
