import * as React from "react";
import {Button, Card, Col, Form, Icon, Input, message, Row, Tag, Tooltip, Upload} from "antd";
import {InjectedTranslateProps, TranslationFunction} from "react-i18next";
import * as styles from "./MailingList.scss";
import * as csv from "csvtojson";
import {FirebaseUser, MailingListCreator} from "types";
import {FMailingList, MailingListError} from "./mailingListReducer";
import {FormComponentProps} from "antd/lib/form";
import * as uuid from "uuid";
import {identity, not, uniq, omit, flatten} from "ramda";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
// @ts-ignore
import {CSVLink} from "react-csv";
import {emailTagsValidator, isValidEmail} from "./helpers";
import {UploadChangeParam} from "antd/es/upload";
import {UploadFile} from "antd/es/upload/interface";

const Dragger = Upload.Dragger;
const FormItem = Form.Item;

export type UploadMailingListDispatchProps = {
  createMailingList: (mailingList: FMailingList) => void;
};

export type UploadMailingListOwnProps = {
  kind: MailingListCreator;
};

export type UploadMailingListStateProps = {
  firebaseUser: FirebaseUser | undefined;
  userMailingList: FMailingList[] | undefined;
  mailingListUploaded: FMailingList | undefined;
  mailingListUploadError: MailingListError | undefined;
};

export type UploadMailingListProps =
  InjectedTranslateProps
  & UploadMailingListDispatchProps
  & UploadMailingListStateProps
  & FormComponentProps
  & UploadMailingListOwnProps;


export type Emails = {
  email: string;
};

export type MailingListData = {
  listName: string;
  emailList: Emails[];
  userId: string;
};

type UploadedEmailList = {
  emailList: Emails[];
  invalidEmailList: Emails[];
};

export type UploadMailingListState = {
  listName: string;
  fileList: UploadFile[];
  emailList: Emails[];
  invalidEmailList: Emails[];
  loading: boolean;
  inputVisible: boolean;
  inputValue: string;
  uploadedEmailist?: {[key: string]: UploadedEmailList};
};

const emailSampleData = [
  {email: "sample_email1@abc.com"},
  {email: "sample_email1@xyz.com"}
];

class UploadMailingListBox extends React.Component<UploadMailingListProps, UploadMailingListState> {
  private inputRef = React.createRef<Input>();

  constructor(props: UploadMailingListProps) {
    super(props);
    this.state = {
      listName: "",
      fileList: [],
      emailList: [],
      invalidEmailList: [],
      inputVisible: false,
      loading: false,
      inputValue: ""
    };
  }

  componentDidUpdate(prevProps: Readonly<UploadMailingListProps>, prevState: Readonly<UploadMailingListState>): void {
    const {t, kind} = this.props;
    if (prevProps.mailingListUploaded !== this.props.mailingListUploaded) {
      const {listName} = this.props.mailingListUploaded as FMailingList;

      if (this.props.mailingListUploaded && this.state.loading && kind === MailingListCreator.upload) {
        message.success(`${t("uploadMailingList.message.listSuccess", {listName})}`);
      }
      if (this.props.mailingListUploaded && this.state.loading && kind === MailingListCreator.create) {
        message.success(`${t("createMailingList.message.listSuccess", {listName})}`);
      }
      // Reset state after showing message as only for the current component localState wil be loading
      this.setState({
        loading: false,
        emailList: [],
        fileList: [],
        inputVisible: false,
        listName: ""
      });
      this.props.form.resetFields();
      if (this.props.mailingListUploadError) {
        message.error(this.props.mailingListUploadError.message);
      }
    }
  }

  // Common
  onInputChange = (name: string) => (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const value = inputEvent.target.value;
    this.setState((prevState: UploadMailingListState) => ({
      ...prevState,
      [name]: value
    }));
  }

