// PMR Voting System JavaScript with Firebase Authentication
document.addEventListener('DOMContentLoaded', function() {
    const candidatesContainer = document.getElementById('candidatesContainer');
    const voteBtn = document.getElementById('voteBtn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const authSection = document.getElementById('authSection');
    const votingSection = document.getElementById('votingSection');
    const userInfo = document.getElementById('userInfo');

    // Sample candidate data
    const candidates = [
        {
            id: 'rangga',
            name: 'Muhammad Rangga',
            position: 'Calon Ketua PMR',
            vision: 'Membangun PMR yang lebih aktif dalam pelayanan kesehatan masyarakat dan mengembangkan program-program inovatif untuk meningkatkan kesadaran kesehatan di lingkungan sekolah.',
            image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Rangga'
        },
        {
            id: 'ghazi',
            name: 'Ghazi',
            position: 'Calon Ketua PMR',
            vision: 'Mewujudkan PMR sebagai organisasi yang profesional dalam bidang kesehatan dengan fokus pada pencegahan penyakit dan promosi gaya hidup sehat di kalangan siswa.',
            image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Ghazi'
        }
    ];

    let selectedCandidate = null;
    let currentUser = null;

    // Load candidates
    function loadCandidates() {
        candidatesContainer.innerHTML = '';

        candidates.forEach(candidate => {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'candidate-card';
            candidateCard.dataset.id = candidate.id;

            candidateCard.innerHTML = `
                <img src="${candidate.image}" alt="${candidate.name}" class="candidate-image">
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-position">${candidate.position}</div>
                <div class="candidate-vision">${candidate.vision}</div>
            `;

            candidateCard.addEventListener('click', () => selectCandidate(candidate.id));
            candidatesContainer.appendChild(candidateCard);
        });
    }

    // Select candidate
    function selectCandidate(candidateId) {
        // Remove previous selection
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-id="${candidateId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCandidate = candidateId;
            voteBtn.disabled = false;
        }
    }

    // Handle voting
    function handleVote() {
        if (!selectedCandidate) {
            alert('Please select a candidate first!');
            return;
        }

        const candidate = candidates.find(c => c.id === selectedCandidate);
        const confirmVote = confirm(`Are you sure you want to vote for ${candidate.name}?`);

        if (confirmVote) {
            // Simulate voting process
            voteBtn.textContent = 'Voting...';
            voteBtn.disabled = true;

            setTimeout(() => {
                alert(`Thank you for voting!\nYou voted for: ${candidate.name}`);
                voteBtn.textContent = 'Vote Submitted ✓';
                voteBtn.style.background = '#4caf50';

                // Reset after 3 seconds
                setTimeout(() => {
                    voteBtn.textContent = 'Start Voting';
                    voteBtn.disabled = false;
                    voteBtn.style.background = '';
                    selectedCandidate = null;
                    document.querySelectorAll('.candidate-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                }, 3000);
            }, 1000);
        }
    }

    // Google Sign In Function
    async function signInWithGoogle() {
        try {
            googleSignInBtn.textContent = 'Signing in...';
            googleSignInBtn.disabled = true;

            const result = await signInWithPopup(auth, provider);
            currentUser = result.user;
            console.log('User signed in:', currentUser);
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Error signing in: ' + error.message);
        } finally {
            googleSignInBtn.textContent = 'Sign in with Google';
            googleSignInBtn.disabled = false;
        }
    }

    // Sign Out Function
    async function signOutUser() {
        try {
            await signOut(auth);
            currentUser = null;
            selectedCandidate = null;
            document.querySelectorAll('.candidate-card').forEach(card => {
                card.classList.remove('selected');
            });
            voteBtn.textContent = 'Start Voting';
            voteBtn.disabled = false;
            voteBtn.style.background = '';
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out: ' + error.message);
        }
    }

    // Update UI based on authentication state
    function updateUI(user) {
        if (user) {
            // User is signed in
            authSection.style.display = 'none';
            votingSection.style.display = 'block';

            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${user.photoURL || 'https://via.placeholder.com/40x40/667eea/ffffff?text=' + user.displayName.charAt(0)}" alt="Profile" class="user-avatar">
                    <div class="user-details">
                        <div class="user-name">${user.displayName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
            `;
        } else {
            // User is signed out
            authSection.style.display = 'block';
            votingSection.style.display = 'none';
            userInfo.innerHTML = '';
        }
    }

    // Authentication state observer
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateUI(user);
    });

    // Event Listeners
    googleSignInBtn.addEventListener('click', signInWithGoogle);
    signOutBtn.addEventListener('click', signOutUser);

    // Initialize authentication state observer
    // The onAuthStateChanged will handle the initial UI state
});
