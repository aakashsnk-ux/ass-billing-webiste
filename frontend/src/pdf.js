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
  doc.setFont("NotoSans", bold ? "bold" : "normal");
  doc.setTextColor(...color);

  const maxWidth = w - padding * 2;

  const lines = doc.splitTextToSize(
    String(text || ""),
    maxWidth
  );

  const lineHeight = fontSize + 2;

  let startY;

  if (valign === "top") {
    startY = y + padding + fontSize;
  } else {
    const textHeight = lines.length * lineHeight;

    startY =
      y +
      (h - textHeight) / 2 +
      fontSize;
  }

  lines.forEach((line, index) => {
    let textX = x + padding;

    if (align === "center") {
      textX = x + w / 2;
    }

    if (align === "right") {
      textX = x + w - padding;
    }

    doc.text(
      line,
      textX,
      startY + index * lineHeight,
      {
        align,
      }
    );
  });
}

function drawHeader(doc, bill) {
  const pageW =
    doc.internal.pageSize.getWidth();

  const margin = 28;

  const contentW =
    pageW - margin * 2;

  let y = 28;

  // ---------------------------------------------------------
  // HEADER BOX
  // ---------------------------------------------------------

  const headerH = 78;

  drawCell(
    doc,
    margin,
    y,
    contentW,
    headerH,
    {
      lineColor: [30, 30, 30],
      lineWidth: 1,
    }
  );

  // ---------------------------------------------------------
  // LOGO - KEEP AT TOP LEFT
  // ---------------------------------------------------------

  drawCell(
    doc,
    margin + 10,
    y + 10,
    58,
    58,
    {
      lineColor: [40, 40, 40],
      lineWidth: 1,
    }
  );

  doc.addImage(
    logo,
    "JPEG",
    margin + 10,
    y + 10,
    58,
    58
  );

  // ---------------------------------------------------------
  // CENTER AREA
  // ---------------------------------------------------------

  const centerLeft =
    margin + 78;

  const centerRight =
    pageW - margin - 8;

  const centerW =
    centerRight - centerLeft;

  const centerX =
    centerLeft + centerW / 2;

  // ---------------------------------------------------------
  // SELLER NAME
  // ---------------------------------------------------------

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.setFontSize(17);

  doc.setTextColor(
    180,
    0,
    0
  );

  doc.text(
    "Aakash S Sonawane",
    centerX,
    y + 25,
    {
      align: "center",
    }
  );

  // ---------------------------------------------------------
  // SERVICE LINE
  // ---------------------------------------------------------

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.setFontSize(9.5);

  doc.setTextColor(
    35,
    35,
    35
  );

  doc.text(
    "Computer, Laptop, CCTV, P2P Services & Repairing",
    centerX,
    y + 42,
    {
      align: "center",
    }
  );

  // ---------------------------------------------------------
  // ADDRESS
  // ---------------------------------------------------------

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.setFontSize(7.5);

  const address =
    "C-502, Millennium Square, Nr Adajan Kharwasa Road, Dindoli, Surat - 394210";

  const addressLines =
    doc.splitTextToSize(
      address,
      centerW
    );

  doc.text(
    addressLines,
    centerX,
    y + 56,
    {
      align: "center",
    }
  );

  // ---------------------------------------------------------
  // MOBILE + EMAIL - ONE LINE
  // ---------------------------------------------------------

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.setFontSize(7.8);

  doc.text(
    "Mob.: 9021554449    |    E-mail: aakashsonawane4449@gmail.com",
    centerX,
    y + 70,
    {
      align: "center",
    }
  );

  // ---------------------------------------------------------
  // IMPORTANT:
  // MOVE EVERYTHING BELOW HEADER DOWN
  // ---------------------------------------------------------

  y += headerH + 10;

  // ---------------------------------------------------------
  // BILL TO / INVOICE DETAILS
  // ---------------------------------------------------------

  const detailsH = 78;

  const leftW =
    contentW * 0.68;

  const rightW =
    contentW - leftW;

  drawCell(
    doc,
    margin,
    y,
    leftW,
    detailsH,
    {
      lineColor: [30, 100, 160],
    }
  );

  drawCell(
    doc,
    margin + leftW,
    y,
    rightW,
    detailsH,
    {
      lineColor: [30, 100, 160],
    }
  );

  // ---------------------------------------------------------
  // BILL TO
  // ---------------------------------------------------------

  doc.setFontSize(10);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.setTextColor(
    30,
    30,
    30
  );

  doc.text(
    "BILL TO",
    margin + 10,
    y + 17
  );

  doc.setFontSize(11);

  doc.text(
    bill.clientName || "",
    margin + 10,
    y + 34
  );

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "normal"
  );

  let clientY =
    y + 49;

  if (bill.clientAddress) {
    const addressLines =
      doc.splitTextToSize(
        bill.clientAddress,
        leftW - 100
      );

    addressLines
      .slice(0, 2)
      .forEach((line) => {
        doc.text(
          line,
          margin + 10,
          clientY
        );

        clientY += 10;
      });
  }

  if (bill.clientPhone) {
    doc.text(
      "Phone: " +
        bill.clientPhone,
      margin + 10,
      Math.min(
        clientY,
        y + detailsH - 8
      )
    );
  }

  // ---------------------------------------------------------
  // DATE / BILL NO
  // ---------------------------------------------------------

  const infoX =
    margin + leftW;

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "DATE",
    infoX + 10,
    y + 18
  );

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.text(
    formatDate(bill.date),
    infoX + 55,
    y + 18
  );

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "BILL NO.",
    infoX + 10,
    y + 38
  );

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.text(
    bill.billNo || "",
    infoX + 55,
    y + 38
  );

  y += detailsH + 10;

  // ---------------------------------------------------------
  // SEPARATE INVOICE BOX
  // ---------------------------------------------------------

  const invoiceBoxH = 34;

  drawCell(
    doc,
    margin,
    y,
    contentW,
    invoiceBoxH,
    {
      lineColor: [30, 100, 160],
      lineWidth: 1,
    }
  );

  doc.setFontSize(15);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.setTextColor(
    200,
    0,
    0
  );

  doc.text(
    "INVOICE",
    pageW / 2,
    y + 23,
    {
      align: "center",
    }
  );

  return (
    y +
    invoiceBoxH +
    10
  );
}

