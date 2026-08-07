import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Convert Number to Words (Indian Number System)
const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + 'Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += a[n];
        }
        return str.trim();
    };

    let word = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const wholeNumber = Math.floor(num);

    if (crore > 0) word += inWords(crore) + ' Crore ';
    if (lakh > 0) word += inWords(lakh) + ' Lakh ';
    if (thousand > 0) word += inWords(thousand) + ' Thousand ';
    if (wholeNumber > 0) word += inWords(wholeNumber);

    return word.trim() + ' Only';
};

const safeNum = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
};

export const generateInvoice = async (order, returnBlob = false) => {
    // 1. Initialize Document
    const doc = new jsPDF('p', 'pt', 'a4'); // Portrait, Points, A4

    // Helper formatting
    const formatPrice = (val) => safeNum(val).toFixed(2);

    // Document styling constants
    const startX = 40;
    let currentY = 40;

    // --- HEADER SECTION ---

    // Karikku Logo setup
    const logoUrl = '/Images/Karikku-footer-logo.svg';
    await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = logoUrl;
        img.onload = () => {
            const originalWidth = img.width || 300;
            const originalHeight = img.height || 100;
            const maxW = 140;
            const maxH = 50;
            const ratio = Math.min(maxW / originalWidth, maxH / originalHeight);
            const renderW = originalWidth * ratio;
            const renderH = originalHeight * ratio;

            const canvas = document.createElement('canvas');
            const scale = 4;
            canvas.width = renderW * scale;
            canvas.height = renderH * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, renderW, renderH);

            doc.addImage(canvas.toDataURL('image/png'), 'PNG', startX, currentY, renderW, renderH);
            resolve(true);
        };
        img.onerror = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text('KARIKKU', startX, currentY + 30);
            resolve(false);
        };
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Tax Invoice/Bill of Supply', 550, currentY + 25, { align: 'right' });

    currentY += 80;

    // --- SELLER AND BILLING/SHIPPING SECTION ---
    const leftColX = startX;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Sold By:', leftColX, currentY);

    currentY += 15;
    doc.text('KARIKKU VENTURES PRIVATE LIMITED', leftColX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('01/152-25, ROYAL TRADE CENTER, BYE PASS', leftColX, currentY + 15);
    doc.text('ROAD, PERINTHALMANNA, MALAPPURAM,', leftColX, currentY + 30);
    doc.text('KERALA - 679322', leftColX, currentY + 45);

    currentY += 65;
    doc.setFont('helvetica', 'bold');
    doc.text('GST NO : 32AALCK2699D1ZF', leftColX, currentY);
    doc.text('FSSAI : 11325999000021', leftColX, currentY + 15);

    let rightY = currentY - 80;
    const maxAddressWidth = 210; // pt - ensures it doesn't overlap with Left Column

    const billingAdrs = order.deliveryAddress || {};
    doc.setFont('helvetica', 'bold');
    doc.text('Billing Address :', 550, rightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    const billingName = billingAdrs.fullName || 'N/A';
    const bLines = [
        billingAdrs.addressLine1 || billingAdrs.address || '',
        billingAdrs.addressLine2 || '',
        `${billingAdrs.city || ''}, ${billingAdrs.state || ''}`,
        `INDIA - ${billingAdrs.pincode || billingAdrs.zipcode || ''}`
    ].filter(Boolean);

    rightY += 15;
    doc.text(billingName, 550, rightY, { align: 'right' });

    // Render wrapped address lines for Billing
    bLines.forEach(line => {
        const splitLines = doc.splitTextToSize(line, maxAddressWidth);
        splitLines.forEach(l => {
            rightY += 15;
            doc.text(l, 550, rightY, { align: 'right' });
        });
    });

    rightY += 30;

    doc.setFont('helvetica', 'bold');
    doc.text('Shipping Address :', 550, rightY, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    rightY += 15;
    doc.text(billingName, 550, rightY, { align: 'right' });

    // Render wrapped address lines for Shipping
    bLines.forEach(line => {
        const splitLines = doc.splitTextToSize(line, maxAddressWidth);
        splitLines.forEach(l => {
            rightY += 15;
            doc.text(l, 550, rightY, { align: 'right' });
        });
    });

    currentY = Math.max(currentY + 60, rightY + 40);

    const orderId = order.orderId || order.orderNumber || order.id || 'N/A';
    const oDate = order.createdAt ? new Date(
        order.createdAt._seconds ? order.createdAt._seconds * 1000 : order.createdAt
    ) : new Date();
    const formattedDate = isNaN(oDate) ? 'N/A' : oDate.toLocaleDateString('en-GB');

    const paymentMethod = order.paymentMethod?.type || order.payment?.paymentMethod || 'Prepaid';

    doc.setFont('helvetica', 'bold');
    doc.text(`Order Id : ${orderId}`, leftColX, currentY);
    doc.text(`Order Date : ${formattedDate}`, leftColX, currentY + 15);
    doc.text(`Payment Method : ${paymentMethod.toUpperCase()}`, leftColX, currentY + 30);

    const invoiceNo = order.invoiceNo || order.invoiceNumber || `INV-${orderId.toString().replace(/\D/g, '') || orderId}`;
    const invDate = new Date().toLocaleDateString('en-GB');

    currentY += 55;

    // --- Dynamic Place of Supply logic ---
    const userState = billingAdrs.state || 'Kerala';
    
    // State Code Mapping (Comprehensive list)
    const indianStateCodes = {
        'andaman and nicobar islands': '35',
        'andhra pradesh': '28',
        'arunachal pradesh': '12',
        'assam': '18',
        'bihar': '10',
        'chandigarh': '04',
        'chhattisgarh': '22',
        'dadra and nagar haveli': '26',
        'daman and diu': '26',
        'delhi': '07',
        'goa': '30',
        'gujarat': '24',
        'haryana': '06',
        'himachal pradesh': '02',
        'jammu and kashmir': '01',
        'jharkhand': '20',
        'karnataka': '29',
        'kerala': '32',
        'ladakh': '37',
        'lakshadweep': '31',
        'madhya pradesh': '23',
        'maharashtra': '27',
        'manipur': '14',
        'meghalaya': '17',
        'mizoram': '15',
        'nagaland': '13',
        'odisha': '21',
        'puducherry': '34',
        'punjab': '03',
        'rajasthan': '08',
        'sikkim': '11',
        'tamil nadu': '33',
        'telangana': '36',
        'tripura': '16',
        'uttar pradesh': '09',
        'uttarakhand': '05',
        'west bengal': '19'
    };

    // Helper to sanitize state name for better matching
    const sanitize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const stateInputSanitized = sanitize(userState);
    let stateCode = '32'; // Default to Kerala
    let matchedState = 'Kerala';

    Object.entries(indianStateCodes).forEach(([stateName, code]) => {
        const entrySanitized = sanitize(stateName);
        // Match if input is part of state name or vice versa (e.g. "Tamilnadu" matches "Tamil Nadu")
        if (stateInputSanitized.includes(entrySanitized) || entrySanitized.includes(stateInputSanitized)) {
            stateCode = code;
            matchedState = stateName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }
    });

    doc.text(`Place of supply : ${matchedState}`, leftColX, currentY);
    doc.text(`Place of Delivery : ${userState}`, leftColX, currentY + 15);
    doc.text(`State Code: ${stateCode}`, leftColX, currentY + 30);
    doc.text(`Invoice No : ${invoiceNo}`, 550, currentY + 15, { align: 'right' });
    doc.text(`Invoice Date : ${invDate}`, 550, currentY + 30, { align: 'right' });

    currentY += 50;

    const tableBody = [];
    let slNo = 1;
    const items = order.items || order.products || [];
    const pricing = order.pricing || {};

    // Calculate total transaction-level discount (Coupons + Coins + Manual discounts)
    // Mapping prioritized for Firestore order structure
    const totalTransactionDiscount = 
        safeNum(pricing.discountAmount) || 
        (safeNum(pricing.couponSavings) + safeNum(pricing.coinSavings) + safeNum(order.discountAmount || 0));

    // Calculate total order MRP to distribute transaction discount proportionally (fallback only)
    const totalOrderMrp = items.reduce((sum, it) => 
        sum + safeNum(it.price || it.unitPrice || it.productDetails?.price || 0) * (safeNum(it.quantity) || 1), 0) || 1;

    if (items && items.length > 0) {
        items.forEach(item => {
            const baseName = item.productName || item.name || item.productDetails?.name || 'Product';
            const variantData = item.variant || item.variants || item.options || item.selectedVariants || item.variantCombination || {};
            let variantString = '';

            if (typeof variantData === 'string') {
                variantString = variantData;
            } else if (variantData && typeof variantData === 'object') {
                if (variantData.variantName || variantData.name) {
                    variantString = variantData.variantName || variantData.name;
                } else if (variantData.variants && typeof variantData.variants === 'object') {
                    variantString = Object.entries(variantData.variants).map(([k, v]) => `${k}: ${v}`).join(', ');
                } else {
                    variantString = Object.entries(variantData)
                        .filter(([k]) => !['variantId', 'id', 'sku', 'price', 'quantity', 'image', 'primaryImage'].includes(k))
                        .map(([k, v]) => (typeof v === 'object' ? null : `${k}: ${v}`))
                        .filter(Boolean).join(', ');
                }
            }

            const name = variantString ? `${baseName} (${variantString})` : baseName;
            const qty = safeNum(item.quantity) || 1;
            const itemGstRate = safeNum(item.gstRate || 5);
            
            // Check if we have pre-calculated itemsPricing from order data (MOST ACCURATE)
            const itemSpecificPricing = (pricing.itemsPricing || []).find(p => String(p.productId || p.id) === String(item.productId || item.id));
            
            let unitPriceExGst, taxableValue, cgst, sgst, rowTotalAmount, totalItemDiscount;

            if (itemSpecificPricing) {
                // Use exact values calculated at time of order
                unitPriceExGst = safeNum(itemSpecificPricing.unitSellingPrice || itemSpecificPricing.unitMrp) / (1 + (itemGstRate / 100));
                totalItemDiscount = safeNum(itemSpecificPricing.mrpDiscount) + safeNum(itemSpecificPricing.discount);
                taxableValue = safeNum(itemSpecificPricing.taxableValue);
                cgst = safeNum(itemSpecificPricing.cgst);
                sgst = safeNum(itemSpecificPricing.sgst);
                rowTotalAmount = safeNum(itemSpecificPricing.total);
            } else {
                const mrp = safeNum(item.mrp || item.originalPrice || item.price || item.unitPrice || item.productDetails?.price || 0);
                const sellingPrice = safeNum(item.price || item.unitPrice || item.productDetails?.price || 0);
                
                const itemTotalMrp = mrp * qty;
                const unitMrpExt = mrp / (1 + (itemGstRate / 100));
                unitPriceExGst = sellingPrice / (1 + (itemGstRate / 100));
                
                let itemMrpDiscount = 0;
                if (pricing.mrpDiscount > 0) {
                    itemMrpDiscount = Math.round((itemTotalMrp / totalOrderMrp) * pricing.mrpDiscount * 100) / 100;
                } else {
                    itemMrpDiscount = Math.max(0, Math.round(((unitMrpExt - unitPriceExGst) * qty) * 100) / 100);
                }

                const proportionalTransactionDiscount = Math.round((itemTotalMrp / totalOrderMrp) * totalTransactionDiscount * 100) / 100;
                totalItemDiscount = Math.round((itemMrpDiscount + proportionalTransactionDiscount) * 100) / 100;
                taxableValue = Math.round(Math.max(0, (unitMrpExt * qty) - totalItemDiscount) * 100) / 100;
                
                const gstTotal = Math.round(taxableValue * (itemGstRate / 100) * 100) / 100;
                cgst = Math.round((gstTotal / 2) * 100) / 100;
                sgst = Math.round((gstTotal - cgst) * 100) / 100;
                rowTotalAmount = Math.round((taxableValue + gstTotal) * 100) / 100;
            }

            tableBody.push([
                slNo++,
                name,
                qty,
                formatPrice(unitPriceExGst),
                formatPrice(totalItemDiscount),
                formatPrice(taxableValue),
                `${itemGstRate}%`,
                formatPrice(cgst),
                formatPrice(sgst),
                formatPrice(rowTotalAmount)
            ]);
        });
    }

    const deliveryCharge = safeNum(pricing.deliveryCharge !== undefined ? pricing.deliveryCharge : pricing.delivery);
    const codCharge = safeNum(pricing.codCharge !== undefined ? pricing.codCharge : pricing.codCharge);

    if (deliveryCharge > 0) {
        tableBody.push(['', 'Delivery Charge', '', '', '', '', '', '', '', formatPrice(deliveryCharge)]);
    }
    if (codCharge > 0) {
        tableBody.push(['', 'COD Charge', '', '', '', '', '', '', '', formatPrice(codCharge)]);
    }
    

    const grandTotal = safeNum(pricing.total || order.payment?.amount || 0);
    tableBody.push([
        { content: 'TOTAL', colSpan: 9, styles: { halign: 'right', fontStyle: 'bold', fillColor: [249, 249, 249] } },
        { content: Math.round(grandTotal || 0).toLocaleString(), styles: { halign: 'right', fontStyle: 'bold', fillColor: [249, 249, 249] } }
    ]);

    const amountInWordsStr = numberToWords(grandTotal);
    tableBody.push([
        { content: `Amount In Words : ${amountInWordsStr}`, colSpan: 10, styles: { halign: 'center', fontStyle: 'italic', fillColor: [240, 240, 240] } }
    ]);

    autoTable(doc, {
        startY: currentY,
        head: [['SL NO', 'Product Name', 'Qty', 'Unit Price', 'Discount', 'Taxable Value', 'Tax Rate', 'CGST', 'SGST', 'Total Amount']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 9, halign: 'center', valign: 'middle' },
        columnStyles: { 
            1: { halign: 'left', cellWidth: 100 },
            9: { halign: 'right' } 
        },
        margin: { left: startX, right: 45 },
    });

    currentY = (doc.lastAutoTable?.finalY || currentY + 100) + 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    if (currentY + 50 > pageHeight) {
        doc.addPage();
        currentY = 40;
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated invoice. No signature required.', startX, currentY);

    if (returnBlob) {
        return doc.output('blob');
    } else {
        doc.save(`${invoiceNo}.pdf`);
    }
};
