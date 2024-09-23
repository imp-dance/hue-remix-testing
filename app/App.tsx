// Render only on client

import { HomeIcon } from "@radix-ui/react-icons";
import { Card, Flex, Heading, Switch } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import type { Light } from "../lib/hueApi.types";
import {
  getLights,
  getRooms,
  useUpdateLightMutation,
} from "./clientApi";
import { ChannelSwitcher } from "./components/ChannelSwitcher";
import { HeatPumpControl } from "./components/HeatPumpControl";
import { LightControl } from "./components/LightControl";
import { queryKeys } from "./constants";

export function App() {
  const lightsQuery = useQuery({
    queryFn: getLights,
    queryKey: [queryKeys.lights],
    refetchInterval: 1500,
  });
  const roomsQuery = useQuery({
    queryFn: getRooms,
    queryKey: [queryKeys.rooms],
  });
  const mutation = useUpdateLightMutation();

  if (!roomsQuery.data) return <div />;
  if (!lightsQuery.data) return <div />;

  const rooms = roomsQuery.data.data;
  const lights = lightsQuery.data.data.sort((a, b) =>
    a.metadata.name.localeCompare(b.metadata.name)
  );

  return (
    <Flex
      p="5"
      direction="column"
      gap="5"
      maxWidth="850px"
      style={{ marginInline: "auto" }}
    >
      <Heading size={{ initial: "5", md: "6", lg: "7" }}>
        Trollhammaren
      </Heading>
      <Flex gap="3">
        <ChannelSwitcher />
        <HeatPumpControl />
      </Flex>
      {rooms.map((room) => {
        const children = (
          room.children
            .map(({ rid }) =>
              lights.find((v) => v.owner.rid === rid)
            )
            .filter(Boolean) as Light[]
        ).sort((a, b) =>
          a.metadata.name.localeCompare(b.metadata.name)
        );
        const checked = children.some((v) => v.on.on);
        return (
          <Card key={room.id} size="2">
            <Flex direction="column" gap="3">
              <Heading color="gray" size="3">
                <Flex align="center" gap="2" justify="between">
                  <Flex align="center" gap="2">
                    <HomeIcon />
                    {room.metadata.name}
                  </Flex>
                  <Switch
                    size="1"
                    color="gray"
                    style={{ cursor: "pointer" }}
                    checked={checked}
                    disabled={mutation.isPending}
                    onCheckedChange={async (newChecked) => {
                      Promise.all(
                        children.map((child) =>
                          mutation.mutate({
                            id: child.id,
                            on: newChecked,
                          })
                        )
                      ).catch(() => {
                        console.log("Something went wrong...");
                      });
                    }}
                  />
                </Flex>
              </Heading>
              <Flex wrap="wrap" gap="3">
                {lights
                  .filter(
                    (device) =>
                      room.children.find(
                        (child) => child.rid === device.owner.rid
                      ) !== undefined
                  )
                  .map((device) => (
                    <LightControl
                      light={device}
                      key={device.id}
                    />
                  ))}
              </Flex>
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}
