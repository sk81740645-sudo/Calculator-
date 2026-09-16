const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function updateDisplay() {
  display.value = expression || "0";
}

function isOperator(char) {
  return ["+", "-", "*", "/", "%"].includes(char);
}

function appendValue(value) {
  if (justCalculated && !isOperator(value)) {
    expression = "";
    history.textContent = "";
  }
  justCalculated = false;

  if (value === ".") {
    const current = expression.split(/[+\-*/%]/).pop();
    if (current.includes(".")) return;
    if (!current) value = "0.";
  }

  if (isOperator(value)) {
    if (!expression && value !== "-") return;
    if (isOperator(expression.slice(-1))) {
      expression = expression.slice(0, -1) + value;
      updateDisplay();
      return;
    }
  }

  expression += value;
  updateDisplay();
}

function clearAll() {
  expression = "";
  history.textContent = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (!expression) return;

  let safeExpression = expression;
  if (isOperator(safeExpression.slice(-1))) {
    safeExpression = safeExpression.slice(0, -1);
  }

  try {
    // Convert percentage to decimal percentage.
    safeExpression = safeExpression.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Evaluate only calculator-generated arithmetic expressions.
    if (!/^[0-9+\-*/().\s]+$/.test(safeExpression)) {
      throw new Error("Invalid expression");
    }

    const result = Function('"use strict"; return (' + safeExpression + ')')();

    if (!Number.isFinite(result)) throw new Error("Math error");

    history.textContent = expression + " =";
    expression = String(Number(result.toFixed(10)));
    justCalculated = true;
    updateDisplay();
  } catch {
    display.value = "Error";
    expression = "";
    setTimeout(updateDisplay, 900);
  }
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value !== undefined) appendValue(value);
  if (action === "clear") clearAll();
  if (action === "delete") deleteLast();
  if (action === "calculate") calculate();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  }
});

updateDisplay();
