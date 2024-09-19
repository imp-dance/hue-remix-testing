import {
  EntertainmentConfigurationResponse,
  Light,
  Room,
} from "../lib/hueApi.types";

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
export function getEntertainment() {
  return fetch("/api/entertainment").then(
    (res) =>
      res.json() as Promise<{
        hdmi: Record<
          `input${number}`,
          {
            name: string;
            status: "linked" | "unplugged";
            type: string;
            lastSyncMode: "game" | "video" | "music";
          }
        >;
        execution: {
          hdmiSource: `input${number}`;
          hdmiActive: boolean;
        };
      }>
  );
}

export function setSyncMode(mode: "game" | "video" | "music") {
  return fetch("/api/entertainment", {
    method: "POST",
    body: JSON.stringify({
      action: "change_mode",
      mode,
    }),
  }).then(
    (res) =>
      res.json() as Promise<EntertainmentConfigurationResponse>
  );
}

export function setChannel(channel: `input${number}`) {
  return fetch("/api/entertainment", {
    method: "POST",
    body: JSON.stringify({
      action: "set_channel",
      channel,
    }),
  }).then((res) => res.json() as Promise<unknown>);
}
