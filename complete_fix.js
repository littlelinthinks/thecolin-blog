/**
 * 完整修复打赏功能的 JavaScript
 * 替换 index.html 中对应的脚本部分
 */

// ===== 打赏功能完整修复版 =====
let selectedCoffeeAmount = 1;
let selectedPaymentMethod = null;
let currentCurrency = 'CNY';

// 币种对应的金额配置
const coffeeAmounts = {
    CNY: [35, 68, 128],
    USD: [5, 10, 20]
};

// 币种符号
const currencySymbols = {
    CNY: '¥',
    USD: '$'
};

/**
 * 切换币种
 * @param {string} currency - 'CNY' 或 'USD'
 * @param {Event} event - 点击事件
 */
function switchCurrency(currency, event) {
    console.log('💱 Switching currency:', currency);
    currentCurrency = currency;
    
    // 更新按钮状态
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target && event.target.closest('.currency-btn')) {
        event.target.closest('.currency-btn').classList.add('active');
    } else {
        const buttons = document.querySelectorAll('.currency-btn');
        buttons.forEach(btn => {
            if (btn.textContent.includes(currency === 'CNY' ? '人民币' : '美元')) {
                btn.classList.add('active');
            }
        });
    }
    
    // 更新所有金额显示
    const amountBtns = document.querySelectorAll('.amount-btn');
    const amounts = coffeeAmounts[currency];
    const symbol = currencySymbols[currency];
    
    amountBtns.forEach((btn, index) => {
        const priceEl = btn.querySelector('.amount-price');
        if (priceEl && amounts[index]) {
            priceEl.textContent = symbol + amounts[index];
        }
    });
    
    // 更新支付方式显示
    const cnPayments = document.querySelectorAll('.payment-cny');
    const usdPayments = document.querySelectorAll('.payment-usd');
    
    if (currency === 'CNY') {
        cnPayments.forEach(el => el.style.display = 'flex');
        usdPayments.forEach(el => el.style.display = 'none');
    } else {
        cnPayments.forEach(el => el.style.display = 'none');
        usdPayments.forEach(el => el.style.display = 'flex');
    }
    
    // 重置支付方式选择
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('selected'));
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
        qrContainer.classList.remove('active');
    }
    
    // 更新已选金额显示
    updateSelectedAmount();
}

/**
 * 更新已选金额显示
 */
function updateSelectedAmount() {
    const amounts = coffeeAmounts[currentCurrency];
    const symbol = currencySymbols[currentCurrency];
    const amount = amounts[selectedCoffeeAmount - 1];
    const selectedAmountEl = document.getElementById('selectedAmount');
    if (selectedAmountEl) {
        selectedAmountEl.textContent = symbol + amount;
    }
}

/**
 * 打开打赏弹窗
 */
function openCoffeeModal() {
    console.log('☕ Opening coffee modal...');
    
    const modal = document.getElementById('coffeeModal');
    if (!modal) {
        console.error('❌ Coffee modal not found!');
        alert('打赏功能初始化失败，请刷新页面重试');
        return;
    }
    
    console.log('✅ Modal found, adding active class...');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 重置状态
    currentCurrency = 'CNY';
    selectedCoffeeAmount = 1;
    selectedPaymentMethod = null;
    
    document.querySelectorAll('.currency-btn').forEach(btn => btn.classList.remove('active'));
    const firstCurrencyBtn = document.querySelector('.currency-btn');
    if (firstCurrencyBtn) firstCurrencyBtn.classList.add('active');
    
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('selected'));
    
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) qrContainer.classList.remove('active');
    
    const thankYouEl = document.querySelector('.coffee-thank-you');
    if (thankYouEl) thankYouEl.classList.remove('active');
    
    // 默认选中第一个金额
    const firstAmountBtn = document.querySelector('.amount-btn');
    if (firstAmountBtn) firstAmountBtn.classList.add('selected');
    
    // 确保显示人民币金额
    switchCurrency('CNY', null);
    
    console.log('✅ Coffee modal opened successfully!');
}

/**
 * 关闭打赏弹窗
 */
function closeCoffeeModal() {
    console.log('🚪 Closing coffee modal...');
    const modal = document.getElementById('coffeeModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * 选择金额
 * @param {HTMLElement} element - 被点击的金额按钮
 * @param {number} amountIndex - 金额索引 (1-3)
 */
function selectAmount(element, amountIndex) {
    console.log('💰 Selecting amount:', amountIndex);
    
    if (!element) {
        console.error('❌ Element is null');
        return;
    }
    
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedCoffeeAmount = amountIndex;
    updateSelectedAmount();
    
    console.log('✅ Amount selected, updated to:', selectedCoffeeAmount);
}

/**
 * 选择支付方式
 * @param {HTMLElement} element - 被点击的支付按钮
 * @param {string} method - 支付方式 ('wechat', 'alipay', 'paypal', 'stripe')
 */
function selectPayment(element, method) {
    console.log('💳 Selecting payment method:', method);
    
    if (!element) {
        console.error('❌ Element is null');
        return;
    }
    
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    element.classList.add('selected');
    selectedPaymentMethod = method;
    
    // 显示二维码区域
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) {
        qrContainer.classList.add('active');
        
        // 根据支付方式显示不同图标
        const qrIcon = document.getElementById('qrCodeIcon');
        if (qrIcon) {
            switch(method) {
                case 'wechat':
                    qrIcon.textContent = '💚';
                    break;
                case 'alipay':
                    qrIcon.textContent = '💙';
                    break;
                case 'paypal':
                    qrIcon.textContent = '🌐';
                    break;
                case 'stripe':
                    qrIcon.textContent = '💳';
                    break;
                default:
                    qrIcon.textContent = '📱';
            }
        }
    }
    
    // 模拟扫码后的感谢提示（3 秒后显示）
    setTimeout(() => {
        showCoffeeThankYou();
    }, 3000);
}

/**
 * 显示感谢提示
 */
function showCoffeeThankYou() {
    console.log('🙏 Showing thank you message...');
    const thankYouEl = document.querySelector('.coffee-thank-you');
    if (thankYouEl) {
        thankYouEl.classList.add('active');
        
        // 5 秒后自动关闭弹窗
        setTimeout(() => {
            closeCoffeeModal();
        }, 5000);
    }
}

// 初始化：点击弹窗外部关闭
document.addEventListener('DOMContentLoaded', function() {
    const coffeeModal = document.getElementById('coffeeModal');
    if (coffeeModal) {
        coffeeModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCoffeeModal();
            }
        });
    }
    
    console.log('✅ Coffee modal event listeners initialized');
});
