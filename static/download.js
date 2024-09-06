function generateImage() {
    var card = document.getElementById('card');
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;

    // Use dom-to-image to generate a high-resolution image
    domtoimage.toPng(card, {
        quality: 1, // High quality setting
        width: cardWidth * 4, // Set higher width
        height: cardHeight * 4, // Set higher height
        style: {
            transform: 'scale(4)', // Scale factor
            transformOrigin: 'top left',
            width: cardWidth + 'px', // Ensure correct element dimensions
            height: cardHeight + 'px' // Ensure correct element dimensions
        }
    })
    .then(function (dataUrl) {
        var link = document.createElement('a');
        link.href = dataUrl;

        // Generate timestamp for the filename
        var now = new Date();
        var timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');

        link.download = 'card_' + timestamp + '.png'; // Append timestamp to the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
    .catch(function (error) {
        console.error('Error generating image:', error);
    });
}

// Bind click event
document.getElementById('generate-card').addEventListener('click', generateImage);
