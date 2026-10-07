// "Text size" in Settings: Standard or Larger. Saved on her phone (a per-device
// convenience, like the phone's own text size). Larger makes everything ~12% bigger.
export const TEXT_SIZE_KEY = "laterup:text-size";
export type TextSize = "standard" | "larger";

export function readTextSize(): TextSize {
  try {
    return localStorage.getItem(TEXT_SIZE_KEY) === "larger" ? "larger" : "standard";
  } catch {
    return "standard";
  }
}

export function saveTextSize(size: TextSize) {
  document.documentElement.dataset.textSize = size;
  try {
    localStorage.setItem(TEXT_SIZE_KEY, size);
  } catch {
    // Storage blocked (private mode): it still applies until the page is closed
  }
}

// Runs before the page draws (in app/layout.tsx), so there is no flash of small text
export const TEXT_SIZE_SCRIPT = `try{if(localStorage.getItem("${TEXT_SIZE_KEY}")==="larger")document.documentElement.dataset.textSize="larger"}catch(e){}`;
