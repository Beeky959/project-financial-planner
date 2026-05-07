const TAX_RATE = 0.15;

// Planner inputs
const hourlyWageInput = document.getElementById("hourlyWage");
const hoursPerWeekInput = document.getElementById("hoursPerWeek");
const targetSavingsInput = document.getElementById("targetSavings");
const goalMonthsInput = document.getElementById("goalMonths");
const totalDebtInput = document.getElementById("totalDebt");
const debtMonthsInput = document.getElementById("debtMonths");

// Expense inputs
const rentInput = document.getElementById("rent");
const groceriesInput = document.getElementById("groceries");
const utilitiesInput = document.getElementById("utilities");
const transportInput = document.getElementById("transport");
const phoneInternetInput = document.getElementById("phoneInternet");
const otherExpensesInput = document.getElementById("otherExpenses");

// Buttons
const calculateBtn = document.getElementById("calculateBtn");
const checkAffordBtn = document.getElementById("checkAffordBtn");
const monthlyViewBtn = document.getElementById("monthlyViewBtn");
const yearlyViewBtn = document.getElementById("yearlyViewBtn");
const resetBtn = document.getElementById("resetBtn");

// Results
const grossIncomeEl = document.getElementById("grossIncome");
const taxAmountEl = document.getElementById("taxAmount");
const netIncomeEl = document.getElementById("netIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const leftAmountEl = document.getElementById("leftAmount");
const savingsNeededEl = document.getElementById("savingsNeeded");
const debtPaymentEl = document.getElementById("debtPayment");
const statusTextEl = document.getElementById("statusText");
const smartAdviceEl = document.getElementById("smartAdvice");

// Dynamic labels
const resultsHeadingEl = document.getElementById("resultsHeading");
const spendingHeadingEl = document.getElementById("spendingHeading");
const affordHeadingEl = document.getElementById("affordHeading");
const grossLabelEl = document.getElementById("grossLabel");
const taxLabelEl = document.getElementById("taxLabel");
const netLabelEl = document.getElementById("netLabel");
const expensesLabelEl = document.getElementById("expensesLabel");
const leftLabelEl = document.getElementById("leftLabel");
const savingsLabelEl = document.getElementById("savingsLabel");
const debtLabelEl = document.getElementById("debtLabel");
const itemPriceLabelEl = document.getElementById("itemPriceLabel");

// Affordability checker
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");
const affordMessageEl = document.getElementById("affordMessage");

// Expense guidance config
const expenseGuidance = {
  rent: {
    input: rentInput,
    suggestion: document.getElementById("rentSuggestion"),
    health: document.getElementById("rentHealth"),
    lowPct: 0.3,
    highPct: 0.4
  },
  groceries: {
    input: groceriesInput,
    suggestion: document.getElementById("groceriesSuggestion"),
    health: document.getElementById("groceriesHealth"),
    lowPct: 0.1,
    highPct: 0.15
  },
  utilities: {
    input: utilitiesInput,
    suggestion: document.getElementById("utilitiesSuggestion"),
    health: document.getElementById("utilitiesHealth"),
    lowPct: 0.05,
    highPct: 0.1
  },
  transport: {
    input: transportInput,
    suggestion: document.getElementById("transportSuggestion"),
    health: document.getElementById("transportHealth"),
    lowPct: 0.05,
    highPct: 0.1
  },
  phoneInternet: {
    input: phoneInternetInput,
    suggestion: document.getElementById("phoneInternetSuggestion"),
    health: document.getElementById("phoneInternetHealth"),
    lowPct: 0.03,
    highPct: 0.06
  },
  otherExpenses: {
    input: otherExpensesInput,
    suggestion: document.getElementById("otherExpensesSuggestion"),
    health: document.getElementById("otherExpensesHealth"),
    lowPct: 0,
    highPct: 0.12
  }
};

let currentLeft = 0;
let currentView = "monthly";

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isBlank(value) {
  return String(value).trim() === "";
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function getViewMultiplier() {
  return currentView === "yearly" ? 12 : 1;
}

function getMonthlyNetIncomeFromInputs() {
  const grossIncome = toNumber(hourlyWageInput.value) * toNumber(hoursPerWeekInput.value) * 4;
  const tax = grossIncome * TAX_RATE;
  return grossIncome - tax;
}

function setHealthState(element, text, state) {
  element.textContent = text;
  element.classList.remove("is-good", "is-warning", "is-danger");

  if (state) {
    element.classList.add(state);
  }
}

function renderViewToggle() {
  monthlyViewBtn.classList.toggle("is-active", currentView === "monthly");
  yearlyViewBtn.classList.toggle("is-active", currentView === "yearly");
}

function renderViewLabels() {
  const isYearly = currentView === "yearly";

  resultsHeadingEl.textContent = isYearly ? "Yearly Results" : "Monthly Results";
  spendingHeadingEl.textContent = isYearly ? "Yearly Living Expenses" : "Monthly Living Expenses";
  affordHeadingEl.textContent = isYearly ? "Can I Afford This This Year?" : "Can I Afford This This Month?";

  grossLabelEl.textContent = isYearly ? "Gross Income per Year" : "Gross Income per Month";
  taxLabelEl.textContent = isYearly ? "Tax per Year" : "Tax per Month";
  netLabelEl.textContent = isYearly ? "Net Income per Year" : "Net Income per Month";
  expensesLabelEl.textContent = isYearly ? "Total Expenses per Year" : "Total Expenses per Month";
  leftLabelEl.textContent = isYearly ? "Left per Year" : "Left per Month";
  savingsLabelEl.textContent = isYearly ? "Yearly Savings Needed" : "Monthly Savings Needed";
  debtLabelEl.textContent = isYearly ? "Yearly Debt Payment" : "Monthly Debt Payment";
  itemPriceLabelEl.textContent = isYearly ? "Price this year ($)" : "Price this month ($)";
}

function renderExpenseGuidance(netIncome) {
  const multiplier = getViewMultiplier();

  Object.values(expenseGuidance).forEach((category) => {
    const rawValue = category.input.value;
    const monthlyValue = toNumber(rawValue);

    if (isBlank(rawValue) || monthlyValue <= 0) {
      if (category === expenseGuidance.otherExpenses) {
        category.suggestion.textContent = currentView === "yearly"
          ? "Suggested: discretionary spending based on your yearly income."
          : "Suggested: discretionary spending based on your monthly income.";
      } else if (netIncome > 0) {
        const low = netIncome * category.lowPct * multiplier;
        const high = netIncome * category.highPct * multiplier;
        category.suggestion.textContent = `Suggested: ${formatCurrency(low)}-${formatCurrency(high)} / ${currentView === "yearly" ? "year" : "month"}`;
      } else {
        category.suggestion.textContent = "Suggested: add income and calculate first.";
      }

      setHealthState(category.health, "Enter your real expense", "");
      return;
    }

    if (netIncome <= 0) {
      category.suggestion.textContent = "Suggested: add income and calculate first.";
      setHealthState(category.health, "Enter your real expense", "");
      return;
    }

    const displayValue = monthlyValue * multiplier;
    const suggestedLow = netIncome * category.lowPct * multiplier;
    const suggestedHigh = netIncome * category.highPct * multiplier;
    const labelUnit = currentView === "yearly" ? "year" : "month";

    if (category === expenseGuidance.otherExpenses) {
      category.suggestion.textContent = `Suggested: keep discretionary spending near or below ${formatCurrency(suggestedHigh)} / ${labelUnit}`;

      if (displayValue <= suggestedHigh) {
        setHealthState(category.health, "Within range", "is-good");
      } else if (displayValue <= suggestedHigh * 1.2) {
        setHealthState(category.health, "A bit high", "is-warning");
      } else {
        setHealthState(category.health, "Too high for your income", "is-danger");
      }

      return;
    }

    category.suggestion.textContent = `Suggested: ${formatCurrency(suggestedLow)}-${formatCurrency(suggestedHigh)} / ${labelUnit}`;

    if (displayValue >= suggestedLow && displayValue <= suggestedHigh) {
      setHealthState(category.health, "Within range", "is-good");
    } else if (displayValue > suggestedHigh && displayValue <= suggestedHigh * 1.15) {
      setHealthState(category.health, "A bit high", "is-warning");
    } else if (displayValue > suggestedHigh * 1.15) {
      setHealthState(category.health, "Too high for your income", "is-danger");
    } else {
      setHealthState(category.health, "Within range", "is-good");
    }
  });
}

function renderPlan(values) {
  const multiplier = getViewMultiplier();
  const displayLeft = values.left * multiplier;

  currentLeft = displayLeft;

  grossIncomeEl.textContent = formatCurrency(values.grossIncome * multiplier);
  taxAmountEl.textContent = formatCurrency(values.tax * multiplier);
  netIncomeEl.textContent = formatCurrency(values.netIncome * multiplier);
  totalExpensesEl.textContent = formatCurrency(values.totalExpenses * multiplier);
  leftAmountEl.textContent = formatCurrency(displayLeft);
  savingsNeededEl.textContent = formatCurrency(values.savingsNeeded * multiplier);
  debtPaymentEl.textContent = formatCurrency(values.debtPayment * multiplier);

  statusTextEl.classList.remove("status-positive", "status-negative");
  if (values.totalExpenses > values.netIncome) {
    statusTextEl.textContent = "You cannot afford your current lifestyle based on your income.";
    statusTextEl.classList.add("status-negative");
  } else if (values.left >= 0) {
    statusTextEl.textContent = "Plan is achievable";
    statusTextEl.classList.add("status-positive");
  } else {
    statusTextEl.textContent = "Plan NOT realistic";
    statusTextEl.classList.add("status-negative");
  }

  renderExpenseGuidance(values.netIncome);
}

function buildAdvice(values) {
  const monthlyShortfall = Math.abs(values.left);
  const extraHoursPerWeek = values.hourlyWage > 0 ? monthlyShortfall / (values.hourlyWage * 4) : 0;
  const availableAfterLifestyle = values.netIncome - values.totalExpenses;
  const longerTimelineMonths = availableAfterLifestyle > values.debtPayment && values.targetSavings > 0
    ? Math.ceil(values.targetSavings / Math.max(availableAfterLifestyle - values.debtPayment, 1))
    : 0;
  const reducedSavingsGoal = values.goalMonths > 0
    ? Math.max((availableAfterLifestyle - values.debtPayment) * values.goalMonths, 0)
    : 0;

  if (values.totalExpenses > values.netIncome) {
    return "<p>Your current lifestyle costs more than your income can support.</p><p>Reduce monthly living expenses first. After your basic lifestyle fits inside net income, revisit savings and debt goals.</p>";
  }

  if (values.left < 0) {
    let advice = `<p>Your lifestyle is affordable, but your goals are too aggressive by ${formatCurrency(monthlyShortfall)} per month.</p>`;

    if (values.hourlyWage > 0) {
      advice += `<p>At your current hourly wage, about ${extraHoursPerWeek.toFixed(1)} extra work hours per week would close that gap.</p>`;
    } else {
      advice += "<p>Add your hourly wage to estimate how many extra hours of work would close the gap.</p>";
    }

    if (longerTimelineMonths > 0 && values.goalMonths > 0 && longerTimelineMonths > values.goalMonths) {
      advice += `<p>Consider extending your savings timeline from ${values.goalMonths} months to about ${longerTimelineMonths} months.</p>`;
    } else if (values.goalMonths > 0) {
      advice += "<p>Consider giving the savings goal more time so the monthly target comes down.</p>";
    }

    if (values.goalMonths > 0) {
      advice += `<p>For the current timeline, a more realistic savings goal would be about ${formatCurrency(reducedSavingsGoal)} total.</p>`;
    }

    return advice;
  }

  if (values.left <= 200) {
    return "<p>Your plan is possible, but it is tight. Keep a small buffer for surprise expenses before increasing optional spending.</p>";
  }

  if (values.left <= 800) {
    return "<p>Your plan looks healthy. Your living expenses are supportable, and you still have room for balanced saving and spending.</p>";
  }

  return "<p>You have a strong monthly surplus. Consider increasing savings, building a larger emergency fund, or paying debt off faster.</p>";
}

function resetResults() {
  currentLeft = 0;

  grossIncomeEl.textContent = "$0.00";
  taxAmountEl.textContent = "$0.00";
  netIncomeEl.textContent = "$0.00";
  totalExpensesEl.textContent = "$0.00";
  leftAmountEl.textContent = "$0.00";
  savingsNeededEl.textContent = "$0.00";
  debtPaymentEl.textContent = "$0.00";

  statusTextEl.textContent = "Waiting for calculation";
  statusTextEl.classList.remove("status-positive", "status-negative");
  smartAdviceEl.innerHTML = "Enter your numbers and click calculate to get advice.";

  renderExpenseGuidance(getMonthlyNetIncomeFromInputs());

  affordMessageEl.textContent = "Enter an item and price to check.";
  affordMessageEl.classList.remove("afford-success", "afford-danger");
}

function calculatePlan() {
  const hourlyWage = toNumber(hourlyWageInput.value);
  const hoursPerWeek = toNumber(hoursPerWeekInput.value);
  const targetSavings = toNumber(targetSavingsInput.value);
  const goalMonths = toNumber(goalMonthsInput.value);
  const totalDebt = toNumber(totalDebtInput.value);
  const debtMonths = toNumber(debtMonthsInput.value);

  const rent = toNumber(rentInput.value);
  const groceries = toNumber(groceriesInput.value);
  const utilities = toNumber(utilitiesInput.value);
  const transport = toNumber(transportInput.value);
  const phoneInternet = toNumber(phoneInternetInput.value);
  const otherExpenses = toNumber(otherExpensesInput.value);

  const grossIncome = hourlyWage * hoursPerWeek * 4;
  const tax = grossIncome * TAX_RATE;
  const netIncome = grossIncome - tax;
  const totalExpenses = rent + groceries + utilities + transport + phoneInternet + otherExpenses;
  const savingsNeeded = goalMonths > 0 ? targetSavings / goalMonths : 0;
  const debtPayment = debtMonths > 0 ? totalDebt / debtMonths : 0;
  const left = netIncome - totalExpenses - savingsNeeded - debtPayment;

  const values = {
    hourlyWage,
    targetSavings,
    goalMonths,
    grossIncome,
    tax,
    netIncome,
    totalExpenses,
    savingsNeeded,
    debtPayment,
    left
  };

  renderPlan(values);
  smartAdviceEl.innerHTML = buildAdvice(values);

  affordMessageEl.textContent = "Enter an item and price to check.";
  affordMessageEl.classList.remove("afford-success", "afford-danger");
}

function resetPlanner() {
  hourlyWageInput.value = "";
  hoursPerWeekInput.value = "";
  targetSavingsInput.value = "";
  goalMonthsInput.value = "";
  totalDebtInput.value = "";
  debtMonthsInput.value = "";
  rentInput.value = "";
  groceriesInput.value = "";
  utilitiesInput.value = "";
  transportInput.value = "";
  phoneInternetInput.value = "";
  otherExpensesInput.value = "";
  itemNameInput.value = "";
  itemPriceInput.value = "";

  resetResults();
}

function checkAffordability() {
  const itemName = itemNameInput.value.trim() || "This item";
  const itemPrice = toNumber(itemPriceInput.value);

  affordMessageEl.classList.remove("afford-success", "afford-danger");

  if (itemPrice <= currentLeft) {
    affordMessageEl.textContent = `${itemName}: You can afford this`;
    affordMessageEl.classList.add("afford-success");
  } else {
    affordMessageEl.textContent = `${itemName}: This breaks your plan`;
    affordMessageEl.classList.add("afford-danger");
  }
}

function handleExpenseInputsChanged() {
  renderExpenseGuidance(getMonthlyNetIncomeFromInputs());
}

calculateBtn.addEventListener("click", calculatePlan);
checkAffordBtn.addEventListener("click", checkAffordability);
resetBtn.addEventListener("click", resetPlanner);

monthlyViewBtn.addEventListener("click", () => {
  currentView = "monthly";
  renderViewToggle();
  renderViewLabels();
  renderExpenseGuidance(getMonthlyNetIncomeFromInputs());
});

yearlyViewBtn.addEventListener("click", () => {
  currentView = "yearly";
  renderViewToggle();
  renderViewLabels();
  renderExpenseGuidance(getMonthlyNetIncomeFromInputs());
});

[
  hourlyWageInput,
  hoursPerWeekInput,
  rentInput,
  groceriesInput,
  utilitiesInput,
  transportInput,
  phoneInternetInput,
  otherExpensesInput
].forEach((input) => {
  input.addEventListener("input", handleExpenseInputsChanged);
});

itemPriceInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkAffordability();
  }
});

renderViewToggle();
renderViewLabels();
resetResults();
