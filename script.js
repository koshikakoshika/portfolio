/* script.js - Core Logic, GSAP Animations, Typewriter, and Achievements Slider */

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initHeaderScroll();
  initTypewriter();
  initGSAPAnimations();
  initAchievementsSlider();
  initCard3DTilt();
  initDraggableCard();
  initContactForm();
});

/* 1. Header scroll effect */
function initHeaderScroll() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

/* 2. Typewriter Effect for Hero Section */
function initTypewriter() {
  const textElement = document.querySelector(".typed-text");
  if (!textElement) return;

  const words = [
    "UI/UX Designer",
    "Ex-Google Student Ambassador",
    "AI-Native & Vibe Coder",
    "BE Computer Science & Design Student",
    "Business Strategist @Sendiee"
  ];
  
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  // Clear any pre-existing text
  textElement.textContent = "";

  function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      textElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35; // Deleting speed
    } else {
      textElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 75; // Typing speed
    }

    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at full word
      isDeleting = true;
      typingSpeed = 2500; // Pause duration on typed word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  // Start the typewriter loop after 800ms
  setTimeout(type, 800);
}

/* 3. GSAP & ScrollTrigger Animations */
function initGSAPAnimations() {
  // Fallback observer function to reveal elements
  const fallbackReveal = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".timeline-item").forEach(item => {
      observer.observe(item);
    });
  };

  // Ensure GSAP and ScrollTrigger are loaded
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    console.warn("GSAP or ScrollTrigger CDNs failed to load. Falling back to CSS transitions.");
    fallbackReveal();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero section entrance animation timeline
  const heroTL = gsap.timeline();
  
  if (document.querySelector("header")) {
    heroTL.from("header", {
      y: -80,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out"
    });
  }

  if (document.querySelector(".hero-line.line-1")) {
    heroTL.from(".hero-line.line-1 .hover-char", {
      y: 80,
      opacity: 0,
      duration: 1,
      stagger: 0.05,
      ease: "power4.out"
    }, "-=0.6");
  }

  if (document.querySelector(".hero-middle-card")) {
    heroTL.from(".hero-card-col", {
      x: 60,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    }, "-=0.7");
  }

  if (document.querySelector(".hero-typewriter-strip")) {
    heroTL.from(".hero-typewriter-strip", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.5");
  }

  // Experience timeline cards reveal on scroll
  const timelineItems = gsap.utils.toArray(".timeline-item");
  timelineItems.forEach((item) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 88%", // Trigger slightly earlier for better mobile feel
        toggleActions: "play none none none"
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      onStart: () => {
        item.classList.add("show"); // Ensure show class is also added
      }
    });
  });

  // Skills fill bar animation on section entering
  if (document.querySelector(".skills")) {
    gsap.to(".skill-bar-fill", {
      scrollTrigger: {
        trigger: ".skills",
        start: "top 75%",
        toggleActions: "play none none none"
      },
      width: function(index, target) {
        return target.getAttribute("data-width");
      },
      duration: 1.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }

  // Achievements reveal
  if (document.querySelector(".achievements")) {
    gsap.from(".achievements-carousel-wrapper", {
      scrollTrigger: {
        trigger: ".achievements",
        start: "top 85%"
      },
      y: 30,
      duration: 0.8,
      ease: "power3.out"
    });
  }

  // Projects reveal
  if (document.querySelector(".projects")) {
    gsap.from(".projects .achievements-carousel-wrapper", {
      scrollTrigger: {
        trigger: ".projects",
        start: "top 85%"
      },
      y: 30,
      duration: 0.8,
      ease: "power3.out"
    });
  }

  // Critical fix: Refresh ScrollTrigger after elements load to align trigger positions
  window.addEventListener("load", () => {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  });
}

/* 4. Achievements Filter & Carousel Sliders */
function initAchievementsSlider() {
  const tabs = document.querySelectorAll(".achievements .filter-tab");
  const achievementsSliders = document.querySelectorAll(".achievements .slider-container");
  const allSliders = document.querySelectorAll(".slider-container");

  // Helper: update which card is currently active (centered) in the track
  function updateActiveCard(track) {
    const cards = track.querySelectorAll(".achievement-card, .project-card");
    if (cards.length === 0) return;

    // Check if the track actually has scroll overflow
    const hasOverflow = track.scrollWidth > track.clientWidth + 10;

    if (!hasOverflow) {
      // If there is no overflow, make all cards active so they are fully visible and readable
      cards.forEach(card => {
        card.classList.add("active-card");
      });
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - trackCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    cards.forEach(card => {
      if (card === closestCard) {
        card.classList.add("active-card");
      } else {
        card.classList.remove("active-card");
      }
    });
  }

  // Tab Filtering Logic
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const filterVal = tab.getAttribute("data-filter");

      achievementsSliders.forEach(slider => {
        const id = slider.getAttribute("id");
        if (id === `slider-${filterVal}`) {
          slider.style.display = "flex";
          slider.classList.add("active");
          const track = slider.querySelector(".slider-track");
          if (track) {
            setTimeout(() => {
              updateActiveCard(track);
            }, 50);
          }
        } else {
          slider.style.display = "none";
          slider.classList.remove("active");
        }
      });
      
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });

  // Carousel Arrow Controls & Drag-To-Scroll Logic
  allSliders.forEach(slider => {
    const track = slider.querySelector(".slider-track");
    const prevBtn = slider.querySelector(".prev-btn");
    const nextBtn = slider.querySelector(".next-btn");

    if (!track) return;

    const scrollAmount = 380; // Card width + gap

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
      });
    }

    const updateNavButtons = () => {
      if (!prevBtn || !nextBtn) return;

      // If no overflow, hide both navigation buttons
      if (track.scrollWidth <= track.clientWidth + 10) {
        prevBtn.style.opacity = "0";
        prevBtn.style.pointerEvents = "none";
        nextBtn.style.opacity = "0";
        nextBtn.style.pointerEvents = "none";
        return;
      }
      
      const scrollLeft = track.scrollLeft;
      const maxScrollLeft = track.scrollWidth - track.clientWidth;

      if (scrollLeft <= 5) {
        prevBtn.style.opacity = "0";
        prevBtn.style.pointerEvents = "none";
      } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "all";
      }

      if (scrollLeft >= maxScrollLeft - 5) {
        nextBtn.style.opacity = "0";
        nextBtn.style.pointerEvents = "none";
      } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "all";
      }
    };

    track.addEventListener("scroll", () => {
      updateNavButtons();
      updateActiveCard(track);
    });
    setTimeout(updateNavButtons, 200);
    window.addEventListener("resize", () => {
      updateNavButtons();
      updateActiveCard(track);
    });

    // Mouse Dragging / Swipe Scroll Interactivity
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener("mousedown", (e) => {
      isDown = true;
      track.classList.add("active");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      track.classList.remove("active");
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("active");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  });

  // Initial active card focus on load
  const activeSliders = document.querySelectorAll(".slider-container.active");
  activeSliders.forEach(slider => {
    const track = slider.querySelector(".slider-track");
    if (track) {
      setTimeout(() => {
        updateActiveCard(track);
      }, 300);
    }
  });
}

