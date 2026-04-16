let data = JSON.parse(localStorage.getItem('tx') || '[]');
let editId = null;

function save(){
  localStorage.setItem('tx', JSON.stringify(data));
  render();
}

function addTx(){

  let t = text.value.trim();
  let a = +amount.value;
  let d = date.value || new Date().toISOString().slice(0,10);

  if(!t || !a){
    alert("Fill all fields");
    return;
  }

  if(editId){
    data = data.map(x =>
      x.id === editId
        ? {...x, text:t, amount:a, type:type.value, cat:cat.value, date:d}
        : x
    );
    editId = null;
  } else {
    data.push({
      id: Date.now(),
      text:t,
      amount:a,
      type:type.value,
      cat:cat.value,
      date:d
    });
  }

  text.value='';
  amount.value='';
  save();
}

function editTx(id){
  let item = data.find(x => x.id === id);

  text.value = item.text;
  amount.value = item.amount;
  type.value = item.type;
  cat.value = item.cat;
  date.value = item.date;

  editId = id;
}

function del(id){
  if(confirm("Delete this transaction?")){
    data = data.filter(x => x.id !== id);
    save();
  }
}

function clearAll(){
  if(confirm("Delete ALL data?")){
    data = [];
    save();
  }
}

function render(){

  let q = search.value.toLowerCase();
  let catF = filterCat.value;

  let rows = data.filter(x =>
    (x.text.toLowerCase().includes(q) || x.cat.toLowerCase().includes(q)) &&
    (!catF || x.cat === catF)
  );

  list.innerHTML = rows.map(x => `
    <tr>
      <td>${x.date}</td>
      <td>${x.text}</td>
      <td>${x.cat}</td>
      <td>${x.type}</td>
      <td>₹${x.amount}</td>
      <td>
        <button onclick="editTx(${x.id})">Edit</button>
        <button onclick="del(${x.id})">X</button>
      </td>
    </tr>
  `).join('');

  if(rows.length === 0){
    list.innerHTML = `<tr><td colspan="6">No transactions found</td></tr>`;
  }

  let incv=0, expv=0, month=0;
  let now = new Date();

  data.forEach(x=>{

    if(x.type === 'income') incv += x.amount;
    else expv += x.amount;

    let d = new Date(x.date);

    if(d.getMonth() === now.getMonth() &&
       d.getFullYear() === now.getFullYear()){
      month += x.type === 'income' ? x.amount : -x.amount;
    }
  });

  bal.textContent = incv - expv;
  inc.textContent = incv;
  exp.textContent = expv;
  mon.textContent = month;
}

function toggleDark(){
  document.body.classList.toggle('dark');
}

function downloadCSV(){

  let csv = "date,text,category,type,amount\n" +
    data.map(x =>
      `${x.date},${x.text},${x.cat},${x.type},${x.amount}`
    ).join('\n');

  let a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = "expenses.csv";
  a.click();
}

render();