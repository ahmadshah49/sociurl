import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

const reactExternal = (id) =>
  id === "react" || id.startsWith("react/") || id === "react-dom" || id.startsWith("react-dom/");

const buildPlugins = () => [
  resolve({ browser: true, preferBuiltins: false }),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.build.json",
    declaration: false,
    sourceMap: true,
  }),
  terser({ format: { comments: false } }),
];

const jsOutputs = (basePath) => [
  {
    file: `${basePath}.js`,
    format: "es",
    sourcemap: true,
  },
  {
    file: `${basePath}.cjs`,
    format: "cjs",
    exports: "named",
    sourcemap: true,
  },
];

export default defineConfig([
  {
    input: "src/index.ts",
    output: jsOutputs("dist/index"),
    plugins: buildPlugins(),
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/react.ts",
    output: jsOutputs("dist/react/index"),
    external: reactExternal,
    plugins: buildPlugins(),
    treeshake: { moduleSideEffects: false },
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
      sourcemap: true,
    },
    plugins: [dts({ tsconfig: "./tsconfig.json" })],
  },
  {
    input: "src/react.ts",
    output: {
      file: "dist/react/index.d.ts",
      format: "es",
      sourcemap: true,
    },
    external: reactExternal,
    plugins: [dts({ tsconfig: "./tsconfig.json" })],
  },
]);
