import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function usePreviousLocation() {
  const router = useRouter();
  const [previousLocation, setPreviousLocation] = useState<string>("/");

  useEffect(() => {
    return router.subscribe("onResolved", ({ fromLocation }) => {
      setPreviousLocation(fromLocation?.href || "/");
    });
  }, []);
  return previousLocation;
}
