import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Package,
    AlertTriangle,
    BarChart3,
    Users,
    Eye,
    Download,
    Filter,
    RefreshCw,
    X,
} from "lucide-react";

export default function Reports() {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [timeframe, setTimeframe] = useState("daily");
    const [chartType, setChartType] = useState("line");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: "all",
        status: "all",
        minRevenue: "",
        maxRevenue: "",
    });

    const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
    const GRADIENT_COLORS = [
        { start: "#3B82F6", end: "#1E40AF" },
        { start: "#8B5CF6", end: "#6D28D9" },
        { start: "#EC4899", end: "#BE185D" },
        { start: "#F59E0B", end: "#D97706" },
        { start: "#10B981", end: "#059669" },
    ];

    // Mock data for demonstration
    const mockData = {
        total_revenue: "45,280.00",
        current_month_revenue: "12,450.00",
        revenue_growth: "12.5",
        total_orders: 234,
        total_products: 156,
        low_stock_count: 8,
        daily_sales: [
            { date: "Oct 1", total: 1200 },
            { date: "Oct 2", total: 1400 },
            { date: "Oct 3", total: 980 },
            { date: "Oct 4", total: 1600 },
            { date: "Oct 5", total: 1850 },
            { date: "Oct 6", total: 2100 },
            { date: "Oct 7", total: 1750 },
        ],
        monthly_revenue: [
            { month: "Jan", total: 3200 },
            { month: "Feb", total: 3800 },
            { month: "Mar", total: 4200 },
            { month: "Apr", total: 3900 },
            { month: "May", total: 4500 },
            { month: "Jun", total: 4800 },
        ],
        orders_by_status: [
            { status: "completed", count: 145 },
            { status: "pending", count: 42 },
            { status: "processing", count: 35 },
            { status: "cancelled", count: 12 },
        ],
        top_products: [
            { product_id: 1, product_name: "Wireless Headphones", sku: "WH-001", quantity_sold: 245, revenue: "12,250" },
            { product_id: 2, product_name: "Smart Watch Pro", sku: "SW-102", quantity_sold: 189, revenue: "9,450" },
            { product_id: 3, product_name: "USB-C Hub", sku: "UH-203", quantity_sold: 167, revenue: "5,010" },
            { product_id: 4, product_name: "Bluetooth Speaker", sku: "BS-304", quantity_sold: 143, revenue: "7,150" },
            { product_id: 5, product_name: "Laptop Stand", sku: "LS-405", quantity_sold: 128, revenue: "3,840" },
        ],
        recent_orders: [
            { id: 1234, customer: "John Doe", status: "completed", total: "234.50", items_count: 3, date: "Oct 24, 2025" },
            { id: 1235, customer: "Jane Smith", status: "processing", total: "456.00", items_count: 5, date: "Oct 24, 2025" },
            { id: 1236, customer: "Bob Johnson", status: "pending", total: "189.99", items_count: 2, date: "Oct 23, 2025" },
            { id: 1237, customer: "Alice Brown", status: "completed", total: "678.25", items_count: 4, date: "Oct 23, 2025" },
        ],
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setReportData(mockData);
            setLoading(false);
        }, 800);
    };

    const handleExport = (format) => {
        if (!reportData) return;

        if (format === 'csv') {
            exportToCSV();
        } else if (format === 'pdf') {
            exportToPDF();
        } else if (format === 'json') {
            exportToJSON();
        }
    };

    const exportToCSV = () => {
        let csv = "Reports Export - " + new Date().toLocaleDateString() + "\n\n";

        // Summary Stats
        csv += "Summary Statistics\n";
        csv += "Metric,Value\n";
        csv += `Total Revenue,$${reportData.total_revenue}\n`;
        csv += `Current Month Revenue,$${reportData.current_month_revenue}\n`;
        csv += `Revenue Growth,${reportData.revenue_growth}%\n`;
        csv += `Total Orders,${reportData.total_orders}\n`;
        csv += `Total Products,${reportData.total_products}\n`;
        csv += `Low Stock Items,${reportData.low_stock_count}\n\n`;

        // Top Products
        csv += "Top Selling Products\n";
        csv += "Rank,Product Name,SKU,Quantity Sold,Revenue\n";
        reportData.top_products.forEach((product, index) => {
            csv += `${index + 1},${product.product_name},${product.sku},${product.quantity_sold},$${product.revenue}\n`;
        });
        csv += "\n";

        // Recent Orders
        csv += "Recent Orders\n";
        csv += "Order ID,Customer,Status,Total,Items,Date\n";
        reportData.recent_orders.forEach((order) => {
            csv += `${order.id},${order.customer},${order.status},$${order.total},${order.items_count},${order.date}\n`;
        });

        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        // Create a simple text-based PDF content
        let content = `
BUSINESS ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY STATISTICS

Total Revenue: $${reportData.total_revenue}
Current Month Revenue: $${reportData.current_month_revenue}
Revenue Growth: ${reportData.revenue_growth}%
Total Orders: ${reportData.total_orders}
Total Products: ${reportData.total_products}
Low Stock Items: ${reportData.low_stock_count}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP SELLING PRODUCTS

${reportData.top_products.map((p, i) =>
            `${i + 1}. ${p.product_name} (${p.sku})
   Quantity Sold: ${p.quantity_sold} | Revenue: $${p.revenue}`
        ).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT ORDERS

${reportData.recent_orders.map(o =>
            `Order #${o.id} - ${o.customer}
   Status: ${o.status} | Total: $${o.total}
   Items: ${o.items_count} | Date: ${o.date}`
        ).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;

        const blob = new Blob([content], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
        const exportData = {
            generated: new Date().toISOString(),
            summary: {
                total_revenue: reportData.total_revenue,
                current_month_revenue: reportData.current_month_revenue,
                revenue_growth: reportData.revenue_growth,
                total_orders: reportData.total_orders,
                total_products: reportData.total_products,
                low_stock_count: reportData.low_stock_count,
            },
            top_products: reportData.top_products,
            recent_orders: reportData.recent_orders,
            daily_sales: reportData.daily_sales,
            monthly_revenue: reportData.monthly_revenue,
            orders_by_status: reportData.orders_by_status,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const applyFilters = () => {
        console.log("Applying filters:", filters);
        // In a real app, you would call the API with these filters
        setShowFilterModal(false);
        fetchReports(); // Re-fetch with filters
    };

    const resetFilters = () => {
        setFilters({
            dateRange: "all",
            status: "all",
            minRevenue: "",
            maxRevenue: "",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
                        <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-semibold mt-6 text-lg">Loading Analytics...</p>
                    <p className="text-gray-400 text-sm mt-2">Gathering your business insights</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold text-lg">Failed to load reports</p>
                    <button
                        onClick={fetchReports}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const revenueGrowth = parseFloat(reportData.revenue_growth);
    const isPositiveGrowth = revenueGrowth >= 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: ${entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <BarChart3 className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        Analytics Dashboard
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Real-time insights into your business performance
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchReports}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
                            >
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium">
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-xl text-sm font-medium text-gray-700"
                                    >
                                        Export as CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700"
                                    >
                                        Export as PDF (Text)
                                    </button>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-xl text-sm font-medium text-gray-700"
                                    >
                                        Export as JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Modal */}
                {showFilterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Filter Reports</h2>
                                <button
                                    onClick={() => setShowFilterModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Range
                                    </label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="quarter">Last Quarter</option>
                                        <option value="year">Last Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Min Revenue
                                        </label>
                                        <input
                                            type="number"
                                            value={filters.minRevenue}
                                            onChange={(e) => setFilters({ ...filters, minRevenue: e.target.value })}
                                            placeholder="$0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Revenue
                                        </label>
                                        <input
                                            type="number"
                                            value={filters.maxRevenue}
                                            onChange={(e) => setFilters({ ...filters, maxRevenue: e.target.value })}
                                            placeholder="$10,000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={resetFilters}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue Card */}
                    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <span
                                    className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${isPositiveGrowth
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {isPositiveGrowth ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {Math.abs(revenueGrowth)}%
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                ${reportData.total_revenue}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">This month: ${reportData.current_month_revenue}</span>
                                <Eye className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div className="px-3 py-1 bg-green-50 rounded-full">
                                    <span className="text-xs font-semibold text-green-600">Active</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                {reportData.total_orders}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">All time orders</span>
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Products Card */}
                    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="px-3 py-1 bg-purple-50 rounded-full">
                                    <span className="text-xs font-semibold text-purple-600">In Stock</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Total Products</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                {reportData.total_products}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">In inventory</span>
                                <Package className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert Card */}
                    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="px-3 py-1 bg-orange-50 rounded-full animate-pulse">
                                    <span className="text-xs font-semibold text-orange-600">Alert</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-1 font-medium">Low Stock Items</p>
                            <p className="text-3xl font-bold text-gray-900 mb-2">
                                {reportData.low_stock_count}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Below 10 units</span>
                                <AlertTriangle className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Daily Sales Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Sales Overview
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartType("line")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartType === "line"
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    Line
                                </button>
                                <button
                                    onClick={() => setChartType("area")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${chartType === "area"
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    Area
                                </button>
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="daily">Last 30 Days</option>
                                    <option value="weekly">Last 7 Weeks</option>
                                    <option value="monthly">Last 12 Months</option>
                                </select>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            {chartType === "line" ? (
                                <LineChart data={reportData.daily_sales}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 7 }}
                                        name="Sales ($)"
                                    />
                                </LineChart>
                            ) : (
                                <AreaChart data={reportData.daily_sales}>
                                    <defs>
                                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                    <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorArea)"
                                        name="Sales ($)"
                                    />
                                </AreaChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Order Status
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={reportData.orders_by_status || []}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.status}: ${entry.count}`}
                                >
                                    {(reportData.orders_by_status || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {(reportData.orders_by_status || []).map((status, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-gray-700 capitalize">{status.status}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{status.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Monthly Revenue Trend
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>Last 12 Months Performance</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportData.monthly_revenue}>
                            <defs>
                                {GRADIENT_COLORS.map((color, index) => (
                                    <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color.start} />
                                        <stop offset="100%" stopColor={color.end} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="total"
                                fill="url(#barGradient0)"
                                radius={[10, 10, 0, 0]}
                                name="Revenue ($)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Bottom Section - Top Products and Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Selling Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Top Selling Products
                            </h2>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                                Top 5
                            </span>
                        </div>
                        <div className="space-y-3">
                            {reportData.top_products.map((product, index) => (
                                <div
                                    key={product.product_id}
                                    className="group relative p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
                                                style={{
                                                    background: `linear-gradient(135deg, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}, ${GRADIENT_COLORS[index % GRADIENT_COLORS.length].end})`
                                                }}
                                            >
                                                #{index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {product.product_name}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">
                                                {product.quantity_sold}
                                            </p>
                                            <p className="text-xs text-gray-500">units sold</p>
                                            <p className="text-sm text-green-600 font-semibold mt-1">
                                                ${product.revenue}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                Recent Orders
                            </h2>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                                View All →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {reportData.recent_orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-bold text-gray-900">
                                                    Order #{order.id}
                                                </p>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-semibold ${order.status === "completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : order.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : order.status === "processing"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">{order.customer}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {order.items_count} items • {order.date}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">
                                                ${order.total}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}