// Define proxy options
const proxyOptions = [
    { value: 'none', label: 'No Proxy', url: null },
    { value: 'corsproxy.io', label: 'corsproxy.io', url: 'https://corsproxy.io/?{url}' },
    { value: 'allorigins.win', label: 'allorigins.win', url: 'https://api.allorigins.win/raw?url={url}' },
    { value: 'cors.sh', label: 'cors.sh', url: 'https://cors.sh/?{url}' },
    { value: 'cors-anywhere', label: 'CORS Anywhere (Heroku)', url: 'https://cors-anywhere.herokuapp.com/{url}' }
];

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('.js-send-request');
    const proxySelect = document.querySelector('.js-proxy-select');
    const copyButton = document.getElementById('copyButton');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Populate proxy select options
    proxyOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        proxySelect.appendChild(optionElement);
    });

    sendButton.addEventListener('click', sendRequests);
    copyButton.addEventListener('click', copyResponse);
    window.addEventListener('scroll', toggleScrollToTopButton);
    scrollToTopBtn.addEventListener('click', scrollToTop);
});

async function sendRequests() {
    const requestCount = parseInt(document.querySelector('.js-request-count').value);
    const requestInterval = parseInt(document.querySelector('.js-request-interval').value);
    const completedRequestsElement = document.querySelector('.js-completed-requests');
    const responseElement = document.querySelector('.js-response');
    let completedRequests = 0;
    let results = [];

    for (let i = 0; i < requestCount; i++) {
        try {
            const result = await sendRequest();
            results.push({ success: true, data: result });
        } catch (error) {
            results.push({ success: false, error: error.message });
        }
        
        completedRequests++;
        completedRequestsElement.textContent = completedRequests;

        // Display results of all requests
        responseElement.textContent = JSON.stringify(results, null, 2);

        if (i < requestCount - 1 && requestInterval > 0) {
            await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
    }
}

async function sendRequest() {
    const endpoint = document.querySelector('.js-endpoint').value;
    const requestType = document.querySelector('.js-request-type').value;
    const payload = document.querySelector('.js-payload').value;
    const proxySelect = document.querySelector('.js-proxy-select');
    const statusElement = document.querySelector('.js-status');
    const statusTextElement = document.querySelector('.js-status-text');

    try {
        const selectedProxy = proxyOptions.find(option => option.value === proxySelect.value);
        let url = endpoint;
        if (selectedProxy && selectedProxy.url) {
            url = selectedProxy.url.replace('{url}', encodeURIComponent(endpoint));
        }

        const options = {
            method: requestType,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (requestType === 'POST') {
            options.body = payload;
        }

        const response = await fetch(url, options);
        
        statusElement.textContent = response.status;
        statusTextElement.textContent = response.statusText;

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Request failed:', error);
        statusElement.textContent = 'Error';
        statusTextElement.textContent = error.message;
        throw error; // Re-throw the error so it's caught in sendRequests
    }
}

function copyResponse() {
    const responseElement = document.querySelector('.js-response');
    const text = responseElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }, (err) => {
        console.error('Could not copy text: ', err);
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.className = "toast show";
    setTimeout(() => { 
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

function toggleScrollToTopButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}