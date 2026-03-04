type SectionHeadingProps = {
  label: string;
  title: string;
  description?: string;
};

export function SectionHeading({ label, title, description }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-sm text-muted md:text-base">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
