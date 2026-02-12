// Navigation History
let pageHistory = [];

// Theme Management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('contentAI_theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggle.textContent = '☀️';
        localStorage.setItem('contentAI_theme', 'light');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('contentAI_theme');
    const themeToggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// Check if logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('contentAI_loggedIn');
    
    loadTheme();
    
    if (isLoggedIn === 'true') {
        showPage('home');
    } else {
        showPage('auth');
    }

    // Initialize chatbox as minimized
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
        chatbox.classList.add('minimized');
    }
    
    // Initialize template count
    setTimeout(() => {
        updateTemplateCount();
    }, 100);
});

// Auth functions
function switchToSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function login() {
    localStorage.setItem('contentAI_loggedIn', 'true');
    alert('Welcome back! 🎉');
    showPage('home');
}

function signup() {
    localStorage.setItem('contentAI_loggedIn', 'true');
    alert('Account created! Welcome to ContentAI! 🎉');
    showPage('home');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('contentAI_loggedIn');
        pageHistory = [];
        showPage('auth');
    }
}

// Smart Page Navigation with History
function showPage(pageId) {
    const currentPage = document.querySelector('.page.active');
    const currentPageId = currentPage ? currentPage.id : null;
    
    if (currentPageId && currentPageId !== pageId) {
        pageHistory.push(currentPageId);
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (pageId === 'home' || pageId === 'auth' || pageHistory.length === 0) {
            backBtn.classList.remove('show');
        } else {
            backBtn.classList.add('show');
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    if (pageHistory.length > 0) {
        const previousPage = pageHistory.pop();
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(previousPage);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            if (previousPage === 'home' || previousPage === 'auth' || pageHistory.length === 0) {
                backBtn.classList.remove('show');
            }
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        showPage('home');
    }
}

function scrollToSection(sectionId) {
    const isLoggedIn = localStorage.getItem('contentAI_loggedIn');
    
    if (isLoggedIn === 'true') {
        showPage('home');
        
        setTimeout(() => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    } else {
        alert('Please login to view this content');
        showPage('auth');
    }
}

// VOICE CLONING FUNCTIONS
let mediaRecorder = null;
let recordingChunks = [];
let recordingTimer = null;
let recordingStartTime = 0;
let isRecording = false;

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordingChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordingChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordingChunks, { type: 'audio/wav' });
            // Here you would typically upload the blob to your server
            alert('Voice recording completed! 🎉 Our AI is now analyzing your voice patterns.');
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        document.getElementById('recordIcon').textContent = '⏹️';
        document.getElementById('recordText').textContent = 'Stop Recording';
        document.getElementById('recordBtn').style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        document.getElementById('recordingTimer').style.display = 'block';
        
        // Start timer
        recordingStartTime = Date.now();
        recordingTimer = setInterval(updateTimer, 1000);
        
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please check your permissions and try again.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        // Update UI
        document.getElementById('recordIcon').textContent = '🎤';
        document.getElementById('recordText').textContent = 'Start Recording';
        document.getElementById('recordBtn').style.background = 'linear-gradient(135deg, #10b981, #14b8a6)';
        document.getElementById('recordingTimer').style.display = 'none';
        
        // Clear timer
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timerDisplay').textContent = display;
}

function testSpeechRecognition() {
    console.log('Testing speech recognition...');
    
    if (!recognition) {
        initVoiceRecognition();
    }
    
    if (!recognition) {
        alert('❌ Speech recognition is not supported in your browser.\n\nPlease use:\n• Chrome\n• Edge\n• Safari\n\nMake sure you\'re using HTTPS (not HTTP)');
        return;
    }
    
    // Test basic functionality
    currentVoiceTarget = 'test';
    
    try {
        recognition.start();
        showLiveTranscription('');
        
        alert('✅ Speech recognition test started!\n\n🎤 Speak now to test the feature.\n\nYou should see your words appear in real-time.');
        
    } catch (error) {
        console.error('Test failed:', error);
        alert('❌ Test failed: ' + error.message + '\n\nTry refreshing the page and allowing microphone permissions.');
    }
}

// VOICE INPUT FUNCTIONS
let currentVoiceTarget = null;
let recognition = null;
let isListening = false;

function initVoiceRecognition() {
    console.log('Checking for speech recognition support...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        console.log('Speech recognition is supported!');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            console.log('Speech recognition started');
        };
        
        recognition.onresult = function(event) {
            console.log('Speech recognition result received');
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const fullTranscript = finalTranscript + interimTranscript;
            console.log('Transcript:', fullTranscript);
            
            // Show live transcription
            showLiveTranscription(fullTranscript);
            
            // If we have final results, show confirmation
            if (finalTranscript.trim()) {
                setTimeout(() => {
                    recognition.stop();
                    showVoiceConfirmation(finalTranscript.trim());
                }, 1500);
            }
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Voice recognition failed: ';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try speaking louder.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone not accessible. Please check permissions.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission denied. Please allow microphone access.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            alert(errorMessage);
            stopListening();
            hideLiveTranscription();
        };
        
        recognition.onend = function() {
            console.log('Speech recognition ended');
            stopListening();
            // Don't hide transcription immediately, let user see the result
        };
        
        console.log('Speech recognition initialized successfully');
    } else {
        console.warn('Speech recognition not supported in this browser');
    }
}

