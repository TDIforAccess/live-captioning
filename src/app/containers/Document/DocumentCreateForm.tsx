import * as React from "react";
import {Button, Form, Input, DatePicker, Col, Row, Card, InputNumber, Switch, Alert} from "antd";
import {FDocument, FirebaseUser} from "types";
import {documentCreateFormItemLayout, tailFormItemLayout} from "../../base/FormLayouts";
import {InjectedTranslateProps} from "react-i18next";
import {FormComponentProps} from "antd/lib/form";
import * as formStyles from "../../base/Form/FormElements.scss";
import {firestore} from "firebase";
import * as uuid from "uuid";
import {realTimeDocumentStore} from "../../services/firebase/firestore";
import * as mtz from "moment-timezone";
import * as moment from "moment";
import {AppRoutes} from "../../store";
import {ActionsButtons, generateActionCreateButtons} from "../../components/Table/ActionCreateButtons";
import {WithAuthenticationState} from "../Authentication/withAuthentication";
import {realTimeDatabse} from "../../services/firebase/firebaseApp";

const FormItem = Form.Item;

export type DocumentCreateFormDispatchProps = {
  documentCreate: (document: FDocument) => void;
};
export type DocumentCreateFormStateProps = {
  firebaseUser: FirebaseUser | undefined;
  documentCreated: FDocument | undefined;
};

type DocumentCreateFormProps =
  WithAuthenticationState &
  DocumentCreateFormDispatchProps &
  DocumentCreateFormStateProps &
  InjectedTranslateProps &
  FormComponentProps;

export type DocumentCreateFormState = {
  name: string;
  sessionEnd: moment.Moment | null;
  sessionLength: number;
  sessionStart: moment.Moment | null;
  sessionTimeZone: string;
  viewersNumber: number;
  loading: boolean;
  isPublic: boolean;
};

const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

class DocumentCreate extends React.Component<DocumentCreateFormProps, DocumentCreateFormState> {
  constructor(props: DocumentCreateFormProps) {
    super(props);
    this.state = {
      name: "",
      sessionEnd: null,
      sessionLength: 1,
      sessionStart: null,
      sessionTimeZone: mtz.tz.guess(),
      viewersNumber: 1,
      loading: false,
      isPublic: false
    };
  }

  onInputChange = (name: string) => (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const value = inputEvent.target.value;
    this.setState((prevState: DocumentCreateFormState) => ({
      ...prevState,
      [name]: value
    }));
  }

  onInputBoolean = (name: string) => (value: boolean) => {
    this.setState((prevState: DocumentCreateFormState) => ({
      ...prevState,
      [name]: value
    }));
  }

  onInputChangeNumber = (name: string) => (value: number) => {
    if (name === "sessionLength" || name === "viewersNumber") {
      this.setState((prevState: DocumentCreateFormState) => ({
        ...prevState,
        [name]: value,
        sessionEnd: name === "sessionLength" && prevState.sessionStart ?
          prevState.sessionStart.clone().add(value, "m") : prevState.sessionEnd
      }));
    }
  }

  onDatePickerChange = (name: string) => (date: moment.Moment, dateString: string) => {
    this.setState((prevState: DocumentCreateFormState) => ({
      ...prevState,
      [name]: date,
      sessionEnd: name === "sessionStart" ? date.clone().add(this.state.sessionLength, "m") : prevState.sessionEnd,
      sessionLength: (name === "sessionEnd" || name === "sessionStart") && prevState.sessionEnd ?
        prevState.sessionEnd.diff(prevState.sessionStart as moment.Moment, "m") : prevState.sessionLength
    }));
  }

  handleSubmit = (userId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.props.form.validateFieldsAndScroll((error: any, values: any) => {
      if (error) {
        return;
      } else {
        this.setState({
          loading: true
        });
        // @ts-ignore
        const firePad = Firepad.backEnd(realTimeDatabse, realTimeDocumentStore.documentRef, {
          userId: userId
        });
        firePad.on("ready", (fileId: string) => {
          const {isPublic, name, sessionStart, sessionEnd, viewersNumber, sessionTimeZone, sessionLength} = this.state;
          this.props.documentCreate({
            documentId: uuid.v4(),
            fileId: fileId,
            user: userId,
            isDeleted: false,
            isPublic,
            name,
            sessionTimeZone,
            sessionLength,
            viewersNumber,
            sessionEnd: sessionEnd ? sessionEnd.format() : moment().format(),
            sessionStart: sessionStart ? sessionStart.format() : moment().format(),
            createdAt: firestore.Timestamp.now().toDate(),
            updatedAt: firestore.Timestamp.now().toDate()
          });
        });
      }
    });
  }

  componentDidMount() {
    const script = document.createElement("script");

    script.src = "/assets/js/firepad.js";
    script.async = true;

    document.body.appendChild(script);
  }

  disabledDate = (date: moment.Moment) => this.state.sessionStart ? date < this.state.sessionStart : date < moment();

  disabledCurrentDate = (date: moment.Moment) => date < moment();

