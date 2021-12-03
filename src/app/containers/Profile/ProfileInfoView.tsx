import * as React from "react";
import {Alert, Button, Card, Col, Form, Input, message, Row, Select} from "antd";
import * as R from "ramda";
import {CommonFormStateProps, CountryUnit, FirebaseUser, Roles, StateUnit, User, UserGivenData} from "types";
import {option} from "fp-ts";
import {UserError} from "../Authentication/authenticationReducers";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {formItemLayout, tailFormItemLayout} from "../../base/FormLayouts";
import {selectFilterHelper, stringUtils, UNITED_STATES} from "../../../utils";
import * as styles from "../BasicInfomation/BasicInformation.scss";
import {SelectValue} from "antd/lib/select";
import * as countryList from "../../../resources/countries.json";
import * as stateList from "../../../resources/states.json";
import {StateInputKind} from "../BasicInfomation/BasicInformationForm";

const {Meta} = Card;
const FormItem = Form.Item;
const Option = Select.Option;
const countries: CountryUnit[] = countryList;
const states: StateUnit[] = stateList;

export type ProfileInfoDispatchProps = {
  fetchUserInfo: (userId: string) => void;
  updateUserInfo: (dUser: User) => void;
};

export type ProfileInfoStateProps = {
  firebaseUser: FirebaseUser | undefined;
  userInfo: option.Option<User> | undefined;
  userInfoFetchError: UserError | undefined;
  userUpdateError: UserError | undefined;
  userUpdated: boolean | undefined;
};

export type ProfileInfoProps =
  ProfileInfoDispatchProps
  & ProfileInfoStateProps
  & CommonFormStateProps;

// TODO this is same as BasicInfomation think how to generalise
export type ProfileInfoState = {
  role: Roles;
  firstName: string;
  lastName: string;
  contactNumber: string;
  companyName: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  businessPhoneNumber: string;
  loading: boolean;
  stateInputKind?: StateInputKind;
  email: string;
};

class ProfileInfoView extends React.Component<ProfileInfoProps, ProfileInfoState> {
  constructor(props: ProfileInfoProps) {
    super(props);
    this.state = {
      email: "asdasd",
      role: Roles.creater,
      firstName: "",
      lastName: "",
      contactNumber: "",
      companyName: "",
      address: "",
      country: "",
      city: "",
      state: "",
      zipCode: "",
      businessPhoneNumber: "",
      loading: false
    };
  }

  componentWillReceiveProps(nextProps: ProfileInfoStateProps) {
    if (nextProps.userInfo !== this.props.userInfo) {
      if (nextProps.userInfo) {
        nextProps.userInfo.fold(
          this.setState({
            loading: false
          }),
          (u: User) => {
            this.setState({
              role: u.role,
              firstName: u.userGivenData.firstName,
              lastName: u.userGivenData.lastName,
              contactNumber: u.userGivenData.contactNumber,
              companyName: u.userGivenData.companyName,
              address: u.userGivenData.address,
              country: u.userGivenData.country,
              city: u.userGivenData.city,
              state: u.userGivenData.state,
              zipCode: u.userGivenData.zipCode,
              businessPhoneNumber: u.userGivenData.businessPhoneNumber,
              loading: false,
              stateInputKind: u.userGivenData.country === UNITED_STATES ? StateInputKind.option : StateInputKind.input
            });
          }
        );
      }

      if (nextProps.userUpdated) {
        message.success("Profile Update Success");
      }

      if (nextProps.userUpdateError) {
        message.error(nextProps.userUpdateError.message);
      }
    }
  }

  componentDidMount() {
    const userId: string | null = this.props.userId;

    if (userId) {
      this.props.fetchUserInfo(userId);
    } else {
      return;
    }
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
    this.setState((prevState: ProfileInfoState) => ({
      ...prevState,
      [name]: value
    }));
  }

