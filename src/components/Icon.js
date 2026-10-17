import React from "react";

export default function Icon({ name, size = 18, className = "" }) {
  // Built-in SVG paths for key Scratch icons to ensure 100% reliable rendering
  const renderInlineIcon = () => {
    switch (name) {
      case "flag":
        return (
          <path d="M3 2v18h2v-7h11l1-3-1-3H5V2H3zm4 2h8.5l-.67 2 .67 2H5V4h2z" fill="currentColor" />
        );
      case "play":
        return <path d="M8 5v14l11-7z" fill="currentColor" />;
      case "stop":
        return <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />;
      case "redo":
        return (
          <path
            d="M18.4 10.6C16.9 6.7 13.1 4 8.7 4.2 4.1 4.4.4 8.2.1 12.8c-.3 5.1 3.7 9.2 8.8 9.2 3.6 0 6.7-2.1 8.1-5.2.3-.7-.2-1.5-.9-1.5-.4 0-.7.2-.9.5-1.1 2.4-3.5 4.1-6.3 4.1-3.9 0-7-3.1-7-7 0-3.8 3-6.9 6.8-7 3.5-.1 6.5 2.1 7.6 5.2H14c-.6 0-1 .4-1 1s.4 1 1 1h5.5c.6 0 1-.4 1-1v-5.5c0-.6-.4-1-1-1s-1 .4-1 1v1.8z"
            fill="currentColor"
          />
        );
      case "undo":
        return (
          <path
            d="M5.6 10.6C7.1 6.7 10.9 4 15.3 4.2c4.6.2 8.3 4 8.6 8.6.3 5.1-3.7 9.2-8.8 9.2-3.6 0-6.7-2.1-8.1-5.2-.3-.7.2-1.5.9-1.5.4 0 .7.2.9.5 1.1 2.4 3.5 4.1 6.3 4.1 3.9 0 7-3.1 7-7 0-3.8-3-6.9-6.8-7-3.5-.1-6.5 2.1-7.6 5.2H10c.6 0 1 .4 1 1s-.4 1-1 1H4.5c-.6 0-1-.4-1-1v-5.5c0-.6.4-1 1-1s1 .4 1 1v1.8z"
            fill="currentColor"
          />
        );
      case "trash":
        return (
          <path
            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
            fill="currentColor"
          />
        );
      case "plus":
        return <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />;
      case "bolt":
        return <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3v0h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15-5.9 10.34z" fill="currentColor" />;
      case "comment":
        return <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />;
      case "sync":
        return (
          <path
            d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
            fill="currentColor"
          />
        );
      default:
        return null;
    }
  };

  const inline = renderInlineIcon();
  if (inline) {
    return (
      <svg
        className={`inline-block align-middle ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
      >
        {inline}
      </svg>
    );
  }

  return (
    <svg
      className={`fill-current inline-block align-middle ${className}`}
      width={size.toString() + "px"}
      height={size.toString() + "px"}
    >
      <use xlinkHref={`/icons/solid.svg#${name}`} />
    </svg>
  );
}
