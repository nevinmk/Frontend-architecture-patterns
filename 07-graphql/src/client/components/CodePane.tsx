type CodePaneProps = {
  title?: string;
  code: string;
  /** Caps the height and scrolls — for responses, which can get long. */
  scroll?: boolean;
};

export function CodePane({ title, code, scroll = false }: CodePaneProps) {
  return (
    <>
      {title && <h3>{title}</h3>}
      <pre style={scroll ? { maxHeight: "24rem", overflow: "auto" } : undefined}>{code}</pre>
    </>
  );
}
