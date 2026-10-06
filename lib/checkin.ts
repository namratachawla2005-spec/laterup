// Daily check-in answers (Home, Section 4). Used by Home, Patterns, Talk and Doctor Prep.
import type { Option } from "./intake";

export const SLEEP_OPTIONS: Option[] = [
  { value: "well", label: "Well" },
  { value: "on_off", label: "On and off" },
  { value: "barely", label: "Barely" },
];

export const ENERGY_OPTIONS: Option[] = [
  { value: "low", label: "Low" },
  { value: "okay", label: "Okay" },
  { value: "good", label: "Good" },
];

// "Slept badly" for Patterns = on and off, or barely
export const SLEPT_BADLY = ["on_off", "barely"];

// Words for sentences: "Slept: barely", "Energy: low"
export const sleepWord = (v: string) => SLEEP_OPTIONS.find((o) => o.value === v)?.label.toLowerCase() ?? v;
export const energyWord = (v: string) => ENERGY_OPTIONS.find((o) => o.value === v)?.label.toLowerCase() ?? v;
