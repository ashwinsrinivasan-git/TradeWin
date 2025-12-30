import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ============================================
// Order Types
// ============================================

export type OrderSide = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
export type OrderStatus = "PENDING" | "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED";
export type TimeInForce = "DAY" | "GTC" | "IOC" | "FOK";

export interface Order {
    orderId: string;
    clientOrderId: string;
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    filledQty: number;
    remainingQty: number;
    price?: number;
    stopPrice?: number;
    avgFillPrice?: number;
    status: OrderStatus;
    timeInForce: TimeInForce;
    createdAt: number;
    updatedAt: number;
    fills: OrderFill[];
    errorMessage?: string;
}

export interface OrderFill {
    fillId: string;
    price: number;
    quantity: number;
    timestamp: number;
    venue: string;
}

export interface NewOrderRequest {
    symbol: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    price?: number;
    stopPrice?: number;
    timeInForce: TimeInForce;
}

// ============================================
// Execution Types
// ============================================

export interface Execution {
    executionId: string;
    orderId: string;
    symbol: string;
    side: OrderSide;
    price: number;
    quantity: number;
    timestamp: number;
    venue: string;
    commission: number;
}

// ============================================
// OMS Store State
// ============================================

interface OMSState {
    // Data
    orders: Map<string, Order>;
    executions: Execution[];
    orderHistory: Order[];

    // Working orders (open or partial)
    workingOrders: Order[];

    // Actions
    submitOrder: (request: NewOrderRequest) => Order;
    cancelOrder: (orderId: string) => boolean;
    amendOrder: (orderId: string, updates: { quantity?: number; price?: number }) => boolean;
    processAck: (orderId: string, exchangeOrderId: string) => void;
    processFill: (orderId: string, fill: OrderFill) => void;
    processReject: (orderId: string, reason: string) => void;
    processCancel: (orderId: string) => void;

    // Getters
    getOrder: (orderId: string) => Order | undefined;
    getOrdersBySymbol: (symbol: string) => Order[];
    getWorkingOrders: () => Order[];
}

// ============================================
// Utility Functions
// ============================================

