// Render only on client

import { HomeIcon, SunIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Slider,
  Switch,
  Text,
} from "@radix-ui/themes";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CSSProperties, useState } from "react";
import type { Light } from "../lib/hueApi.types";
import { getLights, getRooms } from "./clientApi";
import { useDebounceCallback } from "./useDebounceCallback";
import { hexToRgb, rgbToHex, rgbToXY, xybToRGB } from "./utils";

const queryKeys = {
  lights: "lights",
  rooms: "rooms",
};

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
      maxWidth="1200px"
      style={{ marginInline: "auto" }}
    >
      <Heading size={{ initial: "5", md: "6", lg: "7" }}>
        Trollhammaren
      </Heading>
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
              <Grid
                columns={{ sm: "2", md: "3", lg: "4" }}
                gap="3"
              >
                {lights
                  .filter(
                    (device) =>
                      room.children.find(
                        (child) => child.rid === device.owner.rid
                      ) !== undefined
                  )
                  .map((device) => (
                    <LightCard light={device} key={device.id} />
                  ))}
              </Grid>
            </Flex>
          </Card>
        );
      })}
    </Flex>
  );
}

function LightCard(props: { light: Light }) {
  const mutation = useUpdateLightMutation();
  const debouncedMutate = useDebounceCallback(
    mutation.mutate,
    500
  );

  const light = props.light;

  const [requestedBrightness, setRequestedBrightness] = useState(
    light.dimming.brightness
  );
  const serverRgb = xybToRGB(
    light.color.xy.x,
    light.color.xy.y,
    requestedBrightness
  );
  const [requestedHex, setRequestedHex] = useState(
    rgbToHex(serverRgb.r, serverRgb.g, serverRgb.b)
  );
  const { r, g, b } = hexToRgb(requestedHex)!;
  const rgb = `rgb(${r}, ${g}, ${b})`;

  return (
    <Card
      style={
        {
          "--card-background-color": light.on.on
            ? rgb
            : undefined,
          textTransform: "uppercase",
          position: "relative",
        } as CSSProperties
      }
      asChild
    >
      <Button
        onClick={() => {
          mutation.mutate({ id: light.id, on: !light.on.on });
        }}
        size="2"
        color="gray"
        style={{
          display: "flex",
          height: "auto",
          cursor: "pointer",
        }}
        disabled={mutation.isPending}
        variant="soft"
      >
        <Flex
          direction="column"
          align="center"
          pb="1"
          width="100%"
          height="100%"
          style={{ paddingRight: "10%" }}
        >
          <Heading
            size={{ initial: "1", sm: "2" }}
            style={{
              color: "gray",
              mixBlendMode: "difference",
            }}
          >
            <Flex align="center" gap="2">
              <SunIcon />
              <Text
                style={{
                  minWidth: "max-content",
                }}
              >
                {light.metadata.name}
              </Text>
            </Flex>
          </Heading>
          {light.on.on ? (
            <Text
              style={{
                color: "gray",
                mixBlendMode: "difference",
                filter: "contrast(2)",
                display: "block",
              }}
              size="1"
            >
              {requestedBrightness}%
            </Text>
          ) : null}
          {light.on.on ? (
            <Box
              mt="2"
              mb="-2"
              style={{
                width: "100%",
                flexGrow: 1,
              }}
            >
              <Slider
                color="gray"
                variant="classic"
                value={[requestedBrightness]}
                onValueChange={([value]) => {
                  setRequestedBrightness(value);
                  debouncedMutate({
                    id: light.id,
                    brightness: value,
                  });
                }}
                style={
                  {
                    "--accent-track": requestedHex,
                    filter: "contrast(0.9)",
                    width: "100%",
                  } as CSSProperties
                }
                min={light.dimming.min_dim_level}
                step={0.5}
                max={100}
                onClick={(e) => e.stopPropagation()}
                size="3"
              />
            </Box>
          ) : null}
        </Flex>
        {light.on.on ? (
          <>
            <input
              type="color"
              value={requestedHex}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100%",
                width: "10%",
                border: "none",
                opacity: 0.2,
                cursor: "grab",
              }}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setRequestedHex(e.target.value);
                const newValue = hexToRgb(e.target.value);
                if (!newValue) return;
                const { r, g, b } = newValue;
                const { x, y } = rgbToXY(r, g, b);
                debouncedMutate({
                  id: light.id,
                  color: {
                    x,
                    y,
                  },
                });
              }}
            />
          </>
        ) : null}
      </Button>
    </Card>
  );
}

const useUpdateLightMutation = () => {
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
};
