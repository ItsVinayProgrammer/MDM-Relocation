import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {

    const mainHeader = document.getElementById('main-header');

    // --- Dynamic "Move Type" Form Logic ---
    const setupMoveTypeSelection = () => {
        const quoteForm = document.getElementById('quote-form');
        if (!quoteForm) return;

        const moveTypeRadios = quoteForm.querySelectorAll<HTMLInputElement>('input[name="move-type"]');
        const interCityFields = document.getElementById('inter-city-fields') as HTMLElement;
        const withinCityFields = document.getElementById('within-city-fields') as HTMLElement;

        const fromLocationInput = document.getElementById('from-location') as HTMLInputElement;
        const toLocationInput = document.getElementById('to-location') as HTMLInputElement;
        const cityNameInput = document.getElementById('city-name') as HTMLInputElement;

        const handleMoveTypeChange = (selectedValue: 'inter' | 'within') => {
            const glowClass = 'field-glow-animate';

            if (selectedValue === 'within') {
                withinCityFields.classList.add('visible');
                interCityFields.classList.remove('visible');

                cityNameInput.required = true;
                fromLocationInput.required = false;
                toLocationInput.required = false;
                
                withinCityFields.classList.add(glowClass);
                setTimeout(() => withinCityFields.classList.remove(glowClass), 1500);

            } else { // 'inter'
                interCityFields.classList.add('visible');
                withinCityFields.classList.remove('visible');

                cityNameInput.required = false;
                fromLocationInput.required = true;
                toLocationInput.required = true;

                interCityFields.classList.add(glowClass);
                setTimeout(() => interCityFields.classList.remove(glowClass), 1500);
            }
        };

        moveTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                handleMoveTypeChange(target.value as 'inter' | 'within');
            });
        });

        // Initial setup on page load
        const initiallyChecked = quoteForm.querySelector<HTMLInputElement>('input[name="move-type"]:checked');
        if (initiallyChecked) {
            handleMoveTypeChange(initiallyChecked.value as 'inter' | 'within');
        }
    };


    // --- Smooth Scrolling for all .scroll-link elements ---
    const setupSmoothScrolling = () => {
        const scrollLinks = document.querySelectorAll('.scroll-link');
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
                const targetElement = targetId ? document.querySelector(targetId) : null;
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                 // Close mobile menu on link click
                if (mainHeader?.classList.contains('mobile-menu-open')) {
                    mainHeader.classList.remove('mobile-menu-open');
                }
            });
        });
    };

    // --- Sticky Header Styling & Scrollspy ---
    const handleHeaderScroll = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        window.addEventListener('scroll', () => {
            // Header sticky class
            if (window.scrollY > 50) {
                mainHeader?.classList.add('scrolled');
            } else {
                mainHeader?.classList.remove('scrolled');
            }

            // Scrollspy logic
            let current = "";
            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute("id") || "";
                }
            });

            navLinks.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${current}`) {
                    link.classList.add("active");
                }
            });
        });
    };

    // --- Parallax Hero Background ---
    const setupParallaxHero = () => {
        const parallaxBg = document.querySelector('.hero-background-parallax') as HTMLElement;
        if (!parallaxBg) return;

        window.addEventListener('scroll', () => {
            const offset = window.pageYOffset;
            parallaxBg.style.transform = `translateY(${offset * 0.3}px)`;
        });
    };


    // --- Mobile Menu Toggle ---
    const setupMobileMenu = () => {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle && mainHeader) {
            mobileMenuToggle.addEventListener('click', () => {
                mainHeader.classList.toggle('mobile-menu-open');
            });
        }
    };

    // --- Fade-in on Scroll using IntersectionObserver ---
    const setupScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.fade-in');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    };

    // --- Testimonial Slider ---
    const setupTestimonialSlider = () => {
        const slidesContainer = document.querySelector('.testimonial-slides') as HTMLElement;
        const slides = document.querySelectorAll('.testimonial-card');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (!slidesContainer || slides.length === 0) return;

        let currentIndex = 0;
        let slideInterval: number;

        const goToSlide = (index: number) => {
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % slides.length;
            goToSlide(currentIndex);
        };
        
        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(currentIndex);
        }

        const startAutoPlay = () => {
            slideInterval = window.setInterval(nextSlide, 5000);
        };
        
        const resetAutoPlay = () => {
            clearInterval(slideInterval);
            startAutoPlay();
        };

        nextBtn?.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });

        prevBtn?.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });

        startAutoPlay();
    };

    // --- Animated Counters ---
    const setupAnimatedCounters = () => {
        const counters = document.querySelectorAll('.stat-counter');
        const speed = 200; // a smaller number is faster

        const animate = (counter: HTMLElement, target: number) => {
            const suffix = counter.dataset.suffix || '';
            const updateCount = () => {
                const current = +(counter.innerText.replace(/,/g, ''));
                const increment = target / speed;

                if (current < target) {
                    counter.innerText = `${Math.ceil(current + increment).toLocaleString()}`;
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = `${target.toLocaleString()}${suffix}`;
                }
            };
            updateCount();
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target as HTMLElement;
                    const target = +(counter.getAttribute('data-target') || 0);
                    animate(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    };
    
    // --- Enhanced Popup Logic ---
    const exitIntentPopup = document.getElementById('exit-intent-popup');

    const hidePopup = () => {
        if (exitIntentPopup) {
            exitIntentPopup.classList.remove('active');
            setTimeout(() => {
                 (exitIntentPopup as HTMLElement).style.display = 'none';
            }, 300);
        }
    };

    const setupPopupTriggers = () => {
        if (!exitIntentPopup) return;

        const closeModalButton = exitIntentPopup.querySelector('.close-modal');
        
        const showPopup = () => {
            // Check session storage to ensure we don't spam the user.
            if (sessionStorage.getItem('mdm_popup_shown') === 'true') {
                window.removeEventListener('scroll', handleScroll); // Cleanup listener
                return;
            }

            (exitIntentPopup as HTMLElement).style.display = 'flex';
            setTimeout(() => exitIntentPopup.classList.add('active'), 10);
            sessionStorage.setItem('mdm_popup_shown', 'true');
            
            // Once shown, the scroll trigger is no longer needed for this session.
            window.removeEventListener('scroll', handleScroll);
        };
        
        const handleScroll = () => {
            // Show when user scrolls past 40% of the page
            if (window.scrollY > (document.body.scrollHeight * 0.4)) {
                showPopup();
            }
        };

        // --- POPUP TRIGGERS ---
        // 1. On Entry: Show after a 3-second delay.
        setTimeout(showPopup, 3000);

        // 2. On Scroll: Show as a reminder.
        window.addEventListener('scroll', handleScroll, { passive: true });

        // 3. On Exit-Intent: Show when the user intends to leave (desktop only).
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0) {
                showPopup();
            }
        });
        
        // --- Event listeners for closing the popup ---
        closeModalButton?.addEventListener('click', hidePopup);
        exitIntentPopup.addEventListener('click', (e) => {
            // Close if the user clicks on the overlay background
            if (e.target === exitIntentPopup) {
                hidePopup();
            }
        });
    };

    // --- Toast Notification Logic ---
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    };

    // --- Form Submission Handling ---
    const setupFormSubmission = () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                try {
                    // Save form data to Firestore (collection name: 'submissions')
                    await addDoc(collection(db, 'submissions'), {
                        ...data,
                        submittedAt: new Date().toISOString(),
                        formId: form.id || null
                    });
                    showToast('Thank you for your submission! We will get back to you shortly.');
                    form.reset();
                    document.dispatchEvent(new CustomEvent('custom-form-reset', { detail: { formId: form.id } }));
                    if(form.closest('.modal-overlay')) {
                        hidePopup();
                    }
                } catch (error) {
                    console.error('Error saving to Firestore:', error);
                    showToast('Submission failed. Please try again.', 'error');
                }
            });
        });
    };
    
    // --- Custom Date Picker ---
    const setupDatePicker = () => {
        const container = document.getElementById('date-picker-container');
        if (!container) return;
    
        const display = document.getElementById('moving-date-display') as HTMLDivElement;
        const displaySpan = display.querySelector('span') as HTMLSpanElement;
        const hiddenInput = document.getElementById('moving-date') as HTMLInputElement;
        const popup = document.getElementById('calendar-popup') as HTMLDivElement;
        const headerBtn = document.getElementById('calendar-month-year-btn') as HTMLButtonElement;
        const headerLabel = document.getElementById('calendar-month-year-label') as HTMLSpanElement;
        const prevMonthBtn = popup.querySelector('.prev-month') as HTMLButtonElement;
        const nextMonthBtn = popup.querySelector('.next-month') as HTMLButtonElement;
        
        const dayView = document.getElementById('calendar-day-view') as HTMLDivElement;
        const monthView = document.getElementById('calendar-month-view') as HTMLDivElement;
        const yearView = document.getElementById('calendar-year-view') as HTMLDivElement;
        const calendarBody = document.getElementById('calendar-body') as HTMLDivElement;
        
        const flexibleDateCheckbox = document.getElementById('flexible-date') as HTMLInputElement;
    
        let viewDate = new Date();
        let selectedDate: Date | null = null;
        let currentView: 'day' | 'month' | 'year' = 'day';
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yearRange = 12; // Number of years to show in the year view
    
        const formatISODate = (date: Date) => date.toISOString().split('T')[0];
        const formatDisplayDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
        const renderDayView = () => {
            calendarBody.innerHTML = '';
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            headerLabel.textContent = `${viewDate.toLocaleString('en-US', { month: 'long' })} ${year}`;
    
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            const lastDateOfPrevMonth = new Date(year, month, 0).getDate();
    
            // Previous month's dates
            for (let i = firstDayOfMonth; i > 0; i--) {
                const dateEl = document.createElement('button');
                dateEl.type = 'button';
                dateEl.className = 'calendar-date prev-month-date';
                dateEl.textContent = (lastDateOfPrevMonth - i + 1).toString();
                dateEl.disabled = true;
                calendarBody.appendChild(dateEl);
            }
    
            // Current month's dates
            for (let i = 1; i <= lastDateOfMonth; i++) {
                const dateEl = document.createElement('button');
                dateEl.type = 'button';
                dateEl.className = 'calendar-date';
                dateEl.textContent = i.toString();
    
                const fullDate = new Date(year, month, i);
                fullDate.setHours(0, 0, 0, 0);
                
                dateEl.setAttribute('data-date', formatISODate(fullDate));
    
                if (fullDate < today) {
                    dateEl.classList.add('disabled');
                    dateEl.disabled = true;
                }
                if (fullDate.getTime() === today.getTime()) {
                    dateEl.classList.add('today');
                }
                if (selectedDate && fullDate.getTime() === selectedDate.getTime()) {
                    dateEl.classList.add('selected');
                    dateEl.setAttribute('aria-selected', 'true');
                }
                
                if (!dateEl.disabled) {
                    dateEl.addEventListener('click', () => handleDateSelect(fullDate));
                }
                
                calendarBody.appendChild(dateEl);
            }

            const totalCells = calendarBody.children.length;
            const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;

            for (let i = 1; i <= remainingCells; i++) {
                const dateEl = document.createElement('button');
                dateEl.type = 'button';
                dateEl.className = 'calendar-date next-month-date';
                dateEl.textContent = i.toString();
                dateEl.disabled = true;
                calendarBody.appendChild(dateEl);
            }
        };

        const renderMonthView = () => {
            monthView.innerHTML = '';
            headerLabel.textContent = `${viewDate.getFullYear()}`;
            const monthNames = [...Array(12).keys()].map(i => new Date(0, i).toLocaleString('en-US', { month: 'short' }));

            monthNames.forEach((month, index) => {
                const monthEl = document.createElement('button');
                monthEl.type = 'button';
                monthEl.className = 'month-cell';
                monthEl.textContent = month;
                monthEl.dataset.month = index.toString();

                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();

                if (viewDate.getFullYear() < currentYear || (viewDate.getFullYear() === currentYear && index < currentMonth)) {
                    monthEl.classList.add('disabled');
                    monthEl.disabled = true;
                }
                
                if(viewDate.getFullYear() === (selectedDate?.getFullYear() ?? -1) && index === selectedDate?.getMonth()){
                    monthEl.classList.add('selected');
                }

                monthEl.addEventListener('click', () => {
                    viewDate.setMonth(index);
                    updateView('day');
                });
                monthView.appendChild(monthEl);
            });
        };

        const renderYearView = () => {
            yearView.innerHTML = '';
            const startYear = viewDate.getFullYear() - Math.floor(yearRange / 2);
            const endYear = startYear + yearRange - 1;
            headerLabel.textContent = `${startYear} - ${endYear}`;

            for (let i = 0; i < yearRange; i++) {
                const year = startYear + i;
                const yearEl = document.createElement('button');
                yearEl.type = 'button';
                yearEl.className = 'year-cell';
                yearEl.textContent = year.toString();
                yearEl.dataset.year = year.toString();
                
                if (year < today.getFullYear()) {
                     yearEl.classList.add('disabled');
                     yearEl.disabled = true;
                }
                
                if(year === selectedDate?.getFullYear()){
                    yearEl.classList.add('selected');
                }
                
                yearEl.addEventListener('click', () => {
                    viewDate.setFullYear(year);
                    updateView('month');
                });
                yearView.appendChild(yearEl);
            }
        };
        
        const updateView = (view: 'day' | 'month' | 'year', focusEl = true) => {
            currentView = view;

            dayView.classList.toggle('hidden', view !== 'day');
            monthView.classList.toggle('hidden', view !== 'month');
            yearView.classList.toggle('hidden', view !== 'year');
            
            let focusTarget: HTMLElement | null = null;

            if (view === 'day') {
                renderDayView();
                if (focusEl) focusTarget = calendarBody.querySelector('.selected, .today, .calendar-date:not(:disabled)');
            } else if (view === 'month') {
                renderMonthView();
                if (focusEl) focusTarget = monthView.querySelector('.selected, .month-cell:not(:disabled)');
            } else if (view === 'year') {
                renderYearView();
                if (focusEl) focusTarget = yearView.querySelector('.selected, .year-cell:not(:disabled)');
            }
            
            if (focusTarget) {
                 setTimeout(() => (focusTarget as HTMLElement)?.focus(), 100);
            }
        };
    
        const handleDateSelect = (date: Date) => {
            selectedDate = date;
            hiddenInput.value = formatISODate(date);
            displaySpan.textContent = formatDisplayDate(date);
            displaySpan.classList.remove('placeholder');
            flexibleDateCheckbox.checked = false;
            handleCheckboxChange();
            togglePopup(false);
        };
    
        const togglePopup = (show?: boolean) => {
            const isVisible = popup.classList.contains('visible');
            const shouldShow = show !== undefined ? show : !isVisible;
            
            if (shouldShow) {
                viewDate = selectedDate ? new Date(selectedDate) : new Date();
                viewDate.setDate(1); // Start at beginning of month
                popup.classList.add('visible');
                display.classList.add('active');
                display.setAttribute('aria-expanded', 'true');
                updateView('day');
            } else {
                popup.classList.remove('visible');
                display.classList.remove('active');
                display.setAttribute('aria-expanded', 'false');
            }
        };
    
        const handleCheckboxChange = () => {
            const isChecked = flexibleDateCheckbox.checked;
            hiddenInput.required = !isChecked;
            display.classList.toggle('disabled', isChecked);
            if(isChecked) {
                togglePopup(false);
            }
        };
        
        display.addEventListener('click', () => !flexibleDateCheckbox.checked && togglePopup());
        display.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !flexibleDateCheckbox.checked) {
                e.preventDefault();
                togglePopup();
            }
        });

        headerBtn.addEventListener('click', () => {
            if (currentView === 'day') updateView('month');
            else if (currentView === 'month') updateView('year');
        });
        
        prevMonthBtn.addEventListener('click', () => {
            if (currentView === 'day') viewDate.setMonth(viewDate.getMonth() - 1);
            else if (currentView === 'month') viewDate.setFullYear(viewDate.getFullYear() - 1);
            else if (currentView === 'year') viewDate.setFullYear(viewDate.getFullYear() - yearRange);
            updateView(currentView, false);
        });
    
        nextMonthBtn.addEventListener('click', () => {
            if (currentView === 'day') viewDate.setMonth(viewDate.getMonth() + 1);
            else if (currentView === 'month') viewDate.setFullYear(viewDate.getFullYear() + 1);
            else if (currentView === 'year') viewDate.setFullYear(viewDate.getFullYear() + yearRange);
            updateView(currentView, false);
        });
    
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target as Node)) {
                togglePopup(false);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.classList.contains('visible')) {
                togglePopup(false);
                display.focus();
            }
        });
        
        popup.addEventListener('keydown', e => {
            const target = e.target as HTMLButtonElement;
            const isDay = target.classList.contains('calendar-date');
            const isMonth = target.classList.contains('month-cell');
            const isYear = target.classList.contains('year-cell');

            if (!isDay && !isMonth && !isYear) return;

            let elements: HTMLButtonElement[] = [];
            let currentIndex = -1;
            let cols = 7;

            if (isDay) {
                elements = Array.from(calendarBody.querySelectorAll('.calendar-date:not(.prev-month-date):not(.next-month-date)'));
                cols = 7;
            } else if (isMonth) {
                elements = Array.from(monthView.querySelectorAll('.month-cell'));
                cols = 3;
            } else if (isYear) {
                elements = Array.from(yearView.querySelectorAll('.year-cell'));
                cols = 4;
            }

            currentIndex = elements.findIndex(el => el === target);
            if (currentIndex === -1) return;

            let newIndex = currentIndex;
        
            switch(e.key) {
                case 'ArrowRight': newIndex = Math.min(elements.length - 1, currentIndex + 1); break;
                case 'ArrowLeft': newIndex = Math.max(0, currentIndex - 1); break;
                case 'ArrowDown': newIndex = Math.min(elements.length - 1, currentIndex + cols); break;
                case 'ArrowUp': newIndex = Math.max(0, currentIndex - cols); break;
                case 'Enter': case ' ': target.click(); return;
                case 'Home': newIndex = 0; break;
                case 'End': newIndex = elements.length - 1; break;
                default: return;
            }
            e.preventDefault();
            
            if (newIndex !== currentIndex && elements[newIndex] && !elements[newIndex].disabled) {
                elements[newIndex].focus();
            }
        });

        flexibleDateCheckbox.addEventListener('change', handleCheckboxChange);

        document.addEventListener('custom-form-reset', (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.formId !== 'quote-form') return;
            selectedDate = null;
            hiddenInput.value = '';
            displaySpan.textContent = 'Select a date...';
            displaySpan.classList.add('placeholder');
            flexibleDateCheckbox.checked = false;
            handleCheckboxChange();
        });
    
        // Initial setup
        handleCheckboxChange();
        if(hiddenInput.value){
             const date = new Date(hiddenInput.value + 'T00:00:00');
             handleDateSelect(date);
        }
    };

    // --- AI Assistant Logic ---
    const setupAIAssistant = () => {
        const toggleBtn = document.getElementById('ai-assistant-toggle');
        const chatWindow = document.getElementById('ai-chat-window');
        const closeBtn = document.getElementById('ai-chat-close');
        const sendBtn = document.getElementById('ai-chat-send');
        const chatInput = document.getElementById('ai-chat-input') as HTMLInputElement;
        const chatMessages = document.getElementById('ai-chat-messages');

        if (!toggleBtn || !chatWindow || !closeBtn || !sendBtn || !chatInput || !chatMessages) return;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const model = "gemini-3-flash-preview";

        const toggleChat = () => {
            const isHidden = chatWindow.classList.toggle('hidden');
            toggleBtn.setAttribute('aria-expanded', (!isHidden).toString());
            
            if (!isHidden) {
                chatInput.focus();
            } else {
                toggleBtn.focus();
            }
        };

        // Close on Escape key
        chatWindow.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !chatWindow.classList.contains('hidden')) {
                toggleChat();
            }
        });

        const addMessage = (text: string, sender: 'bot' | 'user', isError = false) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-message ${sender} ${isError ? 'error' : ''}`;
            
            if (sender === 'bot') {
                // Render markdown for bot messages
                msgDiv.innerHTML = marked.parse(text) as string;
                
                if (isError) {
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'ai-retry-btn';
                    retryBtn.innerHTML = '<i class="fas fa-redo"></i> Retry';
                    retryBtn.onclick = () => {
                        const lastUserMsg = Array.from(chatMessages.querySelectorAll('.ai-message.user')).pop();
                        if (lastUserMsg) {
                            handleSendMessage(lastUserMsg.textContent || '');
                        }
                        msgDiv.remove(); // Remove error message on retry
                    };
                    msgDiv.appendChild(retryBtn);
                }
            } else {
                msgDiv.textContent = text;
            }
            
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const showTypingIndicator = () => {
            const indicator = document.createElement('div');
            indicator.id = 'ai-typing-indicator';
            indicator.className = 'ai-typing-indicator';
            indicator.setAttribute('role', 'status');
            indicator.setAttribute('aria-label', 'AI is typing');
            indicator.innerHTML = `
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            `;
            chatMessages.appendChild(indicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const hideTypingIndicator = () => {
            const indicator = document.getElementById('ai-typing-indicator');
            if (indicator) indicator.remove();
        };

        const handleSendMessage = async (retryText?: string) => {
            const text = retryText || chatInput.value.trim();
            if (!text) return;

            if (!retryText) {
                addMessage(text, 'user');
                chatInput.value = '';
            }

            showTypingIndicator();

            try {
                const response = await ai.models.generateContent({
                    model: model,
                    contents: text,
                    config: {
                        systemInstruction: `You are **MDM AI**, the lead relocation strategist for **MDM Relocation**. Your mission is to turn the stressful process of moving into a seamless, reassuring experience for every user.

**Your Personality:**
- **Empathetic Expert:** You understand that moving is a major life transition. Your tone should be warm, calm, and deeply knowledgeable.
- **Proactive Guide:** Don't just answer; anticipate. If someone asks about packing, mention fragile items. If they ask about timing, mention decluttering.
- **Reassuring:** Use phrases like "I'm here to help you every step of the way," "We'll handle the heavy lifting," and "Your belongings are in safe hands."

**Interaction Guidelines:**
- **Acknowledge & Validate:** Start by acknowledging the user's specific situation (e.g., "Moving a whole house is a big task, but don't worry—I've got a plan for you.").
- **Concise Brilliance:** Use clear headings and bullet points. Keep it scannable for a chat window.
- **Actionable Advice:** Provide "Expert Pro-Tips" in your responses (e.g., "Pro-Tip: Pack an 'Essentials Box' for your first night.").
- **Direct to Value:** For pricing, always guide them to the **'Get a Quote'** form on our site for an instant, transparent estimate.

**Service Expertise (MDM Standards):**
- **Home Shifting:** Premium multi-layer packing (bubble wrap, foam, heavy-duty cartons).
- **Office Relocation:** Systematic IT handling and zero-downtime strategies.
- **Vehicle Transport:** Specialized closed-container carriers for cars and bikes.
- **Storage:** 24/7 CCTV-monitored, moisture-free warehousing.

**The MDM Promise:**
- Damage-Free Guarantee, Real-Time Tracking, No Hidden Costs, and Background-Verified Professionals.`,
                    }
                });

                hideTypingIndicator();
                const botResponse = response.text || "I'm sorry, I couldn't process that right now. Please try again or contact our support.";
                addMessage(botResponse, 'bot');
            } catch (error) {
                hideTypingIndicator();
                console.error("AI Error:", error);
                addMessage("I'm having a bit of trouble connecting to my servers. Would you like to try sending that again?", 'bot', true);
            }
        };

        toggleBtn.addEventListener('click', toggleChat);
        closeBtn.addEventListener('click', toggleChat);
        sendBtn.addEventListener('click', () => handleSendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
    };

    // Initialize all features
    setupMoveTypeSelection();
    setupSmoothScrolling();
    handleHeaderScroll();
    setupParallaxHero();
    setupMobileMenu();
    setupScrollAnimations();
    setupTestimonialSlider();
    setupAnimatedCounters();
    setupFormSubmission();
    setupPopupTriggers();
    setupDatePicker();
    setupAIAssistant();
});