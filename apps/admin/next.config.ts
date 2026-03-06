import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "9000",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "9000",
    pathname: "/**",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    dangerouslyAllowSVG: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
