import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import Navbar from '../common/Navbar';

const UserDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryAccount: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await transactionService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (response.fraudAlert) {
        setSuccess(`Transaction created but ${response.fraudAlert.action}. ${response.fraudAlert.message}`);
      } else {
        setSuccess('Transaction completed successfully');
      }

      setFormData({ beneficiaryName: '', beneficiaryAccount: '', amount: '' });
      setShowTransferForm(false);
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Transaction failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {error && <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-md">{success}</div>}

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Transfer Money</h2>
              <button
                onClick={() => setShowTransferForm(!showTransferForm)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              >
                {showTransferForm ? 'Cancel' : 'New Transfer'}
              </button>
            </div>

            {showTransferForm && (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={formData.beneficiaryName}
                    onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={formData.beneficiaryAccount}
                    onChange={(e) => setFormData({ ...formData, beneficiaryAccount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Submit Transfer
                </button>
              </form>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.beneficiaryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (tx.status === 'completed' || tx.status === 'approved') ? 'bg-green-100 text-green-800' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          tx.status === 'on_hold' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
