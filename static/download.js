function generateImage() {
    var card = document.getElementById('card');
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;

    // 创建提示元素
    var loadingMessage = document.createElement('div');
    loadingMessage.textContent = '图片生成中...';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.bottom = '30px';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translateX(-50%)';
    loadingMessage.style.backgroundColor = '#000';
    loadingMessage.style.color = '#fff';
    loadingMessage.style.padding = '10px';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.zIndex = '1000';
    loadingMessage.style.display = 'none'; // 默认隐藏
    document.body.appendChild(loadingMessage);

    // 显示提示
    loadingMessage.style.display = 'block';

    domtoimage.toPng(card, {
        quality: 1,
        width: cardWidth * 2,
        height: cardHeight * 2,
        style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
            width: cardWidth + 'px',
            height: cardHeight + 'px'
        }
    })
    .then(function (dataUrl) {
        var image = new Image();
        image.src = dataUrl;
        image.style.display = 'block';
        image.style.maxWidth = '100%';
        image.style.maxHeight = '80vh';
        image.alt = 'card_' + new Date().toISOString().replace(/[:.-]/g, '') + '.png'; // Set alt text with filename

        if (isMobile()) {
            var message = document.createElement('div');
            message.textContent = '长按图片保存到手机,轻触图片返回继续制作';
            message.style.position = 'fixed';
            message.style.bottom = '30px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = '#000';
            message.style.color = '#fff';
            message.style.padding = '10px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '1000';
            document.body.appendChild(message);

            // Append image to body
            document.body.appendChild(image);

            // Add click event to hide image
            image.addEventListener('click', function() {
                document.body.removeChild(image);
                document.body.removeChild(message); // Remove the message as well
            });
        } else {
            var link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'notecard_' + new Date().toISOString().replace(/[:.-]/g, '') + '.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // 隐藏提示
        loadingMessage.style.display = 'none';
        URL.revokeObjectURL(dataUrl); // Release Blob URL
    })
    .catch(function (error) {
        console.error('Error generating image:', error);
        // 隐藏提示
        loadingMessage.style.display = 'none';
    });
}

document.getElementById('generate-card').addEventListener('click', generateImage);

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// 实现复制到剪贴板的功能
function copyToClipboard() {
    var card = document.getElementById('card');
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;

    domtoimage.toBlob(card, {
        quality: 1,
        width: cardWidth * 2,
        height: cardHeight * 2,
        style: {
            transform: 'scale(2)',
            transformOrigin: 'top left',
            width: cardWidth + 'px',
            height: cardHeight + 'px'
        }
    })
    .then(function (blob) {
        // 使用 Clipboard API 复制图片到剪贴板
        navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]).then(function () {
            alert('图片已复制到剪贴板！');
        }).catch(function (error) {
            console.error('Error copying to clipboard:', error);
        });
    })
    .catch(function (error) {
        console.error('Error generating image for clipboard:', error);
    });
}

// 添加复制图片到剪贴板的事件监听
document.getElementById('copy-card').addEventListener('click', copyToClipboard);
