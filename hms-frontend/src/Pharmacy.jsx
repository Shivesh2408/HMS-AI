import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quantities, setQuantities] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const token = localStorage.getItem('authToken');

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/medicines/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setMedicines(response.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching medicines:', err);
        setError('Failed to fetch medicines');
      } finally {
        setLoading(false);
      }
    };
    fetchMedicines();
  }, [token]);

  const handleQuantityChange = (medicineId, value) => {
    setQuantities({
      ...quantities,
      [medicineId]: parseInt(value) || 0,
    });
  };

  const addToCart = (medicine) => {
    const quantity = quantities[medicine.id] || 0;
    if (quantity <= 0) {
      setError('Please select a quantity');
      return;
    }

    if (quantity > medicine.stock) {
      setError(`Only ${medicine.stock} items available`);
      return;
    }

    const existingItem = cart.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.medicine.id === medicine.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { medicine, quantity }]);
    }

    setQuantities({ ...quantities, [medicine.id]: 0 });
    setSuccess(`${medicine.name} added to cart`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.medicine.id !== medicineId));
  };

  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
    } else {
      const cartItem = cart.find(item => item.medicine.id === medicineId);
      if (cartItem && newQuantity > cartItem.medicine.stock) {
        setError(`Only ${cartItem.medicine.stock} items available`);
        return;
      }
      setCart(cart.map(item =>
        item.medicine.id === medicineId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    try {
      setProcessingOrder(true);
      setError('');

      const items = cart.map(item => ({
        medicine_id: item.medicine.id,
        quantity: item.quantity,
      }));

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/create-bill/`,
        { items },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Bill created successfully!');
      setCart([]);
      setShowCart(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating bill:', err);
      setError(err.response?.data?.error || 'Failed to create bill');
    } finally {
      setProcessingOrder(false);
    }
  };

  const total = calculateTotal();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8"
    >
      <div className="flex justify-between items-start mb-8">
        <motion.div variants={cardVariants}>
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Pharmacy Store
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
        </motion.div>

        {cart.length > 0 && (
          <motion.button
            onClick={() => setShowCart(!showCart)}
            className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <span>Shopping Cart ({cart.length})</span>
              {cart.length > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </span>
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 font-semibold mb-6"
        >
          ✗ {error}
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold mb-6"
        >
          ✓ {success}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Medicines Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500"
              />
            </motion.div>
          ) : medicines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-400"
            >
              <p className="text-xl">No medicines available</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicines.map((medicine, idx) => (
                <motion.div
                  key={medicine.id}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-xl opacity-0 hover:opacity-75 blur-2xl transition-all duration-500 ease-in-out pointer-events-none"></div>
                  
                  <div className="relative">
                    <h3 className="text-lg font-bold text-white mb-2">{medicine.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Price</p>
                        <p className="text-xl font-bold text-cyan-400">₹ {parseFloat(medicine.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Stock</p>
                        <p className={`text-xl font-bold ${medicine.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {medicine.stock}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                      Expires: {new Date(medicine.expiry_date).toLocaleDateString()}
                    </p>

                    {medicine.stock > 0 ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max={medicine.stock}
                          value={quantities[medicine.id] || ''}
                          onChange={(e) => handleQuantityChange(medicine.id, e.target.value)}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 bg-gray-800/50 border border-cyan-500/30 rounded text-white text-center focus:outline-none focus:border-cyan-500"
                        />
                        <motion.button
                          onClick={() => addToCart(medicine)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                        >
                          Add to Cart
                        </motion.button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-600 text-gray-400 rounded font-semibold cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        {cart.length > 0 && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-xl border border-cyan-500/10 rounded-xl p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🛒</span> Cart Summary
              </h2>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <motion.div
                    key={item.medicine.id}
                    className="flex justify-between items-start bg-gray-800/30 p-3 rounded"
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{item.medicine.name}</p>
                      <p className="text-cyan-400 text-xs">₹ {parseFloat(item.medicine.price).toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.medicine.stock}
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.medicine.id, parseInt(e.target.value) || 0)}
                        className="w-12 px-2 py-1 bg-gray-700 border border-cyan-500/20 rounded text-white text-center focus:outline-none"
                      />
                      <button
                        onClick={() => removeFromCart(item.medicine.id)}
                        className="text-red-400 hover:text-red-300 text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-cyan-500/20 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-semibold">₹ {total}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-cyan-400 font-bold">Total:</span>
                  <span className="text-cyan-400 font-bold">₹ {total}</span>
                </div>
              </div>

              <motion.button
                onClick={handleCheckout}
                disabled={processingOrder}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-bold text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingOrder ? 'Processing...' : 'Proceed to Checkout'}
              </motion.button>

              <motion.button
                onClick={() => setCart([])}
                className="w-full mt-3 px-4 py-2 border border-red-500/50 text-red-400 rounded-lg font-semibold hover:bg-red-500/10 transition-all duration-300"
              >
                Clear Cart
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Pharmacy;
