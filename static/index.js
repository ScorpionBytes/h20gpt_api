const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    document.body.classList.add("light-mode");

    const defaultText = `<div class="default-text">
    <h1>ÖFIT Chatbot</h1>
    <p>Beginnen Sie eine Unterhaltung und entdecken Sie Informationen aus öffentlichen IT-Quellen.<br> Ihre Chat-Historie wird hier angezeigt.</p>
</div>
`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
}
// Laden der mapping.json Datei
const loadMappingData = async () => {
    const response = await fetch('/static/mapping.json'); // Pfad zur mapping.json Datei anpassen
    const mappingData = await response.json();
    return mappingData;
};

// Funktion zum Finden des Dateinamens basierend auf der URL
const findUrlByFileName = (fileName, mappingData) => {
    // Entfernen Sie den Pfad und die Dateiendung, um nur den Titel zu erhalten
    const title = fileName.replace('user_path/', '').replace('.txt', '').replace('.pdf', '');
    // Suchen der URL basierend auf dem Titel
    const url = mappingData[title];
    return url || "URL nicht gefunden";
};
const createChatElement = (content, className) => {
    // Create new div and apply chat, specified class and set html content of div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv) => {
    try {
        const HOST = "https://dd2131c7c4033653b2.gradio.live"; // Fügen Sie Ihren Host hier ein
        const response = await fetch('/get_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_input: userText})
        });
        const data = await response.json();

        const chatResponseDiv = incomingChatDiv.querySelector(".chat-response");

        // Alle Kinder von chatResponseDiv entfernen
        while (chatResponseDiv.firstChild) {
            chatResponseDiv.removeChild(chatResponseDiv.firstChild);
        }

        if (data.response) {
            const trimmedResponse = data.response.trim();
            const htmlContent = marked.marked(trimmedResponse);
            chatResponseDiv.innerHTML = `<p>${htmlContent}</p>`;
 const firstEmptyP = chatResponseDiv.querySelector('p:empty');
        if (firstEmptyP) {
            chatResponseDiv.removeChild(firstEmptyP);
        }        const mappingData = await loadMappingData();

            // Füge Quellen hinzu
            if (data.sources && data.sources.length > 0) {
                let sourcesHtml = "<div class='sources'><strong>Sources</strong><br>Sources [Score | Link]:<br>";
            data.sources.forEach(source => {
                const fileName = source.source.replace('user_path/', '').replace('.txt', ''); // Entfernen Sie den Pfad und die Dateiendung
                const url = findUrlByFileName(fileName, mappingData); // Reverse-Mapping hier
                sourcesHtml += `${source.score.toFixed(2)} | <a href="${url}" target="_blank">${fileName}</a><br>${source.content}<br>`;
            });
                sourcesHtml += "End Sources</div>";
                chatResponseDiv.innerHTML += sourcesHtml;
            }
        } else if (data.error) {
            chatResponseDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        }

        // Remove the typing animation and save the chats to local storage
        incomingChatDiv.querySelector(".typing-animation").remove();
        localStorage.setItem("all-chats", chatContainer.innerHTML);
        chatContainer.scrollTo(0, chatContainer.scrollHeight);

    } catch (error) {
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
    if (confirm("Bist du sicher, dass du alle Chats löschen möchtest?")) {
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
