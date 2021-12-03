import {should, expect, use} from "chai";

use(should);
use(expect);

const fileName = __filename.replace(`${__dirname}/`, "");
console.time(`${fileName}:imports`);
import * as path from "path";
import * as cssModulesHook from "css-modules-require-hook";
import {renderSync} from "node-sass";
import * as Enzyme from "enzyme";
import * as ReactFutureAdapter from "enzyme-react-adapter-future";
import * as fs from "fs";
import {last} from "lodash";
import {parse as scssParser} from "postcss-scss";
import {hook as requireHackerHook} from "require-hacker";
// tslint:disable-next-line:no-var-requires
const svgRuntimeGenerator = require("../lib/svgRuntimeGenerator/svgRuntimeGenerator.js");
console.timeEnd(`${fileName}:imports`);

console.time(`${fileName}:cssModulesHook`);
cssModulesHook({
  extensions: [".scss"],
  generateScopedName: "[path]___[local]___[hash:base64:5]",
  processorOpts: {parser: scssParser},
  preprocessCss: (data: any, filename: string) => renderSync({
    data,
    file: filename,
    includePaths: [
      path.resolve(__dirname, "../src/components/_sass")]
  }).css
});
console.timeEnd(`${fileName}:cssModulesHook`);

console.time(`${fileName}:require-hacker hook (for svg)`);
requireHackerHook("svg", (path: string) => {
  return svgRuntimeGenerator({
    symbol: {
      request: {
        file: path
      },
      id: (last(path.split("/")) as string).split(".")[0]
    }
  });
});
console.timeEnd(`${fileName}:require-hacker hook (for svg)`);

console.time(`${fileName}:require-hacker hook (for xml)`);
requireHackerHook("xml", (path: string) => {
  return `module.exports = \`${fs.readFileSync(path, "utf-8")}\`;\n`;
});
console.timeEnd(`${fileName}:require-hacker hook (for xml)`);


console.time(`${fileName}:configure enzyme to work with react 16`);
// Configuring enzyme with the module `enzyme-react-adapter-future`,
// to support React context api in testcases which is not supported
// by `enzyme-adapter-react-16`'s current version.
Enzyme.configure({adapter: new ReactFutureAdapter()});
console.timeEnd(`${fileName}:configure enzyme to work with react 16`);


console.time(`${fileName}:Injecting settings module`);
const Module = (require("module")).Module;

const originalResolveFilename = Module._resolveFilename;
const srcPath = path.resolve("src");

// Replicating webpack.seriesplayer.config
const env = process.env.NODE_ENV === "production" ? "production" : "development";
Module._resolveFilename = function (from: string, parent: any, isMain: any) {
  if (from === "settings") {
    // tslint:disable-next-line:no-parameter-reassignment
    from = `${srcPath}/settings/${env}.json`;
  }
  // tslint:disable-next-line:no-invalid-this
  return originalResolveFilename.call(this, from, parent, isMain);
};
console.timeEnd(`${fileName}:Injecting settings module`);
