import {HTML5_ENTITIES} from "./html5-entities";
import {isString, defaultTo} from "lodash";

export const decodeHtml5Entities = (str: string) => {
  if (!isString(str)) {
    return "";
  }

  return str.replace(/&(#?[\w\d]+);?/g, (s, entity) => {
    let chr;

    if (entity.charAt(0) === "#") {
      const code = entity.charAt(1) === "x" ?
        parseInt(entity.substr(2).toLowerCase(), 16) :
        parseInt(entity.substr(1), 10);

      if (!(isNaN(code) || code < -32768 || code > 65535)) {
        chr = String.fromCharCode(code);
      }
    } else {
      chr = HTML5_ENTITIES[entity];
    }

    return defaultTo(chr, s);
  });
};
