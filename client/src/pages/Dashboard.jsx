
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Wallet, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/transactions";

function Dashboard() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setTransactions(response.data);
      } catch (err) {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const totalIncome = transactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = transactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  // Create monthly chart data from actual transactions
  const monthlyData = {};

  transactions.forEach(item => {
    const date = new Date(item.date);
    const month = date.toLocaleString("en-IN", { month: "short" });
    const year = date.getFullYear();
    const key = `${year}-${date.getMonth()}`;

    if (!monthlyData[key]) {
      monthlyData[key] = {
        month: `${month} ${year}`,
        income: 0,
        expense: 0,
        sortDate: new Date(year, date.getMonth(), 1)
      };
    }

    if (item.type === "Income") {
      monthlyData[key].income += Number(item.amount);
    } else {
      monthlyData[key].expense += Number(item.amount);
    }
  });

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.sortDate - b.sortDate)
    .slice(-6);

  // Category-wise expense breakdown
  const categoryTotals = {};

  transactions
    .filter(item => item.type === "Expense")
    .forEach(item => {
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + Number(item.amount);
    });

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount
    }))
    .sort((a, b) => b.amount - a.amount);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const stats = [
    {
      title: "Total Balance",
      amount: totalBalance,
      icon: Wallet,
      color: "purple"
    },
    {
      title: "Total Income",
      amount: totalIncome,
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Total Expenses",
      amount: totalExpense,
      icon: TrendingDown,
      color: "red"
    }
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="dashboard">

      <div className="welcome-section">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening with your finances.</p>
        </div>

        <span className="date-label">
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
          })}
        </span>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div className="stat-card" key={item.title}>
                  <div className="stat-top">
                    <span>{item.title}</span>
                    <div className={`stat-icon ${item.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <h2>₹{item.amount.toLocaleString("en-IN")}</h2>
                  <p className="stat-note">Your financial summary</p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-grid">

            <div className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h3>Income vs Expenses</h3>
                  <p>Monthly financial activity</p>
                </div>
                <span className="chart-tag">Last 6 months</span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#5967db" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="expense" fill="#f59e70" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-legend">
                <span><i className="income-dot"></i> Income</span>
                <span><i className="expense-dot"></i> Expenses</span>
              </div>
            </div>

            <div className="panel">
              <h3>Spending Breakdown</h3>
              <p className="panel-subtitle">Expenses by category</p>

              {categoryData.length > 0 ? (
                categoryData.map(item => (
                  <div className="category-item" key={item.category}>
                    <div>
                      <span>{item.category}</span>
                      <b>₹{item.amount.toLocaleString("en-IN")}</b>
                    </div>

                    <div className="progress">
                      <span
                        style={{
                          width: `${(item.amount / totalExpense) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p>No expense records yet.</p>
              )}
            </div>
          </div>

          <div className="panel recent-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Transactions</h3>
                <p>Your latest financial activities</p>
              </div>
            </div>

            <div className="transaction-table">
              <div className="transaction-row table-header">
                <span>Transaction</span>
                <span>Category</span>
                <span>Date</span>
                <span>Amount</span>
              </div>

              {recentTransactions.length > 0 ? (
                recentTransactions.map(item => (
                  <div className="transaction-row" key={item._id}>
                    <span className="transaction-title">{item.title}</span>
                    <span>{item.category}</span>
                    <span>{formatDate(item.date)}</span>

                    <b className={
                      item.type === "Income" ? "income-text" : "expense-text"
                    }>
                      {item.type === "Income"
                        ? <ArrowUpRight size={15} />
                        : <ArrowDownRight size={15} />
                      }

                      {item.type === "Income" ? "+" : "-"}
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </b>
                  </div>
                ))
              ) : (
                <p>No transactions added yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
