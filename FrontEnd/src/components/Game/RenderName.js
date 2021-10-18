export function renderName(name, isMobile) {
  return (
    <p>
      {isMobile ? "📱" : null} {name}
    </p>
  );
}
