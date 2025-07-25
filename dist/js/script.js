// Tailwind Configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#0ea5e9",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e"
                },
                dark: {
                    900: "#0f172a",
                    800: "#1e293b",
                    700: "#334155",
                    600: "#475569",
                    500: "#64748b"
                }
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"]
            }
        }
    }
};

// Mobile menu toggle functionality
document.addEventListener("DOMContentLoaded", function() {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");

    mobileMenuButton.addEventListener("click", function() {
        const isHidden = mobileMenu.classList.contains("hidden");

        // Toggle menu visibility
        if (isHidden) {
            mobileMenu.classList.remove("hidden");
            mobileMenuButton.innerHTML = '<i class="fas fa-times text-xl"></i>';
        } else {
            mobileMenu.classList.add("hidden");
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        }
    });

    // Close menu when clicking on a link (for single page navigation)
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
        link.addEventListener("click", function() {
            mobileMenu.classList.add("hidden");
            mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
        });
    });
});