function startVoiceInput(targetId) {
    console.log('Starting voice input for:', targetId);
    
    if (!recognition) {
        console.log('Recognition not initialized, initializing now...');
        initVoiceRecognition();
    }
    
    if (!recognition) {
        alert('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
    }
    
    // Check if already listening
    if (isListening) {
        console.log('Already listening, stopping first...');
        recognition.stop();
        return;
    }
    
    currentVoiceTarget = targetId;
    isListening = true;
    
    // Update button to show listening state
    const button = event.target;
    button.textContent = '🔴';
    button.style.animation = 'pulse 1s infinite';
    
    try {
        console.log('Starting speech recognition...');
        recognition.start();
        
        // Show live transcription display
        showLiveTranscription('');
        
        // Show listening feedback
        const notification = document.createElement('div');
        notification.className = 'voice-notification';
        notification.textContent = '🎤 Listening... Speak now!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
        
    } catch (error) {
        console.error('Error starting voice recognition:', error);
        alert('Error starting voice recognition: ' + error.message);
        stopListening();
        hideLiveTranscription();
    }
}

function stopListening() {
    isListening = false;
    
    // Reset all voice buttons
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.textContent = '🎤';
        btn.style.animation = '';
    });
}

function showLiveTranscription(text) {
    let liveDisplay = document.getElementById('liveTranscription');
    
    if (!liveDisplay) {
        // Create live transcription display
        liveDisplay = document.createElement('div');
        liveDisplay.id = 'liveTranscription';
        liveDisplay.className = 'live-transcription';
        liveDisplay.innerHTML = `
            <div class="live-transcription-header">
                <span>🎤 Live Transcription</span>
                <button onclick="hideLiveTranscription()" class="close-transcription">×</button>
            </div>
            <div class="live-transcription-text" id="liveTranscriptionText"></div>
            <div class="live-transcription-footer">
                <small>Speak clearly for better accuracy • Auto-saves when you stop speaking</small>
            </div>
        `;
        document.body.appendChild(liveDisplay);
    }
    
    document.getElementById('liveTranscriptionText').textContent = text || 'Listening...';
    liveDisplay.style.display = 'block';
}

function hideLiveTranscription() {
    const liveDisplay = document.getElementById('liveTranscription');
    if (liveDisplay) {
        liveDisplay.style.display = 'none';
    }
}

function showVoiceConfirmation(transcript) {
    document.getElementById('voiceTextPreview').textContent = transcript;
    document.getElementById('voiceTextEdit').value = transcript;
    document.getElementById('voiceModal').style.display = 'flex';
}

function closeVoiceModal() {
    document.getElementById('voiceModal').style.display = 'none';
    currentVoiceTarget = null;
}

function retryVoiceInput() {
    closeVoiceModal();
    if (currentVoiceTarget) {
        // Find the button for the current target and trigger voice input again
        const targetElement = document.getElementById(currentVoiceTarget);
        if (targetElement) {
            const voiceBtn = targetElement.parentNode.querySelector('.voice-btn');
            if (voiceBtn) {
                startVoiceInput(currentVoiceTarget);
            }
        }
    }
}

function confirmVoiceInput() {
    const editedText = document.getElementById('voiceTextEdit').value;
    
    if (currentVoiceTarget && editedText.trim()) {
        const targetElement = document.getElementById(currentVoiceTarget);
        if (targetElement) {
            targetElement.value = editedText;
            
            // Trigger change event for any listeners
            const event = new Event('change', { bubbles: true });
            targetElement.dispatchEvent(event);
        }
    }
    
    closeVoiceModal();
}

// Initialize voice recognition when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing voice recognition...');
    initVoiceRecognition();
    
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported in this browser');
        // Hide voice buttons if not supported
        document.querySelectorAll('.voice-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        console.log('Speech recognition is supported!');
    }
});

// PLANNER FUNCTIONS
let currentDate = new Date();
let plannedContent = [];

function switchPlannerView(view) {
    document.querySelectorAll('.planner-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    
    if (view === 'calendar') {
        document.getElementById('calendar-view').classList.add('active');
        event.target.classList.add('active');
        generateCalendar();
    } else {
        document.getElementById('list-view').classList.add('active');
        event.target.classList.add('active');
    }
}

function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    // Generate calendar days
    let calendarHTML = '';
    
    // Previous month's trailing days (grayed out)
    for (let i = firstDay - 1; i >= 0; i--) {
        const prevDay = prevMonthDays - i;
        calendarHTML += `
            <div class="calendar-day prev-month">
                <div class="day-number">${prevDay}</div>
            </div>
        `;
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        
        const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Sample content for demo (you can replace with real data)
        const hasContent = day % 3 === 0 || day % 5 === 0 || day % 7 === 0;
        const contentCount = hasContent ? Math.floor(Math.random() * 3) + 1 : 0;
        
        // Generate content indicators
        let contentHTML = '';
        if (contentCount > 0) {
            const platforms = ['instagram', 'youtube', 'linkedin', 'twitter', 'blog'];
            for (let i = 0; i < Math.min(contentCount, 3); i++) {
                const platform = platforms[Math.floor(Math.random() * platforms.length)];
                contentHTML += `<div class="content-indicator ${platform}-indicator"></div>`;
            }
            if (contentCount > 3) {
                contentHTML += `<div class="content-more">+${contentCount - 3}</div>`;
            }
        }
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past-day' : ''} ${hasContent ? 'has-content' : ''}" 
                 onclick="selectDate(${year}, ${month}, ${day})"
                 data-date="${year}-${month}-${day}">
                <div class="day-header">
                    <span class="day-number">${day}</span>
                    ${isToday ? '<span class="today-badge">Today</span>' : ''}
                </div>
                <div class="day-content">
                    ${contentHTML}
                </div>
            </div>
        `;
    }
    
    // Next month's leading days (grayed out)
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        calendarHTML += `
            <div class="calendar-day next-month">
                <div class="day-number">${day}</div>
            </div>
        `;
    }
    
    document.getElementById('calendarDays').innerHTML = calendarHTML;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

function selectDate(year, month, day) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[month]} ${day}, ${year}`;
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    
    // Add selection to clicked day
    const selectedDay = document.querySelector(`[data-date="${year}-${month}-${day}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // Show quick action
    const confirmation = confirm(`📅 ${dateStr}\n\nWould you like to add content for this date?`);
    if (confirmation) {
        openAddContentModal();
        // Pre-fill the date
        const dateInput = document.getElementById('contentDateTime');
        if (dateInput) {
            const dateValue = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00`;
            dateInput.value = dateValue;
        }
    }
}

