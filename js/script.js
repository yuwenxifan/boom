// 全局变量
let currentWires = [];
let buttonState = {
    color: null,
    text: null,
    indicator: null,
    batteries: null
};

// 记忆模块功能
let memoryState = {
    currentStage: 1,
    displayNumber: null,
    history: [],
    stage1Data: { position: null, number: null },
    stage2Data: { position: null, number: null },
    stage3Data: { position: null, number: null },
    stage4Data: { position: null, number: null },
    buttonOrder: [1, 2, 3, 4] // 默认按钮顺序
};

// 摩斯电码模块单词及频率
const morseWords = [
    { word: 'shell', freq: '3.505 MHz' },
    { word: 'halls', freq: '3.515 MHz' },
    { word: 'slick', freq: '3.522 MHz' },
    { word: 'trick', freq: '3.532 MHz' },
    { word: 'boxes', freq: '3.535 MHz' },
    { word: 'leaks', freq: '3.542 MHz' },
    { word: 'strobe', freq: '3.545 MHz' },
    { word: 'bistro', freq: '3.552 MHz' },
    { word: 'flick', freq: '3.555 MHz' },
    { word: 'bombs', freq: '3.565 MHz' },
    { word: 'break', freq: '3.572 MHz' },
    { word: 'brick', freq: '3.575 MHz' },
    { word: 'steak', freq: '3.582 MHz' },
    { word: 'sting', freq: '3.592 MHz' },
    { word: 'vector', freq: '3.595 MHz' },
    { word: 'beats', freq: '3.600 MHz' }
];

// 摩斯码表
const morseMap = {
    '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h', '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q', '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z'
};

// 密码模块单词列表
const passwordWords = [
    'about','after','again','below','could','every','first','found','great','house','large','learn','never','other','place','plant','point','right','small','sound','spell','still','study','their','there','these','thing','think','three','water','where','which','world','would','write'
];

// 顺序线路模块规则表
const wireSeqRules = {
    red:    ['C', 'B', 'A', 'AC', 'B', 'AC', 'ABC', 'AB', 'B'],
    blue:   ['B', 'AC', 'B', 'A', 'B', 'BC', 'C', 'AC', 'A'],
    black:  ['ABC', 'AC', 'B', 'AC', 'B', 'BC', 'AB', 'C', 'C']
};

let wireSeqPanels = [{ wires: [] }];
let wireSeqPanelIndex = 0;

// 复杂线路模块数据与判定
const complexWires = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 模块卡片点击事件
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const moduleType = this.getAttribute('data-module');
            showModule(moduleType);
        });
    });

    // 线路模块颜色按钮事件
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            addWireColor(color);
        });
    });

    // 线路模块手动输入事件
    document.getElementById('wires-input').addEventListener('input', function() {
        const input = this.value.trim();
        if (input) {
            parseWireInput(input);
        }
    });

    // 序列号选择事件
    document.querySelectorAll('.serial-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parity = this.getAttribute('data-parity');
            solveWiresWithSerial(parity);
        });
    });

    // 按钮模块选择事件
    document.querySelectorAll('.btn-color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectButtonOption('color', this);
        });
    });

    document.querySelectorAll('.btn-text-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectButtonOption('text', this);
        });
    });

    document.querySelectorAll('.indicator-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectButtonOption('indicator', this);
        });
    });

    document.querySelectorAll('.battery-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectButtonOption('batteries', this);
        });
    });
}

