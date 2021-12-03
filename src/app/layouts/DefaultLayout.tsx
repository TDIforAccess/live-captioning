import * as React from "react";
import {Layout} from "antd";
import {Footer, Header} from "../components";

export const defaultLayout = (Component: any) => (props: any) => {
  return (
    <Layout>
      <Header {...props}/>
      <Layout.Content>
        <Component {...props} />
      </Layout.Content>
      <Footer/>
    </Layout>
  );
};

