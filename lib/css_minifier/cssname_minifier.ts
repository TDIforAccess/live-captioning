import * as incstr from "incstr";
import * as fs from "fs";
import * as path from "path";

const createUniqueIdGenerator = () => {
  const index = {};
  const dir = path.resolve(__dirname, "..", "..", "webpack", "stats");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const cssnameMinifierLog = path.join(dir, "cssname-minifier.log");
  // if an old file exists, it means we are using build locally, clean it before usage.
  if (fs.existsSync(cssnameMinifierLog)) {
    fs.truncateSync(cssnameMinifierLog);
  }

  const generateNextId = incstr.idGenerator({
    // Removed "d" letter to avoid accidental "ad" construct.
    // @see https://medium.com/@mbrevda/just-make-sure-ad-isnt-being-used-as-a-class-name-prefix-or-you-might-suffer-the-wrath-of-the-558d65502793
    alphabet: "abcefghijklmnopqrstuvwxyzABCEFGHIJKLMNOPQRSTUVWXYZ"
  });

  return (name: string) => {
    if (!index[name]) {
      index[name] = generateNextId();
      fs.appendFileSync(cssnameMinifierLog, `${name} => ${index[name]}\n`);
    }
    return index[name];
  };
};

const uniqueIdGenerator = createUniqueIdGenerator();

export const generateScopedName = (localName: string, resourcePath: string) =>
  `${uniqueIdGenerator(resourcePath.split("/src/", 2)[1])}_${uniqueIdGenerator(localName)}`;