  // Common
  handleSubmit = (userId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    this.setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    this.props.form.validateFieldsAndScroll((error: any, values: any) => {
      if (error) {
        this.setState((prevState) => ({
          ...prevState,
          loading: false
        }));
      } else {
        const {listName, emailList, uploadedEmailist} = this.state;
        let createEmailList: Emails[] = [];
        if (uploadedEmailist) {
          createEmailList = uniq(flatten(Object.keys(uploadedEmailist).map((key) => uploadedEmailist[key].emailList) as any));
        }
        this.props.createMailingList({
          listName,
          emailList: createEmailList.length !== 0 ? createEmailList : emailList,
          userId: userId,
          id: uuid.v4()
        });
      }
    });
  }

  // Common
  validateEmailListName = (name: string, value: string, callback: (errors?: ReadonlyArray<Error>) => void) => {
    // Check if userMailingList exist and atleast one of them have same name as value typed.
    const errors = [];
    if (this.props.userMailingList && this.props.userMailingList.some(({listName}) => listName === value)) {
      errors.push(new Error());
    }
    callback(errors);
  }

  // Could be done better by putting outside the component but better than inside render function.
  // For upload part
  uploadProps = (uploadedFileList: UploadFile[], t: TranslationFunction) => ({
    name: "file",
    multiple: false,
    onChange: (info: UploadChangeParam) => {
      const {file, fileList} = info;
      switch (file.status) {
        case "done":
          message.success(`${t("uploadMailingList.uploadStatus.uploadSuccess", {name: fileList.slice(-1)[0].name})}`);
          break;
        case "error":
          message.error(`${t("uploadMailingList.uploadStatus.uploadFailure", {name: fileList.slice(-1)[0].name})}`);
          break;
        case "removed":
          this.setState(({uploadedEmailist, ...prevState}) => ({
            ...prevState,
            fileList: uploadedFileList.filter((f) => f.uid !== file.uid),
            uploadedEmailist: omit([file.uid] as ReadonlyArray<string>, uploadedEmailist)
          }));
          break;
        case "uploading":
          if (status !== "uploading") {
            // console.log(info.file, info.uploadedFileList, uploadedFileList);
          }
          break;
        default:
      }
    },
    customRequest: (e: any) => {
      const {file, onSuccess, onError} = e;
      uploadedFileList.push(file);
      this.setState({fileList: uploadedFileList});
      const fileReader = new FileReader();
      fileReader.onloadend = (e: any) => {
        csv({
          headers: ["email"]
        }).fromString(fileReader.result as string).then(v => {
          const invalidList = v.filter(({email}) => not(isValidEmail(email)));
          this.setState((prevstate) => ({
            ...prevstate,
            uploadedEmailist: {
              ...prevstate.uploadedEmailist,
              [file.uid]: {
                emailList: uniq(prevstate.emailList.concat(v.filter(({email}) => isValidEmail(email))) as ReadonlyArray<Emails>),
                invalidEmailList: uniq(prevstate.invalidEmailList.concat(invalidList) as ReadonlyArray<Emails>)
              }
            },
            // ToDo: Handle array types correctly for Ramda.
            emailList: uniq(prevstate.emailList.concat(v.filter(({email}) => isValidEmail(email))) as ReadonlyArray<Emails>),
            invalidEmailList: uniq(prevstate.invalidEmailList.concat(invalidList) as ReadonlyArray<Emails>)
          }));
          if (invalidList.length > 0) {
            message.error(`${t("uploadMailingList.uploadStatus.invalidEmail", {list: invalidList.map(({email}) => email).join(",")})}`);
          }
          onSuccess();
        }, (error: any) => {
          onError(error);
        });
      };
      fileReader.onerror = (e: any) => {
        onError("Error");
      };

      fileReader.readAsText(file);
    }
  })

  // Functions for create part
  handleClose = (removedEmail: string) => () => {
    const tags = this.state.emailList.filter(({email}) => email !== removedEmail);
    this.setState({emailList: tags});
  }

  // Functions for create part
  handleInputConfirm = () => {
    const {inputValue, emailList} = this.state;
    if (inputValue && emailList.every(({email}) => email !== inputValue) && isValidEmail(inputValue)) {
      this.setState((prevState) => ({
        ...prevState,
        // ToDo: Handle array types correctly for Ramda.
        emailList: uniq(prevState.emailList.concat({email: inputValue}) as ReadonlyArray<Emails>),
        inputVisible: false,
        inputValue: ""
      }));
    }
  }