const generateOrderId = (): string => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const generateClientOrderId = (): string => {
    return `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// ============================================
// OMS Store Implementation
// ============================================

export const useOMSStore = create<OMSState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        orders: new Map(),
        executions: [],
        orderHistory: [],
        workingOrders: [],

        // Submit a new order
        submitOrder: (request: NewOrderRequest): Order => {
            const orderId = generateOrderId();
            const clientOrderId = generateClientOrderId();
            const now = Date.now();

            const order: Order = {
                orderId,
                clientOrderId,
                symbol: request.symbol,
                side: request.side,
                orderType: request.orderType,
                quantity: request.quantity,
                filledQty: 0,
                remainingQty: request.quantity,
                price: request.price,
                stopPrice: request.stopPrice,
                status: "PENDING",
                timeInForce: request.timeInForce,
                createdAt: now,
                updatedAt: now,
                fills: [],
            };

            set((state) => {
                const newOrders = new Map(state.orders);
                newOrders.set(orderId, order);
                return {
                    orders: newOrders,
                    workingOrders: [...state.workingOrders, order],
                };
            });

            // Simulate async acknowledgment (in production: send to FIX engine)
            setTimeout(() => {
                get().processAck(orderId, `EXC-${Date.now()}`);
            }, 50);

            return order;
        },

        // Cancel an order
        cancelOrder: (orderId: string): boolean => {
            const order = get().orders.get(orderId);
            if (!order) return false;
            if (order.status === "FILLED" || order.status === "CANCELLED" || order.status === "REJECTED") {
                return false;
            }

            // Simulate cancel request (in production: send cancel to FIX engine)
            setTimeout(() => {
                get().processCancel(orderId);
            }, 30);

            return true;
        },

        // Amend an order (quantity or price)
        amendOrder: (orderId: string, updates: { quantity?: number; price?: number }): boolean => {
            const order = get().orders.get(orderId);
            if (!order) return false;
            if (order.status !== "OPEN" && order.status !== "PARTIAL") {
                return false;
            }

            set((state) => {
                const newOrders = new Map(state.orders);
                const existingOrder = newOrders.get(orderId);
                if (existingOrder) {
                    const amendedOrder: Order = {
                        ...existingOrder,
                        quantity: updates.quantity ?? existingOrder.quantity,
                        remainingQty: (updates.quantity ?? existingOrder.quantity) - existingOrder.filledQty,
                        price: updates.price ?? existingOrder.price,
                        updatedAt: Date.now(),
                    };
                    newOrders.set(orderId, amendedOrder);
                }
                return { orders: newOrders };
            });

            return true;
        },

        // Process order acknowledgment from exchange
        processAck: (orderId: string, exchangeOrderId: string) => {
            set((state) => {
                const newOrders = new Map(state.orders);
                const order = newOrders.get(orderId);
                if (order && order.status === "PENDING") {
                    newOrders.set(orderId, {
                        ...order,
                        status: "OPEN",
                        updatedAt: Date.now(),
                    });
                }
                return {
                    orders: newOrders,
                    workingOrders: Array.from(newOrders.values()).filter(
                        (o) => o.status === "OPEN" || o.status === "PARTIAL"
                    ),
                };
            });
        },

        // Process a fill
        processFill: (orderId: string, fill: OrderFill) => {
            set((state) => {
                const newOrders = new Map(state.orders);
                const order = newOrders.get(orderId);
                if (!order) return state;

                const newFilledQty = order.filledQty + fill.quantity;
                const newRemainingQty = order.quantity - newFilledQty;
                const isFullyFilled = newRemainingQty <= 0;

                // Calculate average fill price
                const totalValue = order.fills.reduce((sum, f) => sum + f.price * f.quantity, 0) + fill.price * fill.quantity;
                const avgFillPrice = totalValue / newFilledQty;

                const updatedOrder: Order = {
                    ...order,
                    filledQty: newFilledQty,
                    remainingQty: Math.max(0, newRemainingQty),
                    avgFillPrice,
                    status: isFullyFilled ? "FILLED" : "PARTIAL",
                    fills: [...order.fills, fill],
                    updatedAt: Date.now(),
                };

                newOrders.set(orderId, updatedOrder);

                const execution: Execution = {
                    executionId: fill.fillId,
                    orderId,
                    symbol: order.symbol,
                    side: order.side,
                    price: fill.price,
                    quantity: fill.quantity,
                    timestamp: fill.timestamp,
                    venue: fill.venue,
                    commission: fill.quantity * fill.price * 0.0001, // 1 bps commission
                };

                const workingOrders = Array.from(newOrders.values()).filter(
                    (o) => o.status === "OPEN" || o.status === "PARTIAL"
                );

                const orderHistory = isFullyFilled
                    ? [...state.orderHistory, updatedOrder]
                    : state.orderHistory;

                return {
                    orders: newOrders,
                    executions: [...state.executions, execution],
                    workingOrders,
                    orderHistory,
                };
            });
        },

        // Process rejection
        processReject: (orderId: string, reason: string) => {
            set((state) => {
                const newOrders = new Map(state.orders);
                const order = newOrders.get(orderId);
                if (order) {
                    newOrders.set(orderId, {
                        ...order,
                        status: "REJECTED",
                        errorMessage: reason,
                        updatedAt: Date.now(),
                    });
                }
                return {
                    orders: newOrders,
                    workingOrders: state.workingOrders.filter((o) => o.orderId !== orderId),
                };
            });
        },

        // Process cancellation
        processCancel: (orderId: string) => {
            set((state) => {
                const newOrders = new Map(state.orders);
                const order = newOrders.get(orderId);
                if (order && (order.status === "OPEN" || order.status === "PARTIAL" || order.status === "PENDING")) {
                    const cancelledOrder: Order = {
                        ...order,
                        status: "CANCELLED",
                        updatedAt: Date.now(),
                    };
                    newOrders.set(orderId, cancelledOrder);
                    return {
                        orders: newOrders,
                        workingOrders: state.workingOrders.filter((o) => o.orderId !== orderId),
                        orderHistory: [...state.orderHistory, cancelledOrder],
                    };
                }
                return state;
            });
        },

        // Getters
        getOrder: (orderId: string) => get().orders.get(orderId),

        getOrdersBySymbol: (symbol: string) =>
            Array.from(get().orders.values()).filter((o) => o.symbol === symbol),

        getWorkingOrders: () => get().workingOrders,
    }))
);

// ============================================
// Selectors
// ============================================

export const selectWorkingOrders = (state: OMSState) => state.workingOrders;
export const selectExecutions = (state: OMSState) => state.executions;
export const selectOrderHistory = (state: OMSState) => state.orderHistory;

export const selectOrdersByStatus = (status: OrderStatus) => (state: OMSState) =>
    Array.from(state.orders.values()).filter((o) => o.status === status);

export const selectTotalFilledToday = (state: OMSState) =>
    state.executions
        .filter((e) => e.timestamp > Date.now() - 24 * 60 * 60 * 1000)
        .reduce((sum, e) => sum + e.price * e.quantity, 0);

export const selectTotalCommissions = (state: OMSState) =>
    state.executions.reduce((sum, e) => sum + e.commission, 0);
