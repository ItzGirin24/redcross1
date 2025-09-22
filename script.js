// PMR Voting System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const candidatesContainer = document.getElementById('candidatesContainer');
    const voteBtn = document.getElementById('voteBtn');

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

    // Initialize
    loadCandidates();
    voteBtn.addEventListener('click', handleVote);

    // Add some interactive effects
    document.querySelectorAll('.candidate-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });
});
