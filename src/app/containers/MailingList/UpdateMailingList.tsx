import * as React from "react";
import {Button, Card, Input, Form, Tag, Tooltip, Icon, Select, Divider, message} from "antd";
import {FirebaseUser, CommonStateProps} from "types";
import {FMailingList, MailingListError} from "./mailingListReducer";
import {FormComponentProps} from "antd/lib/form";
import {optionUtils} from "../../../utils";
import {SelectValue} from "antd/lib/select";

const Option = Select.Option;
// @ts-ignore
import MultiSelect from "@kenshooui/react-multi-select";
import {emailTagsValidator, isValidEmail} from "./helpers";
import {uniq, union, head, without, identity} from "ramda";

const FormItem = Form.Item;

export type UpdateMailingListDispatchProps = {
  createMailingList: (mailingList: MailingListData) => void;
  fetchMailingListByUser: (userId: string) => void;
  updateMailingList: (mList: FMailingList) => void;
};


export type UpdateMailingListStateProps = {
  firebaseUser: FirebaseUser | undefined;
  userMailingList: FMailingList[] | undefined;
  mailingListFetchError: MailingListError | undefined;
  mailingListUpdateError: MailingListError | undefined;
  mailingListUpdated: FMailingList | undefined;
};

export type UpdateMailingListProps =
  CommonStateProps
  & UpdateMailingListDispatchProps
  & UpdateMailingListStateProps
  & FormComponentProps;

type Emails = {
  email: string;
};

export type MailingListData = {
  listName: string;
  emailList: Emails[];
  userId: string;
};

type EmailsToDelete = {
  label: string;
  index: number;
};

export type UpdateMailingListState = {
  listSelected: string | null;
  emailList: Emails[];
  emailsToDelete: EmailsToDelete[];
  loading: boolean;
  deleteLoading: boolean;
  inputVisible: boolean;
  inputValue: string;
};

class UpdateMailingListBox extends React.Component<UpdateMailingListProps, UpdateMailingListState> {
  private inputRef = React.createRef<Input>();

  constructor(props: UpdateMailingListProps) {
    super(props);
    this.state = {
      listSelected: null,
      emailList: [],
      emailsToDelete: [],
      loading: false,
      deleteLoading: false,
      inputVisible: false,
      inputValue: ""
    };
  }

  componentWillReceiveProps(nextProps: UpdateMailingListProps) {
    if (nextProps.userMailingList && nextProps.userMailingList.length > 0 && this.state.listSelected === null) {
      const firstUserList = head(nextProps.userMailingList);
      this.setState({
        listSelected: firstUserList ? firstUserList.id : null
      });
    }
    if (nextProps.mailingListUpdated !== this.props.mailingListUpdated) {
      this.setState({
        loading: false,
        emailsToDelete: [],
        emailList: [],
        deleteLoading: false
      });

      if (nextProps.mailingListUpdated) {
        message.success(`${nextProps.mailingListUpdated.listName} Update Success`);
      }

      if (nextProps.mailingListUpdateError) {
        message.error(nextProps.mailingListUpdateError.message);
      }
    }
  }

  // Too Much duplication from Uploader. Can be reduced.
  handleInputConfirm = () => {
    const {inputValue, emailList} = this.state;
    if (inputValue && emailList.every(({email}) => email !== inputValue) && isValidEmail(inputValue)) {
      this.setState((prevState) => ({
        ...prevState,
        emailList: uniq(prevState.emailList.concat({email: inputValue})),
        inputVisible: false,
        inputValue: ""
      }));
    }
  }

  handleClose = (removedEmail: string) => () => {
    const tags = this.state.emailList.filter(({email}) => email !== removedEmail);
    if (tags.length === 0 || tags.every(({email}) => isValidEmail(email))) {
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
    this.setState((prevState: UpdateMailingListState) => ({
      ...prevState,
      [name]: value
    }));
  }

  fetchSelectedList = (): FMailingList | undefined => {
    const userMList = optionUtils.fromUndefinedA(this.props.userMailingList).getOrElse([]);
    const firstUserMList = head(userMList);
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
        const listN = this.fetchSelectedList();
        if (listN) {
          this.props.updateMailingList({
            listName: listN.listName,
            emailList: union(this.state.emailList, listN.emailList),
            userId: userId,
            id: listN.id
          });
        } else {
          return;
        }
      }
    });
  }

  deleteEmails = (event: any) => {
    event.preventDefault();
    this.setState({
      deleteLoading: true
    });
    const listN = this.fetchSelectedList();
    if (listN) {
      const emailsDelete: string[] = this.state.emailsToDelete.map(r => r.label);
      const emails: string[] = without(emailsDelete, listN.emailList.map(r => r.email));
      this.props.updateMailingList({
        listName: listN.listName,
        emailList: emails.map(r => {
          return {
            email: r
          };
        }),
        userId: listN.userId,
        id: listN.id
      });
    } else {
      this.setState({
        deleteLoading: false
      });
      return;
    }
  }

  handleMultiChange = (emailsToDelete: EmailsToDelete[]) => {
    this.setState({emailsToDelete});
  }

  onListChange = (value: SelectValue) => {
    this.setState({
      listSelected: value.toString(),
      emailsToDelete: []
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
    const {emailList, inputVisible, inputValue, emailsToDelete, loading, deleteLoading} = this.state;
    const selectedList = userMList.find(r => r.id === this.state.listSelected);
    const selectedListEmail = selectedList ? selectedList.emailList.map((r, index) => {
      return {
        label: r.email,
        id: index
      };
    }) : [];

    const {t = identity} = this.props;

    if (user) {
      return (
        <Form>
          <Card
            title="Manage List"
          >
            <FormItem>
              {getFieldDecorator("selectMailingList", {
                initialValue: selectedList && selectedList.listName
              })(
                <Select onChange={this.onListChange}>{userMList.map((c1) => <Option
                  key={c1.id} value={c1.id}>{c1.listName}</Option>)}</Select>
              )}
            </FormItem>
            <Divider style={{fontSize: 13}}>{t("modifyMailingList.listTitle", {listName: selectedList && selectedList.listName})}</Divider>
            <FormItem>
              <Button type="danger" onClick={this.deleteEmails} loading={deleteLoading}>{t("modifyMailingList.button.delete.desc")}</Button>
              <MultiSelect
                onChange={this.handleMultiChange}
                items={selectedListEmail}
                showSelectedItems={false}
                showSearch={false}
                heigh={200}
                responsiveHeight={"150px"}
                showSelectAll={false}
                selectedItems={emailsToDelete}
              />
            </FormItem>
            <Divider/>
            <FormItem>
              {getFieldDecorator("inputValue", {
                rules: [{
                  validator: (rule, value, cb) => emailTagsValidator(value, cb, union(emailList, selectedList && selectedList.emailList || []), t)
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
                      <Icon type="plus"/> {t("modifyMailingList.placeHolder.newMailTag")}
                    </Tag>
                  )}
                </div>
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" onClick={this.handleSubmit(user.uid)} loading={loading}>{t("modifyMailingList.button.addEmailsToList.desc")}</Button>
            </FormItem>
          </Card>
        </Form>
      );
    } else {
      return null;
    }
  }
}


export const UpdateMailingList = Form.create()(UpdateMailingListBox);
