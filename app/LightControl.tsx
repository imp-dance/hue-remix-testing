import { SunIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Slider,
  Text,
} from "@radix-ui/themes";
import { Light } from "lib/hueApi.types";
import { CSSProperties, useState } from "react";
import { useUpdateLightMutation } from "./clientApi";
import { useDebounceCallback } from "./useDebounceCallback";
import { hexToRgb, rgbToHex } from "./utils";
import { rgbToXy, xyToRgb } from "./xyzrgb";

export function LightControl(props: { light: Light }) {
  const mutation = useUpdateLightMutation();
  const debouncedMutate = useDebounceCallback(
    mutation.mutate,
    500
  );

  const light = props.light;

  const [requestedBrightness, setRequestedBrightness] = useState(
    light.dimming.brightness
  );

  const gamut = retrieveGamut(light);

  const serverRgb = xyToRgb(
    light.color.xy.x,
    light.color.xy.y,
    light.dimming.brightness,
    gamut
  );
  const [requestedHex, setRequestedHex] = useState(
    rgbToHex(serverRgb.r, serverRgb.g, serverRgb.b)
  );
  const { r, g, b } = hexToRgb(requestedHex)!;

  const background = light.on.on
    ? `rgb(${r}, ${g}, ${b})`
    : undefined;
  const filter = `brightness(${
    0.3 + (requestedBrightness / 100) * 0.7
  })`;

  return (
    <Card
      style={
        {
          "--card-background-color": background,
          textTransform: "uppercase",
          position: "relative",
          filter,
          minWidth: "min(250px, 100%)",
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
        title="Click to toggle light"
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
                title="Click and drag to change brightness"
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
              title="Click to change color"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                height: "100%",
                width: "10%",
                border: "none",
                opacity: 0.2,
                cursor: "pointer",
              }}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setRequestedHex(e.target.value);
                const newValue = hexToRgb(e.target.value);
                if (!newValue) return;
                const { r, g, b } = newValue;
                const { x, y } = rgbToXy(r, g, b, gamut);
                debouncedMutate({
                  id: light.id,
                  color: {
                    x: Math.min(1, Math.max(0, x)),
                    y: Math.min(1, Math.max(0, y)),
                  },
                });
              }}
              onBlur={() => {
                setRequestedHex(
                  rgbToHex(serverRgb.r, serverRgb.g, serverRgb.b)
                );
              }}
            />
          </>
        ) : null}
      </Button>
    </Card>
  );
}

function retrieveGamut(light: Light) {
  return {
    r: light.color.gamut.red,
    g: light.color.gamut.green,
    b: light.color.gamut.blue,
  };
}
