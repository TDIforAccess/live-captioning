import * as React from "react";
import {Layout} from "antd";
import {Footer, Header as CustomHeader, NavBar} from "../components";
// @ts-ignore
import ResponsiveMenu from "react-responsive-navbar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export const navBarLayout = (Component: any) => (props: any) => {
  const {path} = props.match;
  return (
    <Layout style={{background: "#fff"}}>
      <CustomHeader {...props}/>
      <ResponsiveMenu
        menuOpenButton={<FontAwesomeIcon icon="bars" size={"3x"}/>}
        menuCloseButton={<FontAwesomeIcon icon="bars" size={"3x"}/>}
        changeMenuOn="500px"
        menu={<NavBar path={path}/>}
      />
      <Layout.Content>
        <div style={{background: "#fff", padding: 24, minHeight: 380}}>
          <Component {...props} />
        </div>
      </Layout.Content>
      <Footer/>
    </Layout>
  );
};