// 显示模块
function showModule(moduleType) {
    // 隐藏所有模块内容
    document.querySelectorAll('.module-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 隐藏模块索引
    document.getElementById('module-index').style.display = 'none';
    
    // 显示对应模块
    if (moduleType === 'wires') {
        document.getElementById('wires-module').style.display = 'block';
    } else if (moduleType === 'button') {
        document.getElementById('button-module').style.display = 'block';
    } else if (moduleType === 'memory') {
        document.getElementById('memory-module').style.display = 'block';
        // 初始化记忆模块事件监听器
        setTimeout(() => {
            if (!document.querySelector('.display-btn').hasEventListener) {
                initializeMemoryEventListeners();
                document.querySelectorAll('.display-btn, .order-input').forEach(btn => {
                    btn.hasEventListener = true;
                });
            }
        }, 100);
    } else if (moduleType === 'keypad') {
        document.getElementById('keypad-module').style.display = 'block';
    } else if (moduleType === 'simon') {
        document.getElementById('simon-module').style.display = 'block';
    } else if (moduleType === 'who') {
        document.getElementById('who-module').style.display = 'block';
    } else if (moduleType === 'morse') {
        document.getElementById('morse-module').style.display = 'block';
        setTimeout(initializeMorseInput, 100);
    } else if (moduleType === 'maze') {
        document.getElementById('maze-module').style.display = 'block';
    } else if (moduleType === 'password') {
        document.getElementById('password-module').style.display = 'block';
        setTimeout(initializePasswordInput, 100);
    } else if (moduleType === 'wire-sequence') {
        document.getElementById('wire-sequence-module').style.display = 'block';
        setTimeout(updateWireSeqPanelDisplay, 100);
        setTimeout(bindWireSeqRadioEvents, 100);
    } else if (moduleType === 'complex-wires') {
        document.getElementById('complex-wires-module').style.display = 'block';
        setTimeout(updateComplexWiresList, 100);
        setTimeout(bindComplexRadioEvents, 100);
    } else {
        // 其他模块显示占位页面
        document.getElementById('other-modules').style.display = 'block';
        const moduleNames = {
            'keypad': '键盘模块',
            'simon': '四色方块',
            'who': '他叫什么模块',
            'morse': '摩斯电码模块',
            'password': '密码模块',
            'complex-wires': '复杂线路模块',
            'wire-sequence': '顺序线路模块'
        };
        document.getElementById('other-module-title').textContent = moduleNames[moduleType] || '模块';
    }
}

// 返回索引页面
function showIndex() {
    document.getElementById('module-index').style.display = 'block';
    document.querySelectorAll('.module-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 重置状态
    resetWiresModule();
    resetButtonModule();
    resetMemory();
}

// 线路模块功能
function addWireColor(color) {
    currentWires.push(color);
    updateWiresDisplay();
}

function clearWires() {
    currentWires = [];
    updateWiresDisplay();
    document.getElementById('wires-input').value = '';
}

function parseWireInput(input) {
    // 支持多种分隔符：空格、逗号、中文逗号
    const colors = input.split(/[\s,，]+/).filter(color => color.trim());
    currentWires = colors.map(color => color.trim());
    updateWiresDisplay();
}

function updateWiresDisplay() {
    const display = document.getElementById('current-wires-display');
    if (currentWires.length === 0) {
        display.textContent = '无';
    } else {
        display.textContent = currentWires.join(' ');
    }
}

function solveWires() {
    if (currentWires.length < 3 || currentWires.length > 6) {
        alert('请输入3-6根线路的颜色！');
        return;
    }
    
    // 检查是否需要序列号
    const needsSerial = (currentWires.length === 4 || currentWires.length === 5 || currentWires.length === 6);
    
    if (needsSerial) {
        document.getElementById('serial-number-section').style.display = 'block';
    } else {
        solveWiresWithSerial(null);
    }
}

function solveWiresWithSerial(serialParity) {
    const wireCount = currentWires.length;
    let solution = '';
    
    if (wireCount === 3) {
        solution = solve3Wires();
    } else if (wireCount === 4) {
        solution = solve4Wires(serialParity);
    } else if (wireCount === 5) {
        solution = solve5Wires(serialParity);
    } else if (wireCount === 6) {
        solution = solve6Wires(serialParity);
    }
    
    displayWiresSolution(solution);
}

function solve3Wires() {
    const redCount = currentWires.filter(wire => wire === '红').length;
    const lastWire = currentWires[currentWires.length - 1];
    
    if (redCount === 0) {
        return '剪断第二根线';
    } else if (lastWire === '白') {
        return '剪断最后一根线';
    } else {
        const blueCount = currentWires.filter(wire => wire === '蓝').length;
        if (blueCount > 1) {
            // 找到最后一根蓝线的位置
            for (let i = currentWires.length - 1; i >= 0; i--) {
                if (currentWires[i] === '蓝') {
                    return `剪断第${i + 1}根线`;
                }
            }
        } else {
            return '剪断最后一根线';
        }
    }
}

function solve4Wires(serialParity) {
    const redCount = currentWires.filter(wire => wire === '红').length;
    const blueCount = currentWires.filter(wire => wire === '蓝').length;
    const yellowCount = currentWires.filter(wire => wire === '黄').length;
    const lastWire = currentWires[currentWires.length - 1];
    
    if (redCount > 1 && serialParity === 'odd') {
        // 找到最后一根红线的位置
        for (let i = currentWires.length - 1; i >= 0; i--) {
            if (currentWires[i] === '红') {
                return `剪断第${i + 1}根线`;
            }
        }
    } else if (redCount === 0 && lastWire === '黄') {
        return '剪断第一根线';
    } else if (blueCount === 1) {
        return '剪断第一根线';
    } else if (yellowCount > 1) {
        // 找到最后一根黄线的位置
        for (let i = currentWires.length - 1; i >= 0; i--) {
            if (currentWires[i] === '黄') {
                return `剪断第${i + 1}根线`;
            }
        }
    } else {
        return '剪断第二根线';
    }
}

function solve5Wires(serialParity) {
    const redCount = currentWires.filter(wire => wire === '红').length;
    const yellowCount = currentWires.filter(wire => wire === '黄').length;
    const blackCount = currentWires.filter(wire => wire === '黑').length;
    const lastWire = currentWires[currentWires.length - 1];
    
    if (lastWire === '黑' && serialParity === 'odd') {
        return '剪断第四根线';
    } else if (redCount === 1 && yellowCount > 1) {
        return '剪断第一根线';
    } else if (blackCount === 0) {
        return '剪断第二根线';
    } else {
        return '剪断第一根线';
    }
}

function solve6Wires(serialParity) {
    const redCount = currentWires.filter(wire => wire === '红').length;
    const yellowCount = currentWires.filter(wire => wire === '黄').length;
    const whiteCount = currentWires.filter(wire => wire === '白').length;
    
    if (yellowCount === 0 && serialParity === 'odd') {
        return '剪断第三根线';
    } else if (yellowCount === 1 && whiteCount > 1) {
        return '剪断第四根线';
    } else if (redCount === 0) {
        return '剪断最后一根线';
    } else {
        return '剪断第四根线';
    }
}

function displayWiresSolution(solution) {
    document.getElementById('serial-number-section').style.display = 'none';
    document.getElementById('wires-result').style.display = 'block';
    document.getElementById('wires-solution').innerHTML = `<div class="step">${solution}</div>`;
}

function resetWiresModule() {
    currentWires = [];
    updateWiresDisplay();
    document.getElementById('wires-input').value = '';
    document.getElementById('serial-number-section').style.display = 'none';
    document.getElementById('wires-result').style.display = 'none';
}

// 按钮模块功能
function selectButtonOption(type, button) {
    // 移除同组其他按钮的选中状态
    const buttonGroup = button.parentElement;
    buttonGroup.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 选中当前按钮
    button.classList.add('selected');
    
    // 更新状态
    const value = button.getAttribute(`data-${type}`);
    buttonState[type] = value;
    
    updateButtonDisplay();
}

function updateButtonDisplay() {
    const colorMap = {
        'blue': '蓝色',
        'white': '白色',
        'yellow': '黄色',
        'red': '红色',
        'other': '其他'
    };
    
    const textMap = {
        'abort': '中止',
        'detonate': '引爆',
        'hold': '按住',
        'none': '无文字'
    };
    
    const indicatorMap = {
        'car': 'CAR',
        'frk': 'FRK',
        'none': '无'
    };
    
    const batteryMap = {
        '0': '0个',
        '1': '1个',
        '2': '2个',
        '3': '3个+'
    };
    
    document.getElementById('current-btn-color').textContent = 
        buttonState.color ? colorMap[buttonState.color] : '未选择';
    document.getElementById('current-btn-text').textContent = 
        buttonState.text ? textMap[buttonState.text] : '未选择';
    document.getElementById('current-indicator').textContent = 
        buttonState.indicator ? indicatorMap[buttonState.indicator] : '未选择';
    document.getElementById('current-batteries').textContent = 
        buttonState.batteries !== null ? batteryMap[buttonState.batteries] : '未选择';
}

function solveButton() {
    if (!buttonState.color || !buttonState.text || !buttonState.indicator || buttonState.batteries === null) {
        alert('请选择所有按钮信息！');
        return;
    }
    
    const solution = getButtonSolution();
    displayButtonSolution(solution);
}

function getButtonSolution() {
    const { color, text, indicator, batteries } = buttonState;
    const batteryCount = parseInt(batteries);
    
    let steps = [];
    
    // 规则1: 如果是写有"中止"的蓝色按钮
    if (text === 'abort' && color === 'blue') {
        steps.push('按住按钮，然后参考"松开按住的按钮"');
    }
    // 规则2: 如果炸弹上有不止1个电池，同时按钮上写着"引爆"
    else if (batteryCount > 1 && text === 'detonate') {
        steps.push('按下按钮并立即松开');
    }
    // 规则3: 如果按钮是白色的，同时炸弹上有个写着CAR的指示灯亮
    else if (color === 'white' && indicator === 'car') {
        steps.push('按住按钮，然后参考"松开按住的按钮"');
    }
    // 规则4: 如果炸弹上有不止2个电池，也有写着FRK的指示灯亮
    else if (batteryCount > 2 && indicator === 'frk') {
        steps.push('按下按钮并立即松开');
    }
    // 规则5: 如果按钮是黄色的
    else if (color === 'yellow') {
        steps.push('按住按钮，然后参考"松开按住的按钮"');
    }
    // 规则6: 如果是写有"按住"的红色按钮
    else if (text === 'hold' && color === 'red') {
        steps.push('按下按钮并立即松开');
    }
    // 规则7: 如果不满足上述任一情况
    else {
        steps.push('按住按钮，然后参考"松开按住的按钮"');
    }
    
    // 如果步骤包含"按住按钮"，添加松开按钮的说明
    if (steps[0].includes('按住按钮')) {
        steps.push('松开按住的按钮说明：');
        steps.push('• 蓝色光条：在计时器任意数位显示4时松开');
        steps.push('• 白色光条：在计时器任意数位显示1时松开');
        steps.push('• 黄色光条：在计时器任意数位显示5时松开');
        steps.push('• 其他颜色光条：在计时器任意数位显示1时松开');
    }
    
    return steps;
}

function displayButtonSolution(steps) {
    document.getElementById('button-result').style.display = 'block';
    const solutionDiv = document.getElementById('button-solution');
    
    let html = '';
    steps.forEach((step, index) => {
        if (index === 0) {
            html += `<div class="step">${step}</div>`;
        } else if (step.includes('松开按住的按钮说明')) {
            html += `<div class="step"><strong>${step}</strong></div>`;
        } else {
            html += `<div class="step">${step}</div>`;
        }
    });
    
    solutionDiv.innerHTML = html;
}

function resetButtonModule() {
    buttonState = {
        color: null,
        text: null,
        indicator: null,
        batteries: null
    };
    
    // 清除所有选中状态
    document.querySelectorAll('.btn-color-btn, .btn-text-btn, .indicator-btn, .battery-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateButtonDisplay();
    document.getElementById('button-result').style.display = 'none';
}

// 记忆模块功能
// 初始化记忆模块事件监听器
function initializeMemoryEventListeners() {
    // 显示屏数字按钮事件
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDisplayNumber(this);
        });
    });

    // 按钮顺序输入框事件
    document.querySelectorAll('.order-input').forEach((input, index) => {
        input.addEventListener('input', function() {
            updateButtonOrderFromInput();
        });
    });
}

