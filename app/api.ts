import { useQuery } from "@tanstack/react-query";
import { getLights, getRooms } from "./clientApi";
import { queryKeys } from "./constants";

export const useLightsQuery = () =>
  useQuery({
    queryFn: getLights,
    queryKey: [queryKeys.lights],
    refetchInterval: 1500,
  });
export const useRoomsQuery = () =>
  useQuery({
    queryFn: getRooms,
    queryKey: [queryKeys.rooms],
  });
