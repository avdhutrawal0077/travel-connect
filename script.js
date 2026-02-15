/**
 * Premium Desktop UI - Interactive JavaScript
 * Handles page transitions, chat interactions, and animations
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        animationDuration: 400,
        staggerDelay: 100,
        pageTransitionDuration: 500,
        observerThreshold: 0.2,
        easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    };

    // DOM Elements
    const elements = {
        postCards: document.querySelectorAll('.post-card[data-animate="pop-in"]'),
        sidebarNavItems: document.querySelectorAll('.sidebar-nav-item'),
        notificationBtn: document.querySelector('.notification-btn'),
        mainContent: document.querySelector('.main-content'),
        pageContainers: document.querySelectorAll('.page-container'),
        inboxItems: document.querySelectorAll('.inbox-item'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
    };

    let currentPage = 'home';

    // ============================================
    // Page Navigation
    // ============================================
    function initPageNavigation() {
        elements.sidebarNavItems.forEach(item => {
            item.addEventListener('click', function () {
                const targetTab = this.dataset.tab;
                if (targetTab === currentPage) return;

                elements.sidebarNavItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                transitionToPage(targetTab);
                createRipple(this);
            });
        });
    }

    function transitionToPage(newPage) {
        const currentPageEl = document.getElementById(`page-${currentPage}`);
        const newPageEl = document.getElementById(`page-${newPage}`);

        if (!currentPageEl || !newPageEl) return;

        currentPageEl.classList.add('exiting');
        currentPageEl.classList.remove('active');

        setTimeout(() => {
            currentPageEl.classList.remove('exiting');
            newPageEl.classList.add('active');
            currentPage = newPage;

            // Widen main-content grid column for the chat page
            if (elements.mainContent) {
                elements.mainContent.classList.toggle('chat-active', newPage === 'chat');
            }

            // Switch app-layout grid to 2-column mode for chat
            const appLayout = document.querySelector('.app-layout');
            if (appLayout) {
                appLayout.classList.toggle('chat-grid', newPage === 'chat');
            }

            if (newPage === 'home') {
                reinitializeHomeAnimations();
            } else if (newPage === 'chat') {
                scrollToLatestMessage();
            }
        }, 150);
    }

    function reinitializeHomeAnimations() {
        const cards = document.querySelectorAll('#page-home .post-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
                card.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
            }, index * CONFIG.staggerDelay);
        });
    }

    // ============================================
    // Scroll Animations
    // ============================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: CONFIG.observerThreshold,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                        entry.target.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
                    }, index * CONFIG.staggerDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        elements.postCards.forEach(card => observer.observe(card));
    }

    // ============================================
    // Ripple Effect
    // ============================================
    function createRipple(element) {
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: scale(0);
            animation: ripple-effect 600ms ease-out forwards;
            pointer-events: none;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
        `;
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    function addRippleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple-effect {
                to { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // Route Search Bar
    // ============================================
    function initRouteSearchBar() {
        const searchBar = document.getElementById('routeSearchBar');
        const fromInput = document.getElementById('routeFromInput');
        const toInput = document.getElementById('routeToInput');
        const swapBtn = document.getElementById('routeSwapBtn');

        if (!searchBar) return;

        // Light sweep on focus
        let sweepTimeout;
        function triggerSweep() {
            searchBar.classList.remove('sweep-active');
            void searchBar.offsetWidth; // force reflow
            searchBar.classList.add('sweep-active');
            clearTimeout(sweepTimeout);
            sweepTimeout = setTimeout(() => {
                searchBar.classList.remove('sweep-active');
            }, 1100);
        }

        if (fromInput) fromInput.addEventListener('focus', triggerSweep);
        if (toInput) toInput.addEventListener('focus', triggerSweep);

        // Swap values
        if (swapBtn && fromInput && toInput) {
            swapBtn.addEventListener('click', () => {
                const temp = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = temp;
                swapBtn.classList.toggle('swapped');
                triggerSweep();
            });
        }
    }

    // ============================================
    // Post Card - Animate Vehicle
    // ============================================
    function initPostCardAnimations() {
        const postCards = document.querySelectorAll('.post-card');

        postCards.forEach(card => {
            card.addEventListener('click', function (e) {
                if (e.target.closest('.register-btn')) return;

                const movingVehicle = this.querySelector('.moving-vehicle:not(.hidden)');
                if (movingVehicle && !this.classList.contains('activated')) {
                    this.classList.add('activated');
                    movingVehicle.classList.remove('paused');
                    movingVehicle.classList.add('animating');

                    setTimeout(() => {
                        movingVehicle.classList.remove('animating');
                        movingVehicle.classList.add('paused');
                        this.classList.remove('activated');
                    }, 2000);
                }
            });
        });
    }

    // ============================================
    // Register Button - Opens Modal
    // ============================================
    function initRegisterButtons() {
        const registerWrappers = document.querySelectorAll('.register-wrapper');

        registerWrappers.forEach(wrapper => {
            const button = wrapper.querySelector('.register-btn');

            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Prevent action during animation states
                if (wrapper.classList.contains('registering') || wrapper.classList.contains('deregistering')) {
                    return;
                }

                const isRegistered = wrapper.classList.contains('registered');

                if (isRegistered) {
                    // Deregister: registered text goes down with red glow
                    wrapper.classList.add('deregistering');
                    wrapper.classList.remove('registered');

                    setTimeout(() => {
                        wrapper.classList.remove('deregistering');
                    }, 400);
                } else {
                    // Open the modal instead of direct registration
                    const postCard = wrapper.closest('.post-card');
                    openRideModal(postCard, wrapper);
                }
            });
        });
    }

    // ============================================
    // Ride Registration Modal
    // ============================================
    let currentModalWrapper = null;
    let paymentStep = 1; // 1 = Proceed to Pay, 2 = Confirm Booking

    function initRideModal() {
        const modal = document.getElementById('rideModal');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalProceed = document.getElementById('modalProceed');
        const paymentMethods = document.querySelectorAll('.payment-method-item');

        if (!modal) return;

        // Close button (X) - cancel animation
        modalClose.addEventListener('click', () => closeRideModal('cancel'));
        modalCancel.addEventListener('click', () => closeRideModal('cancel'));

        // Click outside to close - cancel animation
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRideModal('cancel');
        });

        // Escape key to close - cancel animation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeRideModal('cancel');
            }
        });

        // Payment method selection
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
            });
        });

        // Proceed/Confirm button
        modalProceed.addEventListener('click', handlePaymentFlow);
    }

    function openRideModal(postCard, wrapper) {
        const modal = document.getElementById('rideModal');
        const proceedBtn = document.getElementById('modalProceed');
        const modalContent = document.getElementById('modalContent');
        const closeMessageOverlay = document.getElementById('closeMessageOverlay');

        if (!modal || !postCard) return;

        currentModalWrapper = wrapper;
        paymentStep = 1;

        // Reset modal state completely
        proceedBtn.textContent = 'Proceed to Pay';
        proceedBtn.classList.remove('confirm');
        proceedBtn.disabled = false;
        if (modalContent) modalContent.style.display = 'block';
        if (closeMessageOverlay) closeMessageOverlay.classList.remove('active');

        // Extract data from post card
        const driverName = postCard.querySelector('.user-name')?.textContent || 'Driver';
        const driverInitials = postCard.querySelector('.avatar')?.textContent || 'DR';
        const fromLocation = postCard.querySelector('.route-point.start span')?.textContent || 'Start';
        const toLocation = postCard.querySelector('.route-point.end span')?.textContent || 'End';
        const amount = postCard.querySelector('.amount')?.textContent || '0';
        const vehicleType = postCard.querySelector('.mode-icon-badge span')?.textContent || 'Vehicle';

        // Calculate price breakdown
        const total = parseInt(amount) || 45;
        const baseFare = Math.round(total * 0.88);
        const platformFee = Math.round(total * 0.07);
        const tax = total - baseFare - platformFee;

        // Populate modal
        document.getElementById('modalDriverName').textContent = driverName;
        document.getElementById('modalDriverAvatar').textContent = driverInitials;
        document.getElementById('modalFromLocation').textContent = fromLocation;
        document.getElementById('modalToLocation').textContent = toLocation;
        document.getElementById('modalVehicleType').textContent = vehicleType;
        document.getElementById('modalBaseFare').textContent = `₹${baseFare}`;
        document.getElementById('modalPlatformFee').textContent = `₹${platformFee}`;
        document.getElementById('modalTax').textContent = `₹${tax}`;
        document.getElementById('modalTotal').textContent = `₹${total}`;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeRideModal(type = 'cancel') {
        const modal = document.getElementById('rideModal');
        const modalContent = document.getElementById('modalContent');
        const closeMessageOverlay = document.getElementById('closeMessageOverlay');
        const closeMessageIcon = document.getElementById('closeMessageIcon');
        const closeMessageText = document.getElementById('closeMessageText');
        const cancelIcon = document.getElementById('cancelIcon');
        const successIcon = document.getElementById('successIcon');

        if (!modal) return;

        // Save wrapper reference before we reset it
        const wrapperToUpdate = currentModalWrapper;
        const isSuccess = type === 'success';

        // Hide main content
        if (modalContent) modalContent.style.display = 'none';

        // Configure icon and text based on type
        if (isSuccess) {
            closeMessageIcon.classList.remove('cancel');
            closeMessageIcon.classList.add('success');
            cancelIcon.classList.add('hidden');
            successIcon.classList.remove('hidden');
            closeMessageText.textContent = 'Done';
            closeMessageText.classList.remove('cancel');
            closeMessageText.classList.add('success');
        } else {
            closeMessageIcon.classList.remove('success');
            closeMessageIcon.classList.add('cancel');
            cancelIcon.classList.remove('hidden');
            successIcon.classList.add('hidden');
            closeMessageText.textContent = 'Registration Canceled';
            closeMessageText.classList.remove('success');
            closeMessageText.classList.add('cancel');
        }

        // Add closing class based on type (triggers shrink animation - 0.25s)
        modal.classList.add(isSuccess ? 'closing-success' : 'closing-cancel');

        // Show the close message overlay immediately
        closeMessageOverlay.classList.add('active');

        // Play sound on success
        if (isSuccess) {
            playConfirmationSound();
        }

        // Show message for 2 seconds, then slide down
        setTimeout(() => {
            modal.classList.add('rolling');
        }, 2000);

        // After slide down completes, reset everything
        setTimeout(() => {
            modal.classList.remove('active', 'closing-cancel', 'closing-success', 'rolling');
            closeMessageOverlay.classList.remove('active');
            document.body.style.overflow = '';

            // Reset modal content and button
            if (modalContent) modalContent.style.display = 'block';
            const proceedBtn = document.getElementById('modalProceed');
            if (proceedBtn) {
                proceedBtn.textContent = 'Proceed to Pay';
                proceedBtn.classList.remove('confirm', 'loading');
                proceedBtn.disabled = false;
            }

            // Reset icon visibility for next use
            cancelIcon.classList.remove('hidden');
            successIcon.classList.add('hidden');
            closeMessageIcon.classList.remove('cancel', 'success');

            // Update register button on success (use saved reference)
            if (isSuccess && wrapperToUpdate) {
                wrapperToUpdate.classList.add('registering');

                setTimeout(() => {
                    wrapperToUpdate.classList.remove('registering');
                    wrapperToUpdate.classList.add('registered');
                }, 300);
            }

            currentModalWrapper = null;
            paymentStep = 1;
        }, 2600);
    }

    // macOS "Funky" alert sound recreation using Web Audio API
    function playConfirmationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // "Funky" is a bouncy, playful sound with descending notes
            const notes = [
                { freq: 1200, time: 0, duration: 0.08 },
                { freq: 900, time: 0.07, duration: 0.08 },
                { freq: 1100, time: 0.14, duration: 0.08 },
                { freq: 800, time: 0.21, duration: 0.12 }
            ];

            notes.forEach(note => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + note.time;
                gainNode.gain.setValueAtTime(0.25, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + note.duration);
            });
        } catch (e) {
            // Audio not supported, silently fail
        }
    }



    function handlePaymentFlow() {
        const proceedBtn = document.getElementById('modalProceed');

        if (paymentStep === 1) {
            // Step 1: Proceed to Pay -> Show confirm button
            proceedBtn.disabled = true;
            proceedBtn.textContent = 'Processing...';

            setTimeout(() => {
                paymentStep = 2;
                proceedBtn.disabled = false;
                proceedBtn.textContent = 'Confirm Payment';
                proceedBtn.classList.add('confirm');
            }, 800);
        } else if (paymentStep === 2) {
            // Step 2: Confirm Payment -> Show loading for 2 seconds, then success
            proceedBtn.disabled = true;
            proceedBtn.innerHTML = '<span class="btn-spinner"></span> Processing...';
            proceedBtn.classList.add('loading');

            // Wait 2 seconds with loading animation
            setTimeout(() => {
                closeRideModal('success');
            }, 2000);
        }
    }

    function showPaymentSuccess() {
        // This function is now deprecated in favor of the new closeRideModal('success')
        // Kept for backward compatibility
        closeRideModal('success');
    }

    // ============================================
    // Chat Functionality
    // ============================================
    function initChatInbox() {
        elements.inboxItems.forEach(item => {
            item.addEventListener('click', function () {
                elements.inboxItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                this.classList.remove('unread');

                const badge = this.querySelector('.inbox-badge');
                if (badge) {
                    badge.style.transform = 'scale(0)';
                    setTimeout(() => badge.remove(), 200);
                }
            });
        });
    }

    function scrollToLatestMessage() {
        if (elements.chatMessages) {
            setTimeout(() => {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }, 100);
        }
    }

    function initChatInput() {
        if (!elements.messageInput || !elements.sendBtn) return;

        function sendMessage() {
            const text = elements.messageInput.value.trim();
            if (!text) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            messageDiv.innerHTML = `
                <div class="message-bubble">${escapeHtml(text)}</div>
                <span class="message-time">${getCurrentTime()}</span>
            `;

            elements.chatMessages.appendChild(messageDiv);
            elements.messageInput.value = '';
            scrollToLatestMessage();
        }

        elements.sendBtn.addEventListener('click', sendMessage);
        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    }



    // ============================================
    // Notification Center
    // ============================================

    // ---- State Machine ----
    const notificationState = {
        isAnimating: false,        // prevents actions during transitions
        expandedWrapper: null,     // reference to the currently expanded wrapper
        savedScrollTop: 0,        // preserves scroll position
        isPanelOpen: false,       // tracks panel state
        lastToggleTime: 0,        // rapid-toggle cooldown timestamp
    };

    // Rapid-toggle guard: reject actions within cooldown window
    function canToggle() {
        const now = Date.now();
        if (now - notificationState.lastToggleTime < 300) return false;
        notificationState.lastToggleTime = now;
        return true;
    }

    // Utility: one-shot transitionend listener with safety timeout
    function onTransitionEnd(el, callback, safetyMs = 500) {
        let fired = false;
        const done = () => {
            if (fired) return;
            fired = true;
            el.removeEventListener('transitionend', handler);
            clearTimeout(timer);
            callback();
        };
        const handler = (e) => {
            if (e.target === el) done();
        };
        el.addEventListener('transitionend', handler);
        const timer = setTimeout(done, safetyMs);
    }

    function initNotificationButton() {
        const notificationBtn = document.querySelector('.notification-btn');
        const notificationPanel = document.getElementById('notificationPanel');
        const notificationOverlay = document.getElementById('notificationOverlay');
        const notificationClose = document.getElementById('notificationClose');
        const markAllReadBtn = document.getElementById('markAllRead');
        const mainContent = document.querySelector('.main-content');
        const sidebarNav = document.querySelector('.sidebar-nav');

        if (!notificationBtn || !notificationPanel) return;

        // Open notification panel
        function openNotificationPanel() {
            if (notificationState.isPanelOpen || notificationState.isAnimating) return;
            notificationState.isAnimating = true;
            notificationState.isPanelOpen = true;

            requestAnimationFrame(() => {
                notificationPanel.classList.add('active');
                notificationOverlay.classList.add('active');
                mainContent.classList.add('notification-open');
                sidebarNav.classList.add('notification-open');
                document.body.style.overflow = 'hidden';
            });

            // Hide the notification badge
            const badge = notificationBtn.querySelector('.notification-badge');
            if (badge) {
                badge.style.opacity = '0';
                badge.style.transform = 'scale(0)';
            }

            onTransitionEnd(notificationPanel, () => {
                notificationState.isAnimating = false;
            }, 500);
        }

        // Close notification panel
        function closeNotificationPanel() {
            if (!notificationState.isPanelOpen || notificationState.isAnimating) return;
            notificationState.isAnimating = true;

            // First collapse any expanded card
            const notificationList = notificationPanel.querySelector('.notification-list');
            if (notificationState.expandedWrapper) {
                const wrapper = notificationState.expandedWrapper;
                const card = wrapper.querySelector('.notification-card');
                if (card) card.classList.remove('replying');
                wrapper.classList.remove('expanded');
                if (notificationList) notificationList.classList.remove('has-expanded-card');
                notificationState.expandedWrapper = null;
                // Clear any reply inputs
                const input = wrapper.querySelector('.reply-input');
                if (input) input.value = '';
            }

            // Small delay to let card collapse start before panel slides out
            const delay = 50;
            setTimeout(() => {
                requestAnimationFrame(() => {
                    notificationPanel.classList.remove('active');
                    notificationOverlay.classList.remove('active');
                    mainContent.classList.remove('notification-open');
                    sidebarNav.classList.remove('notification-open');
                    document.body.style.overflow = '';
                    notificationState.isPanelOpen = false;
                });

                onTransitionEnd(notificationPanel, () => {
                    notificationState.isAnimating = false;
                }, 450);
            }, delay);
        }

        // Bell icon click
        notificationBtn.addEventListener('click', openNotificationPanel);

        // Close button click
        if (notificationClose) {
            notificationClose.addEventListener('click', closeNotificationPanel);
        }

        // Overlay click (close on outside click)
        if (notificationOverlay) {
            notificationOverlay.addEventListener('click', closeNotificationPanel);
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && notificationPanel.classList.contains('active')) {
                if (notificationState.isAnimating) return;
                // First close any expanded card, then panel if no card was expanded
                if (notificationState.expandedWrapper) {
                    collapseExpandedCard();
                } else {
                    closeNotificationPanel();
                }
            }
        });

        // Mark all as read
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', () => {
                const unreadCards = document.querySelectorAll('.notification-card.unread');
                unreadCards.forEach((card, i) => {
                    // Stagger the animation for visual polish
                    setTimeout(() => {
                        card.classList.remove('unread');
                        card.classList.remove('new-message');
                        const dot = card.querySelector('.unread-dot');
                        if (dot) {
                            dot.style.opacity = '0';
                            dot.style.transform = 'scale(0)';
                            setTimeout(() => dot.remove(), 300);
                        }
                    }, i * 60);
                });
            });
        }

        // Initialize notification cards
        initNotificationCards();
    }

    // ============================================
    // Collapse the currently expanded card
    // ============================================
    function collapseExpandedCard(callback) {
        const wrapper = notificationState.expandedWrapper;
        if (!wrapper) {
            if (callback) callback();
            return;
        }

        const card = wrapper.querySelector('.notification-card');
        const notificationList = wrapper.closest('.notification-list');

        notificationState.isAnimating = true;

        // Spring-based collapse: add .collapsing first (sets 420ms transition + bounce keyframe),
        // then remove .expanded to trigger grid-template-rows 1fr → 0fr
        requestAnimationFrame(() => {
            if (card) card.classList.remove('replying');
            wrapper.classList.add('collapsing');

            // Next frame: remove expanded to trigger collapse transition
            requestAnimationFrame(() => {
                wrapper.classList.remove('expanded');
                if (notificationList) {
                    notificationList.classList.remove('has-expanded-card');
                }
                notificationState.expandedWrapper = null;

                // Wait for 420ms spring collapse animation to settle
                setTimeout(() => {
                    wrapper.classList.remove('collapsing');
                    notificationState.isAnimating = false;
                    if (callback) callback();
                }, 440); // 420ms + 20ms safety margin
            });
        });

        // Clear input
        const input = wrapper.querySelector('.reply-input');
        if (input) input.value = '';
    }

    // ============================================
    // Expand a card (unified for all types)
    // ============================================
    function expandCard(wrapper) {
        if (notificationState.isAnimating) return;
        notificationState.isAnimating = true;

        const notificationList = wrapper.closest('.notification-list');
        const card = wrapper.querySelector('.notification-card');

        requestAnimationFrame(() => {
            // Add sibling dimming class
            if (notificationList) {
                notificationList.classList.add('has-expanded-card');
            }

            // Expand via grid-template-rows 0fr → 1fr
            wrapper.classList.add('expanded');
            notificationState.expandedWrapper = wrapper;

            // After 450ms grid transition settles:
            // – Message cards enter reply mode
            // – Other cards just finish
            onTransitionEnd(wrapper, () => {
                if (card && card.dataset.type === 'message' && !card.classList.contains('replied')) {
                    card.classList.add('replying');
                    const input = card.querySelector('.reply-input');
                    if (input) input.focus();
                }
                notificationState.isAnimating = false;
            }, 490);
        });
    }

    // ============================================
    // Notification Card Interactions & Inline Reply
    // ============================================
    function initNotificationCards() {
        const cardWrappers = document.querySelectorAll('.notification-card-wrapper');

        cardWrappers.forEach(wrapper => {
            const card = wrapper.querySelector('.notification-card');
            if (!card) return;

            // General card click — mark as read + handle expansion
            card.addEventListener('click', function (e) {
                // Don't trigger if clicking on reply elements or context preview
                if (e.target.closest('.reply-toggle-btn, .inline-reply-container, .reply-context-preview')) {
                    return;
                }

                // Guard against animation races
                if (notificationState.isAnimating || !canToggle()) return;

                // Mark as read
                this.classList.remove('unread');
                this.classList.remove('new-message');
                const dot = this.querySelector('.unread-dot');
                if (dot) {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                    setTimeout(() => dot.remove(), 300);
                }

                // Ripple glow effect
                createCardRipple(this, e);

                // Handle expansion — unified for all card types
                if (wrapper.classList.contains('expanded')) {
                    // Clicking the same expanded card — collapse it
                    collapseExpandedCard();
                } else if (notificationState.expandedWrapper) {
                    // Another card is expanded — collapse it first, then expand this one
                    const wrapperToExpand = wrapper;
                    collapseExpandedCard(() => {
                        expandCard(wrapperToExpand);
                    });
                } else {
                    // No card expanded — expand this one
                    expandCard(wrapper);
                }
            });

            // Reply toggle button (message cards only)
            const replyToggle = card.querySelector('.reply-toggle-btn');
            if (replyToggle) {
                replyToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (notificationState.isAnimating || !canToggle()) return;

                    if (card.classList.contains('replying')) {
                        // Toggle reply off but stay expanded
                        card.classList.remove('replying');
                    } else {
                        card.classList.add('replying');
                        const input = card.querySelector('.reply-input');
                        if (input) setTimeout(() => input.focus(), 300);
                    }
                });
            }

            // Reply send button
            const sendBtn = card.querySelector('.reply-send-btn');
            if (sendBtn) {
                sendBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    sendReply(wrapper);
                });
            }

            // Reply cancel button
            const cancelBtn = card.querySelector('.reply-cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (notificationState.isAnimating) return;
                    collapseExpandedCard();
                });
            }

            // Reply input — enter to send, prevent propagation
            const replyInput = card.querySelector('.reply-input');
            if (replyInput) {
                replyInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        sendReply(wrapper);
                    }
                });
                replyInput.addEventListener('click', (e) => e.stopPropagation());
            }

            // Emoji button — prevent propagation (decorative for now)
            const emojiBtn = card.querySelector('.reply-emoji-btn');
            if (emojiBtn) {
                emojiBtn.addEventListener('click', (e) => e.stopPropagation());
            }
        });
    }

    // Ripple glow effect on card click
    function createCardRipple(card, event) {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('div');
        ripple.className = 'ripple-ring';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top = (y - size / 2) + 'px';

        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Send reply — simulates API call
    function sendReply(wrapper) {
        const card = wrapper.querySelector('.notification-card');
        const input = card?.querySelector('.reply-input');
        const message = input?.value.trim();

        if (!message) return;

        const chatId = card.dataset.chatId;
        const notificationList = wrapper.closest('.notification-list');

        // Set sending state — remove replying but keep expanded
        card.classList.add('sending');
        card.classList.remove('replying');

        // Simulate sending (in a real app, this would be an API call)
        setTimeout(() => {
            requestAnimationFrame(() => {
                // Remove sending state and collapse
                card.classList.remove('sending');
                wrapper.classList.remove('expanded');

                // Remove sibling dimming
                if (notificationList) {
                    notificationList.classList.remove('has-expanded-card');
                    notificationList.scrollTop = notificationState.savedScrollTop;
                }
                notificationState.expandedWrapper = null;

                // Add to chat if chat section exists
                if (chatId) {
                    addMessageToChat(chatId, message);
                }

                // Show replied state
                card.classList.add('replied');

                // Mark as read
                card.classList.remove('unread', 'new-message');
                const dot = card.querySelector('.unread-dot');
                if (dot) {
                    dot.style.opacity = '0';
                    dot.style.transform = 'scale(0)';
                }

                // Clear input
                input.value = '';
                notificationState.isAnimating = false;
            });
        }, 800);
    }

    // Add message to chat thread
    function addMessageToChat(chatId, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Create new message element
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message sent';
        msgDiv.innerHTML = `
            <div class="message-bubble">${escapeHtml(message)}</div>
            <span class="message-time">${getCurrentTime()}</span>
        `;

        chatMessages.appendChild(msgDiv);

        // Smooth scroll to bottom
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // ============================================
    // Menu Items
    // ============================================
    function initMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function () {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
    }

    // ============================================
    // Post Creation
    // ============================================
    let postDraft = {
        pickup: '',
        destination: '',
        vehicleType: 'bike',
        price: 0,
        seats: 1
    };

    function initPostCreation() {
        const pickupInput = document.getElementById('postPickup');
        const destinationInput = document.getElementById('postDestination');
        const priceInput = document.getElementById('postPrice');
        const seatsInput = document.getElementById('postSeats');
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        const previewBtn = document.getElementById('postPreviewBtn');
        const cancelBtn = document.getElementById('postCancelBtn');
        const editBtn = document.getElementById('previewEditBtn');
        const previewCancelBtn = document.getElementById('previewCancelBtn');
        const publishBtn = document.getElementById('publishPostBtn');

        if (!pickupInput) return;

        // Text input validation (letters and spaces only)
        [pickupInput, destinationInput].forEach(input => {
            input.addEventListener('input', function () {
                const value = this.value;
                const isValid = /^[A-Za-z\s]*$/.test(value);

                if (!isValid) {
                    this.value = value.replace(/[^A-Za-z\s]/g, '');
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            });
        });

        // Price input validation (integers only)
        priceInput.addEventListener('input', function () {
            const value = this.value;
            const isValid = /^\d*$/.test(value);

            if (!isValid) {
                this.value = value.replace(/[^\d]/g, '');
                const wrapper = this.closest('.input-wrapper');
                if (wrapper) wrapper.classList.add('error');
            } else {
                const wrapper = this.closest('.input-wrapper');
                if (wrapper) wrapper.classList.remove('error');
            }
        });

        // Seats input validation (integers 1-3 only)
        if (seatsInput) {
            seatsInput.addEventListener('input', function () {
                const value = this.value;
                // Allow only digits
                this.value = value.replace(/[^\d]/g, '');
                const num = parseInt(this.value);
                const wrapper = this.closest('.input-wrapper');
                if (this.value && (num < 1 || num > 3)) {
                    if (wrapper) wrapper.classList.add('error');
                } else {
                    if (wrapper) wrapper.classList.remove('error');
                }
                // Clamp to max 3
                if (num > 3) this.value = '3';
            });
        }

        // Vehicle type selection
        vehicleOptions.forEach(option => {
            option.addEventListener('click', function () {
                vehicleOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                postDraft.vehicleType = this.dataset.vehicle;
            });
        });

        // Preview button
        if (previewBtn) {
            previewBtn.addEventListener('click', function () {
                const pickup = pickupInput.value.trim();
                const destination = destinationInput.value.trim();
                const price = parseInt(priceInput.value) || 0;
                const seats = parseInt(seatsInput?.value) || 0;

                // Validate all fields
                let isValid = true;

                if (!pickup) {
                    pickupInput.classList.add('error');
                    isValid = false;
                }
                if (!destination) {
                    destinationInput.classList.add('error');
                    isValid = false;
                }
                if (price < 1) {
                    const priceWrapper = priceInput.closest('.input-wrapper');
                    if (priceWrapper) priceWrapper.classList.add('error');
                    isValid = false;
                }
                if (seats < 1 || seats > 3) {
                    const seatsWrapper = seatsInput?.closest('.input-wrapper');
                    if (seatsWrapper) seatsWrapper.classList.add('error');
                    isValid = false;
                }

                if (!isValid) return;

                // Save draft
                postDraft.pickup = pickup;
                postDraft.destination = destination;
                postDraft.price = price;
                postDraft.seats = seats;

                // Update preview
                updatePostPreview();

                // Switch to preview step
                document.getElementById('postStepCreate').classList.remove('active');
                document.getElementById('postStepPreview').classList.add('active');
            });
        }

        // Cancel button (go to home)
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                resetPostForm();
                navigateToHome();
            });
        }

        // Edit button (back to create)
        if (editBtn) {
            editBtn.addEventListener('click', function () {
                document.getElementById('postStepPreview').classList.remove('active');
                document.getElementById('postStepCreate').classList.add('active');
            });
        }

        // Preview Cancel button
        if (previewCancelBtn) {
            previewCancelBtn.addEventListener('click', function () {
                resetPostForm();
                navigateToHome();
            });
        }

        // Publish button
        if (publishBtn) {
            publishBtn.addEventListener('click', function () {
                publishPost();
            });
        }
    }

    function updatePostPreview() {
        const previewPickup = document.getElementById('previewPickup');
        const previewDestination = document.getElementById('previewDestination');
        const previewPrice = document.getElementById('previewPrice');
        const previewSeats = document.getElementById('previewSeats');
        const previewSeatsPlural = document.getElementById('previewSeatsPlural');
        const previewVehicleIcon = document.getElementById('previewVehicleIcon');
        const previewVehicleBadge = document.getElementById('previewVehicleBadge');
        const previewVehicleLabel = document.getElementById('previewVehicleLabel');

        if (previewPickup) previewPickup.textContent = postDraft.pickup;
        if (previewDestination) previewDestination.textContent = postDraft.destination;
        if (previewPrice) previewPrice.textContent = postDraft.price;
        if (previewSeats) previewSeats.textContent = postDraft.seats;
        if (previewSeatsPlural) previewSeatsPlural.textContent = postDraft.seats === 1 ? '' : 's';

        // Update vehicle icon and badge based on type
        const isBike = postDraft.vehicleType === 'bike';

        if (previewVehicleIcon) {
            previewVehicleIcon.className = `moving-vehicle ${isBike ? 'bike-icon' : 'car-icon'}`;
            previewVehicleIcon.innerHTML = isBike ? `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="5" cy="17" r="3" />
                    <circle cx="19" cy="17" r="3" />
                    <path d="M12 17V5l4 4" />
                    <path d="M8 17h4" />
                    <path d="M16 17l-4-8" />
                </svg>
            ` : `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M5 17h14v-5l-2-4H7l-2 4v5z" />
                    <circle cx="7.5" cy="17" r="1.5" />
                    <circle cx="16.5" cy="17" r="1.5" />
                    <path d="M5 12h14" />
                </svg>
            `;
        }

        if (previewVehicleBadge) {
            previewVehicleBadge.className = `mode-icon-badge ${isBike ? 'bike' : 'car'}`;
            previewVehicleBadge.innerHTML = isBike ? `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3.2-6H6m12 6.5l-2-7h-3l1 7" />
                </svg>
                <span id="previewVehicleLabel">Bike Ride</span>
            ` : `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="8" width="18" height="10" rx="2" />
                    <circle cx="7" cy="18" r="2" />
                    <circle cx="17" cy="18" r="2" />
                    <path d="M5 8l2-4h10l2 4" />
                </svg>
                <span id="previewVehicleLabel">Car Ride</span>
            `;
        }
    }

    function publishPost() {
        const feedScroll = document.querySelector('#page-home .feed-scroll');
        if (!feedScroll) return;

        const isBike = postDraft.vehicleType === 'bike';

        // Create new post card HTML
        const newPost = document.createElement('article');
        newPost.className = 'post-card';
        newPost.setAttribute('data-animate', 'pop-in');
        newPost.innerHTML = `
            <div class="glass-overlay"></div>
            <header class="post-header">
                <div class="avatar-container">
                    <div class="avatar">YK</div>
                </div>
                <div class="user-info">
                    <span class="user-name">Yogiraj Kulkarni</span>
                </div>
            </header>
            <div class="route-strip">
                <div class="route-point start">
                    <svg class="start-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" fill="currentColor" />
                    </svg>
                    <span>${escapeHtml(postDraft.pickup)}</span>
                </div>
                <div class="route-track">
                    <div class="track-line"></div>
                    <div class="moving-vehicle ${isBike ? 'bike-icon' : 'car-icon'} paused">
                        ${isBike ? `
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="5" cy="17" r="3" />
                                <circle cx="19" cy="17" r="3" />
                                <path d="M12 17V5l4 4" />
                                <path d="M8 17h4" />
                                <path d="M16 17l-4-8" />
                            </svg>
                        ` : `
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M5 17h14v-5l-2-4H7l-2 4v5z" />
                                <circle cx="7.5" cy="17" r="1.5" />
                                <circle cx="16.5" cy="17" r="1.5" />
                                <path d="M5 12h14" />
                            </svg>
                        `}
                    </div>
                </div>
                <div class="route-point end">
                    <svg class="end-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" fill="currentColor" />
                    </svg>
                    <span>${escapeHtml(postDraft.destination)}</span>
                </div>
            </div>
            <div class="transport-section single-mode">
                <div class="mode-display">
                    <div class="mode-icon-badge ${isBike ? 'bike' : 'car'}">
                        ${isBike ? `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="5.5" cy="17.5" r="3.5" />
                                <circle cx="18.5" cy="17.5" r="3.5" />
                                <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3.2-6H6m12 6.5l-2-7h-3l1 7" />
                            </svg>
                            <span>Bike Ride</span>
                        ` : `
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="8" width="18" height="10" rx="2" />
                                <circle cx="7" cy="18" r="2" />
                                <circle cx="17" cy="18" r="2" />
                                <path d="M5 8l2-4h10l2 4" />
                            </svg>
                            <span>Car Ride</span>
                        `}
                    </div>
                </div>
                <div class="transport-footer">
                    <div class="price-badge">
                        <span class="currency">₹</span>
                        <span class="amount">${postDraft.price}</span>
                    </div>
                    <div class="seats-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        <span>${postDraft.seats}</span> seat${postDraft.seats === 1 ? '' : 's'}
                    </div>
                    <div class="register-wrapper">
                        <div class="register-line"></div>
                        <button class="register-btn">
                            <span class="btn-text register-text">Register</span>
                            <span class="btn-text registered-text">Registered</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert at the top of feed
        feedScroll.insertBefore(newPost, feedScroll.firstChild);

        // Initialize the new post's register button
        const wrapper = newPost.querySelector('.register-wrapper');
        if (wrapper) {
            const button = wrapper.querySelector('.register-btn');
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (wrapper.classList.contains('registering') || wrapper.classList.contains('deregistering')) {
                    return;
                }

                const isRegistered = wrapper.classList.contains('registered');
                if (isRegistered) {
                    wrapper.classList.add('deregistering');
                    wrapper.classList.remove('registered');
                    setTimeout(() => wrapper.classList.remove('deregistering'), 400);
                } else {
                    openRideModal(newPost, wrapper);
                }
            });
        }

        // Initialize post card animation
        newPost.addEventListener('click', function (e) {
            if (e.target.closest('.register-btn')) return;
            const movingVehicle = this.querySelector('.moving-vehicle:not(.hidden)');
            if (movingVehicle && !this.classList.contains('activated')) {
                this.classList.add('activated');
                movingVehicle.classList.remove('paused');
                movingVehicle.classList.add('animating');
                setTimeout(() => {
                    movingVehicle.classList.remove('animating');
                    movingVehicle.classList.add('paused');
                    this.classList.remove('activated');
                }, 2000);
            }
        });

        // Animate entry
        setTimeout(() => {
            newPost.classList.add('visible');
            newPost.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
        }, 50);

        // Reset and navigate
        resetPostForm();
        navigateToHome();
    }

    function resetPostForm() {
        const pickupInput = document.getElementById('postPickup');
        const destinationInput = document.getElementById('postDestination');
        const priceInput = document.getElementById('postPrice');
        const vehicleOptions = document.querySelectorAll('.vehicle-option');

        const seatsInput = document.getElementById('postSeats');
        if (pickupInput) pickupInput.value = '';
        if (destinationInput) destinationInput.value = '';
        if (priceInput) priceInput.value = '';
        if (seatsInput) seatsInput.value = '';

        // Reset vehicle to bike
        vehicleOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.vehicle === 'bike') opt.classList.add('active');
        });

        // Reset steps
        const stepCreate = document.getElementById('postStepCreate');
        const stepPreview = document.getElementById('postStepPreview');
        if (stepCreate) stepCreate.classList.add('active');
        if (stepPreview) stepPreview.classList.remove('active');

        // Reset draft
        postDraft = { pickup: '', destination: '', vehicleType: 'bike', price: 0, seats: 1 };
    }

    function navigateToHome() {
        // Find and click the home nav button
        const homeBtn = document.querySelector('.sidebar-nav-item[data-tab="home"]');
        if (homeBtn) homeBtn.click();
    }

    // ============================================
    // History Cards - Spring Expand/Collapse
    // ============================================

    // Generate spring keyframes for height animation
    function generateSpringKeyframes(from, to, opts) {
        const { stiffness = 260, damping = 24, mass = 1, steps = 60, duration = 440 } = opts || {};
        const keyframes = [];
        const dt = duration / steps / 1000; // time step in seconds
        let pos = from;
        let vel = 0;
        const target = to;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            // Spring physics
            const displacement = pos - target;
            const springForce = -stiffness * displacement;
            const dampingForce = -damping * vel;
            const acceleration = (springForce + dampingForce) / mass;
            vel += acceleration * dt;
            pos += vel * dt;

            // Clamp overshoot to max 5px
            if (to > from) {
                pos = Math.min(pos, to + 5);
            } else {
                pos = Math.max(pos, to - 5);
            }

            keyframes.push({
                height: `${Math.max(0, pos)}px`,
                offset: progress,
            });
        }

        // Ensure final frame is exact
        keyframes[keyframes.length - 1].height = `${to}px`;
        return keyframes;
    }

    function springAnimateExpand(expandedEl, card) {
        // Measure target height
        expandedEl.style.height = 'auto';
        expandedEl.style.opacity = '1';
        expandedEl.style.padding = '0 16px 16px 16px';
        const targetHeight = expandedEl.scrollHeight;
        expandedEl.style.height = '0px';
        expandedEl.style.opacity = '0';
        expandedEl.style.padding = '0 16px';

        // Force reflow
        expandedEl.offsetHeight;

        const keyframes = generateSpringKeyframes(0, targetHeight, {
            stiffness: 260,
            damping: 22,
            mass: 1,
            steps: 60,
            duration: 440,
        });

        // Add opacity to keyframes
        keyframes.forEach((kf, i) => {
            kf.opacity = i < 5 ? (i / 5) : 1;
            kf.padding = '0 16px 16px 16px';
        });

        card.classList.add('expanded');

        const anim = expandedEl.animate(keyframes, {
            duration: 440,
            easing: 'linear', // spring physics are baked into keyframes
            fill: 'forwards',
        });

        anim.onfinish = () => {
            expandedEl.style.height = 'auto';
            expandedEl.style.opacity = '1';
            expandedEl.style.padding = '0 16px 16px 16px';
            anim.cancel();
        };
    }

    function springAnimateCollapse(expandedEl, card) {
        const currentHeight = expandedEl.scrollHeight;

        const keyframes = generateSpringKeyframes(currentHeight, 0, {
            stiffness: 260,
            damping: 26, // tighter for collapse
            mass: 1,
            steps: 50,
            duration: 400,
        });

        // Add opacity to keyframes
        keyframes.forEach((kf, i, arr) => {
            const progress = i / (arr.length - 1);
            kf.opacity = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
            kf.padding = progress > 0.9 ? '0 16px' : '0 16px 16px 16px';
        });

        const anim = expandedEl.animate(keyframes, {
            duration: 400,
            easing: 'linear',
            fill: 'forwards',
        });

        anim.onfinish = () => {
            card.classList.remove('expanded');
            expandedEl.style.height = '0';
            expandedEl.style.opacity = '0';
            expandedEl.style.padding = '0 16px';
            anim.cancel();
        };
    }

    function initHistoryCards() {
        const historyCards = document.querySelectorAll('.history-card');
        if (!historyCards.length) return;

        let animating = false;

        historyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Prevent toggle when clicking safety buttons
                if (e.target.closest('.safety-btn')) return;
                if (animating) return;

                animating = true;
                const expandedEl = card.querySelector('.history-card-expanded');
                const isExpanded = card.classList.contains('expanded');

                // Collapse any other expanded card first
                const promises = [];
                historyCards.forEach(c => {
                    if (c !== card && c.classList.contains('expanded')) {
                        const otherExpanded = c.querySelector('.history-card-expanded');
                        const p = new Promise(resolve => {
                            const currentHeight = otherExpanded.scrollHeight;
                            const kf = generateSpringKeyframes(currentHeight, 0, {
                                stiffness: 260, damping: 26, mass: 1, steps: 50, duration: 400,
                            });
                            kf.forEach((k, i, arr) => {
                                const prog = i / (arr.length - 1);
                                k.opacity = prog > 0.7 ? 1 - ((prog - 0.7) / 0.3) : 1;
                                k.padding = prog > 0.9 ? '0 16px' : '0 16px 16px 16px';
                            });
                            const a = otherExpanded.animate(kf, { duration: 400, easing: 'linear', fill: 'forwards' });
                            a.onfinish = () => {
                                c.classList.remove('expanded');
                                otherExpanded.style.height = '0';
                                otherExpanded.style.opacity = '0';
                                otherExpanded.style.padding = '0 16px';
                                a.cancel();
                                resolve();
                            };
                        });
                        promises.push(p);
                    }
                });

                // After collapsing others, expand or collapse clicked card
                Promise.all(promises).then(() => {
                    if (isExpanded) {
                        springAnimateCollapse(expandedEl, card);
                        setTimeout(() => { animating = false; }, 410);
                    } else {
                        springAnimateExpand(expandedEl, card);
                        setTimeout(() => { animating = false; }, 450);
                    }
                });

                if (promises.length === 0 && isExpanded) {
                    // If no other cards to collapse, release lock sooner for collapse
                } else if (promises.length === 0) {
                    // No other cards to collapse, lock is released after expand
                }
            });
        });
    }

    // ============================================
    // Initialize
    // ============================================
    function init() {
        addRippleStyles();
        initScrollAnimations();
        initPageNavigation();
        initRouteSearchBar();
        initPostCardAnimations();
        initRegisterButtons();
        initRideModal();
        initPostCreation();
        initNotificationButton();
        initChatInbox();
        initChatInput();
        initMenuItems();
        initHistoryCards();

        // Initial card visibility
        setTimeout(() => {
            elements.postCards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setTimeout(() => {
                        card.classList.add('visible');
                        card.style.animation = `pop-in ${CONFIG.animationDuration}ms ${CONFIG.easeOutExpo} forwards`;
                    }, index * CONFIG.staggerDelay);
                }
            });
        }, 100);

        console.log('Travel Connect UI initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
