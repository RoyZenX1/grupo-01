(() => {
    const layout = document.querySelector(".layout");
    const toggle = document.querySelector(".menu-toggle");
    const mobileToggle = document.querySelector(".mobile-menu-toggle");

    if (!layout || !toggle || !mobileToggle) {
        return;
    }

    const storageKey = "nexocargo-sidebar-collapsed";
    const isMobile = () => window.matchMedia("(max-width: 700px)").matches;

    const setMenuState = (collapsed) => {
        layout.classList.toggle("sidebar-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.setAttribute(
            "aria-label",
            collapsed ? "Expandir menú" : "Contraer menú"
        );
    };

    const savedState = localStorage.getItem(storageKey) === "true";
    setMenuState(!isMobile() && savedState);

    toggle.addEventListener("click", () => {
        const collapsed = !layout.classList.contains("sidebar-collapsed");
        setMenuState(collapsed);

        if (!isMobile()) {
            localStorage.setItem(storageKey, String(collapsed));
        }
    });

    mobileToggle.addEventListener("click", () => {
        setMenuState(false);
    });

    window.addEventListener("resize", () => {
        if (isMobile()) {
            setMenuState(false);
        } else {
            setMenuState(localStorage.getItem(storageKey) === "true");
        }
    });
})();