// 从输入框更新按钮顺序
function updateButtonOrderFromInput() {
    const order1 = parseInt(document.getElementById('order-1').value) || 1;
    const order2 = parseInt(document.getElementById('order-2').value) || 2;
    const order3 = parseInt(document.getElementById('order-3').value) || 3;
    const order4 = parseInt(document.getElementById('order-4').value) || 4;
    
    memoryState.buttonOrder = [order1, order2, order3, order4];
}

// 选择显示屏数字
function selectDisplayNumber(button) {
    // 清除其他按钮的选中状态
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 选中当前按钮
    button.classList.add('selected');
    
    // 更新状态
    memoryState.displayNumber = parseInt(button.getAttribute('data-number'));
    
    // 自动获取当前步骤
    getMemorySolution();
}

// 获取正确的按钮数字
function getCorrectButtonNumber() {
    const stage = memoryState.currentStage;
    const display = memoryState.displayNumber;
    
    switch (stage) {
        case 1:
            if (display === 1) return memoryState.buttonOrder[1]; // 第二个位置
            if (display === 2) return memoryState.buttonOrder[1]; // 第二个位置
            if (display === 3) return memoryState.buttonOrder[2]; // 第三个位置
            if (display === 4) return memoryState.buttonOrder[3]; // 第四个位置
            break;
        case 2:
            if (display === 1) return 4; // 数字为4的按钮
            if (display === 2) return memoryState.buttonOrder[memoryState.stage1Data.position - 1]; // 阶段1的位置
            if (display === 3) return memoryState.buttonOrder[0]; // 第一个位置
            if (display === 4) return memoryState.buttonOrder[memoryState.stage1Data.position - 1]; // 阶段1的位置
            break;
        case 3:
            if (display === 1) return memoryState.stage2Data.number; // 阶段2的数字
            if (display === 2) return memoryState.stage1Data.number; // 阶段1的数字
            if (display === 3) return memoryState.buttonOrder[2]; // 第三个位置
            if (display === 4) return 4; // 数字为4的按钮
            break;
        case 4:
            if (display === 1) return memoryState.buttonOrder[memoryState.stage1Data.position - 1]; // 阶段1的位置
            if (display === 2) return memoryState.buttonOrder[0]; // 第一个位置
            if (display === 3) return memoryState.buttonOrder[memoryState.stage2Data.position - 1]; // 阶段2的位置
            if (display === 4) return memoryState.buttonOrder[memoryState.stage2Data.position - 1]; // 阶段2的位置
            break;
        case 5:
            if (display === 1) return memoryState.stage1Data.number; // 阶段1的数字
            if (display === 2) return memoryState.stage2Data.number; // 阶段2的数字
            if (display === 3) return memoryState.stage4Data.number; // 阶段4的数字
            if (display === 4) return memoryState.stage3Data.number; // 阶段3的数字
            break;
    }
    return memoryState.buttonOrder[0]; // 默认返回第一个位置的数字
}