  handleSubmit = (userId: string) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({
      loading: true
    })
    ;
    this.props.form.validateFieldsAndScroll((error: any, values: any) => {
      if (error) {
        return;
      } else {
        this.props.updateUserInfo({
          uid: userId,
          role: this.state.role,
          userGivenData: R.omit(["role", "loading"], this.state) as UserGivenData
        });
      }
    });
  }

  render() {
    const user = this.props.userId;
    const {t = R.identity, userInfo, userInfoFetchError, firebaseUser} = this.props;
    if (user) {
      const {getFieldDecorator} = this.props.form;
      const photoIcon = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR
      0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANUSURBVHhe7ZzHqhRBFIavCOYARnQlZjc
      uBBc+gYjuzKBudSNu9AXEhYggKhgwoPgGhmcwbFyI7kRERQw7c0K/H64wXM4MPT3dXT1T/wcfDDO3u06d7qmudGfMGGOMM
      cYYY4wxxhhjjDGmRczFvXgFH+F7/DmuXus9fbYHZ6OpiDV4Db/i34Lqb3XMKjQlmYGn8RdGSS6ijj2F09D0ge7cJxgltYw
      PcAmaAmxAtelRIgfxFa5H04OVWEfy/6uL4G9CF9TmV9nsdFPNkZ8JAXrgRgmrw+NoOlBXc5DeTr9+RjdFHVzHKFF1ehENz
      MEvGCWpTlWmR8yg6YUoQU24G7PnKkbJacLLmD0PMUpOE97H7PmIUXKa8ANmzw+MktOE3zF7fAESo2YgSk4TugkCP4QTo2X
      EKDlNeAmzJ+VAbBdmj6YDUkxFaEJuFhpIMRpW02fGWY3aXhIlqg5V1go0HWj3QpSsOjyJZgJaJtRyYZSwKlUZU9AELEUtn
      EeJq0IvyhdAW0fquAjeltIHuks1So0SWUady3d+n+iZcAI/YZTUImqiTw/cqWhKojtXC+j9DNY0yFI/fzmaitCoVWu4mr9
      RT+Yd6g6Xeq339JmmFzzCNcYYY8xwsQ61VbEu9I9+KsN0MA+P4WNUH34H1sVOVBkq6yiq7GzRICkaYJ3DujiPnWVpwHYBl
      2E2LMCz2G0/kLaKTMeq0Tm7bYFRLGdQsY00B7DIVsSDWDU6Z1RWp7pA+3DkmI93MKp0pBKxCKtiMXa7+yNvo2IeCTbha4w
      q2su7OBkHRee4h1EZvXyJG3GoUY/mG0YVLOINnIRl0bE3MTp3EfWTB9txKFF7/wejivWjvgkLsV90TJk7f6K/cT8OFepvK
      /CoQmV8g3qIFllM198cQh0TnauMqkud45NK2YbdupiDqnVd9eW3on5PYua4eq339FmZ500RVSeV0Wo0zB9kCbHtqm5rsZV
      oFeoZRoGPkk9R37rWcQujgEdR9c5axRaMAh1lN2Mr0BzLC4yCHGWfYyt+deUIRgHm4GFMzluMgstBjTWSEwWWk8mJgsrJ5
      ERB5WRyoqByMjlRUDmZnCionExOFFROJicKKieTEwWVk8YYY4wxxhhjjDHGGGOMMT0YG/sHMnMFK6VLXssAAAAASUVORK5
      CYII=`;
      return (
        <div>
          {userInfo && firebaseUser ? userInfo.fold(
            (<Alert message={"User Information not found."} type={"error"}/>),
            u => (<div>
              <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex">
                <Col xs={{span: 24, offset: 0}} lg={{span: 8, offset: 0}}>
                  <Card
                    hoverable
                    style={{width: 240}}
                    cover={<img alt="example" src={stringUtils.fromNullToUndefined(firebaseUser.photoURL) ? stringUtils.fromNullToUndefined(firebaseUser.photoURL) : photoIcon}/>}
                  >
                    <Meta
                      description={firebaseUser.email}
                    />
                  </Card>
                </Col>
                <Col xs={{span: 24, offset: 0}} lg={{span: 16, offset: 0}}>
                  <Card>
                    <Form onSubmit={this.handleSubmit(user)}>
                      <FormItem label="Role" {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("role", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.firstName")}],
                          initialValue: this.state.role
                        })(<Select
                          onChange={this.onSelectHandleChange("role")}>
                          <Option value="creater">Caption Creator</Option>
                          <Option value="reader">Caption Reader</Option>
                        </Select>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.firstName")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("firstName", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.firstName")}],
                          initialValue: this.state.firstName
                        })(<Input
                          onChange={this.onInputChange("firstName")}/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.lastName")} {...formItemLayout}>
                        {getFieldDecorator("lastName", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.lastName")}],
                          initialValue: u.userGivenData.lastName
                        })(<Input onChange={this.onInputChange("lastName")}/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.contactNumber")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("contactNumber", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.contactNumber")}],
                          initialValue: this.state.contactNumber
                        })(<Input
                          onChange={this.onInputChange("contactNumber")}
                          placeholder="(123) 456-7890/+123456789"/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.companyName")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("companyName", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.companyName")}],
                          initialValue: this.state.companyName
                        })(<Input onChange={this.onInputChange("companyName")}/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.address")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("address", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.address")}],
                          initialValue: this.state.address
                        })(<Input onChange={this.onInputChange("address")}/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.country")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("country", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.country")}],
                          initialValue: this.state.country
                        })(
                            <Select
                              showSearch
                              optionFilterProp="children"
                              filterOption={selectFilterHelper}
                              onChange={this.onSelectHandleChange("country")}>
                              {countries.map((c1) => <Option key={c1.name} value={c1.name}>{c1.name}</Option>)}
                            </Select>
                        )}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.city")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("city", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.city")}],
                          initialValue: this.state.city
                        })(<Input onChange={this.onInputChange("city")}/>)}
                      </FormItem>
                      {this.state.stateInputKind === StateInputKind.option ? (
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
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.zipCode")}],
                          initialValue: this.state.zipCode
                        })(<Input onChange={this.onInputChange("zipCode")}/>)}
                      </FormItem>

                      <FormItem label={t("basicInformationForm.label.businessPhoneNumber")} {...formItemLayout} className={styles.formItemProfile}>
                        {getFieldDecorator("businessPhoneNumber", {
                          rules: [{required: true, message: t("basicInformationForm.requireMessage.businessPhoneNumber")}],
                          initialValue: this.state.businessPhoneNumber
                        })(<Input
                          onChange={this.onInputChange("businessPhoneNumber")} placeholder="(123) 456-7890/+123456789"/>)}
                      </FormItem>

                      <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit" loading={this.state.loading}>Update</Button>
                      </FormItem>
                    </Form>
                  </Card>
                </Col>
              </Row>
            </div>)
          ) : userInfoFetchError ? (<Alert message={userInfoFetchError.message} type={"error"}/>) : <Row gutter={{xs: 8, sm: 16, md: 24, lg: 32}} type="flex">
            <Col span={12} offset={10}>
              <FontAwesomeIcon icon={"spinner"} size={"10x"} spin={true} color={"#438eb9"}/>
            </Col>
          </Row>
          }
        </div>);
    } else {
      return null;
    }
  }
}

export const ProfileInfo = Form.create()(ProfileInfoView);
