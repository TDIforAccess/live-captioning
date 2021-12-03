import * as React from "react";
import {Form, Row, Col, Card} from "antd";
import {FormComponentProps} from "antd/lib/form/Form";
import * as styles from "./Login.scss";
import {InjectedTranslateProps} from "react-i18next";
import * as login_logo from "./login_logo.png";
import {StyledFirebaseAuth} from "react-firebaseui";
import {authenticationUIConfig} from "../../../services/firebase/authentication";
import {firebaseAuth} from "../../../services/firebase/firebaseApp";
import {RouteComponentProps} from "react-router";
import * as qs from "query-string";

interface LoginFormProps {
  form: FormComponentProps;
}

type SimpleLoginFormProps =
  RouteComponentProps
  & LoginFormProps
  & InjectedTranslateProps;

class LoginFormView extends React.Component<SimpleLoginFormProps> {
  constructor(props: SimpleLoginFormProps) {
    super(props);
  }

  render() {
    const fromUrl = qs.parse(this.props.location.search).r as string;
    return (
      <div className={styles.form}>
        <Row style={{paddingTop: 20}}>
          <Col lg={{span: 8, offset: 8}}>
            <Card>
              <Form className="login-form">
                <div className={styles.logo}>
                  <img alt="logo" src={login_logo}/>
                </div>
                <StyledFirebaseAuth uiConfig={authenticationUIConfig(fromUrl)} firebaseAuth={firebaseAuth}/>
              </Form>
            </Card>

          </Col>

        </Row>
      </div>

    );
  }
}

export const LoginForm = LoginFormView;