// 根据数字获取按钮位置
function getButtonPositionByNumber(number) {
    const index = memoryState.buttonOrder.indexOf(number);
    return index !== -1 ? index + 1 : 1;
}

// 保存阶段数据
function saveStageData(position, number) {
    switch (memoryState.currentStage) {
        case 1:
            memoryState.stage1Data = { position, number };
            break;
        case 2:
            memoryState.stage2Data = { position, number };
            break;
        case 3:
            memoryState.stage3Data = { position, number };
            break;
        case 4:
            memoryState.stage4Data = { position, number };
            break;
    }
}

// 更新记忆模块显示
function updateMemoryDisplay() {
    document.getElementById('current-stage').textContent = memoryState.currentStage;
    
    // 清除显示屏选择
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    memoryState.displayNumber = null;
}

// 更新历史记录显示
function updateMemoryHistory() {
    const historyDisplay = document.getElementById('memory-history-display');
    let html = '';
    
    memoryState.history.forEach(item => {
        const resultClass = item.result.includes('错误') ? 'error' : 'success';
        html += `<div class="history-item ${resultClass}">
            阶段${item.stage}: 显示${item.display} → 按数字${item.number} → ${item.result}
        </div>`;
    });
    
    historyDisplay.innerHTML = html;
    historyDisplay.scrollTop = historyDisplay.scrollHeight;
}

