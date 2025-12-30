import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ============================================
// Types
// ============================================

export interface MarketQuote {
    symbol: string;
    bid: number;
    ask: number;
    last: number;
    volume: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    timestamp: number;
}

export interface OrderBookLevel {
    price: number;
    size: number;
    total: number;
}

export interface OrderBookData {
    symbol: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    spread: number;
    spreadPercent: number;
}

export interface Position {
    symbol: string;
    name: string;
    qty: number;
    avgPrice: number;
    marketPrice: number;
    marketValue: number;
    unrealizedPnL: number;
    realizedPnL: number;
    dayChange: number;
    dayChangePercent: number;
}

export interface Order {
    orderId: string;
    symbol: string;
    side: "BUY" | "SELL";
    orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
    quantity: number;
    filledQty: number;
    price?: number;
    stopPrice?: number;
    status: "PENDING" | "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED";
    timestamp: number;
}

// ============================================
// Market Data Store
// ============================================

interface MarketDataState {
    // Data
    quotes: Record<string, MarketQuote>;
    orderBooks: Record<string, OrderBookData>;
    positions: Position[];
    orders: Order[];
    watchlist: string[];

    // Connection state
    isConnected: boolean;
    lastUpdate: number;

    // Actions
    updateQuote: (quote: MarketQuote) => void;
    updateOrderBook: (symbol: string, data: OrderBookData) => void;
    updatePositions: (positions: Position[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    setConnected: (connected: boolean) => void;
    addToWatchlist: (symbol: string) => void;
    removeFromWatchlist: (symbol: string) => void;
}

// Initial mock data
const initialQuotes: Record<string, MarketQuote> = {
    AAPL: { symbol: "AAPL", bid: 172.48, ask: 172.52, last: 172.50, volume: 45_200_000, change: 2.15, changePercent: 1.26, high: 173.20, low: 170.80, timestamp: Date.now() },
    NVDA: { symbol: "NVDA", bid: 484.90, ask: 485.10, last: 485.00, volume: 32_100_000, change: 13.20, changePercent: 2.80, high: 488.50, low: 475.00, timestamp: Date.now() },
    TSLA: { symbol: "TSLA", bid: 235.15, ask: 235.25, last: 235.20, volume: 28_500_000, change: -3.58, changePercent: -1.50, high: 240.10, low: 233.50, timestamp: Date.now() },
    MSFT: { symbol: "MSFT", bid: 374.95, ask: 375.05, last: 375.00, volume: 18_900_000, change: 3.18, changePercent: 0.85, high: 376.50, low: 372.20, timestamp: Date.now() },
    AMZN: { symbol: "AMZN", bid: 178.45, ask: 178.55, last: 178.50, volume: 22_300_000, change: 2.90, changePercent: 1.65, high: 179.80, low: 176.20, timestamp: Date.now() },
    GOOGL: { symbol: "GOOGL", bid: 141.75, ask: 141.85, last: 141.80, volume: 15_600_000, change: 1.30, changePercent: 0.92, high: 142.50, low: 140.60, timestamp: Date.now() },
    META: { symbol: "META", bid: 358.10, ask: 358.30, last: 358.20, volume: 12_800_000, change: 7.55, changePercent: 2.15, high: 360.00, low: 352.50, timestamp: Date.now() },
    BTC: { symbol: "BTC", bid: 42_480, ask: 42_520, last: 42_500, volume: 28_500, change: 1750, changePercent: 4.29, high: 43_200, low: 41_000, timestamp: Date.now() },
};

const initialPositions: Position[] = [
    { symbol: "AAPL", name: "Apple Inc.", qty: 1500, avgPrice: 145.20, marketPrice: 172.50, marketValue: 258750, unrealizedPnL: 40950, realizedPnL: 12500, dayChange: 3225, dayChangePercent: 1.26 },
    { symbol: "NVDA", name: "NVIDIA Corp.", qty: 400, avgPrice: 420.00, marketPrice: 485.00, marketValue: 194000, unrealizedPnL: 26000, realizedPnL: 8200, dayChange: 5280, dayChangePercent: 2.80 },
    { symbol: "TSLA", name: "Tesla Inc.", qty: 800, avgPrice: 240.50, marketPrice: 235.20, marketValue: 188160, unrealizedPnL: -4240, realizedPnL: 5600, dayChange: -2823, dayChangePercent: -1.50 },
    { symbol: "MSFT", name: "Microsoft", qty: 1000, avgPrice: 310.00, marketPrice: 375.00, marketValue: 375000, unrealizedPnL: 65000, realizedPnL: 22400, dayChange: 3188, dayChangePercent: 0.85 },
    { symbol: "BTC", name: "Bitcoin", qty: 5.5, avgPrice: 38000, marketPrice: 42500, marketValue: 233750, unrealizedPnL: 24750, realizedPnL: 0, dayChange: 9823, dayChangePercent: 4.29 },
];

const generateOrderBook = (symbol: string, midPrice: number): OrderBookData => {
    const spread = midPrice * 0.0002; // 2 bps spread
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 0; i < 10; i++) {
        const bidPrice = +(midPrice - spread / 2 - i * spread).toFixed(2);
        const askPrice = +(midPrice + spread / 2 + i * spread).toFixed(2);
        const bidSize = Math.floor(Math.random() * 5000) + 500;
        const askSize = Math.floor(Math.random() * 5000) + 500;

        bidTotal += bidSize;
        askTotal += askSize;

        bids.push({ price: bidPrice, size: bidSize, total: bidTotal });
        asks.push({ price: askPrice, size: askSize, total: askTotal });
    }

    return {
        symbol,
        bids,
        asks: asks.reverse(), // Asks should be ascending from spread
        spread: +(asks[asks.length - 1].price - bids[0].price).toFixed(2),
        spreadPercent: +((spread / midPrice) * 100).toFixed(4),
    };
};

export const useMarketStore = create<MarketDataState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        quotes: initialQuotes,
        orderBooks: {
            AAPL: generateOrderBook("AAPL", 172.50),
            NVDA: generateOrderBook("NVDA", 485.00),
        },
        positions: initialPositions,
        orders: [],
        watchlist: ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN", "GOOGL", "META", "BTC"],
        isConnected: true,
        lastUpdate: Date.now(),

