document.addEventListener("DOMContentLoaded", function () {
    // Add sidebar toggle button
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    const calendar = document.querySelector('.calendar');

    // Create mobile navbar
    const mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-nav';
    mobileNav.innerHTML = ` 
        <button class="mobile-nav-toggle">
            <i class="bi bi-list"></i>
        </button>
        <h5 class="mobile-title">Teacher Organizer</h5>
        <div style="width: 24px;"></div> <!-- Spacer for alignment -->
    `;
    document.body.insertBefore(mobileNav, document.body.firstChild);

    // Create overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    // Create toggle button
    const toggleButton = document.createElement('div');
    toggleButton.className = 'sidebar-toggle';
    toggleButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
    sidebar.appendChild(toggleButton);
    // Toggle sidebar on button click
    toggleButton.addEventListener('click', function () {
        // Check if sidebar is collapsed or mobile-visible
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-visible');
            overlay.classList.toggle('active');
        } else {
            sidebar.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        }

        // Переворот стрелки
        toggleButton.querySelector('i').classList.toggle('rotated');

        // Save state to localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));

        if (window.calendar && typeof window.calendar.updateSize === 'function') {
            // Используем requestAnimationFrame для синхронизации с браузерной анимацией
            requestAnimationFrame(() => {
                setTimeout(() => window.calendar.updateSize(), 300); // Задержка после анимации
            });
        }
        
    });

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
        if (calendar) calendar.classList.add('expanded'); // календарь тоже сдвинем
    }

    // Toggle sidebar on mobile menu button click
    document.querySelector('.mobile-nav-toggle').addEventListener('click', function () {
        sidebar.classList.toggle('mobile-visible');
        overlay.classList.toggle('active');
        
    });

    // Close sidebar when clicking on overlay
    overlay.addEventListener('click', function () {
        sidebar.classList.remove('mobile-visible');
        overlay.classList.remove('active');
        
    });

    // Close sidebar when clicking on a menu item on mobile
    document.querySelectorAll('.menu a').forEach(item => {
        item.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-visible');
                overlay.classList.remove('active');
                
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-visible');
            overlay.classList.remove('active');
        }
        
    });
});
