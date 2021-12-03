import {SelectValue} from "antd/lib/select";
import {SketchPicker, ColorResult} from "react-color";
import {Col, Row, Form, Select, Button, message, Drawer} from "antd";
import {formItemLayoutEditor} from "../../base/FormLayouts";
import {WithAuthenticationState} from "../Authentication/withAuthentication";
import {FUserEditorSettings} from "../../../types/domains/userSettings";
import {EditorError} from "./EditorReducer";
import {option} from "fp-ts";
import * as React from "react";
import {merge, union, append} from "ramda";
import {InjectedTranslateProps} from "react-i18next";
import * as styles from "../../components/Table/ActionButtons.scss";

const FormItem = Form.Item;
const Option = Select.Option;

export type EditorSettingStateProps = {
  editorSaveError: EditorError | undefined;
  editorSettings: option.Option<FUserEditorSettings>;
  editorFetchError: EditorError | undefined;
  editorSettingsInitial: option.Option<FUserEditorSettings>;
};

export type EditorSettingDispatchProps = {
  updateUserSettings: (settings: FUserEditorSettings) => void;
  fetchUserSettings: (user: string) => void;
};

export type ElementToOperateOn = {
  elem: Element;
};

export type Settings = {
  backGround: string;
  foreGround: string;
  fontFamily: string;
  fontSize: number;
  wordSpace: number;
  letterSpace: number;
  lineSpace: number;
};

export type EditorSettingProps =
  WithAuthenticationState &
  ElementToOperateOn &
  EditorSettingDispatchProps &
  EditorSettingStateProps &
  InjectedTranslateProps;

export type EditorSettingState = {
  displayColorPicker: boolean;
  displayColourPickerType: SettingsActionType;
  settings: Settings;
  showSettings: boolean;
};

const fonts = [
  "Arial, sans-serif",
  "Comic Sans MS, cursive, sans-serif",
  "Courier New, monospace",
  "Times New Roman, serif",
  "Lucida Sans Unicode , Lucida Grande, sans-serif",
  "Trebuchet MS, sans-serif",
  "Verdana, Geneva, sans-serif"
];
const fontSize = [12, 14, 18, 24, 30, 36, 42, 48, 54, 60, 72, 84, 96];
const wordSpace = union([0, 2, 4, 6, 8], fontSize);
const letterSpace = wordSpace;
const lineSpace = append(10, fontSize);

const enum SettingsActionType {
  FontFamily = "fontFamily",
  FontSize = "fontSize",
  WordSpace = "wordSpace",
  LetterSpace = "letterSpace",
  LineSpace = "lineSpace",
  ForeGround = "foreGround",
  BackGround = "backGround"
}


