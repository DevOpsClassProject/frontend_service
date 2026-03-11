import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const API_BASE = process.env.REACT_APP_API_URL;
    console.log("Current API_BASE is:", API_BASE);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // 1. Function to get Products
    const fetchProducts = () => {
        axios.get(`${API_BASE}:3001/products`)
            .then(res => setProducts(res.data))
            .catch(err => console.error("Error fetching products:", err));
    };

    // 2. Function to get Orders
    const fetchOrders = () => {
        axios.get(`${API_BASE}:3002/orders`)
            .then(res => setOrders(res.data))
            .catch(err => console.error("Error fetching orders:", err));
    };

    // 3. Function to Create Order
    const createOrder = (product) => {
        axios.post(`${API_BASE}:3002/orders`, {
            productId: product.id,
            quantity: 1
        })
        .then(() => {
            alert('Order Created!');
            fetchOrders(); // Refresh the list automatically after creating
        })
        .catch(err => alert("Create order failed: " + err.message));
    };

    // Initial load
    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>E-Commerce Store</h1>
            
            {/* Action Toolbar */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={fetchProducts} style={styles.actionBtn}>
                    🔄 Refresh Product List
                </button>
                <button onClick={fetchOrders} style={styles.actionBtn}>
                    📋 Refresh My Orders
                </button>
            </div>

            <hr />

            <h2>Available Products</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {products.length === 0 ? <p>No products found. Click refresh!</p> : 
                    products.map(product => (
                        <div key={product.id} style={styles.card}>
                            <h3>{product.name}</h3>
                            <p>${product.price}</p>
                            <button onClick={() => createOrder(product)} style={styles.buyBtn}>
                                Buy Now
                            </button>
                        </div>
                    ))
                }
            </div>

            <hr />

            <h2>Your Orders</h2>
            {orders.length === 0 ? <p>No orders yet.</p> : (
                <ul>
                    {orders.map((o, i) => {
                        // Find the product name in our products list
                        const productInfo = products.find(p => p.id === o.product_id);
                        
                        return (
                            <li key={i}>
                                Order ID: {o.id} | 
                                <strong> Product: {productInfo ? productInfo.name : `ID ${o.product_id}`}</strong>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

const styles = {
    actionBtn: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    },
    card: {
        border: '1px solid #ddd',
        padding: '15px',
        margin: '10px',
        borderRadius: '8px',
        width: '150px'
    },
    buyBtn: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        cursor: 'pointer'
    }
};

export default App;