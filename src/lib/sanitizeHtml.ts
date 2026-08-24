import sanitizeHtml from "sanitize-html";

/** Blog içeriği için izin verilen HTML - zengin metin editöründen gelen içeriği hem yazarken hem
    okurken bu allowlist'ten geçirerek XSS riskini engelleriz. */
export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "img",
      "video",
      "source",
      "span",
      "blockquote",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      video: ["src", "controls", "width", "height"],
      source: ["src", "type"],
      span: ["style"],
      p: ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        "font-size": [/^\d+(px|em|rem)$/],
      },
    },
    allowedSchemes: ["http", "https", "data"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}
