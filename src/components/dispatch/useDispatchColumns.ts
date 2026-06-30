// src/features/dispatch/useDispatchColumns.ts
import { useMemo } from "react";
import type { Route, Trip } from "./types";
import { getRouteColumn } from "./utils";

interface DispatchColumnsResult {
  fromHueRoutes: Route[];
  toHueRoutes: Route[];
  fromHueTrips: Trip[];
  toHueTrips: Trip[];
}

export function useDispatchColumns(
  routes: Route[],
  trips: Trip[],
): DispatchColumnsResult {
  return useMemo(() => {
    const fromHueRoutes = routes.filter((r) =>
      getRouteColumn(r) === "from-hue"
    );
    const toHueRoutes = routes.filter((r) => getRouteColumn(r) === "to-hue");

    const fromHueTrips = trips.filter((t) =>
      getRouteColumn(t.routes) === "from-hue"
    );
    const toHueTrips = trips.filter((t) =>
      getRouteColumn(t.routes) === "to-hue"
    );

    return { fromHueRoutes, toHueRoutes, fromHueTrips, toHueTrips };
  }, [routes, trips]);
}
