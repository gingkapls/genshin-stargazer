interface ProgressIndicatorProps {
  value?: string;
}

function ProgressIndicator({ value }: ProgressIndicatorProps) {
  return (
    <div className="progress-wrapper">
      <label className="progress-label" data-value={value}>
        <progress max="20" value={value} />
      </label>
    </div>
  );
}

export { ProgressIndicator };