// 重置记忆模块
function resetMemory() {
    memoryState = {
        currentStage: 1,
        displayNumber: null,
        history: [],
        stage1Data: { position: null, number: null },
        stage2Data: { position: null, number: null },
        stage3Data: { position: null, number: null },
        stage4Data: { position: null, number: null },
        buttonOrder: [1, 2, 3, 4]
    };
    
    updateMemoryDisplay();
    updateMemoryHistory();
    
    // 清除显示屏选择
    document.querySelectorAll('.display-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 清除输入框
    document.getElementById('order-1').value = '';
    document.getElementById('order-2').value = '';
    document.getElementById('order-3').value = '';
    document.getElementById('order-4').value = '';
    
    // 隐藏结果
    document.getElementById('memory-result').style.display = 'none';
}

// 获取记忆模块当前步骤
function getMemorySolution() {
    if (!memoryState.displayNumber) {
        return;
    }
    
    // 更新按钮顺序
    updateButtonOrderFromInput();
    
    const correctNumber = getCorrectButtonNumber();
    
    let solution = `阶段 ${memoryState.currentStage}：显示屏显示 ${memoryState.displayNumber}<br>`;
    solution += `<strong>按数字 ${correctNumber}</strong>`;
    
    // 添加规则说明
    solution += `<br><br><strong>规则说明：</strong><br>`;
    solution += getStageRule(memoryState.currentStage, memoryState.displayNumber);
    
    // 添加下一步按钮
    solution += `<br><br><button class="next-stage-btn" onclick="nextStage(${correctNumber})">确认按下数字 ${correctNumber}</button>`;
    
    displayMemorySolution(solution);
}

// 进入下一阶段
function nextStage(number) {
    // 记录历史
    const historyItem = {
        stage: memoryState.currentStage,
        display: memoryState.displayNumber,
        position: getButtonPositionByNumber(number),
        number: number,
        result: '正确'
    };
    memoryState.history.push(historyItem);
    
    // 保存阶段数据
    saveStageData(getButtonPositionByNumber(number), number);
    
    // 进入下一阶段
    if (memoryState.currentStage < 5) {
        memoryState.currentStage++;
        updateMemoryDisplay();
    } else {
        alert('恭喜！记忆模块已成功拆除！');
    }
    
    updateMemoryHistory();
    document.getElementById('memory-result').style.display = 'none';
}

// 获取阶段规则说明
function getStageRule(stage, display) {
    const rules = {
        1: {
            1: "如果显示的是 1，按下第二个位置的按钮。",
            2: "如果显示的是 2，按下第二个位置的按钮。",
            3: "如果显示的是 3，按下第三个位置的按钮。",
            4: "如果显示的是 4，按下第四个位置的按钮。"
        },
        2: {
            1: "如果显示的是 1，按下数字为 4 的按钮。",
            2: "如果显示的是 2，按下和阶段 1 中你所按下的按钮位置相同的按钮。",
            3: "如果显示的是 3，按下第一个位置的按钮。",
            4: "如果显示的是 4，按下和阶段 1 中你所按下的按钮位置相同的按钮。"
        },
        3: {
            1: "如果显示的是 1，按下和阶段 2 中你所按下的按钮数字相同的按钮。",
            2: "如果显示的是 2，按下和阶段 1 中你所按下的按钮数字相同的按钮。",
            3: "如果显示的是 3，按下第三个位置的按钮。",
            4: "如果显示的是 4，按下数字为 4 的按钮。"
        },
        4: {
            1: "如果显示的是 1，按下和阶段 1 中你所按下的按钮位置相同的按钮。",
            2: "如果显示的是 2，按下第一个位置的按钮。",
            3: "如果显示的是 3，按下和阶段 2 中你所按下的按钮位置相同的按钮。",
            4: "如果显示的是 4，按下和阶段 2 中你所按下的按钮位置相同的按钮。"
        },
        5: {
            1: "如果显示的是 1，按下和阶段 1 中你所按下的按钮数字相同的按钮。",
            2: "如果显示的是 2，按下和阶段 2 中你所按下的按钮数字相同的按钮。",
            3: "如果显示的是 3，按下和阶段 4 中你所按下的按钮数字相同的按钮。",
            4: "如果显示的是 4，按下和阶段 3 中你所按下的按钮数字相同的按钮。"
        }
    };
    
    return rules[stage][display] || "未知规则";
}

// 显示记忆模块解决方案
function displayMemorySolution(solution) {
    document.getElementById('memory-result').style.display = 'block';
    document.getElementById('memory-solution').innerHTML = solution;
}

// 重置记忆模块状态
function resetMemoryModule() {
    resetMemory();
    document.getElementById('memory-result').style.display = 'none';
}

// 四色方块模块图片切换
function showSimonImage(hasVowel) {
    // 切换按钮选中状态
    document.querySelectorAll('.simon-vowel-btn').forEach(btn => btn.classList.remove('selected'));
    if (hasVowel) {
        document.querySelectorAll('.simon-vowel-btn')[0].classList.add('selected');
    } else {
        document.querySelectorAll('.simon-vowel-btn')[1].classList.add('selected');
    }
    // 显示图片
    const area = document.getElementById('simon-image-area');
    if (hasVowel) {
        area.innerHTML = '<img src="img/simon-1.png" alt="四色方块-有元音" style="max-width:100%;height:auto;border:1px solid #ccc;box-shadow:0 2px 8px #0001;">';
    } else {
        area.innerHTML = '<img src="img/simon-2.png" alt="四色方块-无元音" style="max-width:100%;height:auto;border:1px solid #ccc;box-shadow:0 2px 8px #0001;">';
    }
}

// 初始化摩斯电码输入监听
function initializeMorseInput() {
    const input = document.getElementById('morse-input');
    if (!input) return;
    input.addEventListener('input', function() {
        handleMorseInput(this.value.trim());
    });
}

function handleMorseInput(raw) {
    const decodeDiv = document.getElementById('morse-decode');
    let decoded = '';
    let valid = true;
    if (/^[.\-\s]+$/.test(raw) && raw.length > 0) {
        // 点划输入
        const parts = raw.split(/\s+/);
        decoded = parts.map(code => morseMap[code] || '?').join('');
        if (decoded.includes('?')) valid = false;
    } else {
        // 字母输入
        decoded = raw.toLowerCase();
    }
    if (raw.length === 0) {
        decodeDiv.textContent = '';
        updateMorseResult('');
        return;
    }
    if (/^[.\-\s]+$/.test(raw)) {
        decodeDiv.textContent = valid ? `翻译：${decoded}` : '翻译：包含无效摩斯码';
    } else {
        decodeDiv.textContent = '';
    }
    // 修正：只要有翻译结果（即使有?），都用decoded去筛选
    if (decoded && /^[a-z?]+$/.test(decoded)) {
        updateMorseResult(decoded.replace(/\?/g, ''));
    } else {
        updateMorseResult('');
    }
}

// 页面加载后初始化摩斯电码输入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMorseInput);
} else {
    initializeMorseInput();
}

