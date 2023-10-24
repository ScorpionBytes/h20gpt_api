const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "PASTE-YOUR-API-KEY-HERE"; // Paste your API key here

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    document.body.classList.add("light-mode");

    const defaultText = `<div class="default-text">
    <h1>Chatten Sie mit öffentlichen IT-Daten</h1>
    <p>Beginnen Sie eine Unterhaltung und entdecken Sie Informationen aus öffentlichen IT-Quellen.<br> Ihre Chat-Historie wird hier angezeigt.</p>
</div>
`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}

const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    try {
        console.log("Vor dem fetch");
        const response = await fetch('/get_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_input: userText})
        });
        console.log("Nach dem fetch", response);
        const data = await response.json();
        console.log("Nach dem JSON-Parsing", data);

const chatResponseDiv = incomingChatDiv.querySelector(".chat-response");

// Alle Kinder von chatResponseDiv entfernen
while (chatResponseDiv.firstChild) {
    chatResponseDiv.removeChild(chatResponseDiv.firstChild);
}

if (data.response) {
    const trimmedResponse = data.response.trim();
        const formattedResponse = trimmedResponse.replace(/\n/g, "  \n");

    const htmlContent = marked.marked(formattedResponse ); // Verwenden Sie einfach `marked`
    chatResponseDiv.innerHTML = `<p>${htmlContent}</p>`;  // removeEmptyParagraphs(chatResponseDiv);
        } else if (data.error) {
            chatResponseDiv.innerHTML = `<p>Error: ${data.error}</p>`;

} else if (data.error) {
    chatResponseDiv.innerHTML = `<p>Error: ${data.error}</p>`;
}


        // Remove the typing animation and save the chats to local storage
        incomingChatDiv.querySelector(".typing-animation").remove();
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

    } catch (error) {
        console.log("Fehler aufgetreten", error);
        const chatResponseDiv = incomingChatDiv.querySelector(".chat-response");
        chatResponseDiv.innerHTML = `<p class="error">Oops! Something went wrong while retrieving the response. Please try again.</p>`;
    }
}

function removeEmptyParagraphs(element) {
    const paragraphs = element.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (!p.textContent.trim()) {
            p.remove();
        }
    });
}
const copyResponse = (copyBtn) => {
    const closestChatContent = copyBtn.closest('.chat-content');
    if (closestChatContent) {
        const chatDetails = closestChatContent.querySelector('.chat-details');
        if (chatDetails) {
            const chatResponseDiv = chatDetails.querySelector(".chat-response");
            if (chatResponseDiv) {
                const htmlContent = chatResponseDiv.innerHTML;
                navigator.clipboard.writeText(htmlContent)
                    .then(() => {
                        console.log("HTML erfolgreich kopiert.");
                        copyBtn.textContent = "done";
                        setTimeout(() => copyBtn.textContent = "content_copy", 1000);
                    })
                    .catch(err => {
                        console.error("Fehler beim Kopieren:", err);
                    });
            } else {
                console.error("Kein .chat-response Element gefunden");
            }
        } else {
            console.error("Kein Element mit der Klasse .chat-details gefunden");
        }
    } else {
        console.error("Kein übergeordnetes Element mit der Klasse .chat-content gefunden");
    }
};





const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
<img src="/static/images/chatbot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                        <div class="chat-response">
                        
</div>
                        
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if (!userText) return; // If chatInput is empty return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
<img src="/static/images/user.png" alt="user-img">
                        
                                                <div class="chat-response">
                                                <p>${userText}</p>
</div>
                    </div>
                </div>`;

    // Create an outgoing chat div with user's message and append it to chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});


const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
});

document.addEventListener('DOMContentLoaded', (event) => {
    const copyButtons = document.querySelectorAll('.material-symbols-rounded');
    copyButtons.forEach((button) => {
        button.addEventListener('click', () => {
            console.log('Button clicked!');
        });
    });
});


loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
chatContainer.addEventListener('click', function(event) {
    if (event.target.matches('.material-symbols-rounded')) {
        copyResponse(event.target);
    }
});
