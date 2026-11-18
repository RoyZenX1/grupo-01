interface SummaryPanelProps {
  readonly visibleCount: number;
  readonly totalCount: number;
  readonly favoriteCount: number;
}

export function SummaryPanel({ visibleCount, totalCount, favoriteCount }: SummaryPanelProps) {
  return (
    <div className="summary-panel" aria-live="polite">
      <p className="mb-0">
        Mostrando <strong>{visibleCount}</strong> de <strong>{totalCount}</strong>{' '}
        iniciativas <strong>{favoriteCount}</strong>{' '}
        {favoriteCount === 1 ? 'favorita' : 'favoritas'}
      </p>
    </div>
  );
}