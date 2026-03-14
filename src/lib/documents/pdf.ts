type DocumentPdfModel = {
  title: string;
  subtitle: string;
  lines: string[];
};

function toPdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function wrapLine(value: string, maxLength = 90) {
  if (value.length <= maxLength) {
    return [value];
  }

  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildPdfDocument(body: string) {
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${body.length} >>\nstream\n${body}\nendstream\nendobj\n`,
  ];

  let output = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(output.length);
    output += object;
  }

  const xrefOffset = output.length;
  output += `xref\n0 ${objects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    output += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(output);
}

export function buildShipmentDocumentPdf(model: DocumentPdfModel) {
  const contentLines = [
    "BT",
    "/F1 20 Tf",
    "50 760 Td",
    `(${toPdfText(model.title)}) Tj`,
    "0 -26 Td",
    "/F1 11 Tf",
    "15 TL",
    `(${toPdfText(model.subtitle)}) Tj`,
    "T*",
    "() Tj",
    "T*",
  ];

  for (const line of model.lines.flatMap((item) => wrapLine(item))) {
    contentLines.push(`(${toPdfText(line)}) Tj`);
    contentLines.push("T*");
  }

  contentLines.push("ET");

  return buildPdfDocument(contentLines.join("\n"));
}
