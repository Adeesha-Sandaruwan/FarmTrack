import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import DashboardSidebar from "../components/DashboardSidebar";

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
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    value || 0
  );

const InventoryPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

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
          t("inventory.noItemsMatch", "Unable to load inventory records.")
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
      setMessage(t("common.success", "Inventory item created successfully."));
      await loadItems();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to create inventory item.")
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
      setMessage(
        t("common.success", "Stock transaction saved successfully.")
      );
      await loadItems();
    } catch (requestError) {
      setFormError(
        requestError.response?.data?.message ||
          t("common.error", "Unable to save stock transaction.")
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
          {user?.role === "admin" && (
         <Link to="/users">User Management</Link>
)}
          <Link to="/production-health">production-health</Link>
          <Link to="/finance">Finance & Analytics</Link>
        </nav>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <DashboardSidebar user={user} onLogout={handleLogout} />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{t("inventory.title", "Farm operations")}</p>
            <h1>{t("inventory.title", "Feed & Inventory")}</h1>
            <p>
              {t(
                "inventory.subtitle",
                "Track feed, medicine, vaccines, equipment, and supplies."
              )}
            </p>
          </div>

          <button className="refresh-button" type="button" onClick={loadItems}>
            {t("common.refresh", "Refresh data")}
          </button>
        </header>

        {pageError && <p className="error-message">{pageError}</p>}
        {formError && <p className="error-message">{formError}</p>}
        {message && <p className="success-message">{message}</p>}

        <section className="summary-grid">
          <article className="summary-card">
            <span>{t("inventory.totalItems", "Total inventory items")}</span>
            <strong>{summary.totalItems}</strong>
          </article>
          <article className="summary-card mortality-card">
            <span>{t("inventory.lowStockItems", "Low-stock alerts")}</span>
            <strong>{summary.lowStockItems}</strong>
          </article>
          <article className="summary-card">
            <span>{t("inventory.categoriesCount", "Feed item types")}</span>
            <strong>{summary.feedItems}</strong>
          </article>
          <article className="summary-card">
            <span>{t("inventory.currentStockCol", "Estimated stock value")}</span>
            <strong>Rs. {formatNumber(summary.totalStockValue)}</strong>
          </article>
        </section>

        {canManageInventory && (
          <section className="management-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t("inventory.addNewItem", "New item")}</p>
                <h2>{t("inventory.addItemModalTitle", "Add inventory item")}</h2>
              </div>
              <span className="role-note">
                {t("userManagement.managerRole", "Manager / Admin access")}
              </span>
            </div>

            <form className="flock-form" onSubmit={handleCreateItem}>
              <label>
                {t("inventory.itemNameLabel", "Item name")}
                <input
                  name="name"
                  placeholder={t(
                    "inventory.itemNamePlaceholder",
                    "e.g., Layer Mash Feed"
                  )}
                  value={itemForm.name}
                  onChange={handleItemChange}
                  required
                />
              </label>

              <label>
                {t("inventory.categoryLabel", "Category")}
                <select
                  name="category"
                  value={itemForm.category}
                  onChange={handleItemChange}
                >
                  <option value="feed">{t("common.feed", "Feed")}</option>
                  <option value="medicine">
                    {t("common.medication", "Medicine")}
                  </option>
                  <option value="vaccine">
                    {t("productionHealth.eventVaccination", "Vaccine")}
                  </option>
                  <option value="equipment">
                    {t("common.equipment", "Equipment")}
                  </option>
                  <option value="supplies">
                    {t("common.other", "Supplies")}
                  </option>
                </select>
              </label>

              <label>
                {t("inventory.unitLabel", "Unit")}
                <select
                  name="unit"
                  value={itemForm.unit}
                  onChange={handleItemChange}
                >
                  <option value="kg">{t("common.kg", "Kilograms (kg)")}</option>
                  <option value="g">Grams (g)</option>
                  <option value="litre">
                    {t("common.litres", "Litres")}
                  </option>
                  <option value="ml">Millilitres (ml)</option>
                  <option value="bag">{t("common.bags", "Bags")}</option>
                  <option value="bottle">
                    {t("common.bottles", "Bottles")}
                  </option>
                  <option value="dose">Doses</option>
                  <option value="piece">{t("common.units", "Pieces")}</option>
                  <option value="box">Boxes</option>
                </select>
              </label>

              <label>
                {t("inventory.quantityLabel", "Opening stock")}
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
                {t("inventory.minThresholdLabel", "Low-stock level")}
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
                {t("inventory.supplierLabel", "Supplier")}
                <input
                  name="supplier"
                  placeholder={t(
                    "inventory.supplierPlaceholder",
                    "e.g., Farm Supply Lanka"
                  )}
                  value={itemForm.supplier}
                  onChange={handleItemChange}
                />
              </label>

              <label>
                {t("common.date", "Expiry date")}
                <input
                  type="date"
                  name="expiryDate"
                  value={itemForm.expiryDate}
                  onChange={handleItemChange}
                />
              </label>

              <label className="form-wide">
                {t("inventory.notesLabel", "Notes")}
                <input
                  name="notes"
                  placeholder={t(
                    "inventory.notesPlaceholder",
                    "Optional inventory notes"
                  )}
                  value={itemForm.notes}
                  onChange={handleItemChange}
                />
              </label>

              <button
                className="form-wide"
                type="submit"
                disabled={creatingItem}
              >
                {creatingItem
                  ? t("inventory.addingItem", "Creating item...")
                  : t("inventory.addItemBtn", "Create inventory item")}
              </button>
            </form>
          </section>
        )}

        <section className="management-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t("inventory.title", "Current stock")}</p>
              <h2>
                {t("inventory.inventoryListTitle", "Inventory records")}
              </h2>
            </div>
            <span className="role-note">
              {items.length} {t("common.active", "active items")}
            </span>
          </div>

          {loading ? (
            <p className="loading-text">
              {t("common.loading", "Loading inventory records...")}
            </p>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>{t("inventory.noItemsMatch", "No inventory items yet")}</h3>
              <p>
                {t(
                  "inventory.addItemModalTitle",
                  "Add your first feed, medicine, vaccine, or supply item."
                )}
              </p>
            </div>
          ) : (
            <div className="flock-table-wrap">
              <table className="flock-table">
                <thead>
                  <tr>
                    <th>{t("inventory.itemNameCol", "Item")}</th>
                    <th>{t("inventory.categoryCol", "Category")}</th>
                    <th>{t("inventory.currentStockCol", "Current stock")}</th>
                    <th>{t("inventory.minAlertCol", "Low-stock level")}</th>
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
                          <span>
                            {item.supplier ||
                              t("common.noData", "No supplier recorded")}
                          </span>
                        </td>
                        <td>
                          <span className="capitalize">{item.category}</span>
                        </td>
                        <td>
                          <strong>
                            {formatNumber(item.currentStock)} {item.unit}
                          </strong>
                          {isLowStock && (
                            <span className="low-stock-text">
                              {t("common.lowStock", "Low stock")}
                            </span>
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
                            {t("inventory.adjustStock", "Record stock")}
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
              <p className="eyebrow">
                {t("dashboard.title", "Daily operation")}
              </p>
              <h2>
                {t("inventory.adjustStockModalTitle", "Record stock movement")}
              </h2>
            </div>
            <span className="role-note">
              {t("userManagement.workerRole", "Available to all farm users")}
            </span>
          </div>

          <form className="flock-form" onSubmit={handleCreateTransaction}>
            <label>
              {t("inventory.selectItemLabel", "Inventory item")}
              <select
                name="itemId"
                value={transactionForm.itemId}
                onChange={handleTransactionChange}
                required
              >
                <option value="">
                  {t("inventory.selectItemPlaceholder", "Select an item")}
                </option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} — {item.currentStock} {item.unit}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t("inventory.adjustmentTypeLabel", "Movement type")}
              <select
                name="transactionType"
                value={transactionForm.transactionType}
                onChange={handleTransactionChange}
              >
                <option value="usage">
                  {t("inventory.typeDeduct", "Usage")}
                </option>
                <option value="stock-in">
                  {t("inventory.typeAdd", "Stock received")}
                </option>
                <option value="adjustment">
                  {t("inventory.typeAudit", "Stock adjustment")}
                </option>
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
                <option value="decrease">Decrease (-)</option>
                <option value="increase">Increase (+)</option>
              </select>
            </label>

            <label>
              {t("inventory.adjustQuantityLabel", "Quantity")}
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
              {t("common.date", "Transaction date")}
              <input
                type="date"
                name="date"
                value={transactionForm.date}
                onChange={handleTransactionChange}
                required
              />
            </label>

            <label>
              {t("inventory.reasonLabel", "Reference")}
              <input
                name="reference"
                placeholder={t(
                  "inventory.reasonPlaceholder",
                  "e.g., Daily feeding"
                )}
                value={transactionForm.reference}
                onChange={handleTransactionChange}
              />
            </label>

            <label className="form-wide">
              {t("inventory.notesLabel", "Notes")}
              <input
                name="notes"
                placeholder={t(
                  "inventory.notesPlaceholder",
                  "Optional transaction notes"
                )}
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
                ? t("inventory.adjustingStock", "Saving transaction...")
                : t("inventory.adjustStockBtn", "Save stock transaction")}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default InventoryPage;