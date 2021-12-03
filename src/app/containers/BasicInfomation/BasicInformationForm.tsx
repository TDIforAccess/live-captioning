import * as React from "react";
import {InjectedTranslateProps} from "react-i18next";
import {
  Form,
  Button,
  Select,
  Input, Col, Row, Card
} from "antd";
import {FormComponentProps} from "antd/lib/form/Form";
import {FirebaseUser, User, UserGivenData, Roles, CountryUnit, StateUnit} from "types";
import {tailFormItemLayout, formItemLayout} from "../../base/FormLayouts";
import * as styles from "./BasicInformation.scss";
import {SelectValue} from "antd/lib/select";
import {head, identity} from "ramda";
import * as countryList from "../../../resources/countries.json";
import * as stateList from "../../../resources/states.json";
import {selectFilterHelper, UNITED_STATES} from "../../../utils";
import {ProfileInfoState} from "../Profile/ProfileInfoView";

const countries: CountryUnit[] = countryList;
const states: StateUnit[] = stateList;
const FormItem = Form.Item;
const Option = Select.Option;


type BasicInformationFormLocalProps =
  InjectedTranslateProps
  & FormComponentProps
  & BasicInformationFormStateProps
  & BasicInformationFormDispatchToProps;

export const enum StateInputKind {
  option = "option",
  input = "input"
}

type BasicInformationLocalState = UserGivenData & {
  role: Roles;
  stateInputKind?: StateInputKind;
};

export type BasicInformationFormDispatchToProps = {
  saveUserInfo: (dUser: User) => void;
};

export type BasicInformationFormStateProps = {
  firebaseUser: FirebaseUser | undefined;
};

class BasicInformation extends React.Component<BasicInformationFormLocalProps, BasicInformationLocalState> {
  constructor(props: BasicInformationFormLocalProps) {
    super(props);
    const country = head(countries);
    this.state = {
      role: Roles.creater,
      firstName: "",
      lastName: "",
      contactNumber: "",
      companyName: "",
      address: "",
      country: country ? country.name : "",
      city: "",
      state: "",
      zipCode: "",
      businessPhoneNumber: "",
      stateInputKind: StateInputKind.option,
      email: ""
    };
  }

  onSelectHandleChange = (name: string) => (value: SelectValue, event: React.ReactElement<HTMLSelectElement>) => {
    if (name === "country") {
      this.props.form.resetFields(["state"]);
    }
    this.setState(({stateInputKind, ...prevState}: ProfileInfoState) => ({
      ...prevState,
      stateInputKind : name === "country" ? (value === UNITED_STATES ? StateInputKind.option : StateInputKind.input) : stateInputKind,
      [name]: value
    }));
  }

  onInputChange = (name: string) => (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const value = inputEvent.target.value;
    this.setState((prevState: BasicInformationLocalState) => ({
      ...prevState,
      [name]: value
    }));
  }

