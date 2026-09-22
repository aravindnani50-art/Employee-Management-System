import React from 'react';

export function Skeleton({ width = '100%', height = '1rem', borderRadius = 'var(--radius-sm)', className = '', style = {} }) {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="table-skeleton-container" aria-label="Loading table content" role="status">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="table-skeleton-row">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              height="1.25rem"
              width={cIdx === 0 ? '40px' : cIdx === 1 ? '140px' : '90px'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="card-skeleton-grid" role="status" aria-label="Loading cards">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card-skeleton-item">
          <Skeleton width="48px" height="48px" borderRadius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width="60%" height="1.1rem" />
            <Skeleton width="40%" height="0.9rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