function formatDate(date) {
  if (!date) return "";

  const d =
    new Date(date);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return date;
  }

  const day =
    String(
      d.getDate()
    ).padStart(2, "0");

  const month =
    String(
      d.getMonth() + 1
    ).padStart(2, "0");

  const year =
    d.getFullYear();

  return `${day}-${month}-${year}`;
}

function drawItemsTable(
  doc,
  bill,
  startY
) {
  const pageW =
    doc.internal.pageSize.getWidth();

  const margin = 28;

  const contentW =
    pageW - margin * 2;

  let y = startY;

  // ---------------------------------------------------------
  // COLUMN ORDER:
  // SR. NO | DESCRIPTION | WARRANTY | QTY | RATE | AMOUNT
  // ---------------------------------------------------------

  const srW = 34;

  const warrantyW = 68;

  const qtyW = 42;

  const rateW = 68;

  const amountW = 78;

  const descW =
    contentW -
    srW -
    warrantyW -
    qtyW -
    rateW -
    amountW;

  const xSr =
    margin;

  const xDesc =
    xSr + srW;

  const xWarranty =
    xDesc + descW;

  const xQty =
    xWarranty + warrantyW;

  const xRate =
    xQty + qtyW;

  const xAmount =
    xRate + rateW;

  // ---------------------------------------------------------
  // TABLE HEADER
  // ---------------------------------------------------------

  const headerH = 24;

  const drawTableHeader =
    () => {
      drawCell(
        doc,
        xSr,
        y,
        srW,
        headerH
      );

      drawCell(
        doc,
        xDesc,
        y,
        descW,
        headerH
      );

      drawCell(
        doc,
        xWarranty,
        y,
        warrantyW,
        headerH
      );

      drawCell(
        doc,
        xQty,
        y,
        qtyW,
        headerH
      );

      drawCell(
        doc,
        xRate,
        y,
        rateW,
        headerH
      );

      drawCell(
        doc,
        xAmount,
        y,
        amountW,
        headerH
      );

      drawTextInCell(
        doc,
        "SR. NO",
        xSr,
        y,
        srW,
        headerH,
        {
          fontSize: 7.5,
          bold: true,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        "DESCRIPTION",
        xDesc,
        y,
        descW,
        headerH,
        {
          fontSize: 7.5,
          bold: true,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        "WARRANTY",
        xWarranty,
        y,
        warrantyW,
        headerH,
        {
          fontSize: 7.5,
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
          fontSize: 7.5,
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
          fontSize: 7.5,
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
          fontSize: 7.5,
          bold: true,
          align: "center",
        }
      );

      y += headerH;
    };

  drawTableHeader();

  // ---------------------------------------------------------
  // COMPACT PRODUCT ROWS
  // ---------------------------------------------------------

  const minRowH = 23;

  const availableBottom = 650;

  (
    bill.items || []
  ).forEach(
    (item, index) => {
      const desc =
        item.desc || "";

      const warranty =
        item.warranty || "";

      const descLines =
        doc.splitTextToSize(
          desc,
          descW - 10
        );

      const warrantyLines =
        doc.splitTextToSize(
          warranty,
          warrantyW - 10
        );

      const rowH =
        Math.max(
          minRowH,
          descLines.length *
            9 +
            10,
          warrantyLines.length *
            8 +
            10
        );

      if (
        y + rowH >
        availableBottom
      ) {
        doc.addPage();

        y = 40;

        drawTableHeader();
      }

      drawCell(
        doc,
        xSr,
        y,
        srW,
        rowH
      );

      drawCell(
        doc,
        xDesc,
        y,
        descW,
        rowH
      );

      drawCell(
        doc,
        xWarranty,
        y,
        warrantyW,
        rowH
      );

      drawCell(
        doc,
        xQty,
        y,
        qtyW,
        rowH
      );

      drawCell(
        doc,
        xRate,
        y,
        rateW,
        rowH
      );

      drawCell(
        doc,
        xAmount,
        y,
        amountW,
        rowH
      );

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
          fontSize: 8,
          valign: "top",
          padding: 5,
        }
      );

      drawTextInCell(
        doc,
        warranty,
        xWarranty,
        y,
        warrantyW,
        rowH,
        {
          fontSize: 7.5,
          align: "center",
        }
      );

      drawTextInCell(
        doc,
        String(
          item.qty ?? 0
        ),
        xQty,
        y,
        qtyW,
        rowH,
        {
          fontSize: 8,
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
          fontSize: 8,
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
          fontSize: 8,
          align: "right",
        }
      );

      y += rowH;
    }
  );

  // ---------------------------------------------------------
  // TOTAL
  // ---------------------------------------------------------

  const totalH = 26;

  const totalLabelW =
    srW +
    descW +
    warrantyW +
    qtyW +
    rateW;

  drawCell(
    doc,
    xSr,
    y,
    totalLabelW,
    totalH
  );

  drawCell(
    doc,
    xAmount,
    y,
    amountW,
    totalH
  );

  drawTextInCell(
    doc,
    "TOTAL",
    xSr,
    y,
    totalLabelW,
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
    "₹ " +
      money(bill.total),
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

  return (
    y + totalH
  );
}

function drawSummary(
  doc,
  bill,
  startY
) {
  const pageW =
    doc.internal.pageSize.getWidth();

  const margin = 28;

  const contentW =
    pageW - margin * 2;

  let y =
    startY + 10;

  const leftW =
    contentW * 0.62;

  const rightW =
    contentW - leftW;

  const summaryH = 78;

  drawCell(
    doc,
    margin,
    y,
    leftW,
    summaryH
  );

  drawCell(
    doc,
    margin + leftW,
    y,
    rightW,
    summaryH
  );

  // ---------------------------------------------------------
  // RUPEES IN WORDS
  // ---------------------------------------------------------

  doc.setFontSize(8);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.setTextColor(
    30,
    30,
    30
  );

  doc.text(
    "RUPEES IN WORDS",
    margin + 8,
    y + 16
  );

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "normal"
  );

  const words =
    amountInWords(
      bill.total
    );

  const wordLines =
    doc.splitTextToSize(
      words,
      leftW - 16
    );

  doc.text(
    wordLines,
    margin + 8,
    y + 33
  );

  // ---------------------------------------------------------
  // RIGHT SUMMARY
  // ---------------------------------------------------------

  const rightX =
    margin + leftW;

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.text(
    "Subtotal",
    rightX + 8,
    y + 18
  );

  doc.text(
    "₹ " +
      money(
        bill.subtotal
      ),
    pageW - margin - 8,
    y + 18,
    {
      align: "right",
    }
  );

  if (
    Number(
      bill.taxPercent
    ) > 0
  ) {
    doc.text(
      `Tax (${bill.taxPercent}%)`,
      rightX + 8,
      y + 35
    );

    doc.text(
      "₹ " +
        money(bill.tax),
      pageW - margin - 8,
      y + 35,
      {
        align: "right",
      }
    );
  }

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "TOTAL",
    rightX + 8,
    y + 58
  );

  doc.text(
    "₹ " +
      money(bill.total),
    pageW - margin - 8,
    y + 58,
    {
      align: "right",
    }
  );

  return (
    y + summaryH
  );
}

