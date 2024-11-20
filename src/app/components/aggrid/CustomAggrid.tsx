import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useColorScheme } from "@mui/material";
import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  SyntheticEvent,
} from "react";
import { DoubleRowCellRenderer } from "./DoubleRowCellRenderer";
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ColGroupDef,
  ColDef,
  ValueGetterParams,
  CellContextMenuEvent,
  IContextMenuParams,
} from "ag-grid-community";
import DoubleRowCellEditor from "./DoubleRowCellEditor";

import {
  ClipboardModule,
  LicenseManager,
  MenuModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import CustomContextMenu from "../contextMenu/CustomContextMenu";
LicenseManager.setLicenseKey("KEY HERE");

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ClipboardModule,
  MenuModule,
]);

export const CustomAggrid = () => {
  const { mode, systemMode, setMode } = useColorScheme();

  const [rowData, setRowData] = useState<any[]>([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQA", price: 48890, electric: true },
    { make: "Fiat", model: "500", price: 15774, electric: false },
    { make: "Nissan", model: "Juke", price: 20675, electric: false },
  ]);

  const columnDefs = useMemo<(ColDef<any, any> | ColGroupDef<any>)[]>(() => {
    return [
      {
        headerName: "Make & Model",
        valueGetter: (p: ValueGetterParams) => p.data.make + " " + p.data.model,
        flex: 2,
      },
      {
        field: "price",
        valueFormatter: (p) => "£" + Math.floor(p.value).toLocaleString(),
        flex: 1,
      },
      { field: "electric", flex: 1 },
      {
        field: "button",
        // cellRenderer: DoubleRowCellRendererAggrid,
        // contextMenuItems: getContextMenuItems,
        cellRenderer: DoubleRowCellRenderer,
        cellEditor: DoubleRowCellEditor,
        editable: true,
        singleClickEdit: true,
        flex: 1,
        minWidth: 100,
        width: 120,
      },
    ];
  }, []);
  const resolvedMode = (systemMode || mode) as "light" | "dark";

  const contextMenuRef = useRef<HTMLMenuElement | null>(null);

  const [contextMenu, setContextMenu] = useState({
    position: {
      x: 0,
      y: 0,
    },
    toggled: false,
  });

  const closeContextMenu = () => {
    setContextMenu({ toggled: false, position: { x: 0, y: 0 } });
  };

  const handleCellContextMenu = (e: CellContextMenuEvent) => {
    // check if this column is button
    // e.event?.preventDefault();
    if (e.colDef.field === "button" && contextMenuRef.current) {
      // e.api.showContextMenu(["copy"] as IContextMenuParams);
      const contextMenuAttr = contextMenuRef.current.getBoundingClientRect();
      if (e.event) {
        const event = e.event as PointerEvent;
        const isLeft = event.clientX < window.innerWidth / 2;

        let x = event.clientX;
        let y = event.clientY;
        if (!isLeft && contextMenuAttr) {
          x = event.clientX - contextMenuAttr.width;
        }

        const newContextMenu = {
          position: { x: x, y: y },
          toggled: true,
        };
        setContextMenu(newContextMenu);
      }
    }
  };

  function resetContextMenu() {
    setContextMenu({
      position: {
        x: 0,
        y: 0,
      },
      toggled: false,
    });
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (contextMenuRef.current) {
        if (!contextMenuRef.current.contains(e.target)) {
          resetContextMenu();
        }
      }
    }

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  });

  const popupParent = useMemo<HTMLElement | null>(() => {
    return document.querySelector("body");
  }, []);

  return (
    <div
      style={{ width: "100%", height: "400px" }}
      onClick={closeContextMenu} // Close context menu when clicking outside.
    >
      <div
        style={{ width: "100%", height: "100%" }}
        className={
          resolvedMode === "light" ? "ag-theme-quartz" : "ag-theme-quartz-dark"
        }
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          rowHeight={80}
          suppressContextMenu
          preventDefaultOnContextMenu
          onCellContextMenu={handleCellContextMenu}
          // getContextMenuItems={getContextMenuItems}
          // context={selectedCellId}
          popupParent={popupParent} // Need to do this to ensure that the popup falls outside of the table
        />
        <CustomContextMenu
          contextMenuRef={contextMenuRef}
          isToggled={contextMenu.toggled}
          positionX={contextMenu.position.x}
          positionY={contextMenu.position.y}
          buttons={[
            {
              text: "Do something",
              icon: ":)",
              onClick: () => alert("hello"),
              isSpacer: false,
            },
            {
              text: "Do something else",
              icon: ":|",
              onClick: () => alert("hello else"),
              isSpacer: false,
            },
            {
              text: "",
              icon: "",
              onClick: () => null,
              isSpacer: true,
            },
          ]}
        />
      </div>
    </div>
  );
};
