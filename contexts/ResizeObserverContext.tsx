import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';

type HeightCallback = (index: number, height: number) => void;

interface ObserverEntry {
  callback: HeightCallback;
  index: number;
}

interface ResizeObserverContextType {
  observe: (element: HTMLElement, index: number, callback: HeightCallback) => void;
  unobserve: (element: HTMLElement) => void;
}

const ResizeObserverContext = createContext<ResizeObserverContextType | null>(null);

export const ResizeObserverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const observerRef = useRef<ResizeObserver | null>(null);
  const entriesRef = useRef<Map<HTMLElement, ObserverEntry>>(new Map());

  // Initialize shared ResizeObserver
  useEffect(() => {
    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        const entryData = entriesRef.current.get(element);
        if (entryData) {
          entryData.callback(entryData.index, entry.contentRect.height);
        }
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const observe = useCallback((element: HTMLElement, index: number, callback: HeightCallback) => {
    if (!observerRef.current) return;
    
    entriesRef.current.set(element, { callback, index });
    observerRef.current.observe(element);
  }, []);

  const unobserve = useCallback((element: HTMLElement) => {
    if (!observerRef.current) return;
    
    entriesRef.current.delete(element);
    observerRef.current.unobserve(element);
  }, []);

  return (
    <ResizeObserverContext.Provider value={{ observe, unobserve }}>
      {children}
    </ResizeObserverContext.Provider>
  );
};

export const useSharedResizeObserver = () => {
  const context = useContext(ResizeObserverContext);
  if (!context) {
    throw new Error('useSharedResizeObserver must be used within ResizeObserverProvider');
  }
  return context;
};
