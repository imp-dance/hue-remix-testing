import { LightningBoltIcon } from "@radix-ui/react-icons";
import { Flex, Heading, Switch } from "@radix-ui/themes";
import { Light } from "lib/hueApi.types";
import { createApp } from "radix-os";
import React from "react";
import { useLightsQuery, useRoomsQuery } from "~/api";
import { useUpdateLightMutation } from "~/clientApi";
import { LightControl } from "~/components/LightControl";

const LightControlAppComponent = createApp(() => {
  const lightsQuery = useLightsQuery();
  const roomsQuery = useRoomsQuery();
  const mutation = useUpdateLightMutation();
  if (!roomsQuery.data) return <div />;
  if (!lightsQuery.data) return <div />;
  const lights = lightsQuery.data.data.sort((a, b) =>
    a.metadata.name.localeCompare(b.metadata.name)
  );
  const rooms = roomsQuery.data.data;

  return (
    <div style={{ padding: "var(--space-5)" }}>
      <Flex wrap="wrap" direction="column" gap="3">
        {rooms.map((device) => {
          const children = (
            device.children
              .map(({ rid }) =>
                lights.find((v) => v.owner.rid === rid)
              )
              .filter(Boolean) as Light[]
          ).sort((a, b) =>
            a.metadata.name.localeCompare(b.metadata.name)
          );
          const checked = children.some((v) => v.on.on);

          return (
            <Flex direction="column" gap="3" key={device.id}>
              <Flex align="center" gap="2" justify="between">
                <Heading size="3">
                  {device.metadata.name}
                </Heading>
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
              {children.length > 0 &&
                children.map((device) => (
                  <React.Fragment key={device.id}>
                    <LightControl
                      light={device}
                      key={device.id}
                    />
                  </React.Fragment>
                ))}
              <hr
                style={{
                  width: "100%",
                  borderColor: "var(--gray-1)",
                }}
              />
            </Flex>
          );
        })}
      </Flex>
    </div>
  );
});

export const lightControlApp = {
  component: LightControlAppComponent,
  appId: "light",
  appName: "Light Control",
  addToDesktop: true,
  defaultWindowSettings: {
    initialWidth: 560,
    initialHeight: 400,
    icon: <LightningBoltIcon />,
    title: "Light Control",
  },
};
