const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const region = String(formData.get("region") || "").trim();
    const type = String(formData.get("type") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const status = contactForm.querySelector("[data-form-status]");

    if (!name || !email || !type || !message) {
      if (status) status.textContent = contactForm.dataset.requiredMessage || "Please complete the required fields.";
      return;
    }

    const subject = encodeURIComponent(`TMS Labs inquiry: ${type}`);
    const body = encodeURIComponent([
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Country/Region: ${region || "Not provided"}`,
      `Inquiry Type: ${type}`,
      "",
      message
    ].join("\n"));

    window.location.href = `mailto:hello@tmslabs.net?subject=${subject}&body=${body}`;
    if (status) status.textContent = contactForm.dataset.successMessage || "Your email app should open with the inquiry prepared.";
  });
}

document.querySelectorAll("[data-calendly]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const href = button.getAttribute("href");
    if (href && href !== "#") return;
    event.preventDefault();
    const message = button.dataset.message || "Scheduling link coming soon. Please email hello@tmslabs.net.";
    window.location.href = `mailto:hello@tmslabs.net?subject=${encodeURIComponent("Schedule a call with TMS Labs")}&body=${encodeURIComponent(message)}`;
  });
});
