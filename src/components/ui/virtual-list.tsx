import React, { useEffect, useRef, useState, useMemo, ReactNode } from "react";
import "@/styles/virtual-list.css";

// Helper component for virtual list items

interface VirtualListItemProps {
  height: number;
  children: ReactNode;
  role?: string;
  style?: React.CSSProperties;
}

const VirtualListItem: React.FC<VirtualListItemProps> = ({
  height,
  children,
  role = "listitem",
  style = {},
}) => {
  return (
    <li
      className="virtual-list-item"
      role={role}
      tabIndex={-1}
      style={{
        height: `${height}px`,
        ...style,
      }}
    >
      {children}
    </li>
  );
};

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = "",
  onScroll,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const getItemHeight = (index: number): number => {
    return typeof itemHeight === "function" ? itemHeight(index) : itemHeight;
  };

  const { totalHeight, startIndex, endIndex, offsetY } = useMemo(() => {
    let totalHeight = 0;
    const itemHeights: number[] = [];

    // Calculate total height and individual item heights
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      itemHeights.push(height);
      totalHeight += height;
    }

    // Find visible range
    let startIndex = 0;
    let endIndex = 0;
    let offsetY = 0;
    let currentHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      if (currentHeight + itemHeights[i] > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentHeight += itemHeights[i];
    }

    // Calculate offset for start index
    offsetY = 0;
    for (let i = 0; i < startIndex; i++) {
      offsetY += itemHeights[i];
    }

    // Find end index
    currentHeight = offsetY;
    for (let i = startIndex; i < items.length; i++) {
      if (
        currentHeight >
        scrollTop + height + overscan * (itemHeights[i] || 50)
      ) {
        endIndex = i;
        break;
      }
      currentHeight += itemHeights[i];
      endIndex = i;
    }

    endIndex = Math.min(items.length - 1, endIndex + overscan);

    return { totalHeight, startIndex, endIndex, offsetY };
  }, [items, scrollTop, height, itemHeight, overscan]);

  // We're now using inline styles directly in the JSX

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const newScrollTop = containerRef.current.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(newScrollTop);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const avgItemHeight = typeof itemHeight === "function" ? 50 : itemHeight; // Use average height for keyboard navigation

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          container.scrollTop += avgItemHeight;
          break;
        case "ArrowUp":
          event.preventDefault();
          container.scrollTop -= avgItemHeight;
          break;
        case "PageDown":
          event.preventDefault();
          container.scrollTop += height;
          break;
        case "PageUp":
          event.preventDefault();
          container.scrollTop -= height;
          break;
        case "Home":
          event.preventDefault();
          container.scrollTop = 0;
          break;
        case "End":
          event.preventDefault();
          container.scrollTop = container.scrollHeight;
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      container.addEventListener("keydown", handleKeyDown);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        container.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [onScroll, height]);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height: `${height}px` }}
      tabIndex={0}
    >
      <div
        ref={contentRef}
        className="virtual-list-content"
        style={{ height: `${totalHeight}px` }}
      >
        <ul
          style={{
            position: "relative",
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
          role="list"
          aria-label={`Lista virtual com ${items.length} itens`}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const itemTop =
              offsetY +
              visibleItems
                .slice(0, index)
                .reduce((acc, _, i) => acc + getItemHeight(startIndex + i), 0);

            return (
              <VirtualListItem
                key={actualIndex}
                height={getItemHeight(actualIndex)}
                role="listitem"
                style={{ top: `${itemTop}px` }}
              >
                {renderItem(item, actualIndex)}
              </VirtualListItem>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic heights
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  estimatedItemHeight: number = 50,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(
    new Map()
  );

  const setItemHeight = (index: number, height: number) => {
    setItemHeights((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  };

  const getItemHeight = (index: number): number => {
    return itemHeights.get(index) || estimatedItemHeight;
  };

  const { visibleRange, totalHeight, offsetY } = useMemo(() => {
    let totalHeight = 0;
    let startIndex = 0;
    let endIndex = 0;
    let offsetY = 0;
    let currentY = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentY + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentY += height;
    }

    // Calculate offset
    offsetY = 0;
    for (let i = 0; i < startIndex; i++) {
      offsetY += getItemHeight(i);
    }

    // Find end index
    currentY = offsetY;
    for (let i = startIndex; i < items.length; i++) {
      const height = getItemHeight(i);
      if (
        currentY >
        scrollTop + containerHeight + overscan * estimatedItemHeight
      ) {
        endIndex = i;
        break;
      }
      currentY += height;
      endIndex = i;
    }

    endIndex = Math.min(items.length - 1, endIndex + overscan);

    // Calculate total height
    for (let i = 0; i < items.length; i++) {
      totalHeight += getItemHeight(i);
    }

    return {
      visibleRange: { startIndex, endIndex },
      totalHeight,
      offsetY,
    };
  }, [
    items,
    scrollTop,
    containerHeight,
    itemHeights,
    overscan,
    estimatedItemHeight,
  ]);

  return {
    visibleRange,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
    setItemHeight,
    getItemHeight,
  };
}
