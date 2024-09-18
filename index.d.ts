declare module "cie-rgb-color-converter" {
  export const ColorConverter: {
    rgbToXy: (
      r: number,
      g: number,
      b: number,
      modelId?: string
    ) => { x: number; y: number };
    xyBriToRgb: (
      x: number,
      y: number,
      b: number
    ) => { r: number; g: number; b: number };
  };
  export default ColorConverter;
}
