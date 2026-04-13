import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (idx) => ({
      opacity: 1,
      x: 0,
      transition: { delay: idx * 0.1, duration: 0.4 },
    }),
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-bills/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setBills(response.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching bills:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(err.response?.data?.error || 'Failed to fetch bills');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, [token]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8"
    >
      <motion.div variants={cardVariants}>
        <h1 className="text-4xl font-black text-white mb-2">
          My Bills & Invoices
        </h1>
        <div className="h-1 w-48 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full mb-8"></div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/200/20 border border-red-500/200/30 rounded-lg text-red-400 font-semibold mb-6"
        >
          ✗ {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-4 border-cyan-500/10 border-t-[#2563EB]"
          />
        </motion.div>
      ) : bills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-cyan-500/10 rounded-12 shadow-lg p-12 text-center"
        >
          <div className="text-6xl mb-4">📋</div>
          <p className="text-white text-lg">No bills yet.</p>
          <p className="text-gray-400 text-sm mt-2">Start shopping in the pharmacy to generate bills!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {bills.map((bill, idx) => (
            <motion.div
              key={bill.id}
              custom={idx}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-900/60 border border-cyan-500/10 rounded-12 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-lg-lg"
            >
              <div className="p-6">
                {/* Bill Header */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-cyan-500/10">
                  <div>
                    <p className="text-gray-400 text-sm">Bill ID</p>
                    <p className="text-white font-bold text-lg">#{bill.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-cyan-400 font-semibold">{formatDate(bill.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-green-600 font-bold text-xl">₹ {parseFloat(bill.total_amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Bill Items Table */}
                <div>
                  <h3 className="text-cyan-400 font-semibold mb-3 text-sm uppercase tracking-wide">Items Purchased</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-cyan-500/10">
                          <th className="text-left py-2 px-3 text-cyan-400 font-semibold">Medicine</th>
                          <th className="text-center py-2 px-3 text-cyan-400 font-semibold">Quantity</th>
                          <th className="text-right py-2 px-3 text-cyan-400 font-semibold">Price</th>
                          <th className="text-right py-2 px-3 text-cyan-400 font-semibold">Sub-Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.items.map((item, itemIdx) => (
                          <motion.tr
                            key={item.id}
                            custom={itemIdx}
                            variants={tableRowVariants}
                            initial="hidden"
                            animate="visible"
                            className="border-b border-cyan-500/10 hover:bg-gray-800/50 transition-all"
                          >
                            <td className="py-3 px-3 text-white font-semibold">{item.medicine_name}</td>
                            <td className="py-3 px-3 text-center text-gray-400">{item.quantity}</td>
                            <td className="py-3 px-3 text-right text-cyan-400">₹ {parseFloat(item.price).toFixed(2)}</td>
                            <td className="py-3 px-3 text-right text-white font-semibold">
                              ₹ {(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bill Total */}
                  <div className="mt-4 pt-4 border-t border-cyan-500/10 flex justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-8">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-cyan-400 font-bold text-lg">₹ {parseFloat(bill.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyBills;
