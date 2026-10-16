import React from "react";
import { Link } from "react-router-dom";

const INLINE_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderInline(text, keyPrefix) {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  let match;
  let i = 0;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const label = link ? link[1] : token;
      const href = link ? link[2] : "#";
      parts.push(
        /^https?:\/\//i.test(href) ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {label}
          </a>
        ) : (
          <Link key={key} to={href} className="text-primary underline underline-offset-2 hover:opacity-80">
            {label}
          </Link>
        )
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function splitRow(line) {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function isSeparatorRow(line) {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function renderTable(rows, key) {
  const header = splitRow(rows[0]);
  const body = rows.slice(1).filter((r) => !isSeparatorRow(r)).map(splitRow);
  return (
    <div key={key} className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {header.map((cell, i) => (
              <th
                key={i}
                className="border-b border-border px-4 py-3 text-right font-heading font-semibold text-foreground"
              >
                {renderInline(cell, `${key}-th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="odd:bg-card even:bg-muted/20">
              {header.map((_, c) => (
                <td key={c} className="border-b border-border px-4 py-3 align-top text-muted-foreground">
                  {renderInline(row[c] ?? "", `${key}-td-${r}-${c}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderParagraph(lines, key) {
  return (
    <p key={key}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {renderInline(line, `${key}-l${i}`)}
        </React.Fragment>
      ))}
    </p>
  );
}

export default function MarkdownContent({ content }) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Table
    if (trimmed.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i].trim());
        i++;
      }
      blocks.push(renderTable(rows, `t-${key++}`));
      continue;
    }

    // Heading (the page owns the single H1, so level 1 and 2 both render as H2)
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const k = `h-${key++}`;
      blocks.push(
        level >= 3 ? (
          <h3 key={k} className="pt-4 text-lg font-heading font-semibold text-foreground">
            {renderInline(heading[2], k)}
          </h3>
        ) : (
          <h2 key={k} className="pt-6 text-xl sm:text-2xl font-heading font-bold text-foreground">
            {renderInline(heading[2], k)}
          </h2>
        )
      );
      i++;
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      const k = `ol-${key++}`;
      blocks.push(
        <ol key={k} className="list-decimal space-y-2 pr-6">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${k}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      const k = `ul-${key++}`;
      blocks.push(
        <ul key={k} className="list-disc space-y-2 pr-6">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `${k}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Paragraph
    const paragraph = [];
    while (i < lines.length) {
      const line = lines[i].trim();
      if (
        !line ||
        line.startsWith("|") ||
        /^#{1,6}\s+/.test(line) ||
        /^\d+\.\s+/.test(line) ||
        /^[-*]\s+/.test(line)
      ) {
        break;
      }
      paragraph.push(line);
      i++;
    }
    blocks.push(renderParagraph(paragraph, `p-${key++}`));
  }

  return (
    <div className="space-y-5 text-base font-body leading-[1.8] text-muted-foreground">{blocks}</div>
  );
}