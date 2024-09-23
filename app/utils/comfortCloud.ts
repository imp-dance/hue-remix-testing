import { Device, Group } from "panasonic-comfort-cloud-client";

export function extractDeviceFromGroups(
  groups: Group[]
): Device {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (groups[0] as any)?._devices?.[0];
}