/* 5. Card 3D Tilt Interaction */
function initCard3DTilt() {
  const targetCards = document.querySelectorAll(".achievement-card, .about-visual-card, .project-card, .timeline-content");
  
  targetCards.forEach(card => {
    const handleMove = (clientX, clientY) => {
      // Only tilt achievements cards if they are active (focused)
      if (card.classList.contains("achievement-card") && !card.classList.contains("active-card")) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = -((centerX - x) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      card.style.boxShadow = `0 15px 35px rgba(255, 255, 255, 0.12)`;
    };

    const handleReset = () => {
      card.style.transform = "";
      card.style.boxShadow = "";
    };

    // Mouse events
    card.addEventListener("mousemove", (e) => {
      handleMove(e.clientX, e.clientY);
    });

    card.addEventListener("mouseleave", handleReset);

    // Touch events for mobile touch support ("move on touching front and back")
    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    card.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }, { passive: true });

    card.addEventListener("touchend", handleReset);
    card.addEventListener("touchcancel", handleReset);
  });
}

/* 6. Contact Form Handling */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
      submitBtn.style.background = '#ffffff';
      submitBtn.style.color = '#000000';
      
      form.reset();
      
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 3000);
      
    }, 1500);
  });
}

/* 7. Draggable Hero Card Logic */
function initDraggableCard() {
  const card = document.querySelector('.draggable-card');
  if (!card) return;

  let isDragging = false;
  let startX, startY, currentX = 0, currentY = 0;

  function onStart(e) {
    // Avoid interfering with buttons inside the card
    if (e.target.closest('a') || e.target.closest('button')) return;
    
    isDragging = true;
    const point = e.touches ? e.touches[0] : e;
    startX = point.clientX - currentX;
    startY = point.clientY - currentY;
    card.style.transition = 'none';
    card.style.zIndex = '50';
  }

  function onMove(e) {
    if (!isDragging) return;
    
    // Prevent touch scrolling when dragging
    if (e.cancelable) e.preventDefault();
    
    const point = e.touches ? e.touches[0] : e;
    currentX = point.clientX - startX;
    currentY = point.clientY - startY;
    
    // Tilt slightly as we drag for a premium feel
    const tilt = currentX * 0.03;
    card.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${tilt}deg)`;
  }

  function onEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // Smooth snap back transition
    card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    
    currentX = 0;
    currentY = 0;
    
    setTimeout(() => {
      card.style.zIndex = '';
    }, 600);
  }

  card.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  card.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
}

/* 8. Light/Dark Theme Toggle Logic */
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;
  const icon = toggleBtn.querySelector("i");
  
  // Apply saved theme on page load (toggles fa-regular and fa-solid for fa-lightbulb)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
    if (icon) {
      icon.className = "fa-solid fa-lightbulb";
    }
  } else {
    document.body.classList.remove("light-mode");
    if (icon) {
      icon.className = "fa-regular fa-lightbulb";
    }
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    
    if (isLight) {
      localStorage.setItem("theme", "light");
      if (icon) {
        icon.className = "fa-solid fa-lightbulb";
      }
    } else {
      localStorage.setItem("theme", "dark");
      if (icon) {
        icon.className = "fa-regular fa-lightbulb";
      }
    }
    
    // Refresh ScrollTrigger as heights/styling might adjust slightly
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
}