  handleSubmit = ({uid, email, phoneNumber}: FirebaseUser) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.props.form.validateFieldsAndScroll((error: any, values: any) => {
      if (error) {
        return;
      } else {
        const {role, stateInputKind, ...restState} = this.state;
        this.props.saveUserInfo({
          uid: uid,
          role,
          userGivenData: {
            ...restState,
            ...(email && {email}),
            ...(phoneNumber && {contactNumber: phoneNumber})
          }
        });
      }
    });
  }

  render() {
    const firstCountry = head(countries);
    const {t = identity, firebaseUser: user} = this.props;
    const {stateInputKind, role} = this.state;
    if (user) {
      const {getFieldDecorator} = this.props.form;
      const {email, phoneNumber} = user;
      return (
        <div>
          <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex">
            <Col xs={{span: 24, offset: 0}} lg={{span: 24, offset: 0}}>
              <Card>
                <Form onSubmit={this.handleSubmit(user)}>
                  <FormItem label={t("basicInformationForm.label.role")} {...formItemLayout} className={styles.formItemProfile}>
                    <Select value={role}
                            onChange={this.onSelectHandleChange("role")}>
                      <Option value={Roles.creater}>Caption Creator</Option>
                      <Option value={Roles.reader}>Caption Reader</Option>
                    </Select>
                  </FormItem>

                  <FormItem label={t("basicInformationForm.label.firstName")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("firstName", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.firstName")}]
                    })(<Input
                      onChange={this.onInputChange("firstName")}/>)}
                  </FormItem>
                  <FormItem label={t("basicInformationForm.label.lastName")} {...formItemLayout}>
                    {getFieldDecorator("lastName", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.lastName")}]
                    })(<Input onChange={this.onInputChange("lastName")}/>)}
                  </FormItem>

                  {email && (
                    <FormItem label={t("basicInformationForm.label.email")} {...formItemLayout} className={styles.formItemProfile}>
                      <Input value={email} readOnly/>
                    </FormItem>
                  )}
                  {!email && (
                    <FormItem label={t("basicInformationForm.label.email")} {...formItemLayout} className={styles.formItemProfile}>
                      {getFieldDecorator("email", {
                        rules: [{required: true, message: t("basicInformationForm.requireMessage.email")}]
                      })(<Input onChange={this.onInputChange("email")}/>)}
                    </FormItem>
                  )}
                  {phoneNumber && (
                    <FormItem label={t("basicInformationForm.label.contactNumber")} {...formItemLayout} className={styles.formItemProfile}>
                      <Input value={phoneNumber} readOnly/>
                    </FormItem>
                  )}
                  {!phoneNumber && (
                    <FormItem label={t("basicInformationForm.label.contactNumber")} {...formItemLayout} className={styles.formItemProfile}>
                      {getFieldDecorator("contactNumber", {
                        rules: [{required: true, message: t("basicInformationForm.requireMessage.contactNumber")}]
                      })(<Input
                        onChange={this.onInputChange("contactNumber")}
                        placeholder="(123) 456-7890/+123456789"/>)}
                    </FormItem>
                  )}

                  <FormItem label={t("basicInformationForm.label.companyName")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("companyName", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.companyName")}]
                    })(<Input onChange={this.onInputChange("companyName")}/>)}
                  </FormItem>

                  <FormItem label={t("basicInformationForm.label.address")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("address", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.address")}]
                    })(<Input onChange={this.onInputChange("address")}/>)}
                  </FormItem>

                  <FormItem label={t("basicInformationForm.label.country")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("country", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.country")}],
                      initialValue: firstCountry && firstCountry.name
                    })(
                      <Select
                        showSearch
                        optionFilterProp="children"
                        filterOption={selectFilterHelper}
                        onChange={this.onSelectHandleChange("country")}>
                        {countries.map((c1) => <Option key={c1.name} value={c1.name}>{c1.name}</Option>)}
                      </Select>)}
                  </FormItem>

                  <FormItem label={t("basicInformationForm.label.city")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("city", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.city")}]
                    })(<Input onChange={this.onInputChange("city")}/>)}
                  </FormItem>

                  {stateInputKind === StateInputKind.option ? (
                    <FormItem label={t("basicInformationForm.label.state")} {...formItemLayout} className={styles.formItemProfile}>
                      {getFieldDecorator("state", {
                        rules: [{required: true, message: t("basicInformationForm.requireMessage.state")}],
                        initialValue: this.state.state
                      })(
                        <Select
                          showSearch
                          optionFilterProp="children"
                          filterOption={selectFilterHelper}
                          onChange={this.onSelectHandleChange("state")}>
                          {states.map((c1) => <Option key={c1.name} value={c1.name}>{c1.name}</Option>)}
                        </Select>
                      )}
                    </FormItem>) : (
                    <FormItem label={t("basicInformationForm.label.state")} {...formItemLayout} className={styles.formItemProfile}>
                      {getFieldDecorator("state", {
                        rules: [{required: true, message: t("basicInformationForm.requireMessage.state")}],
                        initialValue: this.state.state
                      })(<Input onChange={this.onInputChange("state")}/>)}
                    </FormItem>
                  )}

                  <FormItem label={t("basicInformationForm.label.zipCode")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("zipCode", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.zipCode")}]
                    })(<Input onChange={this.onInputChange("zipCode")}/>)}
                  </FormItem>

                  <FormItem label={t("basicInformationForm.label.businessPhoneNumber")} {...formItemLayout} className={styles.formItemProfile}>
                    {getFieldDecorator("businessPhoneNumber", {
                      rules: [{required: true, message: t("basicInformationForm.requireMessage.businessPhoneNumber")}]
                    })(<Input
                      onChange={this.onInputChange("businessPhoneNumber")} placeholder="(123) 456-7890/+123456789"/>)}
                  </FormItem>

                  <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">Register</Button>
                  </FormItem>
                </Form>
              </Card>
            </Col></Row>
        </div>
      );
    } else {
      return null;
    }
  }
}

export const BasicInformationForm = Form.create()(BasicInformation);
