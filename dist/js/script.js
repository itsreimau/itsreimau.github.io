// Function to show the specified section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll(".dynamic-section");
    sections.forEach((section) => (section.style.display = "none"));
    document.getElementById(sectionId).style.display = "block";
}

// Preloader
window.onload = function() {
    setTimeout(function() {
        document.getElementById("preloader").style.display = "none";
    }, 2000);
};

// Automatically show the About Me section when the page loads
window.addEventListener("load", function() {
    showSection("aboutMe");
});