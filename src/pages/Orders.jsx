import { useEffect, useState } from "react";
import {
    ShoppingCart,
    Plus,
    Trash2,
    Edit,
    X,
    Search,
    AlertCircle,
    CheckCircle,
    Package,
    Minus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Orders = () => {
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    // Cart items for creating multi-product orders
    const [cartItems, setCartItems] = useState([]);

    const [form, setForm] = useState({
        status: "pending",
    });
    const [editingId, setEditingId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [errors, setErrors] = useState({});

    // Fetch all products for dropdown
    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
            setFilteredOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            showNotification("Failed to fetch orders", "error");
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    // Search filter
    useEffect(() => {
        const filtered = orders.filter(
            (o) =>
                o.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id?.toString().includes(searchTerm) ||
                o.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [searchTerm, orders]);

    // Show notification
    const showNotification = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Add item to cart
    const addToCart = (productId, quantity) => {
        if (!productId || !quantity || quantity < 1) {
            showNotification("Please select a product and quantity", "error");
            return;
        }

        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;

        if (quantity > product.quantity) {
            showNotification(`Only ${product.quantity} items available`, "error");
            return;
        }

        // Check if product already in cart
        const existingIndex = cartItems.findIndex(item => item.product_id === parseInt(productId));

        if (existingIndex >= 0) {
            const updated = [...cartItems];
            updated[existingIndex].quantity = parseInt(quantity);
            setCartItems(updated);
        } else {
            setCartItems([...cartItems, {
                product_id: parseInt(productId),
                quantity: parseInt(quantity),
                product_name: product.name,
                price: product.price
            }]);
        }

        showNotification("Item added to cart", "success");
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
    };

    // Calculate cart total
    const calculateCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // Create order
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingId) {
            // Update order status only
            setLoading(true);
            try {
                await api.put(`/orders/${editingId}`, { status: form.status });
                showNotification("Order status updated successfully!");
                resetForm();
                setShowModal(false);
                fetchOrders();
            } catch (err) {
                console.error("Error updating order:", err);
                showNotification("Failed to update order", "error");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Create new order
        if (cartItems.length === 0) {
            showNotification("Please add at least one item to cart", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post('/orders', { items: cartItems });
            showNotification("Order created successfully!");
            resetForm();
            setShowModal(false);
            fetchOrders();
            fetchProducts();
        } catch (err) {
            console.error("Error creating order:", err);
            showNotification(
                err.response?.data?.message || "Failed to create order",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({ status: "pending" });
        setCartItems([]);
        setEditingId(null);
        setErrors({});
    };

    // Edit order (only status)
    const handleEdit = (order) => {
        setForm({ status: order.status || "pending" });
        setEditingId(order.id);
        setShowModal(true);
    };

    // Delete order
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order? Product stock will be restored.")) return;

        try {
            await api.delete(`/orders/${id}`);
            showNotification("Order deleted successfully!");
            fetchOrders();
            fetchProducts();
        } catch (err) {
            console.error("Error deleting order:", err);
            showNotification("Failed to delete order", "error");
        }
    };

    // Open add modal
    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    // Calculate stats
    const totalRevenue = orders.reduce((sum, o) => {
        const price = typeof o.total_price === 'string'
            ? parseFloat(o.total_price.replace(/,/g, ''))
            : parseFloat(o.total_price || 0);
        return sum + price;
    }, 0);

    const completedOrders = orders.filter(o => o.status === "completed").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Notification */}
                {notification && (
                    <div
                        className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${notification.type === "success"
                                ? "bg-green-50 border border-green-200 text-green-800"
                                : "bg-red-50 border border-red-200 text-red-800"
                            } animate-slide-in`}
                    >
                        {notification.type === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    </div>
                    <p className="text-gray-600 ml-15">Create and manage multi-item orders</p>
                </div>

                {/* Search and Add Button */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders by customer, ID, or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Create Order
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-900">
                                ${totalRevenue.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                            <p className="text-sm text-purple-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-purple-900">{completedOrders}</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-900">{pendingOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Order Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((o) => (
                                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            #{o.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {o.user || "Guest"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {o.user_email || "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {o.items && o.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {o.items.slice(0, 2).map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-2">
                                                                <Package className="w-3 h-3 text-gray-400" />
                                                                <span className="text-xs">
                                                                    {item.product_name} (x{item.quantity})
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {o.items.length > 2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{o.items.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500">No items</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${o.total_price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${o.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : o.status === "processing"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : o.status === "cancelled"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {o.status || "pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(o)}
                                                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                    title="Edit Status"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(o.id)}
                                                    className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredOrders.length === 0 && (
                            <div className="text-center py-12">
                                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-medium">
                                    {searchTerm ? "No orders found" : "No orders yet"}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchTerm
                                        ? "Try adjusting your search"
                                        : "Click 'Create Order' to place your first order"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingId ? "Update Order Status" : "Create New Order"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {!editingId ? (
                                <div className="space-y-6">
                                    {/* Add Products to Cart */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-4">Add Products</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <select
                                                id="product-select"
                                                className="col-span-2 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select a product...</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} - ${p.price} (Stock: {p.quantity})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    id="quantity-input"
                                                    min="1"
                                                    placeholder="Qty"
                                                    className="w-20 px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const productId = document.getElementById('product-select').value;
                                                        const quantity = document.getElementById('quantity-input').value;
                                                        addToCart(productId, quantity);
                                                        document.getElementById('product-select').value = '';
                                                        document.getElementById('quantity-input').value = '';
                                                    }}
                                                    className="flex-1 bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5 mx-auto" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cart Items */}
                                    {cartItems.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                                            <div className="space-y-2">
                                                {cartItems.map((item) => (
                                                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <Package className="w-5 h-5 text-blue-600" />
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.product_id)}
                                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-blue-900">Order Total:</span>
                                                    <span className="text-2xl font-bold text-blue-900">
                                                        ${calculateCartTotal().toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Update Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || (!editingId && cartItems.length === 0)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Saving...
                                        </span>
                                    ) : (
                                        <span>{editingId ? "Update Status" : "Create Order"}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;