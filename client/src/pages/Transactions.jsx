
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Search, Pencil, Trash2, X,
  ArrowUpRight, ArrowDownRight, Wallet
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL}/transactions`;

const emptyForm = {
  title: "",
  amount: "",
  type: "Expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10)
};

function Transactions() {
  const { token } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const categories = [
    "Food", "Bills", "Transport", "Shopping",
    "Entertainment", "Salary", "Other Income", "Other"
  ];

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // FETCH TRANSACTIONS FROM MONGODB
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL, { headers });

      setTransactions(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType = filter === "All" || item.type === filter;

    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = transactions
    .filter(item => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = transactions
    .filter(item => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (item) => {
    setEditingId(item._id);

    setForm({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: new Date(item.date).toISOString().slice(0, 10)
    });

    setShowForm(true);
    setMessage("");
  };

  // ADD OR UPDATE TRANSACTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const transactionData = {
        ...form,
        amount: Number(form.amount)
      };

      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          transactionData,
          { headers }
        );

        setTransactions(transactions.map(item =>
          item._id === editingId
            ? response.data.transaction
            : item
        ));

        setMessage("Transaction updated successfully!");
      } else {
        const response = await axios.post(
          API_URL,
          transactionData,
          { headers }
        );

        setTransactions([
          response.data.transaction,
          ...transactions
        ]);

        setMessage("Transaction added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to save transaction."
      );
    }
  };

  // DELETE TRANSACTION
  const deleteTransaction = async (id) => {
    const confirmed = window.confirm("Delete this transaction?");

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`, { headers });

      setTransactions(transactions.filter(item => item._id !== id));
      setMessage("Transaction deleted successfully!");

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to delete transaction."
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="transactions-page">

      <div className="welcome-section">
        <div>
          <h1>Transactions</h1>
          <p>Track and manage all your money activities.</p>
        </div>

        <button className="add-transaction-btn" onClick={openAddForm}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {message && (
        <p role="status">{message}</p>
      )}

      <div className="transaction-summary">
        <div className="summary-card">
          <div className="summary-icon income-bg">
            <ArrowUpRight />
          </div>
          <div>
            <p>Total Income</p>
            <h2>₹{totalIncome.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon expense-bg">
            <ArrowDownRight />
          </div>
          <div>
            <p>Total Expenses</p>
            <h2>₹{totalExpense.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon balance-bg">
            <Wallet />
          </div>
          <div>
            <p>Net Balance</p>
            <h2>₹{(totalIncome - totalExpense).toLocaleString("en-IN")}</h2>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="transaction-form-panel">
          <div className="form-heading">
            <h2>{editingId ? "Edit Transaction" : "Add New Transaction"}</h2>
            <button className="close-form" onClick={() => setShowForm(false)}>
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="transaction-form">

            <div className="form-field">
              <label>Transaction Name</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: Grocery Shopping"
                required
              />
            </div>

            <div className="form-field">
              <label>Amount (₹)</label>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="form-field">
              <label>Transaction Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div className="form-field">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" className="save-btn">
                {editingId ? "Update Transaction" : "Save Transaction"}
              </button>
            </div>

          </form>
        </div>
      )}

      <div className="transaction-list-panel">

        <div className="transaction-list-heading">
          <div>
            <h2>All Transactions</h2>
            <p>View, search and manage your records.</p>
          </div>
          <span>{filteredTransactions.length} records</span>
        </div>

        <div className="transaction-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="transaction-table">
          <div className="transaction-row table-header">
            <span>Transaction</span>
            <span>Category</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="empty-transactions">
              Loading transactions...
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map(item => (
              <div className="transaction-row" key={item._id}>
                <span className="transaction-title">{item.title}</span>
                <span>{item.category}</span>
                <span>{formatDate(item.date)}</span>

                <b className={
                  item.type === "Income" ? "income-text" : "expense-text"
                }>
                  {item.type === "Income" ? "+" : "-"}
                  ₹{Number(item.amount).toLocaleString("en-IN")}
                </b>

                <span className="action-buttons">
                  <button onClick={() => openEditForm(item)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteTransaction(item._id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>
            ))
          ) : (
            <div className="empty-transactions">
              No transactions found. Try another search or add a transaction.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Transactions;