function openAddContentModal() {
    document.getElementById('addContentModal').style.display = 'flex';
}

function closeAddContentModal() {
    document.getElementById('addContentModal').style.display = 'none';
}

function saveContentToPlan() {
    const title = document.getElementById('contentTitle').value;
    const platform = document.getElementById('contentPlatform').value;
    const dateTime = document.getElementById('contentDateTime').value;
    const notes = document.getElementById('contentNotes').value;
    
    if (!title || !dateTime) {
        alert('Please fill in the title and schedule date/time!');
        return;
    }
    
    // Save to planned content array
    plannedContent.push({
        title,
        platform,
        dateTime,
        notes,
        status: 'scheduled'
    });
    
    alert('✅ Content added to your planner!');
    closeAddContentModal();
    
    // Clear form
    document.getElementById('contentTitle').value = '';
    document.getElementById('contentNotes').value = '';
}

function filterContentList() {
    const platform = document.getElementById('platformFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    // Filter logic would go here
    console.log('Filtering by:', platform, status);
}

// Initialize calendar when planner page loads
document.addEventListener('DOMContentLoaded', function() {
    generateCalendar();
});

// TEMPLATE FUNCTIONS
let currentTemplate = null;
let templateData = {
    mainText: '',
    subtitleText: '',
    ctaText: '',
    background: 'gradient1',
    textColor: '#ffffff'
};

function showTemplateCategory(category) {
    // Hide all template categories
    document.querySelectorAll('.template-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected category or all
    if (category === 'all') {
        document.querySelectorAll('.template-category').forEach(cat => {
            cat.classList.add('active');
        });
    } else {
        const selectedCategory = document.getElementById(category + '-templates');
        if (selectedCategory) {
            selectedCategory.classList.add('active');
        }
    }
    
    // Add active class to clicked button
    event.target.closest('.category-btn').classList.add('active');
    
    // Update template count
    updateTemplateCount();
}

function filterTemplates() {
    const searchTerm = document.getElementById('templateSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.template-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('templateCount').textContent = visibleCount;
}

function updateTemplateCount() {
    const visibleCards = document.querySelectorAll('.template-card[style="display: block"], .template-card:not([style*="display: none"])');
    const activeCategories = document.querySelectorAll('.template-category.active');
    
    let count = 0;
    activeCategories.forEach(category => {
        count += category.querySelectorAll('.template-card').length;
    });
    
    document.getElementById('templateCount').textContent = count;
}

function openTemplateEditor(templateType) {
    currentTemplate = templateType;
    
    const titles = {
        'instagram-post': '📸 Instagram Post Template',
        'instagram-story': '📖 Instagram Story Template',
        'youtube-thumbnail': '🎬 YouTube Thumbnail Template',
        'twitter-post': '🐦 Twitter Post Template',
        'business-card': '💼 Business Card Template',
        'presentation': '📊 Presentation Template',
        'flyer': '📢 Marketing Flyer Template',
        'banner': '🎯 Web Banner Template',
        'infographic': '📊 Infographic Template',
        'worksheet': '📚 Worksheet Template'
    };
    
    document.getElementById('editor-title').textContent = titles[templateType] || '🎨 Template Editor';
    document.getElementById('editor-subtitle').textContent = 'Customize this template with your content and branding';
    
    // Reset template data
    templateData = {
        mainText: 'Your Amazing Content',
        subtitleText: 'Your Subtitle Here',
        ctaText: 'Call to Action',
        background: 'gradient1',
        textColor: '#ffffff'
    };
    
    // Update form fields
    document.getElementById('mainText').value = templateData.mainText;
    document.getElementById('subtitleText').value = templateData.subtitleText;
    document.getElementById('ctaText').value = templateData.ctaText;
    
    renderTemplate();
    showPage('template-editor');
}

function updateTemplate() {
    templateData.mainText = document.getElementById('mainText').value || 'Your Amazing Content';
    templateData.subtitleText = document.getElementById('subtitleText').value || 'Your Subtitle Here';
    templateData.ctaText = document.getElementById('ctaText').value || 'Call to Action';
    
    renderTemplate();
}

function changeBackground(bgType) {
    templateData.background = bgType;
    renderTemplate();
}

function changeTextColor(color) {
    templateData.textColor = color;
    renderTemplate();
}

function renderTemplate() {
    const canvas = document.getElementById('templateCanvas');
    
    const backgrounds = {
        'gradient1': 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        'gradient2': 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        'gradient3': 'linear-gradient(135deg, #10b981, #14b8a6)',
        'dark': '#1f2937',
        'light': '#ffffff'
    };
    
    let templateHTML = '';
    
    switch(currentTemplate) {
        case 'instagram-post':
            templateHTML = `
                <div class="instagram-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <div class="template-header">
                        <div class="profile-pic"></div>
                        <div class="profile-info">
                            <div class="username">@yourbrand</div>
                            <div class="location">Your Location</div>
                        </div>
                    </div>
                    <div class="template-main">
                        <h2>${templateData.mainText}</h2>
                        <p>${templateData.subtitleText}</p>
                        <button class="template-cta">${templateData.ctaText}</button>
                    </div>
                </div>
            `;
            break;
            
        case 'youtube-thumbnail':
            templateHTML = `
                <div class="youtube-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <div class="thumbnail-content">
                        <h1>${templateData.mainText}</h1>
                        <p>${templateData.subtitleText}</p>
                        <div class="play-button">▶</div>
                        <div class="cta-badge">${templateData.ctaText}</div>
                    </div>
                </div>
            `;
            break;
            
        default:
            templateHTML = `
                <div class="generic-template" style="background: ${backgrounds[templateData.background]}; color: ${templateData.textColor};">
                    <h1>${templateData.mainText}</h1>
                    <p>${templateData.subtitleText}</p>
                    <button class="template-cta">${templateData.ctaText}</button>
                </div>
            `;
    }
    
    canvas.innerHTML = templateHTML;
}

function downloadTemplate() {
    alert('Template downloaded! 📥 Check your downloads folder.');
}

function saveTemplate() {
    alert('Template saved to your library! 💾');
}

// CONTENT GENERATOR FUNCTIONS
let generationsUsed = 0;
const maxGenerations = 5;

function showContentGenerator(contentType) {
    // Store the current content type for posting recommendations
    currentContentType = contentType;
    
    const titles = {
        // Instagram
        'reel-scripts': '🎬 Generate Reel Scripts',
        'instagram-captions': '📝 Generate Instagram Captions', 
        'instagram-stories': '📖 Generate Instagram Stories',
        
        // YouTube
        'youtube-scripts': '🎥 Generate Video Scripts',
        'youtube-shorts': '⚡ Generate Shorts Scripts',
        'youtube-thumbnails': '🖼️ Generate Thumbnail Ideas',
        
        // LinkedIn
        'linkedin-posts': '💼 Generate Professional Posts',
        'linkedin-articles': '📄 Generate LinkedIn Articles',
        'linkedin-carousels': '🎠 Generate Carousel Posts',
        
        // Twitter
        'twitter-tweets': '🔥 Generate Viral Tweets',
        'twitter-threads': '🧵 Generate Thread Content',
        'twitter-trending': '📈 Generate Trending Content',
        
        // Blog
        'blog-posts': '📝 Generate Blog Posts',
        'blog-listicles': '📋 Generate Listicles',
        'blog-tutorials': '🎯 Generate Tutorials',
        
        // Education - Students
        'essay-generator': '📝 Generate Essays',
        'research-paper': '🔬 Generate Research Papers',
        'study-notes': '📊 Generate Study Notes',
        
        // Education - Students  
        'assignment-help': '📋 Generate Assignment Help',
        'presentation-slides': '📊 Generate Presentation Slides',
        'book-summary': '📚 Generate Book Summaries',
        
        // Education - Teachers
        'question-paper': '📋 Generate Question Papers',
        'concept-explanation': '💡 Generate Concept Explanations',
        'worksheet-creator': '📄 Generate Worksheets',
        'lesson-plan': '📚 Generate Lesson Plans',
        'rubric-generator': '⭐ Generate Assessment Rubrics',
        'parent-communication': '📧 Generate Parent Communications',
        
        // Companies
        'marketing-copy': '📢 Generate Marketing Copy',
        'social-media-business': '📱 Generate Business Social Posts',
        'press-release': '📰 Generate Press Releases'
    };
    
    const subtitles = {
        // Instagram
        'reel-scripts': 'Create engaging 15-60 second video scripts that hook viewers instantly',
        'instagram-captions': 'Write compelling captions that drive engagement and match your voice',
        'instagram-stories': 'Generate story content that keeps your audience coming back for more',
        
        // YouTube
        'youtube-scripts': 'Full-length video scripts with natural flow and your speaking style',
        'youtube-shorts': 'Quick, punchy scripts for YouTube Shorts that grab attention fast',
        'youtube-thumbnails': 'Creative thumbnail concepts and text overlays that increase click-through rates',
        
        // LinkedIn
        'linkedin-posts': 'Thought leadership posts that establish your expertise and authority',
        'linkedin-articles': 'Long-form LinkedIn articles that showcase your knowledge and insights',
        'linkedin-carousels': 'Multi-slide carousel posts that educate and engage your professional network',
        
        // Twitter
        'twitter-tweets': 'Craft engaging tweets that spark conversations and drive engagement',
        'twitter-threads': 'Create compelling Twitter threads that tell stories and share insights',
        'twitter-trending': 'Jump on trending hashtags with content that fits your voice and brand',
        
        // Blog
        'blog-posts': 'Comprehensive blog posts that establish authority and drive organic traffic',
        'blog-listicles': 'Engaging list-format articles that are easy to read and highly shareable',
        'blog-tutorials': 'Step-by-step guides that provide real value to your readers',
        
        // Education - Students
        'essay-generator': 'Create essay outlines with proper structure. Perfect for any topic!',
        'research-paper': 'Structure research papers with citations and methodology sections',
        'study-notes': 'Convert complex topics into clear, organized study notes',
        
        // Education - Students
        'assignment-help': 'Get structured help with homework and assignments in any subject',
        'presentation-slides': 'Create engaging presentation content for class projects',
        'book-summary': 'Generate comprehensive summaries of books and articles',
        
        // Education - Teachers
        'question-paper': 'Create comprehensive question papers with MCQs, short answers, and essay questions',
        'concept-explanation': 'Transform complex topics into clear, easy-to-understand explanations for students',
        'worksheet-creator': 'Design engaging worksheets with practice problems, activities, and assessments',
        'lesson-plan': 'Create detailed lesson plans with objectives, activities, and assessments',
        'rubric-generator': 'Generate assessment rubrics for projects, assignments, and presentations',
        'parent-communication': 'Draft professional emails and letters to communicate with parents',
        
        // Companies
        'marketing-copy': 'Create compelling marketing content that converts and drives sales',
        'social-media-business': 'Generate engaging social media content that builds your brand',
        'press-release': 'Draft professional press releases for company announcements and news'
    };
    
    document.getElementById('generator-title').textContent = titles[contentType] || '✨ Generate Content';
    document.getElementById('generator-subtitle').textContent = subtitles[contentType] || 'Create content that sounds like you';
    
    // Update form title based on content type
    const formTitles = {
        // Instagram
        'reel-scripts': 'Create Your Instagram Reel Script',
        'instagram-captions': 'Write Your Instagram Caption',
        'instagram-stories': 'Design Your Instagram Story',
        
        // YouTube
        'youtube-scripts': 'Write Your YouTube Video Script',
        'youtube-shorts': 'Create Your YouTube Shorts Script',
        'youtube-thumbnails': 'Design Your Thumbnail Concept',
        
        // LinkedIn
        'linkedin-posts': 'Craft Your LinkedIn Post',
        'linkedin-articles': 'Write Your LinkedIn Article',
        'linkedin-carousels': 'Create Your Carousel Content',
        
        // Twitter
        'twitter-tweets': 'Write Your Viral Tweet',
        'twitter-threads': 'Create Your Twitter Thread',
        'twitter-trending': 'Join Trending Conversations',
        
        // Blog
        'blog-posts': 'Write Your Blog Post',
        'blog-listicles': 'Create Your Listicle',
        'blog-tutorials': 'Write Your Tutorial Guide',
        
        // Education - Students
        'essay-generator': 'Generate Your Essay',
        'research-paper': 'Create Your Research Paper',
        'study-notes': 'Generate Study Notes',
        'assignment-help': 'Get Assignment Help',
        'presentation-slides': 'Create Presentation Content',
        'book-summary': 'Summarize Your Book',
        
        // Education - Teachers
        'question-paper': 'Create Your Question Paper',
        'concept-explanation': 'Explain Your Concept',
        'worksheet-creator': 'Design Your Worksheet',
        'lesson-plan': 'Plan Your Lesson',
        'rubric-generator': 'Create Assessment Rubric',
        'parent-communication': 'Write Parent Communication',
        
        // Companies
        'marketing-copy': 'Write Marketing Copy',
        'social-media-business': 'Create Business Social Post',
        'press-release': 'Draft Your Press Release'
    };
    
    document.getElementById('generatorFormTitle').textContent = formTitles[contentType] || 'Tell us about your content';
    
    // Generate dynamic form fields based on content type
    generateDynamicFormFields(contentType);
    
    // Update generations counter
    document.getElementById('generationsUsed').textContent = generationsUsed;
    
    showPage('content-generator');
}

function generateDynamicFormFields(contentType) {
    const formContainer = document.getElementById('dynamicFormFields');
    
    // Define form fields for each content type
    const formConfigs = {
        // Social Media (Instagram, YouTube Shorts, TikTok, Twitter)
        'reel-scripts': [
            { type: 'text', id: 'topic', label: 'What\'s your reel about?', placeholder: 'e.g., Morning routine, Cooking hack, Fitness tip...', voice: true },
            { type: 'select', id: 'duration', label: 'Reel Duration', options: ['15 seconds', '30 seconds', '60 seconds', '90 seconds'] },
            { type: 'select', id: 'tone', label: 'Tone', options: ['Casual & Fun', 'Professional', 'Funny', 'Inspiring', 'Educational'] },
            { type: 'textarea', id: 'details', label: 'Additional Details (Optional)', placeholder: 'Hook idea, call-to-action, target audience...', voice: true }
        ],
        
        // Essay Generator
        'essay-generator': [
            { type: 'text', id: 'topic', label: 'Essay Topic', placeholder: 'e.g., Climate change, Social media impact...', voice: true },
            { type: 'select', id: 'paragraphs', label: 'Number of Paragraphs', options: ['3 paragraphs', '4 paragraphs', '5 paragraphs', '6+ paragraphs'] },
            { type: 'select', id: 'wordCount', label: 'Word Count', options: ['500 words', '750 words', '1000 words', '1500 words', '2000+ words'] },
            { type: 'select', id: 'style', label: 'Essay Style', options: ['Argumentative', 'Persuasive', 'Descriptive', 'Narrative', 'Expository'] },
            { type: 'textarea', id: 'details', label: 'Key Points to Include (Optional)', placeholder: 'Main arguments, examples, sources...', voice: true }
        ],
        
        // Research Paper
        'research-paper': [
            { type: 'text', id: 'topic', label: 'Research Topic', placeholder: 'e.g., Artificial Intelligence in Healthcare...', voice: true },
            { type: 'select', id: 'sections', label: 'Paper Sections', options: ['Abstract + Introduction', 'Full Paper (All Sections)', 'Literature Review', 'Methodology', 'Results & Discussion'] },
            { type: 'select', id: 'pages', label: 'Target Length', options: ['5-10 pages', '10-15 pages', '15-20 pages', '20+ pages'] },
            { type: 'text', id: 'citations', label: 'Citation Style', placeholder: 'e.g., APA, MLA, Chicago, Harvard...' },
            { type: 'textarea', id: 'details', label: 'Research Focus (Optional)', placeholder: 'Hypothesis, research questions, methodology...', voice: true }
        ],
        
        // Question Paper
        'question-paper': [
            { type: 'text', id: 'subject', label: 'Subject/Topic', placeholder: 'e.g., Mathematics, Biology, History...', voice: true },
            { type: 'select', id: 'grade', label: 'Grade Level', options: ['Elementary (1-5)', 'Middle School (6-8)', 'High School (9-12)', 'College/University'] },
            { type: 'select', id: 'questionTypes', label: 'Question Types', options: ['MCQ Only', 'Short Answer Only', 'Essay Only', 'Mixed (MCQ + Short + Essay)'] },
            { type: 'select', id: 'totalQuestions', label: 'Total Questions', options: ['10 questions', '20 questions', '30 questions', '40 questions', '50 questions'] },
            { type: 'select', id: 'difficulty', label: 'Difficulty Level', options: ['Easy', 'Medium', 'Hard', 'Mixed Difficulty'] },
            { type: 'textarea', id: 'details', label: 'Topics to Cover (Optional)', placeholder: 'Specific chapters, concepts, or topics...', voice: true }
        ],
        
        // Blog Post
        'blog-posts': [
            { type: 'text', id: 'topic', label: 'Blog Post Topic', placeholder: 'e.g., Best productivity apps for 2025...', voice: true },
            { type: 'select', id: 'wordCount', label: 'Post Length', options: ['500-750 words', '750-1000 words', '1000-1500 words', '1500-2000 words', '2000+ words'] },
            { type: 'select', id: 'tone', label: 'Writing Tone', options: ['Casual & Conversational', 'Professional', 'Informative', 'Entertaining', 'Authoritative'] },
            { type: 'text', id: 'keywords', label: 'SEO Keywords (Optional)', placeholder: 'e.g., productivity, apps, 2025...' },
            { type: 'textarea', id: 'details', label: 'Key Points (Optional)', placeholder: 'Main sections, examples, call-to-action...', voice: true }
        ],
        
        // Marketing Copy
        'marketing-copy': [
            { type: 'text', id: 'product', label: 'Product/Service Name', placeholder: 'e.g., Premium Coffee Maker...', voice: true },
            { type: 'select', id: 'copyType', label: 'Copy Type', options: ['Product Description', 'Sales Page', 'Email Campaign', 'Ad Copy', 'Landing Page'] },
            { type: 'text', id: 'audience', label: 'Target Audience', placeholder: 'e.g., Busy professionals, Coffee lovers...' },
            { type: 'select', id: 'tone', label: 'Brand Tone', options: ['Professional', 'Friendly & Casual', 'Luxury & Premium', 'Fun & Playful', 'Urgent & Persuasive'] },
            { type: 'textarea', id: 'details', label: 'Key Benefits & Features (Optional)', placeholder: 'Unique selling points, benefits, features...', voice: true }
        ]
    };
    
    // Get form config for this content type, or use default
    let fields = formConfigs[contentType];
    
    // If no specific config, use generic social media format
    if (!fields) {
        fields = [
            { type: 'text', id: 'topic', label: 'What\'s your topic or idea?', placeholder: 'e.g., Morning routine tips, Cooking hacks...', voice: true },
            { type: 'select', id: 'tone', label: 'Tone', options: ['Casual & Friendly', 'Professional', 'Funny', 'Inspiring', 'Educational'] },
            { type: 'select', id: 'length', label: 'Content Length', options: ['Short', 'Medium', 'Long'] },
            { type: 'textarea', id: 'details', label: 'Additional Details (Optional)', placeholder: 'Target audience, key points, call-to-action...', voice: true }
        ];
    }
    
    // Generate HTML for form fields
    let formHTML = '';
    fields.forEach(field => {
        formHTML += '<div class="form-group">';
        formHTML += `<label for="${field.id}">${field.label}</label>`;
        
        if (field.type === 'text') {
            formHTML += '<div class="voice-input-container">';
            formHTML += `<input type="text" id="${field.id}" placeholder="${field.placeholder || ''}" />`;
            if (field.voice) {
                formHTML += `<button type="button" class="voice-btn" onclick="startVoiceInput('${field.id}')" title="Use Voice Input">🎤</button>`;
            }
            formHTML += '</div>';
        } else if (field.type === 'select') {
            formHTML += `<select id="${field.id}">`;
            field.options.forEach(option => {
                formHTML += `<option value="${option}">${option}</option>`;
            });
            formHTML += '</select>';
        } else if (field.type === 'textarea') {
            formHTML += '<div class="voice-input-container">';
            formHTML += `<textarea id="${field.id}" placeholder="${field.placeholder || ''}"></textarea>`;
            if (field.voice) {
                formHTML += `<button type="button" class="voice-btn voice-btn-textarea" onclick="startVoiceInput('${field.id}')" title="Use Voice Input">🎤</button>`;
            }
            formHTML += '</div>';
        }
        
        formHTML += '</div>';
    });
    
    formContainer.innerHTML = formHTML;
}

function generateContent() {
    if (generationsUsed >= maxGenerations) {
        alert('You\'ve reached your daily limit of 5 free generations! Upgrade to Pro for unlimited content.');
        return;
    }
    
    // Get form values (works with dynamic fields)
    const topic = document.getElementById('topic')?.value || '';
    const tone = document.getElementById('tone')?.value || 'casual';
    
    if (!topic.trim()) {
        alert('Please enter a topic or idea for your content!');
        return;
    }
    
    // Simulate content generation
    const generatedText = generateSampleContent(topic, tone);
    
    document.getElementById('generatedText').textContent = generatedText;
    document.getElementById('generatedContent').style.display = 'block';
    
    // Update counter
    generationsUsed++;
    document.getElementById('generationsUsed').textContent = generationsUsed;
    
    // Show AI posting recommendation for creators and companies only
    if (shouldShowPostingRecommendation(currentContentType)) {
        setTimeout(() => {
            showPostingRecommendation(currentContentType, topic);
        }, 1500);
    }
    
    // Scroll to generated content
    document.getElementById('generatedContent').scrollIntoView({ behavior: 'smooth' });
}

let currentContentType = '';

function shouldShowPostingRecommendation(contentType) {
    // Only show for creators and companies, not education
    const creatorTypes = [
        'reel-scripts', 'instagram-captions', 'instagram-stories',
        'youtube-scripts', 'youtube-shorts', 'youtube-thumbnails',
        'linkedin-posts', 'linkedin-articles', 'linkedin-carousels',
        'twitter-tweets', 'twitter-threads', 'twitter-trending',
        'blog-posts', 'blog-listicles', 'blog-tutorials',
        'marketing-copy', 'social-media-business', 'press-release'
    ];
    
    return creatorTypes.includes(contentType);
}

function showPostingRecommendation(contentType, topic) {
    const recommendation = analyzeContentTiming(contentType, topic);
    
    // Create recommendation modal
    const modal = document.createElement('div');
    modal.className = 'posting-recommendation-modal';
    modal.innerHTML = `
        <div class="posting-recommendation-content">
            <div class="recommendation-header">
                <div class="recommendation-icon">${recommendation.icon}</div>
                <h3>${recommendation.title}</h3>
            </div>
            <div class="recommendation-body">
                <div class="recommendation-insight">
                    <strong>${recommendation.insight}</strong>
                </div>
                <div class="recommendation-details">
                    <div class="detail-item">
                        <span class="detail-label">📅 Best Day:</span>
                        <span class="detail-value">${recommendation.bestDay}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏰ Best Time:</span>
                        <span class="detail-value">${recommendation.bestTime}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📊 Engagement:</span>
                        <span class="detail-value">${recommendation.engagement}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🔥 Trend Status:</span>
                        <span class="detail-value trend-${recommendation.trendLevel}">${recommendation.trendStatus}</span>
                    </div>
                </div>
                <div class="recommendation-tip">
                    💡 <strong>Pro Tip:</strong> ${recommendation.tip}
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="btn-secondary" onclick="closePostingRecommendation()">Maybe Later</button>
                <button class="btn-primary" onclick="scheduleToPlanner()">📅 Schedule Now</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function analyzeContentTiming(contentType, topic) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // AI analysis based on content type and topic
    const recommendations = {
        // Instagram
        'reel-scripts': {
            icon: '📸',
            title: 'Instagram Reel Timing Analysis',
            bestDay: 'Wednesday or Thursday',
            bestTime: '11 AM - 1 PM or 7 PM - 9 PM',
            engagement: 'High (Peak hours)',
            trendLevel: 'hot',
            trendStatus: 'Trending Now! 🔥',
            insight: 'Instagram Reels perform best during lunch breaks and evening hours!',
            tip: 'Post during peak engagement times for maximum reach. Add trending audio for 2x visibility.'
        },
        
        'instagram-captions': {
            icon: '📸',
            title: 'Instagram Post Timing',
            bestDay: 'Tuesday - Friday',
            bestTime: '9 AM - 11 AM',
            engagement: 'Very High',
            trendLevel: 'trending',
            trendStatus: 'Good Time to Post',
            insight: 'Your content aligns with current Instagram trends!',
            tip: 'Use 3-5 relevant hashtags and post when your audience is most active.'
        },
        
        // YouTube
        'youtube-scripts': {
            icon: '🎬',
            title: 'YouTube Video Timing',
            bestDay: 'Thursday or Friday',
            bestTime: '2 PM - 4 PM EST',
            engagement: 'High',
            trendLevel: 'hot',
            trendStatus: 'Optimal Upload Time',
            insight: 'YouTube algorithm favors uploads during these hours!',
            tip: 'Upload 2-3 hours before peak viewing time for better algorithm pickup.'
        },
        
        'youtube-shorts': {
            icon: '⚡',
            title: 'YouTube Shorts Timing',
            bestDay: 'Any day (Shorts work 24/7)',
            bestTime: '6 PM - 10 PM',
            engagement: 'Very High',
            trendLevel: 'hot',
            trendStatus: 'Trending Format! 🔥',
            insight: 'Shorts are currently getting 10x more reach than regular videos!',
            tip: 'Post multiple shorts per day for maximum visibility. Evening hours get most views.'
        },
        
        // LinkedIn
        'linkedin-posts': {
            icon: '💼',
            title: 'LinkedIn Post Timing',
            bestDay: 'Tuesday - Thursday',
            bestTime: '8 AM - 10 AM or 12 PM - 1 PM',
            engagement: 'High (Business hours)',
            trendLevel: 'trending',
            trendStatus: 'Professional Peak Time',
            insight: 'LinkedIn users are most active during work hours!',
            tip: 'Post early morning or lunch time when professionals check LinkedIn.'
        },
        
        // Twitter
        'twitter-tweets': {
            icon: '🐦',
            title: 'Twitter Post Timing',
            bestDay: 'Wednesday',
            bestTime: '9 AM - 3 PM',
            engagement: 'Very High',
            trendLevel: 'hot',
            trendStatus: 'High Engagement Window',
            insight: 'Twitter engagement peaks during work hours!',
            tip: 'Tweet multiple times per day. Engage with replies within first hour for algorithm boost.'
        },
        
        'twitter-threads': {
            icon: '🧵',
            title: 'Twitter Thread Timing',
            bestDay: 'Tuesday or Thursday',
            bestTime: '10 AM - 12 PM',
            engagement: 'High',
            trendLevel: 'trending',
            trendStatus: 'Great for Threads',
            insight: 'Long-form content performs best mid-morning!',
            tip: 'Post threads when people have time to read. Add a hook in first tweet.'
        },
        
        // Blog
        'blog-posts': {
            icon: '📝',
            title: 'Blog Post Timing',
            bestDay: 'Monday or Tuesday',
            bestTime: '7 AM - 9 AM',
            engagement: 'Medium-High',
            trendLevel: 'steady',
            trendStatus: 'Steady Traffic',
            insight: 'Blog readers prefer morning content!',
            tip: 'Publish early in the week for maximum weekly traffic. Promote on social media.'
        },
        
        // Marketing
        'marketing-copy': {
            icon: '📢',
            title: 'Marketing Campaign Timing',
            bestDay: 'Tuesday - Thursday',
            bestTime: '10 AM - 2 PM',
            engagement: 'High',
            trendLevel: 'hot',
            trendStatus: 'Prime Marketing Hours',
            insight: 'B2B audiences are most receptive mid-week!',
            tip: 'Launch campaigns mid-week for best response rates. Avoid Mondays and Fridays.'
        }
    };
    
    // Get recommendation or use default
    let rec = recommendations[contentType] || {
        icon: '✨',
        title: 'Content Timing Analysis',
        bestDay: 'Tuesday - Thursday',
        bestTime: '9 AM - 12 PM',
        engagement: 'Medium-High',
        trendLevel: 'trending',
        trendStatus: 'Good Time to Post',
        insight: 'Your content is ready to publish!',
        tip: 'Post during peak hours for your target audience.'
    };
    
    // Adjust based on current time
    if (hour >= 9 && hour <= 12) {
        rec.insight = '🔥 Perfect timing! Post NOW for maximum engagement!';
        rec.trendLevel = 'hot';
    } else if (hour >= 18 && hour <= 21) {
        rec.insight = '⭐ Evening prime time! Great moment to post!';
        rec.trendLevel = 'hot';
    }
    
    return rec;
}

function closePostingRecommendation() {
    const modal = document.querySelector('.posting-recommendation-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function scheduleToPlanner() {
    closePostingRecommendation();
    showPage('planner');
    setTimeout(() => {
        openAddContentModal();
    }, 500);
}

function generateSampleContent(topic, tone, length, notes) {
    // Normalize tone value to match sample keys
    const normalizedTone = tone ? tone.toLowerCase().split(' ')[0] : 'casual';
    
    const samples = {
        casual: `Hey everyone! 👋 Let me share something amazing about ${topic}. 

Did you know that ${topic} can completely change your day? Here's what I discovered... [Your authentic experience with ${topic}]. The key is to start small and be consistent.

Try this today and let me know how it goes! Drop a comment below 👇

#${topic.replace(/\s+/g, '')} #authentic #tips`,

        professional: `Professional insight on ${topic}:

As someone who's studied ${topic}, here's what you need to know. The three key principles are: 

1) [First principle] 
2) [Second principle] 
3) [Third principle] 

This approach has proven effective because it addresses the core challenges most people face. Implement these strategies and you'll see measurable results.

What's your experience with ${topic}? I'd love to hear your thoughts in the comments.`,

        funny: `Okay, let's talk about ${topic} but make it fun! 😂

Me trying ${topic} vs. reality... 

So there I was, thinking I had ${topic} figured out... NOPE! Here's what actually happened: [Insert your funny story/experience here]. 

Moral of the story: ${topic} is harder than it looks! Who else can relate? 🙋‍♀️

#${topic.replace(/\s+/g, '')} #fail #relatable`,

        inspiring: `✨ Transform your life with ${topic} ✨

Every expert was once a beginner. Every success story started with a single step. Today, that step is ${topic}.

Here's the truth: ${topic} isn't just about [surface level benefit]. It's about becoming the person who [deeper transformation]. 

Your future self is counting on the decision you make today. Are you ready to begin?

Start with just 5 minutes today. Your journey begins now. 💪

#${topic.replace(/\s+/g, '')} #motivation #transformation`,

        educational: `📚 Everything you need to know about ${topic}

Let's break this down step by step:

🔹 What is ${topic}?
[Clear definition and explanation]

🔹 Why does it matter?
[Key benefits and importance]

🔹 How to get started:
1. [First step]
2. [Second step] 
3. [Third step]

🔹 Common mistakes to avoid:
- [Mistake 1]
- [Mistake 2]

Save this post for later and share it with someone who needs to see this!

#${topic.replace(/\s+/g, '')} #education #tips #howto`
    };
    
    return samples[normalizedTone] || samples.casual;
}

function regenerateContent() {
    if (generationsUsed >= maxGenerations) {
        alert('You\'ve reached your daily limit! Upgrade for unlimited regenerations.');
        return;
    }
    generateContent();
}

function copyContent() {
    const text = document.getElementById('generatedText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Content copied to clipboard! 📋');
    });
}

