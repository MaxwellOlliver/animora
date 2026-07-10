import { createProxyHandler } from "@/lib/create-proxy-handler";
import { getServerEnv } from "@/lib/server-env";

export const { GET, POST, PUT, PATCH, DELETE } = createProxyHandler(
  () => getServerEnv().GATEWAY_URL,
  "gateway-proxy",
);
