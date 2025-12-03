"use client";

import React, { useEffect } from "react";

export default function PluginComponent() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.Jupiter.init({
        displayMode: "widget",
        integratedTargetId: "jupiter-plugin",
      });
    }
  }, []);

  return (
    <div>
      <h1>Jupiter Plugin Demo</h1>
      <div
        id="jupiter-plugin"
      />
    </div>
  );
}
