"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CycloneEvent } from "@/types";
import type { CustomOverlayDataset } from "@/lib/pipeline";
import { getCyclones as getBaseCyclones } from "@/data";

interface DataRegistryContextValue {
  cyclones: CycloneEvent[];
  customCyclones: CycloneEvent[];
  customOverlays: CustomOverlayDataset[];
  registerCyclone: (cyclone: CycloneEvent) => void;
  registerOverlay: (overlay: CustomOverlayDataset) => void;
  toggleOverlayVisibility: (id: string) => void;
  removeOverlay: (id: string) => void;
}

const DataRegistryContext = createContext<DataRegistryContextValue | null>(null);

export function DataRegistryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customCyclones, setCustomCyclones] = useState<CycloneEvent[]>([]);
  const [customOverlays, setCustomOverlays] = useState<CustomOverlayDataset[]>(
    []
  );

  const value = useMemo<DataRegistryContextValue>(() => {
    const base = getBaseCyclones();
    const mergedCyclones = [
      ...base,
      ...customCyclones.filter((cc) => !base.some((b) => b.id === cc.id)),
    ];

    return {
      cyclones: mergedCyclones,
      customCyclones,
      customOverlays,
      registerCyclone: (cyclone) => {
        setCustomCyclones((prev) => [
          ...prev.filter((c) => c.id !== cyclone.id),
          cyclone,
        ]);
      },
      registerOverlay: (overlay) => {
        setCustomOverlays((prev) => [
          ...prev.filter((o) => o.id !== overlay.id),
          overlay,
        ]);
      },
      toggleOverlayVisibility: (id) => {
        setCustomOverlays((prev) =>
          prev.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o))
        );
      },
      removeOverlay: (id) => {
        setCustomOverlays((prev) => prev.filter((o) => o.id !== id));
      },
    };
  }, [customCyclones, customOverlays]);

  return (
    <DataRegistryContext.Provider value={value}>
      {children}
    </DataRegistryContext.Provider>
  );
}

export function useDataRegistry(): DataRegistryContextValue {
  const ctx = useContext(DataRegistryContext);
  if (!ctx) {
    return {
      cyclones: getBaseCyclones(),
      customCyclones: [],
      customOverlays: [],
      registerCyclone: () => {},
      registerOverlay: () => {},
      toggleOverlayVisibility: () => {},
      removeOverlay: () => {},
    };
  }
  return ctx;
}
