import * as React from "react";
import {Button, Card, Input, Form, Tag, Tooltip, Icon, Select, Divider, message} from "antd";
import {FirebaseUser} from "../../../../types/domains/user";
import {FMailingList} from "../../MailingList/mailingListReducer";
import {FormComponentProps} from "antd/lib/form";
import * as R from "ramda";
import {optionUtils} from "../../../../utils";
import {SelectValue} from "antd/lib/select";

const Option = Select.Option;
// @ts-ignore
import MultiSelect from "@kenshooui/react-multi-select";
import {CommonStateProps} from "types";
import {DocumentToShare, FDocumentShare} from "../../../../types/domains/documentShare";
import {firestore} from "firebase";
import {DocumentShareError} from "./documentShareReducer";
import {emailTagsValidatorV2, isValidEmail} from "../../MailingList/helpers";

const FormItem = Form.Item;

export type DocumentShareDispatchProps = {
  fetchMailingListByUser: (userId: string) => void;
  documentSharePost: (docs: FDocumentShare[]) => void;
};

export type DocumentShareStateProps = {
  firebaseUser: FirebaseUser | undefined;
  userMailingList: FMailingList[] | undefined;
  documentShareError: DocumentShareError | undefined;
  documentShareSuccess: string[] | undefined;
};

export type DocumentShareProps =
  CommonStateProps
  & DocumentToShare
  & DocumentShareDispatchProps
  & DocumentShareStateProps
  & FormComponentProps;

type EmailsToShareFromSelect = {
  label: string;
  index: number;
};

export type DocumentShareState = {
  listSelected: string | null;
  emailList: string[];
  emailsToShareFromSelect: EmailsToShareFromSelect[];
  loading: boolean;
  shareButtonLoading: boolean;
  inputVisible: boolean;
  inputValue: string;
};

class DocumentShareBox extends React.Component<DocumentShareProps, DocumentShareState> {
  private inputRef = React.createRef<Input>();

  constructor(props: any) {
    super(props);

    this.state = {
      listSelected: null,
      emailList: [],
      emailsToShareFromSelect: [],
      loading: false,
      shareButtonLoading: false,
      inputVisible: false,
      inputValue: ""
    };
  }

  componentWillReceiveProps(nextProps: DocumentShareProps) {
    if (nextProps.documentShareSuccess !== this.props.documentShareSuccess) {
      this.setState({
        loading: false,
        emailsToShareFromSelect: [],
        emailList: [],
        shareButtonLoading: false
      });
      // TODO need to check why success messages are called again and again.
      if (nextProps.documentShareSuccess) {
        message.success("Share Success");
      }

      if (nextProps.documentShareError) {
        message.error(nextProps.documentShareError.message);
      }
    }
  }

