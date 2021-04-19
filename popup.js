const bg = chrome.extension.getBackgroundPage();

function init() {
  // 删除提交
  let deleteForm = document.getElementById('delete');
  deleteForm.addEventListener('submit', deleteSubmit)

  // 添加提交
  let addForm = document.getElementById('add');
  addForm.addEventListener('submit', addSubmit);

  // 删除选项
  reflash();
  let deleteSelect = document.getElementById('own');

  deleteSelect.addEventListener('change', deleteSelectChange);
  deleteSelectChange();

  // 默认前后缀
  let defaultForm = document.getElementById('default');
  let config = bg.getConfig();
  if (config && config.default) {
    defaultForm.prefix.value = config.default.prefix || '';
    defaultForm.suffix.value = config.default.suffix || '';
  }
  defaultForm.addEventListener('submit', defaultChange);

  // 处理某些选项的禁用
  let modeSelect = document.getElementById('add-mode');
  modeSelect.addEventListener('change', modeChange);

  let exactSelect = document.getElementById('add-exact');
  exactSelect.addEventListener('change', modeChange);
  modeChange();
}

// callback
function deleteSubmit(e) {
  e.preventDefault();
  let deleteSelect = document.getElementById('own');
  const index = deleteSelect.selectedIndex;

  let succ = bg.modifyConfigMap(index, 1);
  if (succ) {
    reflash();
    deleteSelectChange();
  } else {
    alert('修改失败');
  }
}
function addSubmit(e) {
  e.preventDefault();
  let formData = new FormData(e.target);

  let word = formData.get('word');
  let mode = formData.get('mode') || 'word';
  let exact = formData.get('exact') === 'true' ? true : false;
  let replace = formData.get('replace');
  let prefix = formData.get('prefix') || '';
  let suffix = formData.get('suffix') || '';
  let room = formData.get('room') || '';

  let c = {
    word,
    mode,
    exact,
    replace,
    prefix,
    suffix,
    room,
  }

  let succ = bg.modifyConfigMap(0, 0, c);
  if (succ) {
    reflash();
    deleteSelectChange();
  } else {
    alert('修改失败');
  }
}
function deleteSelectChange(e) {
  let deleteSelect = document.getElementById('own');
  const index = deleteSelect.selectedIndex;
  const selectOption = deleteSelect.options[index];

  let ownText = document.getElementById('own-text');
  ownText.innerHTML = selectOption.dataset.option.split('\n').map(w => {
    if (!w) return '';
    return `<p class="option-str">${w}</p>`
  }).filter(w => w).join('');
}
function defaultChange(e) {
  let defaultForm = e.target;
  let succ = bg.modifyConfigDefault(defaultForm.prefix.value, defaultForm.suffix.value);
  if (!succ) {
    alert('修改失败');
  }
}
function modeChange(e) {
  let exactSelect = document.getElementById('add-exact');
  let modeSelect = document.getElementById('add-mode');
  let prefixInput = document.getElementById('add-prefix');
  let suffixInput = document.getElementById('add-suffix');
  let exactValue = exactSelect.options[exactSelect.selectedIndex].value;
  let modeValue = modeSelect.options[modeSelect.selectedIndex].value;
  if (modeValue === 'word') {
    exactSelect.disabled = false;
  } else {
    exactSelect.disabled = true;
  }
  
  if (exactValue === 'true' && modeValue === 'word') {
    prefixInput.disabled = true;
    suffixInput.disabled = true;
  } else {
    prefixInput.disabled = false;
    suffixInput.disabled = false;
  }
}
//

function reflash() {
  let own = document.getElementById('own');
  let config = bg.getConfig();

  let options = [];
  if (config && config.map) {
    options = config.map.map((word, index) => {
      const isWord = word.mode === 'word';
      const isExact = word.exact === true ? '是' : '否';
      const mode = word.mode === 'word' ? '词'
        : word.mode === 'reg' ? '正则表达式'
          : 'eval'
      const optionStr = `
        词：${word.word}
        模式：${mode}
        ${isWord ? '精确匹配：' + isExact : ''}
        替换词：${word.replace}
        前缀：${word.prefix}
        后缀：${word.suffix}
        房间号：${word.room}
      `
      return `<option value="${index}"
                data-option="${optionStr}"
                label="${word.word} => ${word.replace}">"
                ${word.word} => ${word.replace}
              </option>`
    })
  }
  own.innerHTML = options.join('');
}

init();