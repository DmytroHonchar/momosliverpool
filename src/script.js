document.addEventListener("DOMContentLoaded", function () {
    const menuIcon = document.querySelector(".menu-icon");
    const closeButton = document.querySelector(".close-btn");
    const overlay = document.querySelector(".nav-overlay");
    const body = document.querySelector("body");

    // Open navigation overlay
    menuIcon.addEventListener("click", toggleNav);

    // Close navigation overlay
    closeButton.addEventListener("click", toggleNav);

    function toggleNav() {
        if (!overlay.classList.contains("active")) {
            overlay.classList.remove("inactive");
            overlay.classList.add("active");
            body.classList.add("no-scroll");
        } else {
            overlay.classList.remove("active");
            overlay.classList.add("inactive");
            body.classList.remove("no-scroll");
        }
    }
});

document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const messageStatus = document.getElementById("message-status");

    try {
        const response = await fetch("/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (result.success) {
            messageStatus.textContent = "Message sent successfully!";
            messageStatus.className = "message-success";
            form.reset();
        } else {
            messageStatus.textContent = result.message || "Failed to send message.";
            messageStatus.className = "message-error";
        }
    } catch (error) {
        console.error("Error:", error);
        messageStatus.textContent = "Failed to send message. Please try again later.";
        messageStatus.className = "message-error";
    }

    // Show the message for a few seconds, then hide it
    setTimeout(() => {
        messageStatus.className = "hidden";
    }, 3000); // Adjust the timeout as needed
});