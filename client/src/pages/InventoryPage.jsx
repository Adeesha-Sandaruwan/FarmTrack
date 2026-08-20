import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const today = new Date().toISOString().slice(0, 10);

const emptyItemForm = {
  name: "",
  category: "feed",
  unit: "kg",
  openingStock: "",
  reorderLevel: "",
  unitCost: "",
  supplier: "",
  expiryDate: "",
  notes: "",
};

const emptyTransactionForm = {
  itemId: "",
  transactionType: "usage",
  direction: "decrease",
  quantity: "",
  unitCost: "",
  date: today,
  reference: "",
  notes: "",
};

const formatNumber = (value) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value || 0);

const InventoryPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);

  const [creatingItem, setCreatingItem] = useState(false);
  const [creatingTransaction, setCreatingTransaction] = useState(false);

  const canManageInventory = ["admin", "manager"].includes(user?.role);

  const loadItems = async () => {
    try {
      setLoading(true);
      setPageError("");

      const { data } = await api.get("/inventory");
      setItems(data.items);
    } catch (requestError) {
      setPageError(
        requestError.response?.data?.message ||
          "Unable to load inventory records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const summary = useMemo(() => {
    const lowStockItems = items.filter(
      (item) => item.currentStock <= item.reorderLevel
    );

    return {
      totalItems: items.length,
      lowStockItems: lowStockItems.length,
      feedItems: items.filter((item) => item.category === "feed").length,
      totalStockValue: items.reduce(
        (total, item) => total + item.currentStock * item.unitCost,
        0
      ),
    };
  }, [items]);

  const handleItemChange = (event) => {
    setItemForm({
      ...itemForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleTransactionChange = (event) => {
    setTransactionForm({
      ...transactionForm,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateItem = async (event) => {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setCreatingItem(true);

    try {
      await api.post("/inventory", {
        ...itemForm,
        openingStock: Number(itemForm.openingStock || 0),
        reorderLevel: Number(itemForm.reorderLevel || 0),
        unitCost: Number(itemForm.unitCost || 0),
        expiryDate: itemForm.expiryDate || null,
      });

      setItemForm(emptyItemForm);
      setMessage("Inventory item created successfully.");
      await loadItems();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Unable to create inventory item."
      );
    } finally {
      setCreatingItem(false);
    }
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setCreatingTransaction(true);

    try {
      await api.post(`/inventory/${transactionForm.itemId}/transactions`, {
        transactionType: transactionForm.transactionType,
        direction: transactionForm.direction,
        quantity: Number(transactionForm.quantity),
        unitCost: Number(transactionForm.unitCost || 0),
        date: transactionForm.date,
        reference: transactionForm.reference,
        notes: transactionForm.notes,
      });

      setTransactionForm(emptyTransactionForm);
      setMessage("Stock transaction saved successfully.");
      await loadItems();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          "Unable to save stock transaction."
      );
    } finally {
      setCreatingTransaction(false);
    }
  };

  const startTransaction = (item) => {
    setTransactionForm({
      ...emptyTransactionForm,
      itemId: item._id,
      unitCost: item.unitCost,
    });

    document
      .getElementById("stock-transaction-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="farm-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="sidebar-brand" to="/dashboard">
          FarmTrack
        </Link>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>
          <Link to="/flocks">Flock Management</Link>
          <Link className="active" to="/inventory">
            Feed & Inventory
          </Link>
          <span>Production & Health</span>
          <span>Finance & Analytics</span>
        </nav>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Farm operations</p>
            <h1>Feed & Inventory</h1>
            <p>Track feed, medicine, vaccines, equipment, and supplies.</p>
          </div>

          <button className="refresh-button" type="button" onClick={loadItems}>
            Refresh data
          </button>
        </header>

        {pageError && <p className="error-message">{pageError}</p>}
        {formError && <p className="error-message">{formError}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>Total inventory items</span>
            <strong>{summary.totalItems}</strong>
          </article>
          <article className="summary-card mortality-card">
            <span>Low-stock alerts</span>
            <strong>{summary.lowStockItems}</strong>
          </article>
          <article className="summary-card">
            <span>Feed item types</span>
            <strong>{summary.feedItems}</strong>
          </article>
          <article className="summary-card">
            <span>Estimated stock value</span>
            <strong>Rs. {formatNumber(summary.totalStockValue)}</strong>
          </article>
        </section>

        {canManageInventory && (
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">New item</p>
                <h2>Add inventory item</h2>
              </div>
              <span className="role-note">Manager / Admin access</span>
            </div>

            <form className="flock-form" onSubmit={handleCreateItem}>
              <label>
                Item name
                <input
                  name="name"
                  placeholder="e.g., Layer Mash Feed"
                  value={itemForm.name}
                  onChange={handleItemChange}
                  required
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={itemForm.category}
                  onChange={handleItemChange}
                >
                  <option value="feed">Feed</option>
                  <option value="medicine">Medicine</option>
                  <option value="vaccine">Vaccine</option>
                  <option value="equipment">Equipment</option>
                  <option value="supplies">Supplies</option>
                </select>
              </label>

              <label>
                Unit
                <select
                  name="unit"
                  value={itemForm.unit}
                  onChange={handleItemChange}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="litre">Litres</option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="bag">Bags</option>
                  <option value="bottle">Bottles</option>
                  <option value="dose">Doses</option>
                  <option value="piece">Pieces</option>
                  <option value="box">Boxes</option>
                </select>
              </label>

              <label>
                Opening stock
                <input
                  type="number"
                  name="openingStock"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500"
                  value={itemForm.openingStock}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Low-stock level
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 100"
                  value={itemForm.reorderLevel}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Unit cost (Rs.)
                <input
                  type="number"
                  name="unitCost"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 145"
                  value={itemForm.unitCost}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Supplier
                <input
                  name="supplier"
                  placeholder="e.g., Farm Supply Lanka"
                  value={itemForm.supplier}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                Expiry date
                <input
                  type="date"
                  name="expiryDate"
                  value={itemForm.expiryDate}
                  onChange={handleItemChange}
                />
              </label>

              <label className="form-wide">
                Notes
                <input
                  name="notes"
                  placeholder="Optional inventory notes"
                  value={itemForm.notes}
                  onChange={handleItemChange}
                />
              </label>

              <button className="form-wide" type="submit" disabled={creatingItem}>
                {creatingItem ? "Creating item..." : "Create inventory item"}
              </button>
            </form>
          </section>
        )}

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Current stock</p>
              <h2>Inventory records</h2>
            </div>
            <span className="role-note">{items.length} active items</span>
          </div>

          {loading ? (
            <p className="loading-text">Loading inventory records...</p>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No inventory items yet</h3>
              <p>Add your first feed, medicine, vaccine, or supply item.</p>
            </div>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Current stock</th>
                    <th>Low-stock level</th>
                    <th>Value</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLowStock =
                      item.currentStock <= item.reorderLevel;

                    return (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.name}</strong>
                          <span>{item.supplier || "No supplier recorded"}</span>
                        </td>
                        <td>
                          <span className="capitalize">{item.category}</span>
                        </td>
                        <td>
                          <strong>
                            {formatNumber(item.currentStock)} {item.unit}
                          </strong>
                          {isLowStock && (
                            <span className="low-stock-text">Low stock</span>
                          )}
                        </td>
                        <td>
                          {formatNumber(item.reorderLevel)} {item.unit}
                        </td>
                        <td>
                          Rs.{" "}
                          {formatNumber(item.currentStock * item.unitCost)}
                        </td>
                        <td>
                          <button
                            className="table-action"
                            type="button"
                            onClick={() => startTransaction(item)}
                          >
                            Record stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section id="stock-transaction-form" className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Daily operation</p>
              <h2>Record stock movement</h2>
            </div>
            <span className="role-note">Available to all farm users</span>
          </div>

          <form className="flock-form" onSubmit={handleCreateTransaction}>
            <label>
              Inventory item
              <select
                name="itemId"
                value={transactionForm.itemId}
                onChange={handleTransactionChange}
                required
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} — {item.currentStock} {item.unit}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Movement type
              <select
                name="transactionType"
                value={transactionForm.transactionType}
                onChange={handleTransactionChange}
              >
                <option value="usage">Usage</option>
                <option value="stock-in">Stock received</option>
                <option value="adjustment">Stock adjustment</option>
                <option value="wastage">Wastage / damage</option>
              </select>
            </label>

            <label>
              Stock direction
              <select
                name="direction"
                value={transactionForm.direction}
                onChange={handleTransactionChange}
              >
                <option value="decrease">Decrease</option>
                <option value="increase">Increase</option>
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                name="quantity"
                min="0.01"
                step="0.01"
                placeholder="e.g., 25"
                value={transactionForm.quantity}
                onChange={handleTransactionChange}
                required
              />
            </label>

            <label>
              Unit cost (Rs.)
              <input
                type="number"
                name="unitCost"
                min="0"
                step="0.01"
                value={transactionForm.unitCost}
                onChange={handleTransactionChange}
              />
            </label>

            <label>
              Transaction date
              <input
                type="date"
                name="date"
                value={transactionForm.date}
                onChange={handleTransactionChange}
                required
              />
            </label>

            <label>
              Reference
              <input
                name="reference"
                placeholder="e.g., Daily feeding"
                value={transactionForm.reference}
                onChange={handleTransactionChange}
              />
            </label>

            <label className="form-wide">
              Notes
              <input
                name="notes"
                placeholder="Optional transaction notes"
                value={transactionForm.notes}
                onChange={handleTransactionChange}
              />
            </label>

            <button
              className="form-wide"
              type="submit"
              disabled={creatingTransaction}
            >
              {creatingTransaction
                ? "Saving transaction..."
                : "Save stock transaction"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default InventoryPage;