function saveContent() {
    alert('Content saved to your drafts! 💾');
}

// EDUCATION TABS FUNCTIONS
function showEducationTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('#education .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.department-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// CREATOR TABS FUNCTIONS
function showCreatorTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.creator-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// CHATBOX FUNCTIONS
function toggleChatbox() {
    const chatbox = document.getElementById('chatbox');
    const toggle = document.getElementById('chatToggle');
    
    if (chatbox.classList.contains('minimized')) {
        chatbox.classList.remove('minimized');
        toggle.textContent = '▲';
    } else {
        chatbox.classList.add('minimized');
        toggle.textContent = '▼';
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Content creation responses
    if (message.includes('content') || message.includes('write') || message.includes('create')) {
        return "I can help you create authentic content! Try our tools for students (essays, research), HR (job descriptions), companies (marketing copy), or creators (social media). What type of content do you want to create?";
    }
    
    // Getting started responses
    if (message.includes('start') || message.includes('begin') || message.includes('how')) {
        return "Getting started is easy! 1) Upload some of your existing content so I can learn your voice, 2) Choose a template that fits your needs, 3) Fill in the details and generate content that sounds like YOU. Want to try it?";
    }
    
    // Voice/AI responses
    if (message.includes('voice') || message.includes('sound') || message.includes('authentic')) {
        return "That's our specialty! ContentAI analyzes your writing style, tone, and vocabulary to create content that sounds exactly like you wrote it - not like a robot. Upload some of your past content to get started!";
    }
    
    // Pricing responses
    if (message.includes('price') || message.includes('cost') || message.includes('free')) {
        return "We have a free plan with 5 generations per month! Our Creator plan ($29/month) gives you unlimited content generation. Check out our Pricing page for full details.";
    }
    
    // Tools responses
    if (message.includes('tool') || message.includes('template') || message.includes('feature')) {
        return "We have tools for everyone! Students can create essays and research papers, HR can generate job descriptions and emails, Companies can create marketing content, and Creators can make social media posts. What's your role?";
    }
    
    // Default responses
    const defaultResponses = [
        "I'm here to help you create amazing content! What would you like to know about ContentAI?",
        "ContentAI helps you create content that sounds like YOU, not a robot. What can I help you with today?",
        "Whether you're a student, HR professional, business owner, or creator, we have tools to help you create authentic content. What's your goal?",
        "I can help you with content creation, getting started, or finding the right tools. What would you like to explore?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}