function updateMorseResult(prefix) {
    const resultDiv = document.getElementById('morse-result');
    if (!prefix) {
        resultDiv.innerHTML = '<span style="color:#888;">请输入字母，支持模糊筛选</span>';
        return;
    }
    const filtered = morseWords.filter(item => item.word.startsWith(prefix));
    if (filtered.length === 0) {
        resultDiv.innerHTML = '<span style="color:#dc3545;">无匹配单词</span>';
        return;
    }
    resultDiv.innerHTML = filtered.map(item =>
        `<div class='morse-word-item'><span class='word'>${item.word}</span><span class='freq'>${item.freq}</span></div>`
    ).join('');
}

function initializePasswordInput() {
    const inputs = Array.from(document.querySelectorAll('.pw-letter'));
    if (inputs.length !== 5) return;
    inputs.forEach(input => {
        input.addEventListener('input', updatePasswordResult);
    });
}

function updatePasswordResult() {
    const letters = [];
    for (let i = 1; i <= 5; i++) {
        let val = document.getElementById('pw-' + i).value.trim().toLowerCase();
        if (!val) {
            letters.push(null); // 未输入视为任意
            continue;
        }
        // 连续输入支持，无需分隔符
        const arr = val.split('').filter(c => /[a-z]/.test(c));
        letters.push(arr);
    }
    const resultDiv = document.getElementById('pw-result');
    // 过滤单词
    const filtered = passwordWords.filter(word => {
        for (let i = 0; i < 5; i++) {
            if (letters[i] && !letters[i].includes(word[i])) return false;
        }
        return true;
    });
    if (filtered.length === 0) {
        resultDiv.innerHTML = '<span style="color:#dc3545;">无匹配单词</span>';
        return;
    }
    resultDiv.innerHTML = filtered.map(word => `<div class='pw-word-item'>${word}</div>`).join('');
}

// 页面加载后初始化密码输入
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePasswordInput);
} else {
    initializePasswordInput();
}

function updateWireSeqPanelDisplay() {
    document.getElementById('wire-seq-panel-num').textContent = wireSeqPanelIndex + 1;
    document.getElementById('wire-seq-input').value = wireSeqPanels[wireSeqPanelIndex]?.wiresRaw || '';
    updateWireSeqResult();
}

function parseWireSeqInput(input) {
    // 支持"黑A 红B 红C"或"redA blueB blackC"
    const arr = input.trim().split(/\s+/).filter(Boolean);
    return arr.map(item => {
        let color = '', letter = '';
        if (/^[红蓝黑][ABC]$/i.test(item)) {
            color = item[0] === '红' ? 'red' : item[0] === '蓝' ? 'blue' : 'black';
            letter = item[1].toUpperCase();
        } else if (/^(red|blue|black)[ABC]$/i.test(item)) {
            color = item.slice(0, -1).toLowerCase();
            letter = item.slice(-1).toUpperCase();
        }
        return color && letter ? { color, letter } : null;
    }).filter(Boolean);
}

