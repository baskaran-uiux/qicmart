"use client"

import { Download } from "lucide-react"

interface ExportButtonProps {
    currencySymbol: string;
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    newCustomers: number;
    topProducts: Array<{ name: string, units: number, rev: number }>;
    recentOrders: Array<{ id: string, customerName: string, customerEmail: string, total: number, status: string }>;
}

export default function ExportButton({ data }: { data: ExportButtonProps }) {
    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add KPI Summary
        csvContent += "--- KPI Summary ---\n";
        csvContent += `Total Sales,Total Orders,Total Products,New Customers\n`;
        csvContent += `${data.currencySymbol}${data.totalSales},${data.totalOrders},${data.totalProducts},${data.newCustomers}\n\n`;

        // Add Top Products
        csvContent += "--- Top Products ---\n";
        csvContent += "Product Name,Units Sold,Revenue\n";
        data.topProducts.forEach((p) => {
            const safeName = p.name.replace(/"/g, '""');
            csvContent += `"${safeName}",${p.units},${data.currencySymbol}${p.rev}\n`;
        });
        csvContent += "\n";

        // Add Recent Orders
        csvContent += "--- Recent Orders ---\n";
        csvContent += "Order ID,Customer Name,Email,Total,Status\n";
        data.recentOrders.forEach((o) => {
            const safeName = o.customerName.replace(/"/g, '""');
            csvContent += `"${o.id}","${safeName}","${o.customerEmail}",${data.currencySymbol}${o.total},"${o.status}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `store_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-95"
        >
            <Download size={14} className="text-cyan-500" />
            Export CSV
        </button>
    )
}
