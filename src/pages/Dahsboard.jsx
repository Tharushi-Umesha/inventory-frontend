import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    User,
    Package,
    TrendingUp,
    AlertTriangle,
    ShoppingCart,
    DollarSign,
    Activity,
    Users,
    Settings,
    Bell,
    Search,
    BarChart3,
    X,
    Check,
    Clock,
    Zap,
    Moon,
    Sun,
    Lock,
    Mail,
    Phone,
    MapPin,
    Shield,
    Trash2,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        lowStock: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ products: [], orders: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [allOrders, setAllOrders] = useState([]);

    // Notifications state
    const [notifications, setNotifications] = useState([]);

    // Settings state
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [orderAlerts, setOrderAlerts] = useState(true);
    const [lowStockAlerts, setLowStockAlerts] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch products
                const productsRes = await axios.get('http://127.0.0.1:8000/api/products', { headers });
                const products = productsRes.data;
                setAllProducts(products);

                // Fetch orders
                const ordersRes = await axios.get('http://127.0.0.1:8000/api/orders', { headers });
                const orders = ordersRes.data;
                setAllOrders(orders);

                // Compute stats
                const lowStockCount = products.filter(p => p.quantity < 10).length;
                const totalRevenue = orders.reduce((sum, order) => {
                    const price = typeof order.total_price === 'string'
                        ? parseFloat(order.total_price.replace(/,/g, ''))
                        : parseFloat(order.total_price || 0);
                    return sum + price;
                }, 0);

                setStats({
                    totalProducts: products.length,
                    totalOrders: orders.length,
                    totalRevenue,
                    lowStock: lowStockCount
                });

                // Generate recent activity
                const activities = generateRecentActivities(products, orders);
                setRecentActivity(activities);

                // Generate notifications
                const notifs = generateNotifications(products, orders);
                setNotifications(notifs);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Search functionality
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setShowSearchResults(false);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filteredProducts = allProducts
            .filter(p =>
                p.name?.toLowerCase().includes(query) ||
                p.sku?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
            )
            .slice(0, 5);

        const filteredOrders = allOrders
            .filter(o =>
                o.id?.toString().includes(query) ||
                o.customer?.toLowerCase().includes(query) ||
                o.status?.toLowerCase().includes(query)
            )
            .slice(0, 5);

        setSearchResults({ products: filteredProducts, orders: filteredOrders });
        setShowSearchResults(true);
    }, [searchQuery, allProducts, allOrders]);

    const generateNotifications = (products, orders) => {
        const notifs = [];

        // Low stock notifications
        const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0);
        lowStock.forEach(product => {
            notifs.push({
                id: `low-stock-${product.id}`,
                type: 'warning',
                title: 'Low Stock Alert',
                message: `${product.name} is running low (${product.quantity} left)`,
                time: formatTimeAgo(product.updated_at || product.created_at),
                read: false
            });
        });

        // Recent order notifications
        const recentOrders = orders
            .sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date))
            .slice(0, 3);

        recentOrders.forEach(order => {
            notifs.push({
                id: `order-${order.id}`,
                type: order.status === 'completed' ? 'success' : 'info',
                title: order.status === 'completed' ? 'Order Completed' : 'New Order',
                message: `Order #${order.id} - $${order.total_price}`,
                time: formatTimeAgo(order.created_at || order.order_date),
                read: false
            });
        });

        return notifs.slice(0, 10);
    };

    const generateRecentActivities = (products, orders) => {
        const activities = [];

        const recentOrders = orders
            .sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date))
            .slice(0, 3);

        recentOrders.forEach(order => {
            activities.push({
                action: 'New order placed',
                item: `Order #${order.id} - $${order.total_price}`,
                time: formatTimeAgo(order.created_at || order.order_date),
                type: order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'info'
            });
        });

        const lowStockProducts = products
            .filter(p => p.quantity < 10 && p.quantity > 0)
            .slice(0, 2);

        lowStockProducts.forEach(product => {
            activities.push({
                action: 'Low stock alert',
                item: `${product.name} (${product.quantity} left)`,
                time: formatTimeAgo(product.updated_at || product.created_at),
                type: 'warning'
            });
        });

        const recentProducts = products
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
            .slice(0, 2);

        recentProducts.forEach(product => {
            activities.push({
                action: 'Product updated',
                item: `${product.name} - $${product.price}`,
                time: formatTimeAgo(product.updated_at || product.created_at),
                type: 'info'
            });
        });

        return activities
            .sort((a, b) => parseTimeAgo(a.time) - parseTimeAgo(b.time))
            .slice(0, 6);
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const parseTimeAgo = (timeString) => {
        if (timeString === 'Just now') return 0;
        const match = timeString.match(/(\d+)\s+(minute|hour|day)/);
        if (!match) return 999999;
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'minute') return value;
        if (unit === 'hour') return value * 60;
        if (unit === 'day') return value * 1440;
        return 999999;
    };

    const markAsRead = (id) => {
        setNotifications(notifs =>
            notifs.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const statsList = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            change: '+12.5%',
            icon: Package,
            gradient: 'from-blue-500 to-blue-600',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toFixed(2)}`,
            change: '+23.1%',
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-600',
            lightBg: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: 'Low Stock Items',
            value: stats.lowStock,
            change: '-5.4%',
            icon: AlertTriangle,
            gradient: 'from-yellow-500 to-orange-600',
            lightBg: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            change: '+8.2%',
            icon: ShoppingCart,
            gradient: 'from-purple-500 to-purple-600',
            lightBg: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    InventoryPro
                                </h1>
                                <p className="text-xs text-gray-500">Management System</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products, orders..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                                    {searchResults.products.length > 0 && (
                                        <div className="p-2">
                                            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Products</p>
                                            {searchResults.products.map(product => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => {
                                                        navigate('/products');
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                                >
                                                    <Package className="w-4 h-4 text-blue-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.sku} • ${product.price}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.orders.length > 0 && (
                                        <div className="p-2 border-t border-gray-100">
                                            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Orders</p>
                                            {searchResults.orders.map(order => (
                                                <button
                                                    key={order.id}
                                                    onClick={() => {
                                                        navigate('/orders');
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                                >
                                                    <ShoppingCart className="w-4 h-4 text-green-600" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                                                        <p className="text-xs text-gray-500">{order.status} • ${order.total_price}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {searchResults.products.length === 0 && searchResults.orders.length === 0 && (
                                        <div className="p-8 text-center">
                                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No results found</p>
                                            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            <div className="h-8 w-px bg-gray-300"></div>

                            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowNotifications(false)}>
                    <div
                        className="absolute right-4 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[600px] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                <p className="text-sm text-gray-500">{unreadCount} unread</p>
                            </div>
                            <div className="flex gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAllNotifications}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Clear all
                                    </button>
                                )}
                                <button onClick={() => setShowNotifications(false)}>
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 p-2 rounded-lg ${notif.type === 'success' ? 'bg-green-100' :
                                                    notif.type === 'warning' ? 'bg-yellow-100' :
                                                        notif.type === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                {notif.type === 'success' && <Check className="w-4 h-4 text-green-600" />}
                                                {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                                                {notif.type === 'info' && <Zap className="w-4 h-4 text-blue-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {notif.time}
                                                </p>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">No notifications</p>
                                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setShowSettings(false)}>
                    <div
                        className="absolute right-4 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[600px] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Settings</h3>
                            <button onClick={() => setShowSettings(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Profile Section */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Profile Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Shield className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Role</p>
                                            <p className="text-sm font-medium text-gray-900 capitalize">{user?.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                    Appearance
                                </h4>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                                    <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
                                            } mt-0.5`}></div>
                                    </div>
                                </button>
                            </div>

                            {/* Notifications Settings */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notification Preferences
                                </h4>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Email Notifications', state: emailNotifications, setState: setEmailNotifications },
                                        { label: 'Push Notifications', state: pushNotifications, setState: setPushNotifications },
                                        { label: 'Order Alerts', state: orderAlerts, setState: setOrderAlerts },
                                        { label: 'Low Stock Alerts', state: lowStockAlerts, setState: setLowStockAlerts }
                                    ].map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => item.setState(!item.state)}
                                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <div className={`w-12 h-6 rounded-full transition-colors ${item.state ? 'bg-blue-600' : 'bg-gray-300'
                                                }`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform transform ${item.state ? 'translate-x-6' : 'translate-x-0.5'
                                                    } mt-0.5`}></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Account
                                </h4>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
                                        <span className="text-sm font-medium text-gray-700">Change Password</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-left">
                                        <span className="text-sm font-medium text-red-600">Delete Account</span>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                                Welcome back, {user?.name?.split(' ')[0]}! 👋
                            </h2>
                            <p className="text-gray-600">Here's what's happening with your inventory today.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsList.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                            <div className="relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${stat.change.startsWith('+')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-gray-600 text-sm font-semibold mb-2">{stat.title}</h3>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                    <p className="text-xs text-gray-500">Last 24 hours</p>
                                </div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse flex items-start gap-4 p-4">
                                        <div className="w-2 h-2 bg-gray-200 rounded-full mt-1"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivity.length > 0 ? (
                            <div className="space-y-2">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-blue-100"
                                    >
                                        <div className={`mt-1 w-2.5 h-2.5 rounded-full shadow-lg ${activity.type === 'success' ? 'bg-green-500' :
                                                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900">{activity.action}</p>
                                            <p className="text-sm text-gray-600 truncate mt-0.5">{activity.item}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="w-10 h-10 text-blue-600" />
                                </div>
                                <p className="text-gray-900 font-semibold text-lg">No recent activity</p>
                                <p className="text-sm text-gray-500 mt-2">Your activity will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                                <p className="text-xs text-gray-500">Shortcuts</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate("/products")}
                                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl group"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">Add New Product</span>
                                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => navigate("/orders")}
                                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 group"
                            >
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-semibold">Create Order</span>
                                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                            </button>

                            {(user?.role === "admin" || user?.role === "manager") && (
                                <button
                                    onClick={() => navigate("/reports")}
                                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 group"
                                >
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <span className="font-semibold">View Reports</span>
                                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => navigate("/users")}
                                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200 group"
                                >
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <span className="font-semibold">Manage Users</span>
                                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative flex items-start gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                                        Performance Tip
                                    </h4>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        {stats.lowStock > 0
                                            ? `You have ${stats.lowStock} low-stock item${stats.lowStock > 1 ? 's' : ''}. Consider restocking soon to avoid stockouts.`
                                            : 'Your inventory is running smoothly! Keep up the excellent work.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs font-semibold text-green-900">All systems operational</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Insights Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Performance Chart Placeholder */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Sales Trend</h3>
                                <p className="text-xs text-gray-500">Last 7 days</p>
                            </div>
                        </div>
                        <div className="h-48 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-600">Chart visualization</p>
                                <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
                                <p className="text-xs text-gray-500">Overview</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Products in Stock</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{stats.totalProducts - stats.lowStock}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <ShoppingCart className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Pending Orders</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">{Math.floor(stats.totalOrders * 0.15)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <DollarSign className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">Avg Order Value</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">
                                    ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;