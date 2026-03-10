#!/usr/bin/env python3
"""修复打赏弹窗功能"""

import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"
filepath = f"{WORK_DIR}/index.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复 switchCurrency 函数调用（确保所有地方都传递 event）
content = re.sub(
    r"onclick=\"switchCurrency\('CNY'\)\"",
    "onclick=\"switchCurrency('CNY', event)\"",
    content
)
content = re.sub(
    r"onclick=\"switchCurrency\('USD'\)\"",
    "onclick=\"switchCurrency('USD', event)\"",
    content
)

# 2. 修复 openCoffeeModal 中的 switchCurrency 调用
content = re.sub(
    r"switchCurrency\('CNY'\);",
    "switchCurrency('CNY', null);",
    content
)

# 3. 添加调试日志到 openCoffeeModal
old_open = """function openCoffeeModal() {
            const modal = document.getElementById('coffeeModal');"""

new_open = """function openCoffeeModal() {
            console.log('☕ Opening coffee modal...');
            const modal = document.getElementById('coffeeModal');"""

content = content.replace(old_open, new_open)

# 4. 确保 selectAmount 和 selectPayment 有 console.log
old_select_amount = """function selectAmount(element, amountIndex) {
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedCoffeeAmount = amountIndex;
            updateSelectedAmount();
        }"""

new_select_amount = """function selectAmount(element, amountIndex) {
            console.log('💰 Selecting amount:', amountIndex);
            document.querySelectorAll('.amount-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedCoffeeAmount = amountIndex;
            updateSelectedAmount();
        }"""

content = content.replace(old_select_amount, new_select_amount)

old_select_payment = """function selectPayment(element, method) {
            document.querySelectorAll('.payment-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedPaymentMethod = method;"""

new_select_payment = """function selectPayment(element, method) {
            console.log('💳 Selecting payment:', method);
            document.querySelectorAll('.payment-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            element.classList.add('selected');
            selectedPaymentMethod = method;"""

content = content.replace(old_select_payment, new_select_payment)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 打赏弹窗功能已修复")
print("   - switchCurrency 现在接收 event 参数")
print("   - 添加了调试日志")
print("   - openCoffeeModal 调用 switchCurrency 时传递 null")
