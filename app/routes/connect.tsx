import {
  CheckCircledIcon,
  DesktopIcon,
  InfoCircledIcon,
  LightningBoltIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Callout,
  Card,
  Code,
  Container,
  Flex,
  Heading,
  Separator,
  Skeleton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { HueApi } from "lib/hueApi";
import { PairFailure, PairSuccess } from "lib/hueApi.types";
import { useState } from "react";
import { Alert } from "~/Alert";

export default function ConnectRoute() {
  const [ip, setIp] = useState("");
  const [sbIp, setSbIp] = useState("");
  const pairWithBridgeMutation = useMutation({
    mutationFn: () => HueApi.pairWithBridge(ip),
    mutationKey: ["connect"],
  });
  const pairWithSyncBoxMutation = useMutation({
    mutationFn: () => HueApi.pairWithSyncBox(sbIp),
    mutationKey: ["connectSb"],
  });

  const credentials =
    pairWithBridgeMutation.data?.raw_response.find(
      isSuccessResponse
    )?.success ?? null;
  const notPressed =
    pairWithBridgeMutation.data?.raw_response.every(
      (res) => res && "error" in res && res.error.type === 101
    );

  const syncBoxCredentials =
    pairWithSyncBoxMutation.data?.credentials ?? null;

  return (
    <Container size="2">
      <Flex direction="column" gap="3" p="5">
        <Heading size="7">
          <Flex align="center" gap="3">
            <LightningBoltIcon />
            Connect
          </Flex>
        </Heading>
        <Text>Set up devices for use in smart house app</Text>
        <Separator size="4" my="3" />
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="5">
              <Flex align="center" gap="3">
                <DesktopIcon />
                Bridge
              </Flex>
            </Heading>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                pairWithBridgeMutation.mutate();
              }}
            >
              <Flex align="center" gap="3">
                <TextField.Root
                  placeholder="http://192.168..."
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                ></TextField.Root>
                <Button disabled={!ip}>Sync with bridge</Button>
              </Flex>
            </form>
            {pairWithBridgeMutation.isError && (
              <NotFoundCallout />
            )}
            {notPressed && (
              <Alert color="red">
                Link button was not pressed. Please click the
                sync button on your physical device and try
                again.
              </Alert>
            )}
            {credentials && (
              <Alert color="green" icon={<CheckCircledIcon />}>
                <Heading size="2">
                  Connection established
                </Heading>
                Copy and paste the following content into your{" "}
                <Code>.env</Code> file:
                <div>
                  <Code variant="ghost" mt="3" size="3" asChild>
                    <pre>
                      {`USERNAME=${credentials.username}
CLIENTKEY=${credentials.clientkey}
BRIDGE_CONNECTION=${
                        ip.startsWith("http")
                          ? `https${ip.substring(4)}`
                          : ip
                      }`}
                    </pre>
                  </Code>
                </div>
              </Alert>
            )}
            {pairWithBridgeMutation.data && (
              <Skeleton
                loading={pairWithBridgeMutation.isPending}
              >
                <Code>
                  <pre>
                    {JSON.stringify(
                      pairWithBridgeMutation.data ?? {},
                      null,
                      2
                    )}
                  </pre>
                </Code>
              </Skeleton>
            )}
          </Flex>
        </Card>
        <Card>
          <Flex direction="column" gap="3">
            <Heading size="5">
              <Flex align="center" gap="3">
                <DesktopIcon />
                Sync box
              </Flex>
            </Heading>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                pairWithSyncBoxMutation.mutate();
              }}
            >
              <Flex align="center" gap="3">
                <TextField.Root
                  placeholder="http://192.168..."
                  value={sbIp}
                  onChange={(e) => setSbIp(e.target.value)}
                ></TextField.Root>
                <Button disabled={!sbIp}>
                  Sync with sync box
                </Button>
              </Flex>
            </form>
            {pairWithSyncBoxMutation.isError && (
              <NotFoundCallout />
            )}
            {syncBoxCredentials && (
              <Alert color="green" icon={<CheckCircledIcon />}>
                <Heading size="2">
                  Connection established
                </Heading>
                Copy and paste the following content into your{" "}
                <Code>.env</Code> file:
                <div>
                  <Code variant="ghost" mt="3" size="3" asChild>
                    <pre>
                      {`SYNCBOX_ACCESSTOKEN=${
                        syncBoxCredentials.accessToken
                      }
SYNCBOX_REGISTRATIONID=${syncBoxCredentials.registrationId}
SYNCBOX_CONNECTION=${
                        sbIp.startsWith("http")
                          ? `https${sbIp.substring(4)}`
                          : sbIp
                      }`}
                    </pre>
                  </Code>
                </div>
              </Alert>
            )}
          </Flex>
        </Card>
      </Flex>
    </Container>
  );
}

function NotFoundCallout() {
  return (
    <Callout.Root color="red">
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>
        Given IP address was not found. Please check the IP
        address and try again.
      </Callout.Text>
    </Callout.Root>
  );
}

function isSuccessResponse(
  res: PairSuccess | PairFailure | null
): res is PairSuccess {
  return res && "success" in res && res.success.username
    ? true
    : false;
}
