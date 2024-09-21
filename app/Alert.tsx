import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";

type Color = Parameters<typeof Callout.Root>[0]["color"];
type Variant = Parameters<typeof Callout.Root>[0]["variant"];

export function Alert(props: {
  variant?: Variant;
  icon?: React.ReactNode;
  color?: Color;
  children?: React.ReactNode;
}) {
  return (
    <Callout.Root color={props.color} variant={props.variant}>
      <Callout.Icon>
        {props.icon ?? <InfoCircledIcon />}
      </Callout.Icon>
      <Callout.Text>{props.children}</Callout.Text>
    </Callout.Root>
  );
}
