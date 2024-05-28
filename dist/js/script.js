// Function to show the specified section and hide others
function showSection(sectionId) {
    document.getElementById("aboutMe").style.display = "none";
    document.getElementById("project").style.display = "none";
    document.getElementById("contact").style.display = "none";
    document.getElementById(sectionId).style.display = "block";
}

// Automatically show the About Me section when the page loads
window.addEventListener("load", function () {
    showSection("aboutMe");
});

// Contact form submission handling
document.getElementById("contact-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Retrieve values from the form inputs
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    // Create a message to send to the Telegram bot
    var telegramMessage = "Name: " + name + "\nEmail: " + email + "\nMessage: " + message;

    // Telegram bot token and chat ID
    var botToken = "6482372056:AAE1XqjJHUuLJnExe8dRqQ43Oh5FZsOzFUc";
    var chatId = "1478393648";

    // Function to send message to Telegram bot
    sendMessageToTelegram(botToken, telegramMessage, chatId)
        .then((response) => {
            if (response.ok) {
                alert("Your message has been sent!");
            } else {
                return response.text().then((text) => {
                    throw new Error(text);
                });
            }
        })
        .catch((error) => {
            console.error("There was a problem sending your message: ", error);
            alert("There was a problem sending your message. Error: " + error.message);
        });
});

// Function to send message to Telegram bot
function sendMessageToTelegram(token, message, chatId) {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
        chat_id: chatId,
        text: message,
    };

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}