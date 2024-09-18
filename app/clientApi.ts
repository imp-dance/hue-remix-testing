import { Light, Room } from "../lib/hueApi.types";

export function getLights() {
  return fetch("/api/devices").then(
    (res) =>
      res.json() as Promise<{
        data: Light[];
        errors: unknown[];
      }>
  );
}

export function getRooms() {
  return fetch("/api/rooms").then(
    (res) =>
      res.json() as Promise<{
        data: Room[];
        errors: unknown[];
      }>
  );
}
