async function fetchQuote () {
    try {
        const response = await fetch('https://zenquotes.io/api/random');
        const data = await response.json();
        if (data && data[0]) {
            document.getElementById('quote').textContent = data[0].q;
            document.getElementById('author').textContent = "— " + data[0].a;
        }
    } catch (error) {
        console.error('Error fetching quote:', error);
        document.getElementById('quote').textContent = "The best preparation for tomorrow is doing your best today.";
        document.getElementById('author').textContent = "— H. Jackson Brown Jr.";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetchQuote();
});