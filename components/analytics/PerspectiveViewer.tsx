"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLPerspectiveViewerElement } from "@finos/perspective-viewer";

interface PerspectiveViewerProps {
    data: Record<string, unknown>[];
    columns?: string[];
    groupBy?: string[];
    splitBy?: string[];
    aggregates?: Record<string, string>;
    sort?: [string, "asc" | "desc"][];
    className?: string;
    theme?: "Pro Dark" | "Pro Light";
}

export function PerspectiveViewer({
    data,
    columns,
    groupBy,
    splitBy,
    aggregates,
    sort,
    className = "",
    theme = "Pro Dark",
}: PerspectiveViewerProps) {
    const viewerRef = useRef<HTMLPerspectiveViewerElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Dynamic import for Perspective (WASM module)
    useEffect(() => {
        const loadPerspective = async () => {
            try {
                // Import Perspective modules dynamically (they load WASM)
                const perspective = await import("@finos/perspective");
                await import("@finos/perspective-viewer");
                await import("@finos/perspective-viewer-datagrid");
                await import("@finos/perspective-viewer-d3fc");

                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load Perspective:", error);
            }
        };

        loadPerspective();
    }, []);

    // Load data into viewer
    useEffect(() => {
        const loadData = async () => {
            if (!isLoaded || !viewerRef.current || data.length === 0) return;

            try {
                const perspective = await import("@finos/perspective");
                const worker = await perspective.default.worker();
                const table = await worker.table(data);

                await viewerRef.current.load(table);

                // Apply configuration
                const config: Record<string, unknown> = {};
                if (columns) config.columns = columns;
                if (groupBy) config.group_by = groupBy;
                if (splitBy) config.split_by = splitBy;
                if (aggregates) config.aggregates = aggregates;
                if (sort) config.sort = sort;

                if (Object.keys(config).length > 0) {
                    await viewerRef.current.restore(config);
                }
            } catch (error) {
                console.error("Failed to load data into Perspective:", error);
            }
        };

        loadData();
    }, [isLoaded, data, columns, groupBy, splitBy, aggregates, sort]);

    // Apply theme
    useEffect(() => {
        if (viewerRef.current && isLoaded) {
            viewerRef.current.setAttribute("theme", theme);
        }
    }, [theme, isLoaded]);

    if (!isLoaded) {
        return (
            <div className={`flex items-center justify-center bg-black/50 rounded-xl ${className}`}>
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    <span>Loading analytics engine...</span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={(el) => {
                if (el && !el.querySelector("perspective-viewer")) {
                    const viewer = document.createElement("perspective-viewer") as HTMLPerspectiveViewerElement;
                    viewer.style.height = "100%";
                    viewer.style.width = "100%";
                    el.appendChild(viewer);
                    viewerRef.current = viewer;
                }
            }}
            className={`perspective-viewer-container ${className}`}
            style={{ height: "100%", width: "100%" }}
        />
    );
}
