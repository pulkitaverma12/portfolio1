'use client';

import { Suspense, lazy } from 'react';
import './interactive-3d-robot.css';

const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  return (
    <div className={`interactive-spline-root ${className ?? ''}`}>
      <Suspense
        fallback={
          <div className="interactive-spline-fallback" role="status" aria-live="polite" aria-label="Loading 3D scene">
            <span className="interactive-spline-spinner" aria-hidden="true" />
            <span className="interactive-spline-loading-text">Loading 3D...</span>
          </div>
        }
      >
        <Spline scene={scene} className="interactive-spline-scene" />
      </Suspense>
    </div>
  );
}
