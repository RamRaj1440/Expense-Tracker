// =============================
//        DOM REFERENCES
// =============================
const form = document.getElementById("transaction-form");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transaction-list");
const formError = document.getElementById("form-error");
const filterCategory = document.getElementById("filter-category");

// optional: a single element with id "type" (e.g. select) OR radio inputs with name="type"
const typeInput = document.getElementById("type");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

// get submit button (assumes the form has a single submit button)
const submitBtn = form.querySelector('button[type="submit"]');

// We'll programmatically create a Cancel button for edit mode
let cancelBtn = document.createElement("button");
cancelBtn.type = "button";
cancelBtn.className = "cancel-edit-btn";
cancelBtn.textContent = "Cancel";
cancelBtn.style.display = "none";
cancelBtn.style.marginTop = "0.5rem";
submitBtn.insertAdjacentElement("afterend", cancelBtn);

// =============================
//      APPLICATION STATE
// =============================
let transactions = [];
let isEditing = false;
let editingId = null;

// =============================
//     LOCAL STORAGE HELPERS
// =============================
function saveToLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadFromLocalStorage() {
    const data = localStorage.getItem("transactions");
    return data ? JSON.parse(data) : [];
}

// =============================
//   GET TYPE FROM FORM (robust)
// =============================
function getTypeFromForm() {
    // If there is a select/input with id "type", use it
    if (typeInput) {
        return typeInput.value || "expense";
    }
    // Otherwise check radio inputs with name="type"
    const radio = document.querySelector('input[name="type"]:checked');
    if (radio) return radio.value;
    // Fallback: determine by amount sign (positive -> income)
    const amt = Number(amountInput.value || 0);
    return amt >= 0 ? "income" : "expense";
}

// =============================
//  UTILITY: current active filter
// =============================
function getActiveFilter() {
    return filterCategory ? filterCategory.value : "all";
}

// =============================
//       RENDER TRANSACTIONS
// =============================
function renderTransactions(filter = "all") {
    transactionList.innerHTML = ""; // Clear before re-render

    const filteredTxns =
        filter === "all"
            ? transactions
            : transactions.filter((txn) => txn.category === filter);

    if (!filteredTxns.length) {
        transactionList.innerHTML = `<li class="empty">No transactions yet.</li>`;
        return;
    }

    filteredTxns.forEach((txn) => {
        const li = document.createElement("li");
        li.classList.add(txn.type === "income" ? "income-item" : "expense-item");

        li.innerHTML = `
      <div class="txn-left">
        <strong>${escapeHtml(txn.text)}</strong> <br>
        <small>${escapeHtml(txn.category)}</small><br>
       <small class="timestamp">
  Created: ${escapeHtml(txn.createdAt || "")}
  ${txn.editedAt ? `<br><em>Edited: ${escapeHtml(txn.editedAt)}</em>` : ""}
</small>

      </div>

      <div class="txn-right">
        <span class="amount">${txn.amount >= 0 ? "+" : "-"}₹${Math.abs(txn.amount)}</span>

        <button class="edit-btn" data-id="${txn.id}" title="Edit transaction" aria-label="Edit transaction">Edit</button>

        <button class="delete-btn" data-id="${txn.id}" title="Delete transaction" aria-label="Delete transaction">
          Delete
        </button>
      </div>
    `;

        transactionList.appendChild(li);
    });
}

// Small helper to avoid XSS if text contains HTML
function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
// =============================
//  SIMPLE TOAST HELPER
// =============================

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// =============================
//       UPDATE SUMMARY
// =============================
function updateSummary() {
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const netBalance = totalIncome - totalExpenses;

    incomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
    expenseEl.textContent = `₹${totalExpenses.toFixed(2)}`;
    balanceEl.textContent = `₹${netBalance.toFixed(2)}`;
}