        // Actions
        updateQuote: (quote) =>
            set((state) => ({
                quotes: { ...state.quotes, [quote.symbol]: quote },
                lastUpdate: Date.now(),
            })),

        updateOrderBook: (symbol, data) =>
            set((state) => ({
                orderBooks: { ...state.orderBooks, [symbol]: data },
                lastUpdate: Date.now(),
            })),

        updatePositions: (positions) =>
            set({ positions, lastUpdate: Date.now() }),

        addOrder: (order) =>
            set((state) => ({
                orders: [order, ...state.orders],
            })),

        updateOrder: (orderId, updates) =>
            set((state) => ({
                orders: state.orders.map((o) =>
                    o.orderId === orderId ? { ...o, ...updates } : o
                ),
            })),

        setConnected: (connected) => set({ isConnected: connected }),

        addToWatchlist: (symbol) =>
            set((state) => ({
                watchlist: state.watchlist.includes(symbol)
                    ? state.watchlist
                    : [...state.watchlist, symbol],
            })),

        removeFromWatchlist: (symbol) =>
            set((state) => ({
                watchlist: state.watchlist.filter((s) => s !== symbol),
            })),
    }))
);

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const selectQuote = (symbol: string) => (state: MarketDataState) =>
    state.quotes[symbol];

export const selectOrderBook = (symbol: string) => (state: MarketDataState) =>
    state.orderBooks[symbol];

export const selectPositions = (state: MarketDataState) => state.positions;

export const selectTotalPnL = (state: MarketDataState) =>
    state.positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);

export const selectTotalValue = (state: MarketDataState) =>
    state.positions.reduce((sum, p) => sum + p.marketValue, 0);

// ============================================
// Simulated Real-Time Updates (Development)
// ============================================

let simulationInterval: NodeJS.Timeout | null = null;

export const startMarketSimulation = () => {
    if (simulationInterval) return;

    simulationInterval = setInterval(() => {
        const store = useMarketStore.getState();
        const symbols = Object.keys(store.quotes);

        // Update 2-3 random quotes each tick
        const updateCount = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < updateCount; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const quote = store.quotes[symbol];
            if (!quote) continue;

            const change = (Math.random() - 0.5) * quote.last * 0.002; // ±0.1%
            const newLast = +(quote.last + change).toFixed(2);
            const newBid = +(newLast - Math.random() * 0.05).toFixed(2);
            const newAsk = +(newLast + Math.random() * 0.05).toFixed(2);

            store.updateQuote({
                ...quote,
                bid: newBid,
                ask: newAsk,
                last: newLast,
                change: +(newLast - (quote.last - quote.change)).toFixed(2),
                changePercent: +(((newLast - (quote.last - quote.change)) / (quote.last - quote.change)) * 100).toFixed(2),
                timestamp: Date.now(),
            });
        }

        // Update positions based on new quotes
        const newPositions = store.positions.map((pos) => {
            const quote = store.quotes[pos.symbol];
            if (!quote) return pos;

            const marketValue = pos.qty * quote.last;
            const unrealizedPnL = (quote.last - pos.avgPrice) * pos.qty;

            return {
                ...pos,
                marketPrice: quote.last,
                marketValue,
                unrealizedPnL,
                dayChange: pos.qty * quote.change,
                dayChangePercent: quote.changePercent,
            };
        });

        store.updatePositions(newPositions);
    }, 500); // 2Hz updates
};

export const stopMarketSimulation = () => {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
};
