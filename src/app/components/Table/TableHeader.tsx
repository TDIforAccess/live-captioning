import * as React from "react";
import * as styles from "./TableHeader.scss";
import {translate, InjectedTranslateProps} from "react-i18next";
import {Input} from "antd";
import {TABLE_PAGINATION_CONFIG} from "../../store/constants";


export type TableHeaderProps = InjectedTranslateProps & {
  onRowCountChange: (evt: React.FormEvent<HTMLSelectElement>) => void;
  onSearchText: (evt: React.FormEvent<HTMLInputElement>) => void;
  pageSize: number;
  searchText: string;
};

const _TableHeader: React.SFC<TableHeaderProps> = ({t, onRowCountChange, pageSize, searchText, onSearchText}) => (
  <div className={styles.tableHeader}>
    <div>{t("tables.header.display")}
      <select value={pageSize} onChange={onRowCountChange}>
        {TABLE_PAGINATION_CONFIG.map((value) => (<option value={value} role="option" aria-selected={true} key={value}>{value}</option>))}
      </select>
      {t("tables.header.records")}</div>
    <div className={styles.searchBox}>
      <label>{t("tables.header.search")}</label>
      <Input placeholder="" onChange={onSearchText} value={searchText}/>
    </div>
  </div>
);

export const TableHeader = translate()(_TableHeader);