  handleInputConfirm = () => {
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = state.emailList;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      emailList: tags,
      inputVisible: false,
      inputValue: ""
    });
  }

  handleClose = (removedEmail: string) => () => {
    const tags = this.state.emailList.filter(tag => tag !== removedEmail);
    if (tags.length === 0 || tags.every(isValidEmail)) {
      this.props.form.resetFields(["inputValue"]);
    }
    this.setState({emailList: tags});
  }

  showInput = () => {
    this.setState({inputVisible: true}, () => {
      const iRef = this.inputRef.current;
      if (iRef) {
        iRef.focus();
      }
    });
  }

  onInputChange = (name: string) => (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const value = inputEvent.target.value;
    this.setState((prevState: DocumentShareState) => ({
      ...prevState,
      [name]: value
    }));
  }

  fetchSelectedList = (): FMailingList | undefined => {
    const userMList = optionUtils.fromUndefinedA(this.props.userMailingList).getOrElse([]);
    const firstUserMList = R.head(userMList);
    return this.state.listSelected ? userMList.find(r => r.id === this.state.listSelected) : firstUserMList ? firstUserMList : undefined;
  }

  handleSubmit = (userId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({
      loading: true
    });
    this.props.form.validateFieldsAndScroll((error: any, values: any) => {
      if (error) {
        this.setState({
          loading: false
        });
        return;
      } else {
        if (this.props.documentId && this.props.permission) {
          const emailsToShare = [
            ...this.state.emailList,
            ...this.state.emailsToShareFromSelect.map(emts => emts.label)
          ];
          const emailsDocumentEntities: FDocumentShare[] = emailsToShare.map(e => {
            return {
              documentId: this.props.documentId,
              fileId: null,
              email: e,
              invitedBy: this.props.authUser ? this.props.authUser.email ? this.props.authUser.email : this.props.authUser.phoneNumber ? this.props.authUser.phoneNumber : "Live Captioning" : "Live Captioning",
              permission: this.props.permission,
              createdAt: firestore.Timestamp.now().toDate(),
              updatedAt: firestore.Timestamp.now().toDate()
            };
          });
          this.props.documentSharePost(emailsDocumentEntities);
        } else {
          message.error("Something went wrong with resolving document id. Please contact admin.");
        }
      }
    });
  }

  addEmailsToShare = (event: any) => {
    event.preventDefault();
    const listN = this.fetchSelectedList();
    if (listN) {
      const emailsToShare: string[] = this.state.emailsToShareFromSelect.map(r => r.label);
      this.setState(prevState => {
        return {
          ...prevState,
          emailList: R.uniq(R.union(emailsToShare, prevState.emailList))
        };
      });
    } else {
      return;
    }
  }

  handleMultiChange = (emailsToShareFromSelect: EmailsToShareFromSelect[]) => {
    this.setState({emailsToShareFromSelect});
  }

  onListChange = (value: SelectValue) => {
    this.setState({
      listSelected: value.toString(),
      emailsToShareFromSelect: []
    });
  }

  componentDidMount() {
    const userId: string | null = this.props.userId;
    if (userId) {
      this.props.fetchMailingListByUser(userId);
    } else {
      return;
    }
  }

  render() {
    const user: FirebaseUser | undefined = this.props.firebaseUser;
    const {getFieldDecorator} = this.props.form;
    const userMList = optionUtils.fromUndefinedA(this.props.userMailingList).getOrElse([]);
    const firstUserMList = R.head(userMList);

    const {emailList, inputVisible, inputValue, emailsToShareFromSelect, loading, shareButtonLoading} = this.state;
    const selectedList = userMList.find(r => r.id === this.state.listSelected);
    const selectedListEmail = selectedList ? selectedList.emailList.map((r, index) => {
      return {
        label: r.email,
        id: index
      };
    }) : firstUserMList ? firstUserMList.emailList.map((r, index) => {
      return {
        label: r.email,
        id: index
      };
    }) : [];

    const {t = R.identity} = this.props;

    if (user) {
      return (
        <Form>
          <Card title={t("documentShare.title")}>
            <FormItem>
              {getFieldDecorator("selectMailingList", {
                initialValue: firstUserMList && firstUserMList.listName
              })(
                <Select onChange={this.onListChange} defaultValue="1">{userMList.map((c1) => <Option
                  key={c1.id} value={c1.id}>{c1.listName}</Option>)}</Select>
              )}
            </FormItem>
            <Divider style={{fontSize: 13}}>{t("documentShare.mailList", {listName: selectedList ? selectedList.listName : firstUserMList && firstUserMList.listName})}</Divider>
            <FormItem>
              <Button type="primary" onClick={this.addEmailsToShare} loading={shareButtonLoading}>{t("documentShare.button.delete.desc")}</Button>
              <MultiSelect
                onChange={this.handleMultiChange}
                items={selectedListEmail}
                showSelectedItems={false}
                showSearch={false}
                heigh={200}
                responsiveHeight={"150px"}
                showSelectAll={true}
                selectAllHeight={40}
                selectedItems={emailsToShareFromSelect}
              />
            </FormItem>
            <Divider/>
            <FormItem>
              {getFieldDecorator("inputValue", {
                rules: [
                  {
                    validator: (rule, value, cb) => {
                      if (R.isEmpty(this.state.emailList) && R.isEmpty(this.state.emailsToShareFromSelect)) {
                        if (R.isEmpty(value) || R.isNil(value)) {
                          return cb(t("documentShare.message.emailTags"));
                        } else {
                          return cb();
                        }
                      } else {
                        return cb();
                      }
                    }
                  },
                  {
                    validator: (rule, value, cb) => emailTagsValidatorV2(value, cb, this.state.emailList, t)
                  }
                ]
              })(
                <div>
                  {emailList.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                      <Tag key={tag} color={"#108ee9"} closable={true} afterClose={this.handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                      </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                  })}
                  {inputVisible && (
                    <Input
                      ref={this.inputRef}
                      type="text"
                      size="small"
                      style={{width: 78}}
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
                      <Icon type="plus"/> {t("documentShare.placeHolder.newMailTag")}
                    </Tag>
                  )}
                </div>
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" onClick={this.handleSubmit(user.uid)} loading={loading}>{t("documentShare.button.addEmailsToList.desc")}</Button>
            </FormItem>
          </Card>
        </Form>
      );
    } else {
      return null;
    }
  }
}


export const DocumentShare = Form.create()(DocumentShareBox);