function updateWireSeqResult() {
    // 全局累计次数
    let redCount = 0, blueCount = 0, blackCount = 0;
    let colorCountArr = [];
    for (let i = 0; i < wireSeqPanels.length; i++) {
        const wires = wireSeqPanels[i]?.wires || [];
        wires.forEach(w => {
            if (w.color === 'red') redCount++;
            if (w.color === 'blue') blueCount++;
            if (w.color === 'black') blackCount++;
            colorCountArr.push({ color: w.color, idx: i, order: { red: redCount, blue: blueCount, black: blackCount } });
        });
    }
    // 当前面板输入
    const wires = wireSeqPanels[wireSeqPanelIndex]?.wires || [];
    // 计算每根线的全局累计次数
    let r = 0, b = 0, k = 0;
    let globalRed = 0, globalBlue = 0, globalBlack = 0;
    // 统计到当前面板前的累计
    for (let i = 0; i < wireSeqPanelIndex; i++) {
        const ws = wireSeqPanels[i]?.wires || [];
        ws.forEach(w => {
            if (w.color === 'red') globalRed++;
            if (w.color === 'blue') globalBlue++;
            if (w.color === 'black') globalBlack++;
        });
    }
    const resultDiv = document.getElementById('wire-seq-result');
    if (wires.length === 0) {
        resultDiv.innerHTML = '<span style="color:#888;">请输入本面板所有线的颜色和连接字母</span>';
        return;
    }
    let html = '';
    wires.forEach((w, idx) => {
        let desc = `${w.color === 'red' ? '红' : w.color === 'blue' ? '蓝' : '黑'}线连接${w.letter}`;
        let cut = false;
        let rule = '';
        let thisCount = 0;
        if (w.color === 'red') {
            thisCount = globalRed + (++r);
            rule = wireSeqRules.red[thisCount-1] || '';
            cut = rule.includes(w.letter);
        } else if (w.color === 'blue') {
            thisCount = globalBlue + (++b);
            rule = wireSeqRules.blue[thisCount-1] || '';
            cut = rule.includes(w.letter);
        } else if (w.color === 'black') {
            thisCount = globalBlack + (++k);
            rule = wireSeqRules.black[thisCount-1] || '';
            cut = rule.includes(w.letter);
        }
        html += `<div class='wire-seq-wire-item'><span class='desc'>${desc}</span><span class='${cut ? 'cut' : 'nocut'}'>${cut ? '剪断' : '不要剪'}</span><span style='color:#888;font-size:0.95em;margin-left:8px;'>累计第${thisCount}根，规则: ${rule}</span></div>`;
    });
    resultDiv.innerHTML = html;
}

function saveWireSeqInput() {
    const input = document.getElementById('wire-seq-input').value;
    const wires = parseWireSeqInput(input);
    wireSeqPanels[wireSeqPanelIndex] = { wires, wiresRaw: input };
}

document.getElementById('wire-seq-input')?.addEventListener('input', function() {
    saveWireSeqInput();
    updateWireSeqResult();
});

function addWireSeqQuickInput() {
    const color = document.querySelector('input[name="wire-seq-color"]:checked').value;
    const letter = document.querySelector('input[name="wire-seq-letter"]:checked').value;
    const input = document.getElementById('wire-seq-input');
    input.value = (input.value.trim() ? input.value.trim() + ' ' : '') + color + letter;
    input.dispatchEvent(new Event('input'));
}

function nextWireSeqPanel() {
    saveWireSeqInput();
    if (wireSeqPanelIndex === wireSeqPanels.length - 1) {
        wireSeqPanels.push({ wires: [] });
    }
    wireSeqPanelIndex++;
    updateWireSeqPanelDisplay();
}

function prevWireSeqPanel() {
    saveWireSeqInput();
    if (wireSeqPanelIndex > 0) {
        wireSeqPanelIndex--;
        updateWireSeqPanelDisplay();
    }
}

function resetWireSeqModule() {
    wireSeqPanels = [{ wires: [] }];
    wireSeqPanelIndex = 0;
    updateWireSeqPanelDisplay();
}

// 页面加载后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateWireSeqPanelDisplay();
        document.getElementById('wire-seq-input')?.addEventListener('input', function() {
            saveWireSeqInput();
            updateWireSeqResult();
        });
    });
} else {
    updateWireSeqPanelDisplay();
    document.getElementById('wire-seq-input')?.addEventListener('input', function() {
        saveWireSeqInput();
        updateWireSeqResult();
    });
}

// 顺序线路模块单选按钮高亮
function updateWireSeqRadioSelected() {
    document.querySelectorAll('.wire-seq-radio-group').forEach(group => {
        group.querySelectorAll('.wire-seq-radio-label').forEach(label => {
            const input = label.querySelector('input[type="radio"]');
            if (input.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });
    });
}

// 初始化和变更时绑定
function bindWireSeqRadioEvents() {
    document.querySelectorAll('.wire-seq-radio-group input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateWireSeqRadioSelected);
    });
    updateWireSeqRadioSelected();
}

