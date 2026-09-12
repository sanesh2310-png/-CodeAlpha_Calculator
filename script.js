(function(){
  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');

  let current = '0';
  let previous = null;
  let operator = null;
  let justEvaluated = false;

  const opMap = { '÷':'/', '×':'*', '−':'-', '+':'+' };

  function formatNumber(numStr){
    if (numStr === 'Error') return numStr;
    const [intPart, decPart] = numStr.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart !== undefined ? withCommas + '.' + decPart : withCommas;
  }

  function updateScreen(){
    resultEl.textContent = formatNumber(current);
    if (operator && previous !== null){
      expressionEl.textContent = formatNumber(previous) + ' ' + operator;
    } else {
      expressionEl.innerHTML = '&nbsp;';
    }
  }

  function inputDigit(d){
    if (justEvaluated){
      current = d;
      justEvaluated = false;
      return;
    }
    if (current === '0') current = d;
    else if (current.length < 15) current += d;
  }

  function inputDecimal(){
    if (justEvaluated){
      current = '0.';
      justEvaluated = false;
      return;
    }
    if (!current.includes('.')) current += '.';
  }

  function clearAll(){
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
  }

  function backspace(){
    if (justEvaluated) return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
  }

  function percent(){
    const val = parseFloat(current);
    if (isNaN(val)) return;
    current = String(val / 100);
  }

  function chooseOperator(op){
    if (operator !== null && previous !== null && !justEvaluated){
      evaluate();
    }
    previous = current;
    operator = op;
    current = '0';
    justEvaluated = false;
    highlightOperator(op);
  }

  function highlightOperator(op){
    document.querySelectorAll('.op').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.op === op);
    });
  }

  function evaluate(){
    if (operator === null || previous === null) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let res;
    switch (opMap[operator]){
      case '+': res = a + b; break;
      case '-': res = a - b; break;
      case '*': res = a * b; break;
      case '/': res = b === 0 ? NaN : a / b; break;
      default: return;
    }
    current = isNaN(res) ? 'Error' : String(Math.round(res * 1e10) / 1e10);
    previous = null;
    operator = null;
    justEvaluated = true;
    highlightOperator(null);
  }

  function pressAnim(btn){
    if (!btn) return;
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 90);
  }

  document.querySelector('.pad').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    pressAnim(btn);
    const action = btn.dataset.action;

    if (action === 'number') inputDigit(btn.dataset.num);
    else if (action === 'decimal') inputDecimal();
    else if (action === 'clear') clearAll();
    else if (action === 'backspace') backspace();
    else if (action === 'percent') percent();
    else if (action === 'operator') chooseOperator(btn.dataset.op);
    else if (action === 'equals') evaluate();

    updateScreen();
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key;
    let btn = null;

    if (/^[0-9]$/.test(key)){
      inputDigit(key);
      btn = document.querySelector(`[data-num="${key}"]`);
    } else if (key === '.'){
      inputDecimal();
      btn = document.querySelector('[data-action="decimal"]');
    } else if (key === '+' || key === '-' || key === '*' || key === '/'){
      const opSymbol = Object.keys(opMap).find(k => opMap[k] === key);
      chooseOperator(opSymbol);
      btn = document.querySelector(`[data-op="${opSymbol}"]`);
    } else if (key === 'Enter' || key === '='){
      e.preventDefault();
      evaluate();
      btn = document.querySelector('[data-action="equals"]');
    } else if (key === 'Backspace'){
      backspace();
      btn = document.querySelector('[data-action="backspace"]');
    } else if (key === 'Escape'){
      clearAll();
      btn = document.querySelector('[data-action="clear"]');
    } else if (key === '%'){
      percent();
      btn = document.querySelector('[data-action="percent"]');
    } else {
      return;
    }

    pressAnim(btn);
    updateScreen();
  });

  updateScreen();
})();
