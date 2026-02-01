const denominations = [50,20,10,5,2,1,0.5,0.2,0.1,0.05];

const floatTarget = {
  20:10, 10:20, 5:20, 2:25, 1:20,
  0.5:20, 0.2:20, 0.1:15, 0.05:15
};

// 🔐 SAFE 초기값
function getSafe(){
  return JSON.parse(localStorage.getItem("safe") || JSON.stringify({
    20:10,10:20,5:20,2:50,1:40,0.5:40,0.2:40,0.1:100,0.05:100
  }));
}

function saveSafe(data){
  localStorage.setItem("safe", JSON.stringify(data));
}

const cashInputsDiv = document.getElementById("cash-inputs");

denominations.forEach(d => {
  cashInputsDiv.innerHTML += `
    <label>$${d} x <input type="number" id="d${d}" value="0" /></label><br/>
  `;
});

let lastShortage = {};

function calculateCash(){
  let total = 0;
  let message = "";
  lastShortage = {};

  denominations.forEach(d => {
    let count = Number(document.getElementById(`d${d}`).value);
    total += d * count;
  });

  message += `Total Cash: $${total.toFixed(2)}<br/><br/>`;
  message += `<b>Float Adjustment:</b><br/>`;

  for (let d in floatTarget) {
    let current = Number(document.getElementById(`d${d}`).value);
    let need = floatTarget[d] - current;

    if (need > 0) {
      lastShortage[d] = need;
      message += `<span class='warn'>$${d} 부족 ${need}개 → 금고 사용</span><br/>`;
    }
  }

  document.getElementById("cash-result").innerHTML = message;
}

function finalizeDay(){
  let safe = getSafe();
  let msg = "";

  for (let d in lastShortage){
    if(safe[d] >= lastShortage[d]){
      safe[d] -= lastShortage[d];
      msg += `$${d} ${lastShortage[d]}개 금고에서 사용<br/>`;
    } else {
      msg += `<span class='warn'>❗금고에 $${d} 부족</span><br/>`;
    }
  }

  saveSafe(safe);

  // 하루 기록 저장
  let logs = JSON.parse(localStorage.getItem("cashLogs") || "[]");

  logs.push({
    date: new Date().toLocaleDateString(),
    cashier: document.getElementById("cashier").value,
    shortages: lastShortage
  });

  localStorage.setItem("cashLogs", JSON.stringify(logs));

  document.getElementById("final-message").innerHTML =
    `<span class='success'>Day Saved ✅</span><br/>${msg}`;
}

/* Deposit & Refund 기존 유지 */
function getDeposits(){ return JSON.parse(localStorage.getItem("deposits") || "[]"); }
function saveDeposits(d){ localStorage.setItem("deposits", JSON.stringify(d)); renderDeposits(); }
function addDeposit(){
  let d = getDeposits();
  d.push({name:depName.value,date:depDate.value,pax:depPax.value,amount:depAmount.value,status:"Pending"});
  saveDeposits(d);
}
function renderDeposits(){
  depositList.innerHTML = getDeposits().map((d,i)=>`
  <div>${d.name} | ${d.date} | $${d.amount} | ${d.status}
  <button onclick="completeDeposit(${i})">Complete</button></div>`).join("");
}
function completeDeposit(i){
  let d = getDeposits(); d[i].status="Done"; saveDeposits(d);
}

function getRefunds(){ return JSON.parse(localStorage.getItem("refunds") || "[]"); }
function saveRefunds(r){ localStorage.setItem("refunds", JSON.stringify(r)); renderRefunds(); }
function addRefund(){
  let r = getRefunds();
  r.push({date:refDate.value,order:refOrder.value,amount:refAmount.value,reason:refReason.value});
  saveRefunds(r);
}
function renderRefunds(){
  refundList.innerHTML = getRefunds().map(r=>`
  <div>${r.date} | ${r.order} | $${r.amount} | ${r.reason}</div>`).join("");
}

renderDeposits();
renderRefunds();

