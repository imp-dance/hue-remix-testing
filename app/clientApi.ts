import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Group } from "panasonic-comfort-cloud-client";
import { z } from "zod";
import {
  EntertainmentConfigurationResponse,
  Light,
  Room,
} from "../lib/hueApi.types";
import { queryKeys } from "./constants";
import { heatPumpEventSchema } from "./domain";

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
      res.json() as Promise<
        | {
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
          }
        | { error: string }
      >
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

export function useUpdateLightMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (arg: {
      id: string;
      on?: boolean;
      color?: { x: number; y: number };
      brightness?: number;
    }) =>
      fetch("/api/devices/" + arg.id, {
        body: JSON.stringify(arg),
        method: "PUT",
      }),
    mutationKey: [queryKeys.lights],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.lights],
      });
    },
  });
}

export function useHeatPumpEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (arg: z.infer<typeof heatPumpEventSchema>) =>
      fetch("/api/comfortcloud", {
        body: JSON.stringify(arg),
        method: "PUT",
      }).then((res) => res.json()),
    mutationKey: [queryKeys.heatpump],
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.heatpump],
      });
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.heatpump],
        });
      }, 2500);
    },
  });
}

export function useHeatPumpQuery() {
  return useQuery({
    queryFn: () =>
      fetch("/api/comfortcloud", {
        method: "GET",
      }).then((res) => res.json() as Promise<Group[]>),
    queryKey: [queryKeys.heatpump],
    refetchInterval: 15000,
  });
}
