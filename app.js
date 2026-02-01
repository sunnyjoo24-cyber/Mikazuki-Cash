const denominations = [50,20,10,5,2,1,0.5,0.2,0.1,0.05];

const floatTarget = {
  20:10, 10:20, 5:20, 2:25, 1:20,
  0.5:20, 0.2:20, 0.1:15, 0.05:15
};

const cashInputsDiv = document.getElementById("cash-inputs");

denominations.forEach(d => {
  cashInputsDiv.innerHTML += `
    <label>$${d} x <input type="number" id="d${d}" value="0" /></label><br/>
  `;
});

function calculateCash(){
  let total = 0;
  let message = "";

  denominations.forEach(d => {
    let count = Number(document.getElementById(`d${d}`).value);
    total += d * count;
  });

  message += `Total Cash: $${total.toFixed(2)}<br/><br/>`;

  message += `<b>Float Shortage / Excess:</b><br/>`;

  for (let d in floatTarget) {
    let current = Number(document.getElementById(`d${d}`).value);
    let need = floatTarget[d] - current;

    if (need > 0) {
      message += `$${d} 부족 ${need}개 → 금고에서 꺼내세요<br/>`;
    } else if (need < 0) {
      message += `$${d} 초과 ${-need}개<br/>`;
    }
  }

  document.getElementById("cash-result").innerHTML = message;
}

/* Booking Deposits */

function getDeposits(){
  return JSON.parse(localStorage.getItem("deposits") || "[]");
}

function saveDeposits(data){
  localStorage.setItem("deposits", JSON.stringify(data));
  renderDeposits();
}

function addDeposit(){
  let deposits = getDeposits();
  deposits.push({
    name: depName.value,
    date: depDate.value,
    pax: depPax.value,
    amount: depAmount.value,
    status: "Pending"
  });
  saveDeposits(deposits);
}

function renderDeposits(){
  let list = getDeposits();
  depositList.innerHTML = list.map((d,i)=>`
    <div>
      ${d.name} | ${d.date} | $${d.amount} | ${d.status}
      <button onclick="completeDeposit(${i})">Complete</button>
    </div>
  `).join("");
}

function completeDeposit(i){
  let list = getDeposits();
  list[i].status = "Completed";
  saveDeposits(list);
}

/* Refund Log */

function getRefunds(){
  return JSON.parse(localStorage.getItem("refunds") || "[]");
}

function saveRefunds(data){
  localStorage.setItem("refunds", JSON.stringify(data));
  renderRefunds();
}

function addRefund(){
  let refunds = getRefunds();
  refunds.push({
    date: refDate.value,
    order: refOrder.value,
    amount: refAmount.value,
    reason: refReason.value
  });
  saveRefunds(refunds);
}

function renderRefunds(){
  refundList.innerHTML = getRefunds().map(r=>`
    <div>${r.date} | ${r.order} | $${r.amount} | ${r.reason}</div>
  `).join("");
}

renderDeposits();
renderRefunds();
