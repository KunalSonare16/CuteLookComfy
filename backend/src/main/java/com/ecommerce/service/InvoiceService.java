package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.SettingsRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final OrderRepository orderRepository;
    private final SettingsService settingsService;

    @Transactional(readOnly = true)
    public byte[] generateInvoice(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);

            String storeName = settingsService.getValue("store_name", "MyStore");
            String storeAddress = settingsService.getValue("store_address", "");
            String gstin = settingsService.getValue("gstin", "");
            DeviceRgb primaryColor = new DeviceRgb(232, 36, 42);

            Paragraph title = new Paragraph(storeName)
                .setFontSize(22).setBold().setFontColor(primaryColor);
            doc.add(title);
            doc.add(new Paragraph(storeAddress).setFontSize(9));
            doc.add(new Paragraph("GSTIN: " + gstin).setFontSize(9));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("TAX INVOICE").setFontSize(16).setBold().setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Invoice #: INV-" + order.getId().toString().substring(0, 8).toUpperCase())
                .setFontSize(10));
            doc.add(new Paragraph("Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")))
                .setFontSize(10));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("Bill To:").setBold().setFontSize(11));
            if (order.getShippingAddress() != null) {
                doc.add(new Paragraph(order.getShippingAddress().getOrDefault("name", "").toString()).setFontSize(10));
                doc.add(new Paragraph(order.getShippingAddress().getOrDefault("line1", "").toString() + ", " +
                    order.getShippingAddress().getOrDefault("city", "").toString() + " - " +
                    order.getShippingAddress().getOrDefault("pincode", "").toString()).setFontSize(10));
            }
            doc.add(new Paragraph("\n"));

            float[] colWidths = {250f, 80f, 80f, 100f};
            Table table = new Table(colWidths);
            table.setWidth(UnitValue.createPercentValue(100));

            addHeaderCell(table, "Item", primaryColor);
            addHeaderCell(table, "Qty", primaryColor);
            addHeaderCell(table, "Unit Price", primaryColor);
            addHeaderCell(table, "Total", primaryColor);

            for (OrderItem item : order.getItems()) {
                table.addCell(new Cell().add(new Paragraph(item.getProductName()).setFontSize(10)));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQty())).setFontSize(10)));
                table.addCell(new Cell().add(new Paragraph("₹" + item.getUnitPrice()).setFontSize(10)));
                table.addCell(new Cell().add(new Paragraph("₹" + item.getTotalPrice()).setFontSize(10)));
            }
            doc.add(table);
            doc.add(new Paragraph("\n"));

            Table totals = new Table(new float[]{350f, 130f});
            totals.setWidth(UnitValue.createPercentValue(100));
            totals.addCell(new Cell().add(new Paragraph("Subtotal").setFontSize(10)).setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER));
            totals.addCell(new Cell().add(new Paragraph("₹" + order.getSubtotal()).setFontSize(10)));
            if (order.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {
                totals.addCell(new Cell().add(new Paragraph("Discount").setFontSize(10)).setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER));
                totals.addCell(new Cell().add(new Paragraph("-₹" + order.getDiscountAmount()).setFontSize(10)));
            }
            totals.addCell(new Cell().add(new Paragraph("Shipping").setFontSize(10)).setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER));
            totals.addCell(new Cell().add(new Paragraph("₹" + order.getShippingCharge()).setFontSize(10)));
            totals.addCell(new Cell().add(new Paragraph("TOTAL").setFontSize(12).setBold()).setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER));
            totals.addCell(new Cell().add(new Paragraph("₹" + order.getTotalAmount()).setFontSize(12).setBold()));
            doc.add(totals);

            doc.add(new Paragraph("\n\nThank you for your purchase!").setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    private void addHeaderCell(Table table, String text, DeviceRgb bgColor) {
        table.addHeaderCell(new Cell()
            .add(new Paragraph(text).setFontSize(10).setBold().setFontColor(ColorConstants.WHITE))
            .setBackgroundColor(bgColor));
    }
}
