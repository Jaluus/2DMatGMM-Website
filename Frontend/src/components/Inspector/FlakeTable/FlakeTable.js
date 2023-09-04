import "./FlakeTable.css";

import { useEffect, useMemo, useState } from "react";
import { MantineReactTable } from "mantine-react-table";
import FlakeTableActions from "./FlakeTableActions";
import { ActionIcon, Paper } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useMantineTheme } from '@mantine/core';

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function FlakeTable(props) {
  const theme = useMantineTheme();
  const selectedColor = theme.colorScheme === "dark" ? theme.colors.gray[8] : theme.colors.gray[4];

  const viewportHeight = window.innerHeight;
  const entryHeight = convertRemToPixels(2.5);
  const headerHeight = convertRemToPixels(3.5);
  const tableHeight = viewportHeight - headerHeight * 2;

  const pageSize = Math.floor(tableHeight / entryHeight) - 1;
  const numPages = Math.ceil(props.flakeData.length / pageSize);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  });

  function handleNextPage() {
    if (pagination.pageIndex === numPages - 1) return;
    setPagination((prev) => {
      return { ...prev, pageIndex: prev.pageIndex + 1 };
    });
  }

  function handlePrevPage() {
    if (pagination.pageIndex === 0) return;
    setPagination((prev) => {
      return { ...prev, pageIndex: prev.pageIndex - 1 };
    });
  }

  useEffect(() => {
    let current_page = Math.floor(props.selectedIndex / pagination.pageSize);

    setPagination((prev) => ({
      ...prev,
      pageIndex: current_page,
    }));
  }, [props.selectedIndex]);

  const paginationFooter = (
    <Paper className="flakeTableEntryPagination" style={{ height: headerHeight }} withBorder radius={0}>
      <ActionIcon
        onClick={handlePrevPage}
        className="flakeTablePaginationButton"
      >
        <IconArrowLeft />
      </ActionIcon>
      <span className="flakeTablePaginationText">
        Page {pagination.pageIndex + 1} of {numPages}
      </span>
      <ActionIcon
        onClick={handleNextPage}
        className="flakeTablePaginationButton"
      >
        <IconArrowRight />
      </ActionIcon>
    </Paper>
  );

  const tableCell = ({ cell }) => {
    let flake = cell.getValue();
    return (
      <div className="flakeTableEntryDiv">
        <span className="flakeTableEntry">
          <b>{flake.flake_id}</b> ({cell.row.index + 1})
        </span>
        <FlakeTableActions
          className="flakeTableEntry"
          flake={flake}
          onFavorite={props.onFavorite}
          onUsed={props.onUsed}
        />
      </div>
    );
  };

  const tableHeader = () => {
    return (
      <div className="flakeTableHeader">
        Showing {props.flakeData.length} of {props.numTotalFlakes} flakes
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorFn: (row) => row,
        minSize: "0",
        enableSorting: false,
        Cell: tableCell,
        Header: tableHeader,
      },
    ],
    [props.flakeData]
  );

  return (
    <MantineReactTable
      columns={columns}
      data={props.flakeData}
      enableGlobalFilter={false}
      enableFullScreenToggle={false}
      enableDensityToggle={false}
      enableHiding={false}
      enableColumnFilters={false}
      enableTopToolbar={false}
      enableColumnActions={false}
      initialState={{ density: "sx" }}
      state={{ pagination, showSkeletons: props.isLoading }}
      mantinePaginationProps={{
        showRowsPerPage: false,
        showFirstLastPageButtons: false,
      }}
      mantineTableContainerProps={{
        sx: { height: tableHeight, width: "100%" },
      }}
      mantineTableHeadCellProps={{ sx: { height: entryHeight } }}
      mantinePaperProps={{ withBorder: false, shadow: "none" }}
      renderBottomToolbar={({ table }) => {
        return paginationFooter;
      }}
      mantineTableBodyCellProps={({ row }) => ({
        //add onClick to row to select upon clicking anywhere in the row
        onClick: () => {
          props.onClickFlake(row.index);
        },
        sx: {
            ...(row.index === props.selectedIndex) && {"background-color": selectedColor} ,
          height: entryHeight,
        },
      })}
    />
  );
}

export default FlakeTable;