  render() {
    const origin = window.location.origin;
    const {t} = this.props;
    const {getFieldDecorator} = this.props.form;
    const user: FirebaseUser | undefined = this.props.firebaseUser;
    const document: FDocument | undefined = this.props.documentCreated;
    if (user) {
      return (
        <div>
          <Row>
            <Col xs={{span: 24, offset: 0}} lg={{span: 12, offset: 0}}>
              <Card>
              <Form onSubmit={this.handleSubmit(user.uid)}>
                <FormItem label={t("documentCreateForm.label.sessionName")} {...documentCreateFormItemLayout}
                          className={formStyles.formItem}>
                  {getFieldDecorator("sessionName", {
                    rules: [{
                      required: true,
                      message: t("documentCreateForm.requireMessage.sessionName")
                    }]
                  })(<Input
                    onChange={this.onInputChange("name")}/>)}
                </FormItem>

                <FormItem label={t("documentCreateForm.label.viewersNumber")} {...documentCreateFormItemLayout}
                          className={formStyles.formItem}>
                  {getFieldDecorator("viewersNumber", {
                    initialValue: this.state.viewersNumber,
                    rules: [{
                      pattern: RegExp("^\\d+$"),
                      message: t("documentCreateForm.requireMessage.integer", {max: 1000, min: 1})
                    }, {
                      required: true,
                      message: t("documentCreateForm.requireMessage.viewersNumber")
                    }]
                  })(<InputNumber min={1} max={1000}
                    onChange={this.onInputChangeNumber("viewersNumber")}/>)}
                </FormItem>

                <FormItem label={t("documentCreateForm.label.sessionLength")} {...documentCreateFormItemLayout}
                          className={formStyles.formItem}>
                  {getFieldDecorator("sessionLength", {
                    initialValue: this.state.sessionLength,
                    rules: [{
                      pattern: RegExp("^\\d+$"),
                      message: t("documentCreateForm.requireMessage.integer", {max: 720, min: 1})
                    }, {
                      required: true,
                      message: t("documentCreateForm.requireMessage.sessionLength")
                    }]
                  })(<InputNumber min={1}
                     onChange={this.onInputChangeNumber("sessionLength")}/>)}
                </FormItem>

                <FormItem label={t("documentCreateForm.label.timezone")} {...documentCreateFormItemLayout}
                          className={formStyles.formItem}>
                  {getFieldDecorator("timeZone", {
                    rules: [{
                      required: false,
                      message: t("basicInformationForm.requireMessage.firstName")
                    }],
                    initialValue: mtz.tz.guess()
                  })(<Input disabled={true}/>)}
                </FormItem>

                <FormItem label={t("documentCreateForm.label.sessionStart")} {...documentCreateFormItemLayout}>
                  {getFieldDecorator("sessionStart", {
                    rules: [{type: "object", required: true, message: t("documentCreateForm.requireMessage.sessionStart")}]
                  })(
                    <DatePicker disabledDate={this.disabledCurrentDate}
                                onChange={this.onDatePickerChange("sessionStart")} showTime
                                format={DATE_TIME_FORMAT}/>
                  )}
                </FormItem>

                <FormItem label={t("documentCreateForm.label.sessionEnd")} {...documentCreateFormItemLayout}>
                  {getFieldDecorator("sessionEnd", {
                    initialValue: this.state.sessionEnd,
                    rules: [{type: "object", required: true, message: t("documentCreateForm.requireMessage.sessionEnd")}]
                  })(
                    <DatePicker onChange={this.onDatePickerChange("sessionEnd")}
                                disabledDate={this.disabledDate} showTime format={DATE_TIME_FORMAT}/>
                  )}
                </FormItem>
                <FormItem label={t("documentCreateForm.label.publicPrivate")} {...documentCreateFormItemLayout}>
                  {getFieldDecorator("isPublic", {
                    initialValue: this.state.isPublic
                  })(
                    <Switch
                      checkedChildren={t("documentCreateForm.label.checkedYes")}
                      unCheckedChildren={t("documentCreateForm.label.unCheckedNo")}
                      onChange={this.onInputBoolean("isPublic")}
                      defaultChecked={this.state.isPublic}
                    />
                  )}
                </FormItem>

                {document ?
                  (<FormItem {...tailFormItemLayout}>
                    <a type="primary" href={AppRoutes.editor({user: document.user, documentId: document.documentId})}>
                      {t("documentCreateForm.label.goToSession")}
                    </a>
                    {generateActionCreateButtons({
                      isLoggedIn: this.props.isLoggedIn,
                      userId: this.props.userId,
                      authUser: this.props.authUser
                    })({}, [ActionsButtons.ShareReadSession, ActionsButtons.ShareWriteSession])(document)}
                   { this.state.isPublic ? (<Alert message={`PublicUrl = ${origin}${AppRoutes.publicEditor({documentId: document.documentId})}`} type="info" />) : null }
                  </FormItem>)
                  :
                  (<FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit"
                            loading={this.state.loading}>Create</Button>
                  </FormItem>)

                }

              </Form>
              </Card>
            </Col>
          </Row>
        </div>
      );
    } else {
      return null;
    }

  }
}


export const DocumentCreateForm = Form.create()(DocumentCreate);