function drawFooterSections(
  doc,
  bill,
  startY
) {
  const pageW =
    doc.internal.pageSize.getWidth();

  const margin = 28;

  const contentW =
    pageW - margin * 2;

  let y =
    startY + 12;

  // ---------------------------------------------------------
  // BANK DETAILS
  // ---------------------------------------------------------

  const leftW =
    contentW * 0.65;

  const rightW =
    contentW - leftW;

  const bankH = 90;

  drawCell(
    doc,
    margin,
    y,
    leftW,
    bankH
  );

  drawCell(
    doc,
    margin + leftW,
    y,
    rightW,
    bankH
  );

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "BANK DETAILS",
    margin + 8,
    y + 16
  );

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.setFontSize(8);

  const bankRows = [
    [
      "Bank Name",
      "BANK OF INDIA",
    ],
    [
      "Branch Name",
      "GHODDOD ROAD",
    ],
    [
      "IFSC Code",
      "BKID0002743",
    ],
    [
      "UPI ID",
      "aakash.sonawane@boi",
    ],
  ];

  let bankY =
    y + 34;

  bankRows.forEach(
    ([label, value]) => {
      doc.setFont(
        "NotoSans",
        "bold"
      );

      doc.text(
        label + " :",
        margin + 8,
        bankY
      );

      doc.setFont(
        "NotoSans",
        "normal"
      );

      doc.text(
        value,
        margin + 75,
        bankY
      );

      bankY += 15;
    }
  );

  const signX =
    margin + leftW;

  doc.setFontSize(8);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "For- Aakash S Sonawane",
    signX + 8,
    y + 28
  );

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.text(
    "Authorised Signatory",
    signX +
      rightW / 2,
    y + 48,
    {
      align: "center",
    }
  );

  y +=
    bankH + 10;

  // ---------------------------------------------------------
  // EXISTING DYNAMIC NOTES
  // ---------------------------------------------------------

  if (bill.notes) {
    const noteLines =
      doc.splitTextToSize(
        bill.notes,
        contentW - 16
      );

    const notesH =
      Math.max(
        48,
        noteLines.length *
          11 +
          28
      );

    drawCell(
      doc,
      margin,
      y,
      contentW,
      notesH
    );

    doc.setFontSize(9);

    doc.setFont(
      "NotoSans",
      "bold"
    );

    doc.text(
      "NOTES",
      margin + 8,
      y + 16
    );

    doc.setFont(
      "NotoSans",
      "normal"
    );

    doc.setFontSize(8);

    doc.text(
      noteLines,
      margin + 8,
      y + 31
    );

    y +=
      notesH + 10;
  }

  // ---------------------------------------------------------
  // RECEIVER DETAILS + TERMS & CONDITIONS
  // SAME BOX
  // ---------------------------------------------------------

  const combinedH =
    100;

  const receiverW =
    contentW * 0.38;

  const termsW =
    contentW - receiverW;

  // One outer box
  drawCell(
    doc,
    margin,
    y,
    contentW,
    combinedH
  );

  // Vertical divider
  doc.setDrawColor(
    30,
    100,
    160
  );

  doc.setLineWidth(
    0.8
  );

  doc.line(
    margin + receiverW,
    y,
    margin + receiverW,
    y + combinedH
  );

  // ---------------------------------------------------------
  // RECEIVER DETAILS
  // ---------------------------------------------------------

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "RECEIVER DETAILS",
    margin + 8,
    y + 16
  );

  doc.setFontSize(8);

  doc.setFont(
    "NotoSans",
    "normal"
  );

  doc.text(
    "Name: __________________",
    margin + 8,
    y + 38
  );

  doc.text(
    "Sign: ___________________",
    margin + 8,
    y + 59
  );

  // Existing signatory retained
  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "For- Aakash S Sonawane",
    margin + 8,
    y + 81
  );

  // ---------------------------------------------------------
  // TERMS & CONDITIONS
  // ---------------------------------------------------------

  const termsX =
    margin + receiverW;

  doc.setFontSize(9);

  doc.setFont(
    "NotoSans",
    "bold"
  );

  doc.text(
    "TERMS & CONDITIONS",
    termsX + 8,
    y + 16
  );

  const terms = [
    "Burn/Water/Physical damages are Not Covered.",
    "Please back-up your data on your hard disk drive before sending the PC for Repairs.",
    "Our workshop will not be held liable for any loss of data.",
  ];

  doc.setFontSize(7.5);

  doc.setFont(
    "NotoSans",
    "normal"
  );

  let termY =
    y + 32;

  terms.forEach(
    (term, index) => {
      const lines =
        doc.splitTextToSize(
          `${index + 1}. ${term}`,
          termsW - 16
        );

      doc.text(
        lines,
        termsX + 8,
        termY
      );

      termY +=
        lines.length *
          9 +
        4;
    }
  );

  return (
    y + combinedH
  );
}

