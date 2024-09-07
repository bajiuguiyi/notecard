function generateImage() {
    var card = document.getElementById('card');
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;

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

        var link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'notecard_' + new Date().toISOString() + '.png';

        if (isMobile()) {
            // Mobile-specific display method
            var message = document.createElement('div');
            message.textContent = '图片已生成，长按图片保存到手机';
            message.style.position = 'fixed';
            message.style.bottom = '20px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.backgroundColor = '#000';
            message.style.color = '#fff';
            message.style.padding = '10px';
            message.style.borderRadius = '5px';
            message.style.zIndex = '1000';
            document.body.appendChild(message);

            image.style.display = 'block';
            image.style.maxWidth = '100%'; // Ensure image fits within the screen width
            image.style.maxHeight = '80vh'; // Limit the height to avoid overflow

            document.body.appendChild(image);
        } else {
            // Desktop-specific download method
            document.body.appendChild(link);
            link.click(); // Trigger download
            document.body.removeChild(link); // Clean up
        }

        URL.revokeObjectURL(dataUrl); // Release Blob URL
    })
    .catch(function (error) {
        console.error('Error generating image:', error);
    });
}

document.getElementById('generate-card').addEventListener('click', generateImage);

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}
