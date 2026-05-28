"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function FlightMap(props: any) {
  const Map = useMemo(
    () =>
      dynamic(() => import("./Map"), {
        loading: () => (
          <div className="flex h-full w-full items-center justify-center bg-[#0b0e14] text-slate-400">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="animate-pulse text-sm font-medium uppercase tracking-widest">Initializing Radar...</p>
            </div>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  return <Map {...props} />;
}
