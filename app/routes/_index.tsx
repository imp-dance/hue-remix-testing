import { type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { App } from "../App";

export const meta: MetaFunction = () => {
  return [
    { title: "Trollhammaren Hue Lights" },
    { name: "description", content: ":-)" },
  ];
};

export default function Index() {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  return isMounted ? <App /> : <div></div>;
}