  // Functions for create part
  showInput = () => {
    this.setState({inputVisible: true}, () => {
      const iRef = this.inputRef.current;
      if (iRef) {
        iRef.focus();
      }
    });
  }

  render() {
    const {fileList, loading, listName, emailList, inputVisible, inputValue} = this.state;
    const {t = identity, form: {getFieldDecorator}, firebaseUser: user, kind} = this.props;
    if (user) {
      return (
        <Form onSubmit={this.handleSubmit(user.uid)}>
          <Card title={t(kind === MailingListCreator.upload ? "uploadMailingList.title" : "createMailingList.title")}>
            <FormItem>
              {getFieldDecorator("listName", {
                rules: [
                  {
                    required: true, message: t("uploadMailingList.message.listName")
                  },
                  {
                    validator: this.validateEmailListName, message: t("uploadMailingList.message.duplicateListName")
                  }],
                validateFirst: true,
                initialValue: listName
              })(
                <Input
                  placeholder={t("uploadMailingList.placeHolder.listName")}
                  className={styles.formLength}
                  onChange={this.onInputChange("listName")}/>
              )}
            </FormItem>

            {kind === MailingListCreator.upload && (
              <>
                <FormItem>
                  {getFieldDecorator("fileList", {
                    rules: [
                      {
                        required: true, message: t("uploadMailingList.message.fileList")
                      }]
                  })(
                    <Dragger {...this.uploadProps(fileList, t)} fileList={fileList} accept="text/csv">
                      <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                      </p>
                      <p className="ant-upload-text">{t("uploadMailingList.placeHolder.uploadBoxDesc1")}</p>
                      <p className="ant-upload-hint">{t("uploadMailingList.placeHolder.uploadBoxDesc2")}</p>
                    </Dragger>
                  )}
                </FormItem>
                <FormItem>
                  <Row>
                    <Col span={8}>
                      <Button type="primary" htmlType="submit" loading={loading}>{t("uploadMailingList.button.submitList.desc")}</Button>
                    </Col>
                    <Col span={8} offset={4}>
                      <Button type="default">
                        <CSVLink data={emailSampleData} filename={"sampleEmailList.csv"} target="_blank">
                          <FontAwesomeIcon icon="file-csv"/> {t("uploadMailingList.downloadSample")}
                        </CSVLink>
                      </Button>
                    </Col>
                  </Row>
                </FormItem>
              </>
            )}
            {kind === MailingListCreator.create && (
              <>
                <FormItem>
                  {getFieldDecorator("inputValue", {
                    rules: [{
                      validator: (rule, value, cb) => emailTagsValidator(value, cb, emailList, t)
                    }],
                    trigger: "onBlur"
                  })(
                    <div>
                      {emailList.map(({email}, index) => {
                        const isLongTag = email.length > 30;
                        const tagElem = (
                          <Tag key={index} closable={true} afterClose={this.handleClose(email)}>
                            {isLongTag ? `${email.slice(0, 30)}...` : email}
                          </Tag>
                        );
                        return isLongTag ? <Tooltip title={email} key={email}>{tagElem}</Tooltip> : tagElem;
                      })}
                      {inputVisible && (
                        <Input
                          ref={this.inputRef}
                          type="text"
                          size="small"
                          style={{width: 150}}
                          value={inputValue}
                          onChange={this.onInputChange("inputValue")}
                          onBlur={this.handleInputConfirm}
                          onPressEnter={this.handleInputConfirm}
                        />
                      )}

                      {!inputVisible && (
                        <Tag
                          onClick={this.showInput}
                          style={{background: "#fff", borderStyle: "dashed"}}
                        >
                          <Icon type="plus"/> {t("createMailingList.placeHolder.newMailTag")}
                        </Tag>
                      )}
                    </div>
                  )}
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" loading={loading}>{t("createMailingList.button.createList.desc")}</Button>
                </FormItem>
              </>
            )}
          </Card>
        </Form>
      );
    } else {
      return null;
    }
  }
}

export const UploadMailingList = Form.create()(UploadMailingListBox);
