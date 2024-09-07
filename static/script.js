document.addEventListener('DOMContentLoaded', function() {


    const dateTextElement = document.getElementById('date-text');
    const dateInputHidden = document.getElementById('date-input-hidden');

    const contentId = document.getElementById('content');

    function adjustCardSize() {
        // 让卡片的宽度和高度适应内容
        contentId.style.width = 'auto';
        contentId.style.height = 'auto';
    }

    // 监听内容变化
    contentId.addEventListener('input', adjustCardSize);

    // 初始调整
    adjustCardSize();

   // 初始化当前日期
    const today = new Date();

    // 使用 Intl.DateTimeFormat 设置时区为中国时区（Asia/Shanghai）
    // 并将日期格式化为 Y/M/D 格式
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'Asia/Shanghai'
    };
    const formatter = new Intl.DateTimeFormat('zh-CN', options);
    const formattedDate = formatter.format(today); // 格式化为 Y/M/D

    // 显示日期
    dateTextElement.textContent = `摘录于${formattedDate}`;
    dateInputHidden.value = today.toISOString().split('T')[0]; // 存储原始日期

    // 初始化 flatpickr
    flatpickr(dateTextElement, {
        dateFormat: "Y/m/d", // 设置为 Y/M/D 格式
        defaultDate: formattedDate,
        onChange: function(selectedDates) {
            // 更新日期到 <p id="date-text"> 中
            if (selectedDates.length > 0) {
                const selectedDate = selectedDates[0];
                const formattedDate = formatter.format(selectedDate); // 使用 formatter
                dateTextElement.textContent = `摘录于${formattedDate}`;
                dateInputHidden.value = selectedDate.toISOString().split('T')[0];
            }
        }
    });

    // 获取画布背景颜色和字体颜色
    const backElement = document.querySelector('.back');
    const cardElement = document.querySelector('.card');
    // 默认背景颜色
    const defaultBackgroundColor = 'rgb(27,28,33)';


// 获取默认颜色块元素
    const defaultColorBox = document.getElementById('default-color-box');

    // 绑定点击事件以重置背景颜色
    defaultColorBox.addEventListener('click', function() {
        resetToDefaultBackground();

    });
    // 重置为默认背景颜色函数
    function resetToDefaultBackground() {
        backElement.style.background = defaultBackgroundColor;
        backElement.classList.add('custom-background'); // 默认文字颜色
        updateCardFont();
    }
    let computedFontColor = ' ';
   // 修改背景颜色函数
    function changeBackground(color) {
        backElement.style.background = color;
   // 检查当前设置的背景颜色
        console.log('Setting background color:', color);
        // 如果背景颜色是默认颜色，设置字体颜色为默认颜色
        if (color === defaultBackgroundColor) {
            backElement.style.color = 'rgb(230,210,180)'; // 默认文字颜色
            console.log('Setting text color to default color');
        } else {
            // 获取计算后的颜色
            const computedColor = window.getComputedStyle(backElement).background;

            // 计算背景颜色的亮度
            const brightness = calculateBrightness(computedColor);

             // 根据亮度设置字体颜色
            const textColor = brightness < 0.5 ? 'white' : 'black';
            backElement.style.color = textColor;
            computedFontColor = textColor;
            console.log('Setting text color based on brightness:',brightness, textColor);
        }
         updateCardFont();
        console.log('111:',computedFontColor);
        console.log('111:',updateCardFont());
    }


    // 计算颜色的亮度
    function calculateBrightness(color) {

        // 处理可能的 rgb 格式
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10) / 255;
            const g = parseInt(rgbMatch[2], 10) / 255;
            const b = parseInt(rgbMatch[3], 10) / 255;

            // Gamma 修正
            const gammaCorrection = (val) => {
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            };

            const rL = gammaCorrection(r);
            const gL = gammaCorrection(g);
            const bL = gammaCorrection(b);

            return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
        }

        // 处理可能的 hex 格式
        const hexMatch = color.match(/#([0-9a-fA-F]{6})/);
        if (hexMatch) {
            const hex = hexMatch[1];
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;

            // Gamma 修正
            const gammaCorrection = (val) => {
                return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
            };

            const rL = gammaCorrection(r);
            const gL = gammaCorrection(g);
            const bL = gammaCorrection(b);

            return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
        }

        // 处理渐变格式
        const gradientMatch = color.match(/linear-gradient\((.+?)\)/);
        if (gradientMatch) {
            // 提取渐变中的颜色
            const gradientColors = gradientMatch[1].match(/#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\d+,\s*\d+,\s*\d+\)/g);
            if (gradientColors) {
                // 计算所有渐变颜色的亮度，并取平均值
                const brightnessValues = gradientColors.map(col => calculateBrightness(col));
                return brightnessValues.reduce((a, b) => a + b) / brightnessValues.length;
            }
        }

        return 0.5; // 如果无法解析颜色，返回默认亮度
    }

    // Handle avatar click and upload
    const avatar = document.getElementById('avatar');
    const avatarInput = document.getElementById('avatar-input');

    avatar.addEventListener('click', function() {
        avatarInput.click();  // Trigger the file input click
    });

    avatarInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                avatar.src = e.target.result;  // Set the avatar image source to the uploaded file
            };
            reader.readAsDataURL(file);  // Read the uploaded file as a data URL
        }
    });

    // Handle QR code click and upload
    const qrCodeImage = document.getElementById('qrCodeImage');
    const qrCodeInput = document.getElementById('qr-code-input');

    qrCodeImage.addEventListener('click', function() {
        qrCodeInput.click();  // Trigger the file input click
    });

    qrCodeInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                qrCodeImage.src = e.target.result;  // Set the QR code image source to the uploaded file
            };
            reader.readAsDataURL(file);  // Read the uploaded file as a data URL
        }
    });

    // 基于输入的 URL 生成二维码
    const qrCodeInputField = document.getElementById('qr-code-url-input');
    qrCodeInputField.addEventListener('input', function() {
        const url = qrCodeInputField.value;
        if (url) {
            generateQRCode(url);
        }
    });

    // 生成二维码的函数
    // 生成二维码的函数
    function generateQRCode(url) {
        // 获取卡片背景颜色和字体颜色
        const back = document.querySelector('.back');
        const backgroundColor = window.getComputedStyle(back).backgroundColor;
        const fontColor = window.getComputedStyle(back).color;

        let qrColor = 'black'; // 默认二维码前景色为黑色
        let qrBackgroundColor = 'white'; // 默认二维码背景色为白色

        // 检查背景色和字体颜色是否匹配特定条件
        if (backgroundColor === 'rgb(27, 28, 33)' && fontColor === 'rgb(230, 210, 180)') {
            qrColor = backgroundColor; // 如果匹配，则使用当前设置的字体颜色
            qrBackgroundColor = fontColor; // 以及背景颜色
        }

        // 发送请求以生成二维码
        fetch('/generate_qr_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: url,
                qr_color: qrColor,  // 传递二维码前景色
                qr_background_color: qrBackgroundColor  // 传递二维码背景色
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const qrCodeImage = document.getElementById('qrCodeImage');
            qrCodeImage.src = URL.createObjectURL(blob);
        })
        .catch(error => {
            console.error('Error generating QR Code:', error);
        });
    }
    window.generateQRCode = generateQRCode;


    // 获取右侧的字体选择框
    const fontSelection = document.getElementById('font-selection');

    const fontColorPicker = document.getElementById('font-color-picker');


    console.log('666:',fontColorPicker.value);


    let selectedColor = computedFontColor;
    console.log('777:',computedFontColor);
        // 更新左侧画布上的字体
    // 更新字体和颜色的函数
    function updateCardFont() {
        const selectedFont = fontSelection.value;

        fontColorPicker.addEventListener('input', function() {
            // 只有在用户选择颜色时，才更新 selectedColor
            if (fontColorPicker.value) {
                selectedColor = fontColorPicker.value;
            }
        });
        console.log('222:',selectedColor);

        // 设置字体样式
        nicknameElement.style.fontFamily = selectedFont;
        dateElement.style.fontFamily = selectedFont;
        contentElement.style.fontFamily = selectedFont;
        authorElement.style.fontFamily = selectedFont;
        sourceElement.style.fontFamily = selectedFont;
        notecardElement.style.fontFamily = selectedFont;
        // 设置字体颜色
        nicknameElement.style.color = selectedColor;
        dateElement.style.color = selectedColor;
        contentElement.style.color = selectedColor;
        authorElement.style.color = selectedColor;
        sourceElement.style.color = selectedColor;
        notecardElement.style.color = selectedColor;
    }

     // 添加事件监听器，字体选择框变化时更新卡片字体

    fontSelection.addEventListener('change', updateCardFont);
    fontColorPicker.addEventListener('input', updateCardFont);

    // 添加事件监听器，更新背景颜色的点击事件
    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            console.log('Color box clicked:', color); // 输出被点击的颜色
            changeBackground(color);
        });
    });
    // 为自定义颜色选择器添加事件监听器
    document.getElementById('custom-color-picker').addEventListener('input', function() {
        const color = this.value;
        console.log('Custom color picker changed:', color); // 输出选择的自定义颜色
        changeBackground(color);
    });



 // 获取右侧的显示选项复选框
    const showAvatarCheckbox = document.getElementById('show-avatar');
    const showNicknameCheckbox = document.getElementById('show-nickname');
    const showDateCheckbox = document.getElementById('show-date');
    const showContentCheckbox = document.getElementById('show-content');
    const showAuthorCheckbox = document.getElementById('show-author');
    const showSourceCheckbox = document.getElementById('show-source');
    const showNotecardCheckbox = document.getElementById('show-notecard');
    const showQrCodeCheckbox = document.getElementById('show-qr-code');
    // 获取显示边框复选框和边框颜色选择器
   const showBorderCheckbox = document.getElementById('show-border');
    const borderColorsContainer = document.getElementById('border-colors');
    const colorButtons = borderColorsContainer.querySelectorAll('button');
 // 获取颜色选择单选按钮
    const colorRadios = document.querySelectorAll('input[name="border-color"]');
    // 获取左侧对应的元素
    const avatarElement = document.querySelector('.avatar');
    const nicknameElement = document.querySelector('.nickname');
    const dateElement = document.querySelector('.date-container');
    const contentElement = document.querySelector('.card-content');
    const authorElement = document.querySelector('.author');
    const sourceElement = document.querySelector('.source');
    const notecardElement = document.querySelector('.notecard');
    const qrCodeElement = document.querySelector('.qr-code');
    // 添加事件监听器
    showBorderCheckbox.addEventListener('change', function() {
        if (this.checked) {
            borderColorsContainer.style.display = 'block';
            backElement.style.borderRadius = '20px'; // 添加圆角
            backElement.style.boxShadow = '0 0 20px 10px rgba(0, 0, 0, 0.3)'; // 添加柔光效果
            cardElement.style.padding = '40px'; // 恢复内边距
        } else {
            borderColorsContainer.style.display = 'none';
            backElement.style.borderRadius = '0'; // 移除圆角
            backElement.style.boxShadow = 'none'; // 移除柔光效果
            cardElement.style.padding = '0'; // 设置内边距为0
        }
    });

    // 获取颜色选择器元素
    const colorPicker = document.getElementById('back-color-picker');

    // 颜色选择按钮事件
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            if (color.startsWith('linear-gradient')) {
                // 如果颜色值是渐变色，则使用 backgroundImage
                cardElement.style.backgroundImage = color;
                cardElement.style.backgroundColor = ''; // 确保 backgroundColor 被清除
            } else {
                // 否则，使用 backgroundColor
                cardElement.style.backgroundColor = color;
                cardElement.style.backgroundImage = ''; // 确保 backgroundImage 被清除
            }
        });
    });

    // 颜色选择器事件
    colorPicker.addEventListener('input', function() {
        const color = this.value;
        cardElement.style.backgroundColor = color;
        cardElement.style.backgroundImage = ''; // 确保 backgroundImage 被清除
    });

    // 初始化状态
    if (showBorderCheckbox.checked) {
        borderColorsContainer.style.display = 'block';
        backElement.style.borderRadius = '20px'; // 默认圆角
        backElement.style.boxShadow = '0 0 20px 10px rgba(0, 0, 0, 0.3)'; // 默认柔光效果
        cardElement.style.padding = '40px'; // 默认内边距
    } else {
        borderColorsContainer.style.display = 'none';
        backElement.style.borderRadius = '0';
        backElement.style.boxShadow = 'none';
        cardElement.style.padding = '0'; // 默认内边距
    }

    // 初始化时根据复选框状态设置显示/隐藏
    function updateCardDisplay() {
        avatarElement.style.display = showAvatarCheckbox.checked ? 'block' : 'none';
        nicknameElement.style.display = showNicknameCheckbox.checked ? 'block' : 'none';
        dateElement.style.display = showDateCheckbox.checked ? 'block' : 'none';
        contentElement.style.display = showContentCheckbox.checked ? 'block' : 'none';
        authorElement.style.display = showAuthorCheckbox.checked ? 'block' : 'none';
        sourceElement.style.display = showSourceCheckbox.checked ? 'block' : 'none';
        notecardElement.style.display = showNotecardCheckbox.checked ? 'block' : 'none';
        qrCodeElement.style.display = showQrCodeCheckbox.checked ? 'block' : 'none';

    }


    // 设置复选框的默认状态为选中
    showAvatarCheckbox.checked = true;
    showNicknameCheckbox.checked = true;
    showDateCheckbox.checked = true;
    showContentCheckbox.checked = true;
    showAuthorCheckbox.checked = true;
    showSourceCheckbox.checked = true;
    showQrCodeCheckbox.checked = true;
    showNotecardCheckbox.checked = true;

    // 添加事件监听器，复选框状态变化时更新卡片显示
    showAvatarCheckbox.addEventListener('change', updateCardDisplay);
    showNicknameCheckbox.addEventListener('change', updateCardDisplay);
    showDateCheckbox.addEventListener('change', updateCardDisplay);
    showContentCheckbox.addEventListener('change', updateCardDisplay);
    showAuthorCheckbox.addEventListener('change', updateCardDisplay);
    showSourceCheckbox.addEventListener('change', updateCardDisplay);
    showNotecardCheckbox.addEventListener('change', updateCardDisplay);
    showQrCodeCheckbox.addEventListener('change', updateCardDisplay);


    // 在内容加载和更新后调用
    function adjustCardHeight() {
        const card = document.querySelector('.card');
        if (card) {
            card.style.height = 'auto'; // 让卡片的高度适应内容
        }
    }

    // 在内容更新后
    document.addEventListener('DOMContentLoaded', function() {
        adjustCardHeight();
    });
    //切换主题
      const themeStylesheet = document.getElementById('theme-stylesheet');

    document.querySelectorAll('#card-theme .theme-btn').forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');

            if (themeUrls[theme]) {
                themeStylesheet.href = themeUrls[theme];
            }
        });
    });

    document.querySelectorAll('.option-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有选项卡和内容区域的活动状态
            document.querySelectorAll('.option-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // 添加当前点击的选项卡和对应内容区域的活动状态
            const target = this.getAttribute('data-target');
            this.classList.add('active');
            document.querySelector(`.${target}`).classList.add('active');
        });
    });

    // 默认显示第一个选项卡的内容
    document.querySelector('.option-tab[data-target="background-options"]').classList.add('active');
    document.querySelector('.background-options').classList.add('active');


    document.querySelectorAll('.tab-option').forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有选项卡和内容区域的活动状态
            document.querySelectorAll('.tab-option').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.qr-input, .article-input').forEach(c => c.style.display = 'none');

            // 添加当前点击的选项卡和对应内容区域的活动状态
            const target = this.getAttribute('data-target');
            this.classList.add('active');
            document.querySelector(`.${target}`).style.display = 'block';
        });
    });

    // 默认显示 .qr-input
    document.querySelector('.qr-input').style.display = 'block';
    document.querySelector('.tab-option[data-target="qr-input"]').classList.add('active');

    // 获取主题盒子元素
    const themeBox = document.querySelector('.theme-s');
    const themeBoxContent = document.querySelector('#card-theme');
    let isBoxExpanded = true; // 记录盒子的展开状态
    let hideTimeout; // 用于存储定时器

    // 切换盒子的显示和隐藏
    function toggleThemeBox() {
        if (isBoxExpanded) {
            themeBox.classList.add('collapsed');
            themeBox.classList.remove('expanded');
        } else {
            themeBox.classList.remove('collapsed');
            themeBox.classList.add('expanded');
        }
        isBoxExpanded = !isBoxExpanded;
    }

    // 清除之前的定时器
    function resetHideTimeout() {
        clearTimeout(hideTimeout);
    }

    // 设置定时器自动隐藏
    function startHideTimeout() {
        hideTimeout = setTimeout(function() {
            if (isBoxExpanded) {
                toggleThemeBox();
            }
        }, 2000); // 2秒钟
    }

    // 添加点击事件监听器到主题盒子
    themeBox.addEventListener('click', function(event) {
        resetHideTimeout(); // 清除之前的定时器
        startHideTimeout(); // 启动新的定时器

        // 防止点击盒子内的按钮时触发收纳
        if (event.target.closest('.theme-btn')) return;
        toggleThemeBox();
    });

    // 点击页面其他地方时，隐藏盒子
    document.addEventListener('click', function(event) {
        if (!themeBox.contains(event.target)) {
            if (isBoxExpanded) {
                toggleThemeBox();
            }
        }
    });

    // 启动定时器以便自动隐藏
    startHideTimeout();

    document.addEventListener('DOMContentLoaded', function() {
        const contentId = document.getElementById('content');

        contentId.addEventListener('paste', function(event) {
            event.preventDefault(); // 阻止默认的粘贴行为

            // 创建一个临时的 div 元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = (event.clipboardData || window.clipboardData).getData('text/html');

            // 获取纯文本内容
            const text = tempDiv.innerText || tempDiv.textContent;

            // 插入纯文本内容
            document.execCommand('insertText', false, text);
        });
    });




    // 初始化卡片显示状态
    updateCardDisplay();

    // 初始化字体
    updateCardFont();


});
