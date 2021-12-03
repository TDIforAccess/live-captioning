import * as React from "react";
import {DashboardDocumentsStatus, FDocument} from "types";
import Column from "antd/es/table/Column";
import {Table} from "antd";
import {TranslationFunction} from "i18next";
import {TableHeader} from "../../components";
import {PaginationConfig} from "antd/lib/pagination";
import {SorterResult} from "antd/lib/table";
import {TABLE_PAGINATION_CONFIG} from "../../store";

export type DashboardTableProps = {
  documents: FDocument[];
  documentFetchStatus?: DashboardDocumentsStatus;
  nameColumn: (doc: FDocument) => JSX.Element;
  actionButton: (document: FDocument) => JSX.Element;
  t: TranslationFunction;
};
export type DashboardTableState = {
  searchText: string;
  pageSize: number;
  filteredDocuments: FDocument[];
  paginationText: string;
  currentPage: number;
};

const rowKey = ({documentId}: FDocument) => documentId;

const sorter = ({name: a}: FDocument, {name: b}: FDocument) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());

const getPaginationText = (currentPage: number, total: number, pageSize: number, t: TranslationFunction) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = total >= (currentPage * pageSize) ? (currentPage * pageSize) : total;
  return t("tables.footer.paginationText", {start, end, total});
};

export class DashboardTable extends React.Component<DashboardTableProps, DashboardTableState> {

  state = {
    searchText: "",
    pageSize: TABLE_PAGINATION_CONFIG[0],
    filteredDocuments: this.props.documents,
    paginationText: "",
    currentPage: 1
  };

  static getDerivedStateFromProps(props: DashboardTableProps, state: DashboardTableState) {
    // Any time the current user changes,
    if (props.documents.length !== state.filteredDocuments.length && state.searchText === "") {
      return {
        ...state,
        filteredDocuments: props.documents,
        paginationText: getPaginationText(1, props.documents.length, state.pageSize, props.t)
      };
    }
    return null;
  }

  handleOnSearch = (evt: React.FormEvent<HTMLInputElement>) => {
    const value = evt.currentTarget.value || "";
    this.setState((prevState) => {
      const {pageSize, currentPage} = prevState;
      const filteredDocuments = prevState.filteredDocuments.filter(({name}) => name.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
      return ({
        ...prevState,
        searchText: value,
        filteredDocuments,
        paginationText: getPaginationText(
          Math.min(currentPage, Math.ceil(filteredDocuments.length / pageSize)),
          filteredDocuments.length,
          pageSize,
          this.props.t
        )
      });
    });
  }

  handlePageSizeChange = (evt: React.FormEvent<HTMLSelectElement>) => {
    const pageSize = parseInt(evt.currentTarget.value, 10);
    this.setState((prevState) => ({
      ...prevState,
      pageSize,
      // In case current pagination, reduces the number of pages, takes the min.
      paginationText: getPaginationText(
        Math.min(prevState.currentPage, Math.ceil(prevState.filteredDocuments.length / pageSize)),
        prevState.filteredDocuments.length,
        pageSize,
        this.props.t
      )
    }));
  }

  header = () => (
    <TableHeader
      onRowCountChange={this.handlePageSizeChange}
      onSearchText={this.handleOnSearch}
      pageSize={this.state.pageSize}
      searchText={this.state.searchText}
    />
  )

  handleTableChange = (pagination: PaginationConfig, filters: Record<keyof FDocument, string[]>, sorter: SorterResult<FDocument>) => {
    this.setState((prevState: DashboardTableState) => ({
      ...prevState,
      currentPage: pagination.current || 1,
      paginationText: getPaginationText(pagination.current || 1, prevState.filteredDocuments.length, pagination.pageSize || 5, this.props.t)
    }));
  }

  render() {
    const {documentFetchStatus, nameColumn, actionButton, t} = this.props;
    const {filteredDocuments, pageSize, paginationText} = this.state;
    const pagination = {
      total: filteredDocuments.length,
      showTotal: (total: number) => paginationText,
      pageSize: pageSize,
      defaultPageSize: TABLE_PAGINATION_CONFIG[0]
    };

    return (
      <Table dataSource={filteredDocuments}
             rowKey={rowKey}
             loading={documentFetchStatus === DashboardDocumentsStatus.PROGRESS || documentFetchStatus === DashboardDocumentsStatus.DELETE_PROGRESS}
             pagination={pagination}
             bordered={true}
             title={this.header}
             onChange={this.handleTableChange}
      >
        <Column title={t("tables.columns.sessions")}
                key="name"
                sorter={sorter}
                render={nameColumn}
        />
        <Column title={t("tables.columns.actions")}
                key="documentId"
                sorter={sorter}
                render={actionButton}
        />
      </Table>
    );
  }
}
