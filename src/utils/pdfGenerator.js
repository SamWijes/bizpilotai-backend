'use strict';
const PDFDocument = require('pdfkit');

/**
 * Generate a professional invoice PDF and pipe it to an Express response stream.
 *
 * @param {import('express').Response} res - Express response object
 * @param {object} data - Invoice data
 * @param {object} data.business - Business info
 * @param {object} data.customer - Customer info (nullable)
 * @param {object} data.invoice  - Invoice record
 * @param {object} data.sale     - Sale record
 * @param {Array}  data.items    - Sale items
 */
const generateInvoicePDF = (res, { business, customer, invoice, sale, items }) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers so browser opens/downloads PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `inline; filename="${invoice.invoiceNumber}.pdf"`
    );

    doc.pipe(res);

    const colors = { primary: '#1E3A5F', accent: '#2E86AB', light: '#F5F7FA', text: '#333333' };

    // ── Header ────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill(colors.primary);

    doc.fillColor('white')
        .fontSize(26).font('Helvetica-Bold')
        .text(business.name || 'Business Name', 50, 30);

    if (business.address) {
        doc.fontSize(9).font('Helvetica').text(business.address, 50, 62);
    }
    if (business.phone) doc.text(`Phone: ${business.phone}`, 50, 75);
    if (business.email) doc.text(`Email: ${business.email}`, 50, 88);

    doc.fillColor(colors.accent).fontSize(20).font('Helvetica-Bold')
        .text('INVOICE', 400, 40, { align: 'right' });

    doc.fillColor('white').fontSize(10).font('Helvetica')
        .text(`No: ${invoice.invoiceNumber}`, 400, 68, { align: 'right' })
        .text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, 400, 82, { align: 'right' });

    if (invoice.dueDate) {
        doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 96, { align: 'right' });
    }

    // ── Bill To ────────────────────────────────────────────
    doc.moveDown(4);
    doc.fillColor(colors.primary).fontSize(11).font('Helvetica-Bold').text('BILL TO:');
    doc.fillColor(colors.text).fontSize(10).font('Helvetica');

    if (customer) {
        doc.text(customer.name);
        if (customer.email) doc.text(customer.email);
        if (customer.phone) doc.text(customer.phone);
        if (customer.address) doc.text(customer.address);
    } else {
        doc.text('Walk-in Customer');
    }

    // ── Items Table ────────────────────────────────────────
    const tableTop = doc.y + 20;
    const col = { item: 50, qty: 270, price: 340, disc: 410, total: 490 };

    // Table header
    doc.rect(50, tableTop, doc.page.width - 100, 22).fill(colors.primary);
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
        .text('Item', col.item + 5, tableTop + 6)
        .text('Qty', col.qty, tableTop + 6)
        .text('Unit Price', col.price, tableTop + 6)
        .text('Discount', col.disc, tableTop + 6)
        .text('Total', col.total, tableTop + 6);

    let rowY = tableTop + 26;
    items.forEach((item, i) => {
        const bg = i % 2 === 0 ? colors.light : 'white';
        doc.rect(50, rowY, doc.page.width - 100, 20).fill(bg);

        doc.fillColor(colors.text).fontSize(9).font('Helvetica')
            .text(item.productName || item.product?.name || 'Product', col.item + 5, rowY + 5, { width: 210 })
            .text(String(item.quantity), col.qty, rowY + 5)
            .text(`${business.currency || '$'}${parseFloat(item.unitPrice).toFixed(2)}`, col.price, rowY + 5)
            .text(`${business.currency || '$'}${parseFloat(item.discount || 0).toFixed(2)}`, col.disc, rowY + 5)
            .text(`${business.currency || '$'}${parseFloat(item.total).toFixed(2)}`, col.total, rowY + 5);

        rowY += 20;
    });

    // ── Totals ────────────────────────────────────────────
    rowY += 10;
    const cur = business.currency || '$';

    const addTotalRow = (label, value, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10)
            .fillColor(bold ? colors.primary : colors.text)
            .text(label, 360, rowY)
            .text(`${cur}${parseFloat(value).toFixed(2)}`, 490, rowY, { width: 60, align: 'right' });
        rowY += 18;
    };

    addTotalRow('Subtotal:', sale.subtotal);
    if (parseFloat(sale.discountAmount) > 0) {
        addTotalRow('Discount:', `-${sale.discountAmount}`);
    }
    if (parseFloat(sale.taxRate) > 0) {
        addTotalRow(`Tax (${sale.taxRate}%):`, sale.taxAmount);
    }
    doc.moveTo(360, rowY).lineTo(555, rowY).strokeColor(colors.accent).lineWidth(1).stroke();
    rowY += 5;
    addTotalRow('TOTAL:', sale.total, true);

    // ── Status badge ────────────────────────────────────────
    rowY += 20;
    doc.rect(50, rowY, 100, 24).fill(
        invoice.status === 'PAID' ? '#27AE60' : invoice.status === 'OVERDUE' ? '#E74C3C' : colors.accent
    );
    doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
        .text(invoice.status, 55, rowY + 6, { width: 90, align: 'center' });

    // ── Payment Method ────────────────────────────────────
    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
        .text(`Payment Method: ${sale.paymentMethod}`, 50, rowY + 35);

    // ── Notes ────────────────────────────────────────────
    if (invoice.notes || sale.notes) {
        doc.moveDown(2);
        doc.fontSize(9).fillColor(colors.primary).font('Helvetica-Bold').text('Notes:');
        doc.fillColor(colors.text).font('Helvetica').text(invoice.notes || sale.notes);
    }

    // ── Footer ────────────────────────────────────────────
    doc.fontSize(8).fillColor('#999')
        .text('Thank you for your business!', 50, doc.page.height - 50, {
            align: 'center',
            width: doc.page.width - 100,
        });

    doc.end();
};

module.exports = { generateInvoicePDF };
