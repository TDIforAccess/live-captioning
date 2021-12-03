import * as React from "react";
import {Alert, Col, Form, Input, Row, Card} from "antd";
import {formItemLayout} from "../../../base/FormLayouts";
import * as R from "ramda";
import * as formStyles from "../../../base/Form/FormElements.scss";
import {CommonFormStateProps} from "types";
import {FirebaseUser} from "../../../../types/domains/user";
import {RouteComponentProps} from "react-router";
import {FDocument} from "../../../../types/domains/document";
import {DocumentError} from "../documentReducer";
import {option} from "fp-ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ActionsButtons, generateActionCreateButtons} from "../../../components/Table/ActionCreateButtons";
import {WithAuthenticationState} from "../../Authentication/withAuthentication";

const FormItem = Form.Item;

export type SessionInfoDispatchProps = {
  fetchDocumentById: (documentId: String) => void;
};

type SessionId = {
  sessionId: string;
};

export type SessionInfoStateProps = {
  firebaseUser: FirebaseUser | undefined;
  sessionInfo: option.Option<FDocument> | undefined;
  sessionInfoFetchError: DocumentError | undefined;
};

export type SessionInfoProps =
  SessionInfoDispatchProps &
  WithAuthenticationState &
  SessionInfoStateProps &
  CommonFormStateProps &
  RouteComponentProps<SessionId>;

export type SessionInfoState = {};

class SessionInfoView extends React.Component<SessionInfoProps, SessionInfoState> {
  constructor(props: SessionInfoProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const userId: string | null = this.props.userId;
    const sessionId = this.props.match.params.sessionId;

    if (userId && sessionId) {
      this.props.fetchDocumentById(sessionId);
    } else {
      return;
    }
  }

  render() {
    const user = this.props.userId;
    const {t = R.identity} = this.props;
    const {sessionInfoFetchError, sessionInfo} = this.props;
    if (user) {
      return (
        <div>

          {
            sessionInfo ? sessionInfo.fold(
              (<Alert message={"Session not found."} type={"error"}/>),
              s => (<div>
                <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex">
                  <Col xs={{span: 24, offset: 0}} lg={{span: 24, offset: 0}}>
                    <Card title={"Session Info"}>
                    <Form>
                      <FormItem
                        label={t("documentCreateForm.label.sessionName")} {...formItemLayout}>
                        <Input disabled={true}
                               value={s.name} readOnly/>
                      </FormItem>

                      <FormItem
                        label={t("documentCreateForm.label.viewersNumber")} {...formItemLayout}
                        className={formStyles.formItem}>
                        <Input disabled={true}
                               value={s.viewersNumber} readOnly/>
                      </FormItem>

                      <FormItem
                        label={t("documentCreateForm.label.sessionLength")} {...formItemLayout}
                        className={formStyles.formItem}>
                        <Input disabled={true}
                               value={`${s.sessionLength} minutes`} readOnly/>
                      </FormItem>

                      <FormItem
                        label={t("documentCreateForm.label.sessionStart")} {...formItemLayout}>
                        <Input disabled={true} value={s.sessionStart} readOnly/>
                      </FormItem>

                      <FormItem
                        label={t("documentCreateForm.label.sessionEnd")} {...formItemLayout}>
                        <Input disabled={true} readOnly value={s.sessionEnd}/>
                      </FormItem>
                      {generateActionCreateButtons({
                        isLoggedIn: this.props.isLoggedIn,
                        userId: this.props.userId,
                        authUser: this.props.authUser
                      })({}, [ActionsButtons.ShareReadSession, ActionsButtons.ShareWriteSession])(s)}
                    </Form>
                    </Card>
                  </Col>
                </Row>
              </div>)
            ) : sessionInfoFetchError ? (
              <Alert message={sessionInfoFetchError.message} type={"error"}/>
            ) : (<div>
              <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex">
                <Col span={12} offset={10}>
                  <FontAwesomeIcon icon={"spinner"} size={"10x"} spin={true} color={"#438eb9"}/>
                </Col>
              </Row>
            </div>)
          }
        </div>
      );
    } else {
      return null;
    }
  }
}

export const SessionInfo = Form.create()(SessionInfoView);
