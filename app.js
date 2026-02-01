const denominations = [50,20,10,5,2,1,0.5,0.2,0.1,0.05];
const floatTarget = {20:10,10:20,5:20,2:25,1:20,0.5:20,0.2:20,0.1:15,0.05:15};

function getSafe(){
  return JSON.parse(localStorage.getItem("safe") || JSON.stringify({
    20:10,10:20,5:20,2:50,1:40,0.5:40,0.2:40,0.1:100,0.05:100
  }));
}
function saveSafe(s){ localStorage.setItem("safe", JSON.stringify(s)); }

const cashInputsDiv = document.getElementById("cash-inputs");
denominations.forEach(d=>{
  cashInputsDiv.innerHTML += `$${d} x <input type="number" id="d${d}" value="0"><br>`;
});

let lastShortage = {};

function calculateCash(){
  lastShortage = {};
  let msg = "<b>Float Adjustment</b><br>";

  for(let d in floatTarget){
    let cur = Number(document.getElementById(`d${d}`).value);
    let need = floatTarget[d] - cur;
    if(need>0){
      lastShortage[d]=need;
      msg += `<span class='warn'>$${d} 부족 ${need}개 → SAFE 사용</span><br>`;
    }
  }
  document.getElementById("cash-result").innerHTML = msg;
}

function finalizeDay(){
  let safe = getSafe();
  let msg = "";

  for(let d in lastShortage){
    if(safe[d] >= lastShortage[d]){
      safe[d] -= lastShortage[d];
      msg += `$${d} ${lastShortage[d]}개 사용<br>`;
    } else {
      msg += `<span class='warn'>SAFE에 $${d} 부족</span><br>`;
    }
  }
  saveSafe(safe);
  renderSafe();

  document.getElementById("final-message").innerHTML =
    `<span class='success'>Saved</span><br>${msg}`;
}

function renderSafe(){
  let s = getSafe();
  safeStatus.innerHTML = Object.keys(s).map(d=>
    `$${d} : ${s[d]}개`
  ).join("<br>");
}

/* ===== Deposit ===== */

function getDeposits(){ return JSON.parse(localStorage.getItem("deposits")||"[]"); }
function saveDeposits(d){ localStorage.setItem("deposits", JSON.stringify(d)); renderDeposits(); }

function addDeposit(){
  let d = getDeposits();
  d.push({
    name:depName.value,
    date:depDate.value,
    pax:depPax.value,
    amount:depAmount.value,
    memo:depMemo.value,
    status:"Pending",
    handledBy:"",
    method:""
  });
  saveDeposits(d);
}

function handleDeposit(i,method){
  let d = getDeposits();
  d[i].status="Done";
  d[i].method=method;
  d[i].handledBy=document.getElementById("cashier").value;
  saveDeposits(d);
}

function renderDeposits(){
  depositList.innerHTML = getDeposits().map((x,i)=>`
    <div class="deposit">
      <b>${x.name}</b> | ${x.date} | $${x.amount} | ${x.status}<br>
      <span class="small">${x.memo}</span><br>
      ${x.status==="Pending" ? `
        <button onclick="handleDeposit(${i},'Refund')">Refund</button>
        <button onclick="handleDeposit(${i},'Deduct')">Deduct from Bill</button>
      ` : `
        <span class="small">Handled: ${x.method} by ${x.handledBy}</span>
      `}
    </div>
  `).join("");
}

/* ===== Refund ===== */

function getRefunds(){ return JSON.parse(localStorage.getItem("refunds")||"[]"); }
function saveRefunds(r){ localStorage.setItem("refunds", JSON.stringify(r)); renderRefunds(); }

function addRefund(){
  let r = getRefunds();
  r.push({
    date:refDate.value,
    order:refOrder.value,
    amount:refAmount.value,
    reason:refReason.value,
    staff:document.getElementById("cashier").value
  });
  saveRefunds(r);
}

function renderRefunds(){
  refundList.innerHTML = getRefunds().map(x=>`
    ${x.date} | ${x.order} | $${x.amount} | ${x.reason} | ${x.staff}<br>
  `).join("");
}

renderSafe();
renderDeposits();
renderRefunds();
