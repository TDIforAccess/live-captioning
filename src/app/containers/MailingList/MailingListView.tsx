import * as React from "react";
import {containerUtils} from "../../../utils";
import {UpdateMailingListContainer} from "./UpdateMailingListContainer";
import {Col, Row} from "antd";
import {UploadMailingListContainer} from "./UploadMailingListContainer";
import {CommonStateProps, MailingListCreator} from "types";

const MailingListView: React.SFC<CommonStateProps> =
  (props) => {
    return (
      <div>
        <Row gutter={24}>
          <Col xs={{span: 24, offset: 0}} lg={{span: 8, offset: 0}}>
            <UploadMailingListContainer {...{...props, kind: MailingListCreator.upload}}/>
          </Col>
          <Col xs={{span: 24, offset: 0}} lg={{span: 8, offset: 0}}>
            <UploadMailingListContainer {...{...props, kind: MailingListCreator.create}}/>
          </Col>
          <Col xs={{span: 24, offset: 0}} lg={{span: 8, offset: 0}}>
            <UpdateMailingListContainer {...props}/>
          </Col>
        </Row>
      </div>
    );
  };


export const MailingListContainer = containerUtils.connectTranslated(null, null)(
  MailingListView
);


