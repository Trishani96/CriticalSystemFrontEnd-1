import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService';
import Navbar from '../common/Navbar';

const AdminDashboard = () => {
  const [fraudLogs, setFraudLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('fraud');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fraudData, auditData, statsData] = await Promise.all([
        transactionService.getFraudLogs(),
        transactionService.getAuditLogs(),
        transactionService.getStatistics()
      ]);
      setFraudLogs(fraudData.fraudLogs);
      setAuditLogs(auditData.auditLogs);
      setStatistics(statsData.statistics);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await transactionService.resolveFraudLog(id, 'Reviewed and resolved');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Total Users</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{statistics.totalUsers}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Total Transactions</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{statistics.totalTransactions}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Pending Transactions</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{statistics.pendingTransactions}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm font-medium text-gray-500">Unresolved Fraud</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{statistics.unresolvedFraud}</div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('fraud')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'fraud'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fraud Logs
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'audit'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Audit Logs
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'fraud' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolve</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fraudLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ruleTriggered}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              log.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                              log.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {log.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.actionTaken}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {!log.resolved ? (
                              <button
                                onClick={() => handleResolve(log.id)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Resolve
                              </button>
                            ) : (
                              <span className="text-green-600">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.outcome}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
