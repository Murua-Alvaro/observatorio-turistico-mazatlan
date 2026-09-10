type Props = {
  source: string;
  note: string;
};

export function SourceNote({ source, note }: Props) {
  return (
    <div className="source-note">
      <strong>{source}</strong>
      <span>{note}</span>
    </div>
  );
}
