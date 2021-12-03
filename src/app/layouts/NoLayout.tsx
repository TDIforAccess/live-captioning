import * as React from "react";

export const noLayout = (Component: any) => (props: any) => {
  return (
    <Component {...props} />
  );
};