export class EditorSetting extends React.Component<EditorSettingProps,
  EditorSettingState> {
  constructor(props: EditorSettingProps) {
    super(props);
    this.state = {
      displayColorPicker: false,
      displayColourPickerType: SettingsActionType.BackGround,
      settings: {
        backGround: "white",
        foreGround: "black",
        fontFamily: "Arial, sans-serif",
        fontSize: 12,
        wordSpace: 0,
        letterSpace: 0,
        lineSpace: 14
      },
      showSettings: false
    };
  }

  componentWillReceiveProps(prevProps: Readonly<EditorSettingProps>, prevState: Readonly<EditorSettingState>): void {
    const {editorSettings, editorSettingsInitial, t, editorFetchError, editorSaveError} = this.props;
    if (prevProps.editorSettings !== editorSettings) {
      if (this.props.editorSettings.isSome()) {
        message.success(t("editorSettings.saveSuccess"));
      }
    }

    if (prevProps.editorSettingsInitial !== editorSettingsInitial) {
      if (prevProps.editorSettingsInitial.isSome()) {
        this.setState((prevState: EditorSettingState) => ({
          ...prevState,
          settings: prevProps.editorSettingsInitial.map(a => a.settings).getOrElse(this.state.settings)
        }));
      }
    }
    if (editorFetchError) {
      message.error(`${editorFetchError.message}. ${t("editorSettings.retry")}`);
    }

    if (editorSaveError) {
      message.error(`${editorSaveError.message}. ${t("editorSettings.retry")}`);
    }
  }

  componentDidMount() {
    const userId: string | null = this.props.userId;
    if (userId) {
      this.props.fetchUserSettings(userId);
    } else {
      return;
    }
  }

  saveSettings = (settings: Settings): void => {
    if (this.props.userId) {
      this.props.updateUserSettings({
        settings: settings,
        user: this.props.userId
      });
    }
  }

  initialSpawn = (settings: Settings) => {
    // @ts-ignore
    this.props.elem.style.backgroundColor = settings.backGround;
    // @ts-ignore
    this.props.elem.style.color = settings.foreGround;
    // @ts-ignore
    this.props.elem.style.fontFamily = settings.fontFamily;
    // @ts-ignore
    this.props.elem.style.fontSize = `${settings.fontSize}px`;
    // @ts-ignore
    this.props.elem.style.wordSpacing = `${settings.wordSpace}px`;
    // @ts-ignore
    this.props.elem.style.letterSpacing = `${settings.letterSpace}px`;
    // @ts-ignore
    this.props.elem.style.lineHeight = `${settings.lineSpace}px`;
  }

  handleChangeComplete = (color: ColorResult) => {
    switch (this.state.displayColourPickerType) {
      case SettingsActionType.ForeGround: {
        // @ts-ignore
        this.props.elem.style.backgroundColor = color.hex;
        break;
      }
      case SettingsActionType.BackGround: {
        // @ts-ignore
        this.props.elem.style.color = color.hex;
        break;
      }
      default:
    }
    this.setState((prevState: EditorSettingState) => {
      const newState = ({
        ...prevState,
        settings: {
          ...prevState.settings,
          [this.state.displayColourPickerType]: color.hex
        }
      });
      this.saveSettings(newState.settings);
      return newState;
    });
  }

  handleAttrChange = (type: SettingsActionType) => (value: SelectValue) => {
    let valT = value;
    switch (type) {
      case SettingsActionType.FontFamily: {
        // @ts-ignore
        this.props.elem.style.fontFamily = value;
        break;
      }
      case SettingsActionType.FontSize: {
        // @ts-ignore
        this.props.elem.style.fontSize = `${value}px`;
        valT = parseInt(value.toString(), 10);
        break;
      }
      case SettingsActionType.WordSpace: {
        // @ts-ignore
        this.props.elem.style.wordSpacing = `${value}px`;
        valT = parseInt(value.toString(), 10);
        break;
      }
      case SettingsActionType.LetterSpace: {
        // @ts-ignore
        this.props.elem.style.letterSpacing = `${value}px`;
        valT = parseInt(value.toString(), 10);
        break;
      }
      case SettingsActionType.LineSpace: {
        // @ts-ignore
        this.props.elem.style.lineHeight = `${value}px`;
        valT = parseInt(value.toString(), 10);
        break;
      }
      default:
    }
    this.setState((prevState: EditorSettingState) => {
      const newState = ({
        ...prevState,
        settings: merge(prevState.settings, {[type]: valT})
      });
      this.saveSettings(newState.settings);
      return newState;
    });
  }

  handleColourClick = (type: SettingsActionType) => () => {
    this.setState({
      displayColorPicker: !this.state.displayColorPicker,
      displayColourPickerType: type
    });
  }

  handleClose = () => {
    this.setState({displayColorPicker: false});
  }

  setDefaults = () => {

    this.setState((prevState: EditorSettingState) => {
      const newState = ({
        ...prevState,
        settings: {
          backGround: "white",
          foreGround: "black",
          fontFamily: "Arial, sans-serif",
          fontSize: 12,
          wordSpace: 0,
          letterSpace: 0,
          lineSpace: 14
        }
      });
      this.saveSettings(newState.settings);
      return newState;
    });
  }

  showDrawer = () =>
    this.setState((prevState: EditorSettingState) => ({...prevState, showSettings: true}))

  hideDrawer = () =>
    this.setState((prevState: EditorSettingState) => ({...prevState, showSettings: false}))

  render() {
    const {settings, showSettings} = this.state;
    const {t} = this.props;
    this.initialSpawn(settings);
    return (
      <>
        <Button className={styles.buttonPrimary} onClick={this.showDrawer}>
          {t("editorSettings.title")}
        </Button>
        <Drawer
          title={t("editorSettings.title")}
          placement="right"
          onClose={this.hideDrawer}
          visible={showSettings}
        >
          <Row gutter={24}>
            <Col xs={{span: 24, offset: 3}} lg={{span: 24, offset: 3}}>
              <Form layout="inline">
                <FormItem>
                  <Button onClick={this.setDefaults}>
                    {t("editorSettings.default")}
                  </Button>
                  <Button onClick={this.handleColourClick(SettingsActionType.BackGround)}>
                    {t("editorSettings.backgroundColor")}
                  </Button>
                  <Button onClick={this.handleColourClick(SettingsActionType.ForeGround)}>
                    {t("editorSettings.textColor")}
                  </Button>
                  {this.state.displayColorPicker ? (
                    <div style={{position: "absolute", zIndex: 2}}>
                      <div
                        role={"button"}
                        style={{
                          position: "fixed",
                          top: "0px",
                          right: "0px",
                          bottom: "0px",
                          left: "0px"
                        }}
                        onClick={this.handleClose}
                      />
                      <SketchPicker
                        onChangeComplete={this.handleChangeComplete}
                      />
                    </div>
                  ) : null}
                </FormItem>
                <FormItem label={t("editorSettings.fontFamily")} {...formItemLayoutEditor}>
                  <Select
                    value={settings.fontFamily}
                    onChange={this.handleAttrChange(SettingsActionType.FontFamily)}
                    style={{width: "160px"}}
                  >
                    {fonts.map(font => (
                      <Option key={font}>{font}</Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label={t("editorSettings.fontSize")} {...formItemLayoutEditor}>
                  <Select
                    value={settings.fontSize}
                    onChange={this.handleAttrChange(SettingsActionType.FontSize)}
                    style={{width: "62px"}}
                  >
                    {fontSize.map(size => (
                      <Option key={`${size}`}>{size}</Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label={t("editorSettings.wordSpace")} {...formItemLayoutEditor}>
                  <Select
                    value={settings.wordSpace}
                    onChange={this.handleAttrChange(SettingsActionType.WordSpace)}
                  >
                    {wordSpace.map(w => (
                      <Option key={`${w}`}>{w}</Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label={t("editorSettings.letterSpace")} {...formItemLayoutEditor}>
                  <Select
                    value={settings.letterSpace}
                    onChange={this.handleAttrChange(SettingsActionType.LetterSpace)}
                  >
                    {letterSpace.map(l => (
                      <Option key={`${l}`}>{l}</Option>
                    ))}
                  </Select>
                </FormItem>
                <FormItem label={t("editorSettings.lineSpace")} {...formItemLayoutEditor}>
                  <Select
                    value={settings.lineSpace}
                    onChange={this.handleAttrChange(SettingsActionType.LineSpace)}
                  >
                    {lineSpace.map(l => (
                      <Option key={`${l}`}>{l}</Option>
                    ))}
                  </Select>
                </FormItem>
              </Form>
            </Col>
          </Row>
        </Drawer>
      </>
    );
  }
}
