"use client";
import { useEffect, useRef } from "react";
import { CameraControls } from "@react-three/drei";
import { VIEWS, dayPoint, intro } from "@/lib/world";

export default function CameraRig({ view, focusDay, started }) {
  const ref = useRef(), introDone = useRef(false);
  // posição inicial: alto no céu
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.setLookAt(-140, 260, 200, 0, 0, 0, false);
  }, []);
  useEffect(() => {
    const c = ref.current; if (!c || !started) return;
    if (focusDay) {
      const p = dayPoint(focusDay);
      c.smoothTime = .9;
      c.setLookAt(p.x - 6, p.y + 13, p.z + 14, p.x, p.y, p.z, true);
    } else {
      const v = VIEWS[view];
      c.smoothTime = view === 0 && !introDone.current ? 2.2 : 1.1;
      introDone.current = true;
      c.setLookAt(...v.pos, ...v.target, !intro.instant);
    }
  }, [view, focusDay, started]);
  return (
    <CameraControls
      ref={ref} makeDefault minDistance={10} maxDistance={190}
      minPolarAngle={.2} maxPolarAngle={1.35} dollySpeed={.6} draggingSmoothTime={.18}
    />
  );
}
