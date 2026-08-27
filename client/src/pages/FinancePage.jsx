import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import DashboardSidebar from "../components/DashboardSidebar";

const today = new Date().toISOString().slice(0, 10);

const emptySaleForm = {
  category: "egg",
  quantity: "",
  unitPrice: "",
  date: today,
  description: "",
};

const emptyExpenseForm = {
  category: "feed",
  amount: "",
  date: today,
  description: "",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat().format(Number(value) || 0);

const FinancePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const [saleForm, setSaleForm] = useState(emptySaleForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);

  const [creatingSale, setCreatingSale] = useState(false);
  const [creatingExpense, setCreatingExpense] = useState(false);

  const canManageFinance = ["admin", "manager"].includes(user?.role);

  // ---------------------------------------------------------
  // Load finance data
  // ---------------------------------------------------------
  const loadFinance = async () => {
    try {
      setLoading(true);
      setFormError("");

      const [
        summaryResponse,
        salesResponse,
        expensesResponse,
      ] = await Promise.all([
        api.get("/finance/summary"),
        api.get("/sales"),
        api.get("/expenses"),
      ]);

      setSummary(summaryResponse.data?.data || {});
      setSales(salesResponse.data?.sales || []);
      setExpenses(expensesResponse.data?.expenses || []);
    } catch (requestError) {
      console.error("Finance loading error:", requestError);

      setFormError(
        requestError.response?.data?.message ||
          "Unable to load finance data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // Initial finance data loading
  // ---------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const fetchFinance = async () => {
      try {
        const [
          summaryResponse,
          salesResponse,
          expensesResponse,
        ] = await Promise.all([
          api.get("/finance/summary"),
          api.get("/sales"),
          api.get("/expenses"),
        ]);

        if (cancelled) return;

        setSummary(summaryResponse.data?.data || {});
        setSales(salesResponse.data?.sales || []);
        setExpenses(expensesResponse.data?.expenses || []);
      } catch (requestError) {
        if (cancelled) return;

        console.error("Finance loading error:", requestError);

        setFormError(
          requestError.response?.data?.message ||
            "Unable to load finance data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFinance();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------
  // Logout
  // ---------------------------------------------------------
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ---------------------------------------------------------
  // Sale form
  // ---------------------------------------------------------
  const handleSaleChange = (event) => {
    const { name, value } = event.target;

    setSaleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Expense form
  // ---------------------------------------------------------
  const handleExpenseChange = (event) => {
    const { name, value } = event.target;

    setExpenseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // Create sale
  // ---------------------------------------------------------
  const handleCreateSale = async (event) => {
    event.preventDefault();

    setFormError("");
    setMessage("");
    setCreatingSale(true);

    try {
      await api.post("/sales", {
        category: saleForm.category,
        quantity: Number(saleForm.quantity),
        unitPrice: Number(saleForm.unitPrice),
        date: saleForm.date,
        description: saleForm.description,
      });

      setSaleForm({
        ...emptySaleForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setMessage("Sale recorded successfully.");

      await loadFinance();
    } catch (requestError) {
      console.error("Create sale error:", requestError);

      setFormError(
        requestError.response?.data?.message ||
          "Unable to record sale."
      );
    } finally {
      setCreatingSale(false);
    }
  };

  // ---------------------------------------------------------
  // Create expense
  // ---------------------------------------------------------
  const handleCreateExpense = async (event) => {
    event.preventDefault();

    setFormError("");
    setMessage("");
    setCreatingExpense(true);

    try {
      await api.post("/expenses", {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description,
      });

      setExpenseForm({
        ...emptyExpenseForm,
        date: new Date().toISOString().slice(0, 10),
      });

      setMessage("Expense recorded successfully.");

      await loadFinance();
    } catch (requestError) {
      console.error("Create expense error:", requestError);

      setFormError(
        requestError.response?.data?.message ||
          "Unable to record expense."
      );
    } finally {
      setCreatingExpense(false);
    }
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <main className="farm-dashboard">
      <DashboardSidebar
        user={user}
        onLogout={handleLogout}
      />

      <section className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">
              Finance & Analytics
            </p>

            <h1>Finance & Analytics</h1>

            <p>
              Track farm revenue, expenses and profitability.
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadFinance}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh data"}
          </button>
        </header>

        {/* Error message */}
        {formError && (
          <p className="error-message">
            {formError}
          </p>
        )}

        {/* Success message */}
        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <p className="loading-text">
            Loading finance data...
          </p>
        ) : (
          <>
            {/* =================================================
                KPI CARDS
            ================================================== */}
            <section className="summary-grid">
              <article className="summary-card">
                <span>Total Revenue</span>

                <strong>
                  {formatCurrency(
                    summary?.totalRevenue
                  )}
                </strong>
              </article>

              <article className="summary-card">
                <span>Total Expenses</span>

                <strong>
                  {formatCurrency(
                    summary?.totalExpenses
                  )}
                </strong>
              </article>

              <article className="summary-card">
                <span>Net Profit</span>

                <strong>
                  {formatCurrency(
                    summary?.profit
                  )}
                </strong>
              </article>

              <article className="summary-card">
                <span>Profit Margin</span>

                <strong>
                  {summary?.profitMargin || 0}%
                </strong>
              </article>
            </section>

            {/* =================================================
                RECORD SALE / EXPENSE
            ================================================== */}
            {canManageFinance && (
              <section className="overview-two-column">
                {/* Sale */}
                <section className="management-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">
                        Revenue
                      </p>

                      <h2>Record Sale</h2>
                    </div>
                  </div>

                  <form
                    className="flock-form"
                    onSubmit={handleCreateSale}
                  >
                    <label>
                      Category

                      <select
                        name="category"
                        value={saleForm.category}
                        onChange={handleSaleChange}
                      >
                        <option value="egg">
                          Eggs
                        </option>

                        <option value="chicken">
                          Chicken
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>
                    </label>

                    <label>
                      Quantity

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="quantity"
                        value={saleForm.quantity}
                        onChange={handleSaleChange}
                        required
                      />
                    </label>

                    <label>
                      Unit Price

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="unitPrice"
                        value={saleForm.unitPrice}
                        onChange={handleSaleChange}
                        required
                      />
                    </label>

                    <label>
                      Date

                      <input
                        type="date"
                        name="date"
                        value={saleForm.date}
                        onChange={handleSaleChange}
                        required
                      />
                    </label>

                    <label className="form-wide">
                      Description

                      <input
                        name="description"
                        value={saleForm.description}
                        onChange={handleSaleChange}
                        placeholder="Optional sale description"
                      />
                    </label>

                    <button
                      className="form-wide"
                      type="submit"
                      disabled={creatingSale}
                    >
                      {creatingSale
                        ? "Saving..."
                        : "Record Sale"}
                    </button>
                  </form>
                </section>

                {/* Expense */}
                <section className="management-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">
                        Costs
                      </p>

                      <h2>Record Expense</h2>
                    </div>
                  </div>

                  <form
                    className="flock-form"
                    onSubmit={handleCreateExpense}
                  >
                    <label>
                      Category

                      <select
                        name="category"
                        value={expenseForm.category}
                        onChange={handleExpenseChange}
                      >
                        <option value="feed">
                          Feed
                        </option>

                        <option value="medicine">
                          Medicine
                        </option>

                        <option value="labour">
                          Labour
                        </option>

                        <option value="electricity">
                          Electricity
                        </option>

                        <option value="water">
                          Water
                        </option>

                        <option value="transportation">
                          Transportation
                        </option>

                        <option value="equipment">
                          Equipment
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>
                    </label>

                    <label>
                      Amount

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="amount"
                        value={expenseForm.amount}
                        onChange={handleExpenseChange}
                        required
                      />
                    </label>

                    <label>
                      Date

                      <input
                        type="date"
                        name="date"
                        value={expenseForm.date}
                        onChange={handleExpenseChange}
                        required
                      />
                    </label>

                    <label className="form-wide">
                      Description

                      <input
                        name="description"
                        value={expenseForm.description}
                        onChange={handleExpenseChange}
                        placeholder="Optional expense description"
                      />
                    </label>

                    <button
                      className="form-wide"
                      type="submit"
                      disabled={creatingExpense}
                    >
                      {creatingExpense
                        ? "Saving..."
                        : "Record Expense"}
                    </button>
                  </form>
                </section>
              </section>
            )}

            {/* =================================================
                CATEGORY ANALYSIS
            ================================================== */}
            <section className="overview-two-column">
              {/* Revenue by category */}
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      Revenue analysis
                    </p>

                    <h2>
                      Revenue by Category
                    </h2>
                  </div>
                </div>

                {summary?.revenueByCategory?.length ? (
                  <div className="dashboard-list">
                    {summary.revenueByCategory.map(
                      (item) => (
                        <article
                          className="dashboard-list-item"
                          key={item.category}
                        >
                          <div>
                            <strong>
                              {item.category}
                            </strong>

                            <span>
                              {item.count} transactions
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              item.total
                            )}
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <p className="loading-text">
                    No sales recorded yet.
                  </p>
                )}
              </section>

              {/* Expenses by category */}
              <section className="management-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">
                      Cost analysis
                    </p>

                    <h2>
                      Expenses by Category
                    </h2>
                  </div>
                </div>

                {summary?.expenseByCategory?.length ? (
                  <div className="dashboard-list">
                    {summary.expenseByCategory.map(
                      (item) => (
                        <article
                          className="dashboard-list-item"
                          key={item.category}
                        >
                          <div>
                            <strong>
                              {item.category}
                            </strong>

                            <span>
                              {item.count} transactions
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              item.total
                            )}
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <p className="loading-text">
                    No expenses recorded yet.
                  </p>
                )}
              </section>
            </section>

            {/* =================================================
                SALES TABLE
            ================================================== */}
            <section className="management-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    Transactions
                  </p>

                  <h2>Recent Sales</h2>
                </div>

                <span className="role-note">
                  {sales.length} records
                </span>
              </div>

              {sales.length ? (
                <div className="flock-table-wrap">
                  <table className="flock-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sales
                        .slice(0, 10)
                        .map((sale) => (
                          <tr key={sale._id}>
                            <td>
                              {new Date(
                                sale.date
                              ).toLocaleDateString()}
                            </td>

                            <td>
                              {sale.category}
                            </td>

                            <td>
                              {formatNumber(
                                sale.quantity
                              )}
                            </td>

                            <td>
                              {formatCurrency(
                                sale.unitPrice
                              )}
                            </td>

                            <td>
                              <strong>
                                {formatCurrency(
                                  sale.amount
                                )}
                              </strong>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="loading-text">
                  No sales records yet.
                </p>
              )}
            </section>

            {/* =================================================
                EXPENSE TABLE
            ================================================== */}
            <section className="management-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    Transactions
                  </p>

                  <h2>Recent Expenses</h2>
                </div>

                <span className="role-note">
                  {expenses.length} records
                </span>
              </div>

              {expenses.length ? (
                <div className="flock-table-wrap">
                  <table className="flock-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>

                    <tbody>
                      {expenses
                        .slice(0, 10)
                        .map((expense) => (
                          <tr key={expense._id}>
                            <td>
                              {new Date(
                                expense.date
                              ).toLocaleDateString()}
                            </td>

                            <td>
                              {expense.category}
                            </td>

                            <td>
                              {expense.description ||
                                "—"}
                            </td>

                            <td>
                              <strong>
                                {formatCurrency(
                                  expense.amount
                                )}
                              </strong>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="loading-text">
                  No expense records yet.
                </p>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
};

export default FinancePage;