document.addEventListener('DOMContentLoaded', function() {
    if (annyang) {

        const commands = {
            'hello': function() {
                alert('Hello World!');
            },
            'change color to *color': function(color) {
                document.body.style.backgroundColor = color;
            },
            'navigate to *page': function(page) {
                const lowerPage = page.toLowerCase();
                if (lowerPage === 'home') {
                    window.location.href = 'index.html';
                } else if (lowerPage === 'stocks') {
                    window.location.href = 'stocks.html';
                } else if (lowerPage === 'dogs') {
                    window.location.href = 'dogs.html';
                }
            }
        };

        annyang.addCommands(commands);
        annyang.start();

        document.getElementById('turnOnAudio').addEventListener('click', function() {
            annyang.start();
            alert('Voice commands are now enabled');
        });

        document.getElementById('turnOffAudio').addEventListener('click', function() {
            annyang.abort();
            alert('Voice commands are now disabled');
        });
    } else {
        console.error('Speech recognition is not supported on this browser!');
    }
});
