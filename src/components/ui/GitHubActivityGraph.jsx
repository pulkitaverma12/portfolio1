import React, { useEffect, useMemo, useState } from 'react';

const GitHubActivityGraph = ({ githubUsername, githubProfileUrl }) => {
  const primaryGraphUrl = useMemo(
    () => `https://ghchart.rshah.org/EF4444/${githubUsername}`,
    [githubUsername]
  );
  const fallbackGraphUrl = useMemo(
    () => `https://ghchart.rshah.org/DC2626/${githubUsername}`,
    [githubUsername]
  );

  const [graphSrc, setGraphSrc] = useState(primaryGraphUrl);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [usedFallbackUrl, setUsedFallbackUrl] = useState(false);
  const [showSvgFallback, setShowSvgFallback] = useState(false);

  useEffect(() => {
    setGraphSrc(primaryGraphUrl);
    setHasLoaded(false);
    setUsedFallbackUrl(false);
    setShowSvgFallback(false);
  }, [primaryGraphUrl]);

  const handleImageLoad = () => {
    setHasLoaded(true);
  };

  const handleImageError = () => {
    if (!usedFallbackUrl) {
      setGraphSrc(fallbackGraphUrl);
      setHasLoaded(false);
      setUsedFallbackUrl(true);
      return;
    }

    setShowSvgFallback(true);
  };

  return (
    <section className="activity-shell hover-target" aria-label="GitHub activity graph">
      <div className="activity-header-row">
        <h3>Activity Graph</h3>
        <a href={githubProfileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open GitHub profile">
         Github
        </a>
      </div>

      <div className="activity-board" aria-label="GitHub profile activity graph">
        <div className="activity-heatmap-frame" role="img" aria-label={`GitHub contribution graph for ${githubUsername}`}>
          <div className="activity-graph-scroll">
            {!showSvgFallback && (
              <img
                src={graphSrc}
                alt={`GitHub contribution graph for ${githubUsername}`}
                className={`activity-heatmap-image ${hasLoaded ? 'is-ready' : ''}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}

            {showSvgFallback && (
              <svg
                className="activity-heatmap-fallback"
                viewBox="0 0 800 180"
                aria-label="Activity graph fallback"
                role="img"
              >
                <defs>
                  <linearGradient id="fallbackGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(33, 38, 45, 0.95)" />
                    <stop offset="55%" stopColor="rgba(63, 63, 63, 0.9)" />
                    <stop offset="100%" stopColor="rgba(120, 120, 120, 0.9)" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="800" height="180" fill="url(#fallbackGradient)" rx="14" ry="14" />
                <text x="32" y="92" fill="rgba(229, 229, 229, 0.96)" fontSize="24" fontFamily="monospace">
                  Live graph unavailable. Open GitHub to view latest activity.
                </text>
              </svg>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHubActivityGraph;
