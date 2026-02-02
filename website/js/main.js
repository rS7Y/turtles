/**
 * Turtles Restaurant & Bar - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeaderScroll();
    initReservationForm();
    initSmoothScroll();
    setMinDate();
});

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    if (header) {
        const scrollThreshold = 50;

        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }
}

/**
 * Active Navigation Link on Scroll
 */
function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    function highlightNavLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink, { passive: true });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Reservation Form Handling
 */
function initReservationForm() {
    const form = document.getElementById('reservation-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('/api/reserve', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    showNotification('Reservation request submitted! We\'ll confirm via WhatsApp/call.', 'success');
                    form.reset();
                    setMinDate();
                } else {
                    throw new Error('Failed to submit');
                }
            } catch (error) {
                showNotification('Could not submit reservation. Please call +91 92700 11045 to book.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

/**
 * Set Minimum Date for Reservation to Today
 */
function setMinDate() {
    const dateInput = document.getElementById('date');
    
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        dateInput.min = `${year}-${month}-${day}`;
        dateInput.value = dateInput.min;
    }
}

/**
 * Show Notification Toast
 */
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <button class="notification__close" aria-label="Close">&times;</button>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 24px;
            right: 24px;
            max-width: 400px;
            padding: 16px 20px;
            background: #1a1a2e;
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        }
        .notification--success { border-left: 4px solid #10b981; }
        .notification--error { border-left: 4px solid #ef4444; }
        .notification p { margin: 0; flex: 1; }
        .notification__close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .notification__close:hover { opacity: 1; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    notification.querySelector('.notification__close').addEventListener('click', () => {
        notification.remove();
    });

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 6000);
}

/**
 * Lazy Load Images (using Intersection Observer)
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}
