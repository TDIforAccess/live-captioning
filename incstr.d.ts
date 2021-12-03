/*
declare module 'incstr' {
  export type IdGeneratorArguments = {
    lastId?: string;
    alphabet?: string;
    numberlike?: boolean;
    prefix?: string;
    suffix?: string;
  }
  export const idGenerator: (args: IdGeneratorArguments) => () => void;
}
*/

declare module 'incstr' {
  const incstr: any;
  export = incstr;
}
