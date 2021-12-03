import * as React from "react";
import {Layout} from "antd";
import {InjectedTranslateProps, translate} from "react-i18next";
import * as styles from "./Footer.scss";

type FooterProps = InjectedTranslateProps;

const _Footer: React.SFC<FooterProps> = (props: FooterProps) => (
  <Layout.Footer className={styles.footer}>{props.t("footer.text")}</Layout.Footer>
);

export const Footer = translate()(_Footer);


