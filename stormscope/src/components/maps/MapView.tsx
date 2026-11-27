"use client";

import { useRef, useEffect, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { ODISHA_CENTER, ODISHA_ZOOM } from "@/lib/constants";
import { createStormScopeMapStyle } from "@/maps/cartoStyle";

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  /** Optional bounding box [minLng, minLat, maxLng, maxLat] to fit smoothly */
  fitBounds?: [number, number, number, number] | null;
  className?: string;
  /** Optional base regional land and Odisha state GeoJSON for cartographic context */
  bayOfBengalLand?: GeoJSON.FeatureCollection;
  odishaGeo?: GeoJSON.FeatureCollection;
  /** Called once when the map style is loaded */
  onLoad?: (map: maplibregl.Map) => void;
  /** If true, disable scroll zoom (useful for embedded maps) */
  scrollZoom?: boolean;
  /** Show cursor latitude/longitude telemetry in bottom-right */
  showCoordinates?: boolean;
  /** Optional overlays rendered inside the map container */
  children?: React.ReactNode;
}

export default function MapView({
  center = ODISHA_CENTER,
  zoom = ODISHA_ZOOM,
  fitBounds = null,
  className,
  bayOfBengalLand,
  odishaGeo,
  onLoad,
  scrollZoom = true,
  showCoordinates = true,
  children,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onLoadRef = useRef(onLoad);
  const [loaded, setLoaded] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: createStormScopeMapStyle(bayOfBengalLand, odishaGeo),
      center,
      zoom,
      attributionControl: false,
      maxZoom: 12,
      minZoom: 4,
    });

    if (!scrollZoom) {
      map.scrollZoom.disable();
    }

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 96, unit: "metric" }),
      "bottom-right"
    );

    map.on("mousemove", (e) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(3)),
        lng: Number(e.lngLat.lng.toFixed(3)),
      });
    });
    map.on("mouseout", () => {
      setCursorCoords(null);
    });

    map.on("load", () => {
      setLoaded(true);
      onLoadRef.current?.(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit bounds when provided, otherwise fly to center/zoom
  const boundsKey = fitBounds ? fitBounds.join(",") : "";
  const centerLng = center[0];
  const centerLat = center[1];
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    if (fitBounds) {
      map.fitBounds(
        [
          [fitBounds[0], fitBounds[1]],
          [fitBounds[2], fitBounds[3]],
        ],
        { padding: 56, duration: 450, maxZoom: 9.2 }
      );
      return;
    }

    map.flyTo({
      center: [centerLng, centerLat],
      zoom,
      duration: 450,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, centerLng, centerLat, zoom, loaded]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-border-subtle bg-deep-ocean",
        className
      )}
    >
      <div ref={containerRef} className="h-full w-full" />
      {children}
      {showCoordinates && cursorCoords && (
        <div className="pointer-events-none absolute bottom-10 right-3 z-10 rounded-[8px] glass-panel px-2.5 py-1 text-[11px] font-mono text-mist-gray">
          {cursorCoords.lat.toFixed(3)}°N, {cursorCoords.lng.toFixed(3)}°E
        </div>
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-ocean-surface">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-2 border-horizon-blue/30 border-t-horizon-blue rounded-full animate-spin" />
            <p className="text-sm text-mist-gray">
              Initializing cartographic view…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
