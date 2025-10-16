import { build } from "esbuild";

import fs from "fs";

import packageJson from "../../package.json";
import { Environment } from "../environment";

type Dependencies = (typeof packageJson)["dependencies"];
type SomeDependencies = Partial<Dependencies>;
type PickedDependencies = Array<keyof (typeof packageJson)["dependencies"]>;

const EXTERNAL_DEPS: PickedDependencies = ["ffmpeg-ffprobe-static"];

async function main() {
  const buildDest = Environment.get("BUILD_DEST");

  await build({
    entryPoints: ["./src/server.ts"],
    bundle: true,
    outfile: "dist/index.js",
    platform: "node",
    external: EXTERNAL_DEPS,
    minify: true,
    sourcemap: true,
  });

  const minimalPackage = {
    name: packageJson.name,
    version: packageJson.version,
    main: "dist/index.js",
    dependencies: (
      Object.keys(packageJson.dependencies) as PickedDependencies
    ).reduce<SomeDependencies>((acc, currentValue) => {
      if (EXTERNAL_DEPS.includes(currentValue)) {
        acc[currentValue] = packageJson.dependencies[currentValue];
      }
      return acc;
    }, {}),
  };

  fs.writeFileSync(
    `${buildDest}/package.json`,
    JSON.stringify(minimalPackage, null, 2),
  );
  const env = fs.readFileSync("./.env", "utf-8");
  fs.writeFileSync(`${buildDest}/.env`, env);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