export async function downloadBillPdf(
  bill
) {
  const doc =
    new jsPDF({
      unit: "pt",
      format: "a4",
    });

  // ---------------------------------------------------------
  // REGULAR FONT
  // ---------------------------------------------------------

  const font =
    await fetch(notoSans)
      .then((res) =>
        res.arrayBuffer()
      );

  const bytes =
    new Uint8Array(font);

  let binary = "";

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    binary += String.fromCharCode(
      bytes[i]
    );
  }

  const base64 =
    btoa(binary);

  doc.addFileToVFS(
    "NotoSans-Regular.ttf",
    base64
  );

  doc.addFont(
    "NotoSans-Regular.ttf",
    "NotoSans",
    "normal"
  );

  doc.setFont(
    "NotoSans",
    "normal"
  );

  // ---------------------------------------------------------
  // BOLD FONT
  // ---------------------------------------------------------

  const boldFont =
    await fetch(notoSansBold)
      .then((res) =>
        res.arrayBuffer()
      );

  const boldBytes =
    new Uint8Array(
      boldFont
    );

  let boldBinary = "";

  for (
    let i = 0;
    i < boldBytes.length;
    i++
  ) {
    boldBinary +=
      String.fromCharCode(
        boldBytes[i]
      );
  }

  const boldBase64 =
    btoa(boldBinary);

  doc.addFileToVFS(
    "NotoSans-Bold.ttf",
    boldBase64
  );

  doc.addFont(
    "NotoSans-Bold.ttf",
    "NotoSans",
    "bold"
  );

  // ---------------------------------------------------------
  // PAGE SIZE
  // ---------------------------------------------------------

  const pageW =
    doc.internal.pageSize.getWidth();

  const pageH =
    doc.internal.pageSize.getHeight();

  // ---------------------------------------------------------
  // PAGE 1
  // ---------------------------------------------------------

  let y =
    drawHeader(
      doc,
      bill
    );

  y =
    drawItemsTable(
      doc,
      bill,
      y
    );

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------

  if (
    y >
    pageH - 270
  ) {
    doc.addPage();

    y = 40;
  }

  y =
    drawSummary(
      doc,
      bill,
      y
    );

  // ---------------------------------------------------------
  // FOOTER
  // ---------------------------------------------------------

  if (
    y >
    pageH - 250
  ) {
    doc.addPage();

    y = 40;
  }

  drawFooterSections(
    doc,
    bill,
    y
  );

  // ---------------------------------------------------------
  // SAVE PDF
  // ---------------------------------------------------------

  doc.save(
    `${bill.billNo || "invoice"}.pdf`
  );
}