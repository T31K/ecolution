export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1536px] px-5 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}
