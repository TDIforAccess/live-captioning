declare module 'require-hacker' {
  export const hook: (id: string, resolver: (path: string) => any) => void;
}