// =============================
//      FORM SUBMISSION
// =============================
form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.textContent = ""; // Clear previous errors

    const text = textInput.value.trim();
    const amountRaw = amountInput.value.trim();
    const category = categoryInput.value;
    const type = getTypeFromForm();

    // Validation
    if (!text) {
        formError.textContent = "Please enter a valid description.";
        return;
    }

    if (amountRaw === "" || isNaN(amountRaw)) {
        formError.textContent = "Please enter a valid number for the amount.";
        return;
    }

    if (!category) {
        formError.textContent = "Please select a category.";
        return;
    }

    const amount = Number(amountRaw);
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isEditing && editingId !== null) {
        // ----- UPDATE MODE -----
        const idx = transactions.findIndex((t) => t.id === editingId);
        if (idx !== -1) {
            transactions[idx].text = text;
            transactions[idx].amount = amount;
            transactions[idx].category = category;
            transactions[idx].type = type;
            transactions[idx].editedAt = now.toLocaleString(); // New timestamp
        }

        // exit edit mode
        isEditing = false;
        editingId = null;
        submitBtn.textContent = "Add Transaction";
        cancelBtn.style.display = "none";
    } else {
        // ----- ADD MODE -----
        const transaction = {
            id: Date.now(),
            text,
            amount,
            category,
            type,
            date,
            time,
        };

        transactions.push(transaction);
    }

    // persist & refresh UI for both add & update
    saveToLocalStorage();
    renderTransactions(getActiveFilter());
    updateSummary();
    form.reset();
    showToast(isEditing ? "Transaction updated!" : "Transaction added!");
});

// =============================
// DELEGATED CLICK HANDLER (edit + delete)
// =============================
transactionList.addEventListener("click", function (e) {
    // DELETE
    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute("data-id"));
        transactions = transactions.filter((t) => t.id !== id);
        saveToLocalStorage();
        renderTransactions(getActiveFilter());
        updateSummary();
        showToast("Transaction deleted.");

        // if we were editing the deleted transaction, abort edit mode
        if (isEditing && editingId === id) {
            isEditing = false;
            editingId = null;
            submitBtn.textContent = "Add Transaction";
            cancelBtn.style.display = "none";
            form.reset();
        }
        return;
    }

    // EDIT
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
        const id = Number(editBtn.getAttribute("data-id"));
        const txn = transactions.find((t) => t.id === id);
        if (!txn) return;

        // Populate form with txn data
        textInput.value = txn.text;
        amountInput.value = txn.amount;
        categoryInput.value = txn.category;

        // populate type if available
        if (typeInput) {
            typeInput.value = txn.type;
        } else {
            // set radio input if exists
            const radio = document.querySelector(`input[name="type"][value="${txn.type}"]`);
            if (radio) radio.checked = true;
        }

        // Enter edit mode
        isEditing = true;
        editingId = id;
        submitBtn.textContent = "Update Transaction";
        cancelBtn.style.display = "inline-block";

        // scroll the form into view (optional)
        form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
});

// =============================
//       CANCEL EDIT BUTTON
// =============================
cancelBtn.addEventListener("click", function () {
    isEditing = false;
    editingId = null;
    submitBtn.textContent = "Add Transaction";
    cancelBtn.style.display = "none";
    form.reset();
});

// =============================
//   FILTER CHANGE LISTENER
// =============================
if (filterCategory) {
    filterCategory.addEventListener("change", () => {
        renderTransactions(getActiveFilter());
    });
}

// =============================
//      INITIALIZE APP
// =============================
function init() {
    transactions = loadFromLocalStorage();

    // Optional demo seed if there is no saved data
    if (!transactions.length) {
        transactions = [
            {
                id: Date.now() + 1,
                text: "Demo Salary",
                amount: 5000,
                category: "Salary",
                type: "income",
                date: "11/20/2025",
                time: "2:30 PM",
            },
            {
                id: Date.now() + 2,
                text: "Demo Food",
                amount: -300,
                category: "Food",
                type: "expense",
                date: "11/20/2025",
                time: "2:30 PM",
            },
        ];
        saveToLocalStorage();
    }
    renderTransactions(getActiveFilter());
    updateSummary();
}

init();
