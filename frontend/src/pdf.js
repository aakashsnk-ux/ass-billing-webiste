import { jsPDF } from "jspdf";
import notoSans from "./assets/fonts/NotoSans-Regular.ttf";
import notoSansBold from "./assets/fonts/NotoSans-Bold.ttf";
import logo from "./assets/logo.jpeg";

function money(n) {
  return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
}

function numberToWords(num) {
  num = Math.round(Number(num) || 0);

  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function twoDigits(n) {
    if (n < 20) return ones[n];

    const t = Math.floor(n / 10);
    const r = n % 10;

    return tens[t] + (r ? " " + ones[r] : "");
  }

  function threeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    let result = "";

    if (hundred) {
      result += ones[hundred] + " Hundred";
      if (rest) result += " ";
    }

    if (rest) result += twoDigits(rest);

    return result;
  }

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore) result += threeDigits(crore) + " Crore ";

  if (lakh) result += twoDigits(lakh) + " Lakh ";

  if (thousand) result += twoDigits(thousand) + " Thousand ";

  if (remainder) result += threeDigits(remainder);

  return result.trim();
}

function amountInWords(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return numberToWords(rounded) + " Only";
}

function drawCell(doc, x, y, w, h, options = {}) {
  const {
    fill = false,
    fillColor = [255, 255, 255],
    lineColor = [30, 100, 160],
    lineWidth = 0.8,
  } = options;

  doc.setLineWidth(lineWidth);
  doc.setDrawColor(...lineColor);

  if (fill) {
    doc.setFillColor(...fillColor);
    doc.rect(x, y, w, h, "FD");
  } else {
    doc.rect(x, y, w, h);
  }
}

function drawTextInCell(
  doc,
  text,
  x,
  y,
  w,
  h,
  options = {}
) {
  const {
    fontSize = 9,
    bold = false,
    align = "left",
    color = [30, 30, 30],
    padding = 5,
    valign = "middle",
  } = options;

  doc.setFontSize(fontSize);
  doc.setFont(undefined, bold ? "bold" : "normal");
  doc.setTextColor(...color);

  const maxWidth = w - padding * 2;
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);

  const lineHeight = fontSize + 2;

  let startY;

  if (valign === "top") {
    startY = y + padding + fontSize;
  } else {
    const textHeight = lines.length * lineHeight;
    startY = y + (h - textHeight) / 2 + fontSize;
  }

  lines.forEach((line, index) => {
    let textX = x + padding;

    if (align === "center") {
      textX = x + w / 2;
    }

    if (align === "right") {
      textX = x + w - padding;
    }

    doc.text(line, textX, startY + index * lineHeight, {
      align,
    });
  });
}

