/**
 * Find the closest point on a line.
 * This point will be within reach of the lamp.
 *
 * @param A the point where the line starts
 * @param B the point where the line ends
 * @param P the point which is close to a line.
 * @return the point which is on the line.
 */
export function getClosestPointToPoints(
  A: Point,
  B: Point,
  P: Point
): Point {
  const AP = makePoint(P.x - A.x, P.y - A.y);
  const AB = makePoint(B.x - A.x, B.y - A.y);
  const ab2 = AB.x * AB.x + AB.y * AB.y;
  const ap_ab = AP.x * AB.x + AP.y * AB.y;
  let t = ap_ab / ab2;
  if (t < 0.0) {
    t = 0.0;
  } else if (t > 1.0) {
    t = 1.0;
  }
  const newPoint = makePoint(A.x + AB.x * t, A.y + AB.y * t);
  return newPoint;
}

export function getClosestPoint(
  point: Point,
  gamut: Gamut
): Point {
  const pAB = getClosestPointToPoints(gamut.r, gamut.g, point);
  const pAC = getClosestPointToPoints(gamut.b, gamut.r, point);
  const pBC = getClosestPointToPoints(gamut.g, gamut.b, point);

  const dAB = getDistanceBetweenTwoPoints(point, pAB);
  const dAC = getDistanceBetweenTwoPoints(point, pAC);
  const dBC = getDistanceBetweenTwoPoints(point, pBC);

  let lowest = dAB;
  let closestPoint = pAB;

  if (dAC < lowest) {
    lowest = dAC;
    closestPoint = pAC;
  }

  if (dBC < lowest) {
    lowest = dBC;
    closestPoint = pBC;
  }

  return closestPoint;
}

/**
 * Find the distance between two points.
 *
 * @param one
 * @param two
 * @return the distance between point one and two
 */
export function getDistanceBetweenTwoPoints(
  one: Point,
  two: Point
): number {
  const dx = one.x - two.x; // horizontal difference
  const dy = one.y - two.y; // vertical difference
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist;
}

/**
 * Method to see if the given XY value is within the reach of the lamps.
 *
 * @param p the point containing the X,Y value
 * @return true if within reach, false otherwise.
 */
export function checkPointInLampsReach(
  p: Point,
  gamut: Gamut
): boolean {
  const red = gamut.r;
  const green = gamut.g;
  const blue = gamut.b;

  const v1 = makePoint(green.x - red.x, green.y - red.y);
  const v2 = makePoint(blue.x - red.x, blue.y - red.y);

  const q = makePoint(p.x - red.x, p.y - red.y);

  const s = crossProduct(q, v2) / crossProduct(v1, v2);
  const t = crossProduct(v1, q) / crossProduct(v1, v2);

  if (s >= 0.0 && t >= 0.0 && s + t <= 1.0) {
    return true;
  } else {
    return false;
  }
}

export function makePoint(x: number, y: number): Point {
  return { x, y };
}

export function crossProduct(p1: Point, p2: Point): number {
  return p1.x * p2.y - p1.y * p2.x;
}

// GAMUT are exposed by Hue API v2 for each light resource.
export const GAMUT_C = {
  r: makePoint(0.6915, 0.3038),
  g: makePoint(0.17, 0.7),
  b: makePoint(0.1532, 0.0475),
};

export interface Point {
  x: number;
  y: number;
}

export interface Gamut {
  r: Point;
  g: Point;
  b: Point;
}

export function rgbToXy(
  r: number,
  g: number,
  b: number,
  gamut: Gamut = GAMUT_C
): { x: number; y: number; brightness: number } {
  // Get the RGB values from your color object and convert them to be between 0 and 1. So the RGB color (255, 0, 100) becomes (1.0, 0.0, 0.39)
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device.
  r = gammaCorrection(r);
  g = gammaCorrection(g);
  b = gammaCorrection(b);

  // Convert the RGB values to XYZ using the Wide RGB D65 conversion formula The formulas used:
  const X = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const Z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // Calculate the xy values from the XYZ values
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);
  const brightness = Y;

  // Check if the found xy value is within the color gamut of the light, if not continue with step 6, otherwise step 7. When we send a value which the light is
  // not capable of, the resulting color might not be optimal. Therefore we try to only send values which are inside the color gamut of the selected light.
  if (!checkPointInLampsReach(makePoint(x, y), gamut)) {
    // Calculate the closest point on the color gamut triangle and use that as xy value The closest value is calculated by making a perpendicular line to one of
    // the lines the triangle consists of and when it is then still not inside the triangle, we choose the closest corner point of the triangle.
    const closestPoint = getClosestPoint(makePoint(x, y), gamut);
    x = closestPoint.x;
    y = closestPoint.y;
  }

  return { x, y, brightness };
}

function gammaCorrection(value: number): number {
  return value > 0.04045
    ? Math.pow((value + 0.055) / (1.0 + 0.055), 2.4)
    : value / 12.92;
}

export function xyToRgb(
  x: number,
  y: number,
  brightness: number,
  gamut: Gamut = GAMUT_C
): { r: number; g: number; b: number } {
  // Check if the xy value is within the color gamut of the lamp, if not continue with step 2, otherwise step 3. We do
  // this to calculate the most accurate color the given light can actually do.
  if (!checkPointInLampsReach(makePoint(x, y), gamut)) {
    // Calculate the closest point on the color gamut triangle and use that as xy value. See step 6 of color to xy.
    const closestPoint = getClosestPoint(makePoint(x, y), gamut);

    x = closestPoint.x;
    y = closestPoint.y;
  }

  // Calculate XYZ values
  const z = 1.0 - x - y;

  const Y = brightness;
  const X = (Y / y) * x;
  const Z = (Y / y) * z;

  // Convert to RGB using Wide RGB D65 conversion
  let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
  let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
  let b = X * 0.051713 - Y * 0.121364 + Z * 1.01153;

  if (r > b && r > g && r > 1.0) {
    // red is too big
    g = g / r;
    b = b / r;
    r = 1.0;
  } else if (g > b && g > r && g > 1.0) {
    // green is too big
    r = r / g;
    b = b / g;
    g = 1.0;
  } else if (b > r && b > g && b > 1.0) {
    // blue is too big
    r = r / b;
    g = g / b;
    b = 1.0;
  }

  r = reverseGammaCorrection(r);
  g = reverseGammaCorrection(g);
  b = reverseGammaCorrection(b);

  if (r > b && r > g) {
    // red is biggest
    if (r > 1.0) {
      g = g / r;
      b = b / r;
      r = 1.0;
    }
  } else if (g > b && g > r) {
    // green is biggest
    if (g > 1.0) {
      r = r / g;
      b = b / g;
      g = 1.0;
    }
  } else if (b > r && b > g) {
    // blue is biggest
    if (b > 1.0) {
      r = r / b;
      g = g / b;
      b = 1.0;
    }
  }

  r = Math.round(r * 255);
  g = Math.round(g * 255);
  b = Math.round(b * 255);

  return { r, g, b };
}

function reverseGammaCorrection(rgbValue: number): number {
  return rgbValue <= 0.0031308
    ? 12.92 * rgbValue
    : (1.0 + 0.055) * Math.pow(rgbValue, 1.0 / 2.4) - 0.055;
}
