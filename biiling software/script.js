document.addEventListener('DOMContentLoaded', function() {
    // Initialize invoice date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    // Set due date to 7 days from today
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
    
    // Add item button
    document.getElementById('add-item').addEventListener('click', addNewItemRow);
    
    // Remove item button event delegation
    document.getElementById('items-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const row = e.target.closest('tr');
            row.remove();
            calculateTotals();
        }
    });
    
    // Calculate totals when any input changes
    document.getElementById('items-table').addEventListener('input', function(e) {
        if (e.target.classList.contains('item-qty') || 
            e.target.classList.contains('item-price') || 
            e.target.classList.contains('item-tax')) {
            calculateRowTotal(e.target.closest('tr'));
            calculateTotals();
        }
    });
    
    // Discount calculation
    document.getElementById('discount-value').addEventListener('input', calculateTotals);
    document.getElementById('discount-type').addEventListener('change', calculateTotals);
    
    // New invoice button
    document.getElementById('new-invoice').addEventListener('click', resetInvoice);
    
    // Print invoice button
    document.getElementById('print-invoice').addEventListener('click', function() {
        window.print();
    });
    
    // Save invoice button
    document.getElementById('save-invoice').addEventListener('click', saveInvoice);
    
    // Initialize with one empty row
    addNewItemRow();
});

function addNewItemRow() {
    const tbody = document.querySelector('#items-table tbody');
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td><input type="text" class="item-name" placeholder="Item name"></td>
        <td><input type="text" class="item-desc" placeholder="Description"></td>
        <td><input type="number" class="item-qty" min="1" value="1"></td>
        <td><input type="number" class="item-price" min="0" step="0.01" placeholder="0.00"></td>
        <td>
            <select class="item-tax">
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="18">18%</option>
                <option value="20">20%</option>
            </select>
        </td>
        <td class="item-total">0.00</td>
        <td><button class="remove-item btn-small"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(newRow);
    
    // Focus on the item name field
    newRow.querySelector('.item-name').focus();
}

function calculateRowTotal(row) {
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
    
    const subtotal = qty * price;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    row.querySelector('.item-total').textContent = total.toFixed(2);
}

function calculateTotals() {
    const rows = document.querySelectorAll('#items-table tbody tr');
    let subtotal = 0;
    let taxTotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const rowSubtotal = qty * price;
        const rowTax = rowSubtotal * (taxRate / 100);
        
        subtotal += rowSubtotal;
        taxTotal += rowTax;
    });
    
    // Calculate discount
    const discountValue = parseFloat(document.getElementById('discount-value').value) || 0;
    const discountType = document.getElementById('discount-type').value;
    let discountAmount = 0;
    
    if (discountType === 'percent') {
        discountAmount = subtotal * (discountValue / 100);
    } else {
        discountAmount = discountValue;
    }
    
    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    
    // Calculate grand total
    const grandTotal = subtotal + taxTotal - discountAmount;
    
    // Update UI
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('tax-total').textContent = taxTotal.toFixed(2);
    document.getElementById('discount-amount').textContent = discountAmount.toFixed(2);
    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
}

function resetInvoice() {
    if (confirm('Are you sure you want to create a new invoice? All current data will be lost.')) {
        // Generate new invoice number (simple increment for demo)
        const currentInvNum = document.getElementById('invoice-number').value;
        const invNumParts = currentInvNum.split('-');
        const newNum = parseInt(invNumParts[1]) + 1;
        document.getElementById('invoice-number').value = `INV-${newNum.toString().padStart(4, '0')}`;
        
        // Reset date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
        
        // Reset due date to 7 days from today
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];
        
        // Clear client info
        document.getElementById('client-name').value = '';
        document.getElementById('client-email').value = '';
        document.getElementById('client-phone').value = '';
        document.getElementById('client-address').value = '';
        
        // Clear items table
        const tbody = document.querySelector('#items-table tbody');
        tbody.innerHTML = '';
        
        // Add one empty row
        addNewItemRow();
        
        // Reset totals
        document.getElementById('subtotal').textContent = '0.00';
        document.getElementById('tax-total').textContent = '0.00';
        document.getElementById('discount-amount').textContent = '0.00';
        document.getElementById('grand-total').textContent = '0.00';
        document.getElementById('discount-value').value = '0';
        document.getElementById('discount-type').value = 'percent';
        
        // Reset notes and payment method
        document.getElementById('notes').value = '';
        document.getElementById('payment-method').value = 'cash';
    }
}

function saveInvoice() {
    // In a real application, this would save to a database or generate a PDF
    // For this demo, we'll just show an alert with the invoice data
    
    const invoiceData = {
        invoiceNumber: document.getElementById('invoice-number').value,
        invoiceDate: document.getElementById('invoice-date').value,
        dueDate: document.getElementById('due-date').value,
        client: {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value
        },
        items: [],
        subtotal: parseFloat(document.getElementById('subtotal').textContent),
        tax: parseFloat(document.getElementById('tax-total').textContent),
        discount: parseFloat(document.getElementById('discount-amount').textContent),
        total: parseFloat(document.getElementById('grand-total').textContent),
        paymentMethod: document.getElementById('payment-method').value,
        notes: document.getElementById('notes').value
    };
    
    // Collect items
    const rows = document.querySelectorAll('#items-table tbody tr');
    rows.forEach(row => {
        invoiceData.items.push({
            name: row.querySelector('.item-name').value,
            description: row.querySelector('.item-desc').value,
            quantity: parseFloat(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value),
            taxRate: parseFloat(row.querySelector('.item-tax').value),
            total: parseFloat(row.querySelector('.item-total').textContent)
        });
    });
    
    // Show success message (in a real app, you would send this to a server)
    alert('Invoice saved successfully!\n\nTotal: $' + invoiceData.total.toFixed(2));
    console.log('Invoice data:', invoiceData);
    
    // In a real application, you might:
    // 1. Send data to server via fetch/axios
    // 2. Generate a PDF
    // 3. Save to localStorage/IndexedDB for offline use
    // 4. Add to an invoice list/history
}