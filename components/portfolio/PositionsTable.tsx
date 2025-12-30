"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ValueFormatterParams, CellClassParams, GridReadyEvent } from "ag-grid-community";
import { GlassCard } from "@/components/ui/GlassCard";
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react";
import "ag-grid-community/styles/ag-grid.css";

// Custom theme overrides for NeonFlux design
const gridStyles = `
.ag-theme-custom {
  --ag-background-color: transparent;
  --ag-header-background-color: rgba(0, 0, 0, 0.3);
  --ag-odd-row-background-color: transparent;
  --ag-row-hover-color: rgba(255, 255, 255, 0.05);
  --ag-border-color: rgba(255, 255, 255, 0.1);
  --ag-header-foreground-color: rgba(255, 255, 255, 0.5);
  --ag-foreground-color: rgba(255, 255, 255, 0.9);
  --ag-font-family: inherit;
  --ag-font-size: 13px;
  --ag-row-border-color: rgba(255, 255, 255, 0.05);
  --ag-selected-row-background-color: rgba(0, 243, 255, 0.1);
}

.ag-theme-custom .ag-header-cell {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ag-theme-custom .ag-cell {
  display: flex;
  align-items: center;
}

.ag-theme-custom .ag-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Cell flash animation for price updates */
@keyframes flash-positive {
  0% { background-color: rgba(0, 243, 255, 0.4); }
  100% { background-color: transparent; }
}

@keyframes flash-negative {
  0% { background-color: rgba(255, 0, 204, 0.4); }
  100% { background-color: transparent; }
}

.cell-flash-positive {
  animation: flash-positive 0.8s ease-out;
}

.cell-flash-negative {
  animation: flash-negative 0.8s ease-out;
}
`;

interface Position {
    symbol: string;
    name: string;
    qty: number;
    avg: number;
    price: number;
    pnl: number;
    change: number;
}

const initialData: Position[] = [
    { symbol: "AAPL", name: "Apple Inc.", qty: 1500, avg: 145.20, price: 172.50, pnl: 40950, change: 1.25 },
    { symbol: "NVDA", name: "NVIDIA Corp.", qty: 400, avg: 420.00, price: 485.00, pnl: 26000, change: 2.80 },
    { symbol: "TSLA", name: "Tesla Inc.", qty: 800, avg: 240.50, price: 235.20, pnl: -4240, change: -1.50 },
    { symbol: "MSFT", name: "Microsoft", qty: 1000, avg: 310.00, price: 375.00, pnl: 65000, change: 0.85 },
    { symbol: "BTC", name: "Bitcoin", qty: 5.5, avg: 38000.00, price: 42500.00, pnl: 24750, change: 4.20 },
    { symbol: "AMZN", name: "Amazon.com", qty: 250, avg: 145.00, price: 178.50, pnl: 8375, change: 1.65 },
    { symbol: "GOOGL", name: "Alphabet Inc.", qty: 300, avg: 125.00, price: 141.80, pnl: 5040, change: 0.92 },
    { symbol: "META", name: "Meta Platforms", qty: 200, avg: 320.00, price: 358.20, pnl: 7640, change: 2.15 },
];

// Custom cell renderer for Asset column
const AssetCellRenderer = (props: { data: Position }) => {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {props.data.symbol[0]}
            </div>
            <div className="min-w-0">
                <div className="font-bold text-white truncate">{props.data.symbol}</div>
                <div className="text-xs text-gray-500 truncate">{props.data.name}</div>
            </div>
        </div>
    );
};

// Custom cell renderer for Change column
const ChangeCellRenderer = (props: { value: number }) => {
    const isPositive = props.value >= 0;
    return (
        <span className={`inline-flex items-center gap-1 font-mono ${isPositive ? "text-neon-blue" : "text-neon-pink"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(props.value).toFixed(2)}%
        </span>
    );
};

// Custom cell renderer for P&L column
const PnLCellRenderer = (props: { value: number }) => {
    const isPositive = props.value >= 0;
    return (
        <span className={`font-mono font-bold ${isPositive ? "text-neon-blue" : "text-neon-pink"}`}>
            {isPositive ? "+" : "-"}${Math.abs(props.value).toLocaleString()}
        </span>
    );
};

export function PositionsTable() {
    const gridRef = useRef<AgGridReact<Position>>(null);
    const [rowData, setRowData] = useState<Position[]>(initialData);

    // Column definitions with AG Grid features
    const columnDefs = useMemo<ColDef<Position>[]>(() => [
        {
            field: "symbol",
            headerName: "Asset",
            cellRenderer: AssetCellRenderer,
            minWidth: 180,
            flex: 1.5,
            sortable: true,
            filter: true,
        },
        {
            field: "qty",
            headerName: "Quantity",
            valueFormatter: (params: ValueFormatterParams) => params.value?.toLocaleString() || "",
            cellClass: "font-mono text-gray-300",
            minWidth: 100,
            flex: 1,
            sortable: true,
            type: "numericColumn",
        },
        {
            field: "avg",
            headerName: "Avg. Price",
            valueFormatter: (params: ValueFormatterParams) => `$${params.value?.toFixed(2) || "0.00"}`,
            cellClass: "font-mono text-gray-400",
            minWidth: 110,
            flex: 1,
            sortable: true,
            type: "numericColumn",
        },
        {
            field: "price",
            headerName: "Market Price",
            valueFormatter: (params: ValueFormatterParams) =>
                `$${params.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}`,
            cellClass: "font-mono text-white font-bold",
            minWidth: 120,
            flex: 1,
            sortable: true,
            type: "numericColumn",
        },
        {
            field: "change",
            headerName: "Day Δ",
            cellRenderer: ChangeCellRenderer,
            minWidth: 100,
            flex: 1,
            sortable: true,
            type: "numericColumn",
        },
        {
            field: "pnl",
            headerName: "Total P&L",
            cellRenderer: PnLCellRenderer,
            minWidth: 140,
            flex: 1.2,
            sortable: true,
            type: "numericColumn",
            cellClassRules: {
                "cell-flash-positive": (params: CellClassParams) => params.value > 0,
                "cell-flash-negative": (params: CellClassParams) => params.value < 0,
            },
        },
    ], []);

    // Default column settings
    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        suppressMovable: false,
    }), []);

    // Simulate real-time price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRowData(prevData =>
                prevData.map(position => {
                    // Random price fluctuation ±0.5%
                    const fluctuation = 1 + (Math.random() - 0.5) * 0.01;
                    const newPrice = +(position.price * fluctuation).toFixed(2);
                    const newPnL = Math.round((newPrice - position.avg) * position.qty);
                    const newChange = +((newPrice / position.price - 1) * 100 + position.change).toFixed(2);

                    return {
                        ...position,
                        price: newPrice,
                        pnl: newPnL,
                        change: newChange,
                    };
                })
            );
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        params.api.sizeColumnsToFit();
    }, []);

    return (
        <>
            <style>{gridStyles}</style>
            <GlassCard className="overflow-hidden">
                <div className="p-6 border-b border-glass-border flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-white">Active Positions</h3>
                        <p className="text-xs text-gray-500 mt-1">Powered by AG Grid • Live updates every 2s</p>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="ag-theme-custom" style={{ height: 420, width: "100%" }}>
                    <AgGridReact<Position>
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        animateRows={true}
                        rowSelection="single"
                        getRowId={(params) => params.data.symbol}
                        suppressCellFocus={true}
                        domLayout="normal"
                    />
                </div>
            </GlassCard>
        </>
    );
}