// 页面加载和顺序线路模块显示时都调用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindWireSeqRadioEvents);
} else {
    bindWireSeqRadioEvents();
}

function addComplexWire() {
    // 获取颜色
    const colors = Array.from(document.querySelectorAll('.complex-wire-color:checked')).map(cb => cb.value);
    // 获取★和LED
    const hasStar = document.querySelector('.complex-wire-star:checked')?.value === '1';
    const hasLed = document.querySelector('.complex-wire-led:checked')?.value === '1';
    // 判定区域
    const result = getComplexWireRegion(colors, hasStar, hasLed);
    // 记录
    complexWires.push({ colors, hasStar, hasLed, result });
    updateComplexWiresList();
    // 清空输入
    document.querySelectorAll('.complex-wire-color').forEach(cb => cb.checked = false);
    document.querySelector('.complex-wire-star[value="0"]').checked = true;
    document.querySelector('.complex-wire-led[value="0"]').checked = true;
}

function getComplexWireRegion(colors, hasStar, hasLed) {
    // 集合图判定逻辑
    // 先编码集合
    const key = [
        colors.includes('red'),
        colors.includes('blue'),
        hasStar,
        hasLed
    ].map(b => b ? '1' : '0').join('');
    // 交集查表
    // key顺序: 红, 蓝, ★, LED
    // 参考集合图人工整理
    const regionMap = {
        // 红 蓝 ★ LED
        '0000': 'C', // 白线无★无灯
        '0001': 'D', // 白线无★有灯
        '0010': 'C', // 白线有★无灯
        '0011': 'B', // 白线有★有灯
        '1000': 'S', // 红线无★无灯
        '1001': 'B', // 红线无★有灯 
        '1010': 'C', // 红线有★无灯
        '1011': 'B', // 红线有★有灯 
        '0100': 'S', // 蓝线无★无灯 
        '0101': 'P', // 蓝线无★有灯 
        '0110': 'D', // 蓝线有★无灯 
        '0111': 'P',  // 蓝线有★有灯
        '1100': 'S', // 红蓝无★无灯 
        '1101': 'S', // 红蓝无★有灯 
        '1110': 'P', // 红蓝有★无灯 
        '1111': 'D' // 红蓝有★有灯 
        // 只要有红或蓝或★或LED的组合都覆盖
        // 其它组合可补充
    };
    const resultMap = {C:'剪断线路', D:'不要剪断线路', S:'如炸弹序列号末位为偶数则剪断', P:'如有Parallel端口则剪断', B:'如有2个及以上电池则剪断'};
    return regionMap[key] + ': ' + resultMap[regionMap[key]];
    ;
}

function updateComplexWiresList() {
    const list = document.getElementById('complex-wires-list');
    if (!list) return;
    if (complexWires.length === 0) {
        list.innerHTML = '<span style="color:#888;">请添加每根线的属性</span>';
        return;
    }
    list.innerHTML = complexWires.map((w, i) => {
        const colorStr = w.colors.map(c => c === 'red' ? '红' : c === 'blue' ? '蓝' : '白').join('');
        const starStr = w.hasStar ? '有★' : '无★';
        const ledStr = w.hasLed ? 'LED亮' : 'LED灭';
        let desc = `${colorStr || '无色'} ${starStr} ${ledStr}`;
        return `<div class='wire-seq-wire-item'><span class='desc'>第${i+1}根：${desc}</span><span class='cut'>${w.result}</span></div>`;
    }).join('');
}

// 复杂线路模块多选/单选标签高亮
function updateComplexRadioSelected() {
    // 多选
    document.querySelectorAll('.complex-radio-group').forEach(group => {
        group.querySelectorAll('.complex-radio-label').forEach(label => {
            const input = label.querySelector('input[type="checkbox"]');
            if (input) {
                if (input.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            }
        });
    });
    // 单选
    document.querySelectorAll('.complex-radio-group').forEach(group => {
        group.querySelectorAll('.complex-radio-label').forEach(label => {
            const input = label.querySelector('input[type="radio"]');
            if (input) {
                if (input.checked) {
                    label.classList.add('selected');
                } else {
                    label.classList.remove('selected');
                }
            }
        });
    });
}

// 绑定事件
function bindComplexRadioEvents() {
    document.querySelectorAll('.complex-radio-group input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', updateComplexRadioSelected);
    });
    document.querySelectorAll('.complex-radio-group input[type="radio"]').forEach(input => {
        input.addEventListener('change', updateComplexRadioSelected);
    });
    updateComplexRadioSelected();
}

// 页面加载和复杂线路模块显示时都调用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindComplexRadioEvents);
} else {
    bindComplexRadioEvents();
}

function resetComplexWireModule() {
    complexWires.length = 0;
    updateComplexWiresList();
} 