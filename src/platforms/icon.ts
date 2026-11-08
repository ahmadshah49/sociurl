import type { IconMetadata } from "../types";
import { ICONS } from "./icon-data";

export type IconName = keyof typeof ICONS;

export function icon(name: IconName, color: string): IconMetadata {
  return {
    viewBox: ICONS[name].viewBox,
    paths: ICONS[name].paths,
    color,
  };
}