function drawHeader(doc, bill) {
  const pageW = doc.internal.pageSize.getWidth();

  const margin = 28;
  const contentW = pageW - margin * 2;

  let y = 28;

  // ---------------------------------------------------------
  // TOP SELLER HEADER
  // ---------------------------------------------------------

  drawCell(doc, margin, y, contentW, 78, {
    lineColor: [30, 30, 30],
    lineWidth: 1,
  });

  // Left logo-style box
  drawCell(doc, margin + 10, y + 10, 58, 58, {
    lineColor: [40, 40, 40],
    lineWidth: 1,
  });

  doc.addImage(
  logo,
  "JPEG",
  margin + 10,
  y + 10,
  58,
  58
);

  doc.setFontSize(17);
doc.setFont("NotoSans", "bold");
doc.setTextColor(180, 0, 0);
doc.text("Aakash S Sonawane", margin + 80, y + 25);

// reset for remaining header text
doc.setFont("NotoSans", "normal");
doc.setTextColor(35, 35, 35);

  doc.setFontSize(10);
  doc.setFont("NotoSans", "normal");

  doc.text(
    "Computer, Laptop, CCTV, P2P Services & Repairing",
    margin + 80,
    y + 42
  );

  doc.text(
    "C-502, Millennium Square, Nr Adajan Kharwasa Road,",
    margin + 80,
    y + 56
  );

  doc.text(
    "Dindoli, Surat - 394210",
    margin + 80,
    y + 69
  );

  // Right contact area
  const rightX = pageW - margin - 190;

  doc.setFontSize(9);
  doc.setFont("NotoSans", "bold");
  doc.text("Mob.", rightX, y + 25);

  doc.setFont("NotoSans", "normal");
  doc.text("9021554449", rightX + 35, y + 25);

  doc.setFont("NotoSans", "bold");
  doc.text("E-mail", rightX, y + 42);

  doc.setFont("NotoSans", "normal");
  doc.text("aakashsonawane4449@gmail.com", rightX + 35, y + 42);

  doc.setFont("NotoSans", "bold");
  doc.text("Services", rightX, y + 58.5);

  doc.setFont("NotoSans", "normal");
  doc.text("Computer / CCTV", rightX + 40, y + 59);

  y += 86;

  // ---------------------------------------------------------
  // BILL TO / INVOICE DETAILS
  // ---------------------------------------------------------

  const detailsH = 92;
  const leftW = contentW * 0.68;
  const rightW = contentW - leftW;

  drawCell(doc, margin, y, leftW, detailsH, {
    lineColor: [30, 100, 160],
  });

  drawCell(doc, margin + leftW, y, rightW, detailsH, {
    lineColor: [30, 100, 160],
  });

  // Bill to heading
  doc.setFontSize(10);
  doc.setFont("NotoSans", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("BILL TO", margin + 10, y + 17);

  doc.setFontSize(11);
  doc.text(
    bill.clientName || "",
    margin + 10,
    y + 34
  );

  doc.setFontSize(9);
  doc.setFont("NotoSans", "normal");

  let clientY = y + 49;

  if (bill.clientAddress) {
    const addressLines = doc.splitTextToSize(
      bill.clientAddress,
      leftW - 100
    );

    addressLines.slice(0, 3).forEach((line) => {
      doc.text(line, margin + 10, clientY);
      clientY += 12;
    });
  }

  if (bill.clientPhone) {
    doc.text(
      "Phone: " + bill.clientPhone,
      margin + 10,
      Math.min(clientY, y + detailsH - 10)
    );
  }

  // Right invoice information

  const infoX = margin + leftW;

  doc.setFontSize(9);
  doc.setFont("NotoSans", "bold");
  doc.text("DATE", infoX + 10, y + 18);

  doc.setFont("NotoSans", "normal");
  doc.text(
    formatDate(bill.date),
    infoX + 55,
    y + 18
  );

  doc.setFont("NotoSans", "bold");
  doc.text("BILL NO.", infoX + 10, y + 38);

  doc.setFont("NotoSans", "normal");
  doc.text(
    bill.billNo || "",
    infoX + 55,
    y + 38
  );

  // Invoice title
  doc.setFontSize(16);
  doc.setFont("NotoSans", "bold");
  doc.setTextColor(200, 0, 0);

  doc.text(
    "INVOICE",
    infoX + rightW / 2,
    y + 67,
    {
      align: "center",
    }
  );

  return y + detailsH + 12;
}

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

function drawItemsTable(doc, bill, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentW = pageW - margin * 2;

  let y = startY;

  // Column widths
  const srW = 34;
  const qtyW = 55;
  const rateW = 82;
  const amountW = 95;

  const descW =
    contentW - srW - qtyW - rateW - amountW;

  const xSr = margin;
  const xDesc = xSr + srW;
  const xQty = xDesc + descW;
  const xRate = xQty + qtyW;
  const xAmount = xRate + rateW;

  // ---------------------------------------------------------
  // TABLE HEADER
  // ---------------------------------------------------------

  const headerH = 30;

  drawCell(doc, xSr, y, srW, headerH);
  drawCell(doc, xDesc, y, descW, headerH);
  drawCell(doc, xQty, y, qtyW, headerH);
  drawCell(doc, xRate, y, rateW, headerH);
  drawCell(doc, xAmount, y, amountW, headerH);

  drawTextInCell(doc, "SR. NO", xSr, y, srW, headerH, {
    fontSize: 8,
    bold: true,
    align: "center",
  });

  drawTextInCell(
    doc,
    "DESCRIPTION",
    xDesc,
    y,
    descW,
    headerH,
    {
      fontSize: 8,
      bold: true,
      align: "center",
    }
  );

  drawTextInCell(doc, "QTY", xQty, y, qtyW, headerH, {
    fontSize: 8,
    bold: true,
    align: "center",
  });

  drawTextInCell(doc, "RATE", xRate, y, rateW, headerH, {
    fontSize: 8,
    bold: true,
    align: "center",
  });

  drawTextInCell(
    doc,
    "AMOUNT",
    xAmount,
    y,
    amountW,
    headerH,
    {
      fontSize: 8,
      bold: true,
      align: "center",
    }
  );

  y += headerH;

  // ---------------------------------------------------------
  // ITEM ROWS
  // ---------------------------------------------------------

  const minRowH = 40;
  const availableBottom = 650;

  bill.items.forEach((item, index) => {
    const desc = item.desc || "";

    const descLines = doc.splitTextToSize(
      desc,
      descW - 12
    );

    const rowH = Math.max(
      minRowH,
      descLines.length * 12 + 18
    );

    // New page if required
    if (y + rowH > availableBottom) {
      doc.addPage();

      y = 40;

      // Repeat table header
      drawCell(doc, xSr, y, srW, headerH);
      drawCell(doc, xDesc, y, descW, headerH);
      drawCell(doc, xQty, y, qtyW, headerH);
      drawCell(doc, xRate, y, rateW, headerH);
      drawCell(doc, xAmount, y, amountW, headerH);

      drawTextInCell(doc, "SR. NO", xSr, y, srW, headerH, {
        fontSize: 8,
        bold: true,
        align: "center",
      });

      drawTextInCell(
        doc,
        "DESCRIPTION",
        xDesc,
        y,
        descW,
        headerH,
        {
          fontSize: 8,
          bold: true,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        "QTY",
        xQty,
        y,
        qtyW,
        headerH,
        {
          fontSize: 8,
          bold: true,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        "RATE",
        xRate,
        y,
        rateW,
        headerH,
        {
          fontSize: 8,
          bold: true,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        "AMOUNT",
        xAmount,
        y,
        amountW,
        headerH,
        {
          fontSize: 8,
          bold: true,
          align: "center",
        }
      );

      y += headerH;
    }

    drawCell(doc, xSr, y, srW, rowH);
    drawCell(doc, xDesc, y, descW, rowH);
    drawCell(doc, xQty, y, qtyW, rowH);
    drawCell(doc, xRate, y, rateW, rowH);
    drawCell(doc, xAmount, y, amountW, rowH);

    drawTextInCell(
      doc,
      String(index + 1),
      xSr,
      y,
      srW,
      rowH,
      {
        fontSize: 8,
        align: "center",
      }
    );

    drawTextInCell(
      doc,
      desc,
      xDesc,
      y,
      descW,
      rowH,
      {
        fontSize: 9,
        valign: "top",
        padding: 6,
      }
    );

    drawTextInCell(
      doc,
      String(item.qty ?? 0),
      xQty,
      y,
      qtyW,
      rowH,
      {
        fontSize: 9,
        align: "center",
      }
    );

    drawTextInCell(
      doc,
      money(item.rate),
      xRate,
      y,
      rateW,
      rowH,
      {
        fontSize: 9,
        align: "right",
      }
    );

    drawTextInCell(
      doc,
      money(item.amount),
      xAmount,
      y,
      amountW,
      rowH,
      {
        fontSize: 9,
        align: "right",
      }
    );

    y += rowH;
  });

  // ---------------------------------------------------------
  // TOTAL ROW
  // ---------------------------------------------------------

  const totalH = 26;

  drawCell(doc, xSr, y, srW + descW + qtyW + rateW, totalH);

  drawCell(doc, xAmount, y, amountW, totalH);

  drawTextInCell(
    doc,
    "TOTAL",
    xSr,
    y,
    srW + descW + qtyW + rateW,
    totalH,
    {
      fontSize: 10,
      bold: true,
      align: "right",
      padding: 8,
    }
  );

  drawTextInCell(
    doc,
    "₹ " + money(bill.total),
    xAmount,
    y,
    amountW,
    totalH,
    {
      fontSize: 10,
      bold: true,
      align: "right",
      padding: 6,
    }
  );

  y += totalH;

  return y;
}

function drawSummary(doc, bill, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentW = pageW - margin * 2;

  let y = startY + 10;

  const leftW = contentW * 0.62;
  const rightW = contentW - leftW;

  const summaryH = 78;

  drawCell(doc, margin, y, leftW, summaryH);
  drawCell(doc, margin + leftW, y, rightW, summaryH);

  // Amount in words
  doc.setFontSize(8);
  doc.setFont("NotoSans", "bold");
  doc.setTextColor(30, 30, 30);

  doc.text(
    "RUPEES IN WORDS",
    margin + 8,
    y + 16
  );

  doc.setFontSize(9);
  doc.setFont("NotoSans", "normal");

  const words = amountInWords(bill.total);

  const wordLines = doc.splitTextToSize(
    words,
    leftW - 16
  );

  doc.text(
    wordLines,
    margin + 8,
    y + 33
  );

  // Right summary
  const rightX = margin + leftW;

  doc.setFontSize(9);

  doc.setFont("NotoSans", "normal");

  doc.text(
    "Subtotal",
    rightX + 8,
    y + 18
  );

  doc.text(
    "₹ " + money(bill.subtotal),
    pageW - margin - 8,
    y + 18,
    {
      align: "right",
    }
  );

  if (Number(bill.taxPercent) > 0) {
    doc.text(
      `Tax (${bill.taxPercent}%)`,
      rightX + 8,
      y + 35
    );

    doc.text(
      "₹ " + money(bill.tax),
      pageW - margin - 8,
      y + 35,
      {
        align: "right",
      }
    );
  }

  doc.setFont("NotoSans", "bold");

  doc.text(
    "TOTAL",
    rightX + 8,
    y + 58
  );

  doc.text(
    "₹ " + money(bill.total),
    pageW - margin - 8,
    y + 58,
    {
      align: "right",
    }
  );

  return y + summaryH;
}

function drawFooterSections(doc, bill, startY) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 28;
  const contentW = pageW - margin * 2;

  let y = startY + 12;

  // ---------------------------------------------------------
  // BANK DETAILS + RECEIVER DETAILS
  // ---------------------------------------------------------

  const leftW = contentW * 0.65;
  const rightW = contentW - leftW;

  const bankH = 108;

  drawCell(doc, margin, y, leftW, bankH);
  drawCell(doc, margin + leftW, y, rightW, bankH);

  doc.setFontSize(9);
  doc.setFont("NotoSans", "bold");

  doc.text(
    "BANK DETAILS",
    margin + 8,
    y + 16
  );

  doc.setFont("NotoSans", "normal");
  doc.setFontSize(8);

  const bankRows = [
    ["Bank Name", "BANK OF INDIA"],
    ["Branch Name", "GHODDOD ROAD"],
    ["IFSC Code", "BKID0002743"],
    ["UPI ID", "aakash.sonawane@boi"],
  ];

  let bankY = y + 34;

  bankRows.forEach(([label, value]) => {
    doc.setFont("NotoSans", "bold");
    doc.text(label + " :", margin + 8, bankY);

    doc.setFont("NotoSans", "normal");

    doc.text(
      value,
      margin + 75,
      bankY
    );

    bankY += 17;
  });

  // Receiver / signatory
  const signX = margin + leftW;

  doc.setFontSize(8);
  doc.setFont("NotoSans", "bold");

  doc.text(
    "RECEIVER DETAILS",
    signX + 8,
    y + 16
  );

  doc.setFont("NotoSans", "normal");

  doc.text(
    "Name: __________________",
    signX + 8,
    y + 43
  );

  doc.text(
    "Sign: ___________________",
    signX + 8,
    y + 64
  );

  doc.setFont("NotoSans", "bold");

  doc.text(
    "For- Aakash S Sonawane",
    signX + 8,
    y + 86
  );

  doc.text(
    "Authorised Signatory",
    signX + rightW / 2,
    y + 99,
    {
      align: "center",
    }
  );

  y += bankH + 10;

  // ---------------------------------------------------------
  // NOTES
  // ---------------------------------------------------------

  if (bill.notes) {
    const noteLines = doc.splitTextToSize(
      bill.notes,
      contentW - 16
    );

    const notesH = Math.max(
      48,
      noteLines.length * 12 + 28
    );

    drawCell(doc, margin, y, contentW, notesH);

    doc.setFontSize(9);
    doc.setFont("NotoSans", "bold");

    doc.text(
      "NOTES",
      margin + 8,
      y + 16
    );

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(8);

    doc.text(
      noteLines,
      margin + 8,
      y + 31
    );

    y += notesH + 10;
  }

  // ---------------------------------------------------------
  // TERMS & CONDITIONS
  // ---------------------------------------------------------

  const terms = [
    "Burn/Water/Physical damages are Not Covered.",
    "Please back-up your data on your hard disk drive before sending the PC for Repairs.",
    "Our workshop will not be held liable for any loss of data.",
  ];

  const termsH = 72;

  drawCell(doc, margin, y, contentW, termsH);

  doc.setFontSize(9);
  doc.setFont("NotoSans", "bold");

  doc.text(
    "TERMS & CONDITIONS",
    margin + 8,
    y + 16
  );

  doc.setFontSize(8);
  doc.setFont("NotoSans", "normal");

  let termY = y + 31;

  terms.forEach((term) => {
    const lines = doc.splitTextToSize(
      "• " + term,
      contentW - 16
    );

    doc.text(
      lines,
      margin + 8,
      termY
    );

    termY += lines.length * 10 + 4;
  });

  return y + termsH;
}

export async function downloadBillPdf(bill) {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const font = await fetch(notoSans)
    .then((res) => res.arrayBuffer());

  const bytes = new Uint8Array(font);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);

  doc.addFileToVFS("NotoSans-Regular.ttf", base64);
  doc.addFont(
  "NotoSans-Regular.ttf",
  "NotoSans",
  "normal"
);

doc.setFont("NotoSans", "normal");


const boldFont = await fetch(notoSansBold)
  .then((res) => res.arrayBuffer());

const boldBytes = new Uint8Array(boldFont);

let boldBinary = "";
for (let i = 0; i < boldBytes.length; i++) {
  boldBinary += String.fromCharCode(boldBytes[i]);
}

const boldBase64 = btoa(boldBinary);

doc.addFileToVFS(
  "NotoSans-Bold.ttf",
  boldBase64
);

doc.addFont(
  "NotoSans-Bold.ttf",
  "NotoSans",
  "bold"
);

  // tumhara existing PDF code...


  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ---------------------------------------------------------
  // PAGE 1
  // ---------------------------------------------------------

  let y = drawHeader(doc, bill);

  y = drawItemsTable(doc, bill, y);

  // If there isn't enough room for summary/footer,
  // move them to a fresh page.
  if (y > pageH - 270) {
    doc.addPage();
    y = 40;
  }

  y = drawSummary(doc, bill, y);

  // Footer sections
  if (y > pageH - 220) {
    doc.addPage();
    y = 40;
  }

  drawFooterSections(doc, bill, y);

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------

  doc.save(`${bill.billNo || "invoice"}.pdf`);
}

