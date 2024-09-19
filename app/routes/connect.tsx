import {
  CheckCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Callout,
  Code,
  Flex,
  Heading,
  Skeleton,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { HueApi } from "lib/hueApi";
import { PairFailure, PairSuccess } from "lib/hueApi.types";
import { useState } from "react";

export default function ConnectRoute() {
  const [ip, setIp] = useState("");
  const mutation = useMutation({
    mutationFn: () => HueApi.pairWithBridge(ip),
    mutationKey: ["connect"],
  });

  const credentials =
    mutation.data?.raw_response.find(isSuccessResponse)
      ?.success ?? null;
  const notPressed = mutation.data?.raw_response.every(
    (res) => res && "error" in res && res.error.type === 101
  );

  return (
    <Flex direction="column" gap="5" p="5">
      <Heading size="7">Connect</Heading>
      <Flex align="center" gap="3">
        <TextField.Root
          placeholder="192.168..."
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        ></TextField.Root>
        <Button onClick={() => mutation.mutate()}>
          Sync with bridge
        </Button>
      </Flex>
      {notPressed && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Link button was not pressed. Try again.
          </Callout.Text>
        </Callout.Root>
      )}
      {credentials && (
        <Callout.Root color="green">
          <Callout.Icon>
            <CheckCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            <Heading size="2">Connection established</Heading>
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
          </Callout.Text>
        </Callout.Root>
      )}
      {mutation.data && (
        <Skeleton loading={mutation.isPending}>
          <Code>
            <pre>
              {JSON.stringify(mutation.data ?? {}, null, 2)}
            </pre>
          </Code>
        </Skeleton>
      )}
    </Flex>
  );
}

function isSuccessResponse(
  res: PairSuccess | PairFailure | null
): res is PairSuccess {
  return res && "success" in res && res.success.username
    ? true
    : false;
}
