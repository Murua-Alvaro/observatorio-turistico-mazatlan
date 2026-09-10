type Props = {
  kicker: string;
  title: string;
  description: string;
};

export function SectionHeader({ kicker, title, description }: Props) {
  return (
    <div className="section-heading">
      <span>{kicker}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
