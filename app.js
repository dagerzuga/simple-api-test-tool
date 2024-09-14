// Define proxy options
const proxyOptions = [
    { value: 'none', label: 'No Proxy', url: null },
    { value: 'corsproxy.io', label: 'corsproxy.io', url: 'https://corsproxy.io/?{url}' },
    { value: 'allorigins.win', label: 'allorigins.win', url: 'https://api.allorigins.win/raw?url={url}' },
    { value: 'cors.sh', label: 'cors.sh', url: 'https://cors.sh/?{url}' },
    { value: 'cors-anywhere', label: 'CORS Anywhere (Heroku)', url: 'https://cors-anywhere.herokuapp.com/{url}' },
    { value: 'custom', label: 'Custom Proxy', url: null }
];

document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('.js-send-request');
    const proxySelect = document.querySelector('.js-proxy-select');
    const copyButton = document.getElementById('copyButton');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const customProxyContainer = document.getElementById('customProxyContainer');
    const payloadFormatSelect = document.querySelector('.js-payload-format');

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
    proxySelect.addEventListener('change', toggleCustomProxyField);
    payloadFormatSelect.addEventListener('change', updatePayloadPlaceholder);

    updatePayloadPlaceholder();
});

function toggleCustomProxyField() {
    const proxySelect = document.querySelector('.js-proxy-select');
    const customProxyContainer = document.getElementById('customProxyContainer');
    customProxyContainer.style.display = proxySelect.value === 'custom' ? 'block' : 'none';
}

function updatePayloadPlaceholder() {
    const payloadFormatSelect = document.querySelector('.js-payload-format');
    const payloadTextarea = document.querySelector('.js-payload');
    const format = payloadFormatSelect.value;

    let placeholder = '';
    switch (format) {
        case 'application/json':
            placeholder = '{\n  "key": "value"\n}';
            break;
        case 'application/x-www-form-urlencoded':
            placeholder = 'key1=value1&key2=value2';
            break;
        case 'text/plain':
            placeholder = 'Enter plain text here';
            break;
        case 'application/xml':
            placeholder = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element>value</element>\n</root>';
            break;
    }

    payloadTextarea.placeholder = placeholder;
}

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
    const payloadFormat = document.querySelector('.js-payload-format').value;
    const proxySelect = document.querySelector('.js-proxy-select');
    const customProxyInput = document.querySelector('.js-custom-proxy');
    const statusElement = document.querySelector('.js-status');
    const statusTextElement = document.querySelector('.js-status-text');

    try {
        const selectedProxy = proxyOptions.find(option => option.value === proxySelect.value);
        let url = endpoint;
        if (selectedProxy && selectedProxy.url) {
            url = selectedProxy.url.replace('{url}', encodeURIComponent(endpoint));
        } else if (proxySelect.value === 'custom') {
            url = customProxyInput.value.replace('{url}', encodeURIComponent(endpoint));
        }

        const options = {
            method: requestType,
            headers: {
                'Content-Type': payloadFormat
            }
        };

        if (['POST', 'PUT', 'PATCH'].includes(requestType)) {
            options.body = payload;
        }

        const response = await fetch(url, options);
        
        statusElement.textContent = response.status;
        statusTextElement.textContent = response.statusText;

        const responseData = await response.text();
        try {
            return JSON.parse(responseData);
        } catch {
            return responseData;
        }
    } catch (error) {
        console.error('Request failed:', error);
        statusElement.textContent = 'Error';
        statusTextElement.textContent = error.message;
        throw error;
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