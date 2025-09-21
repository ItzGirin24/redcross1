// Voting System for Ketua PMR SMA IT ABU BAKAR BOARDING SCHOOL
class VotingSystem {
    constructor() {
        this.currentUser = null;
        this.selectedCandidate = null;
        this.candidates = [
            { id: 1, name: "Ahmad Rizki", class: "XII IPA 1", vision: "Membangun PMR yang lebih aktif dan peduli terhadap kesehatan masyarakat" },
            { id: 2, name: "Siti Nurhaliza", class: "XII IPS 1", vision: "Mengembangkan program kesehatan preventif dan edukasi di sekolah" },
            { id: 3, name: "Budi Santoso", class: "XII IPA 2", vision: "Meningkatkan kerjasama PMR dengan organisasi kesehatan eksternal" }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.showAuthSection();
    }

    bindEvents() {
        // Auth events
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('registerBtn').addEventListener('click', () => this.handleRegister());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Enter key for inputs
        document.getElementById('email').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    showAuthSection() {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('votingSection').classList.add('hidden');
    }

    showVotingSection() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('votingSection').classList.remove('hidden');
        this.displayCandidates();
    }

    handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            this.showMessage('authMessage', 'Mohon isi email dan password', 'error');
            return;
        }

        // Simple validation for demo purposes
        if (email.includes('@') && password.length >= 6) {
            this.currentUser = {
                email: email,
                name: email.split('@')[0],
                hasVoted: localStorage.getItem(`voted_${email}`) === 'true'
            };
            this.showMessage('authMessage', `Selamat datang, ${this.currentUser.name}!`, 'success');
            setTimeout(() => {
                this.showVotingSection();
            }, 1000);
        } else {
            this.showMessage('authMessage', 'Email atau password tidak valid', 'error');
        }
    }

    handleRegister() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            this.showMessage('authMessage', 'Mohon isi email dan password', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('authMessage', 'Password minimal 6 karakter', 'error');
            return;
        }

        // Simple registration for demo purposes
        this.currentUser = {
            email: email,
            name: email.split('@')[0],
            hasVoted: false
        };

        this.showMessage('authMessage', 'Registrasi berhasil! Silakan login.', 'success');
    }

    handleLogout() {
        this.currentUser = null;
        this.selectedCandidate = null;
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        this.showAuthSection();
        this.showMessage('authMessage', 'Anda telah logout', 'success');
    }

    displayCandidates() {
        const candidatesList = document.getElementById('candidatesList');
        candidatesList.innerHTML = '';

        this.candidates.forEach(candidate => {
            const candidateDiv = document.createElement('div');
            candidateDiv.className = 'candidate';
            candidateDiv.dataset.candidateId = candidate.id;
            candidateDiv.innerHTML = `
                <h3>${candidate.name}</h3>
                <p><strong>Kelas:</strong> ${candidate.class}</p>
                <p><strong>Visi:</strong> ${candidate.vision}</p>
            `;

            candidateDiv.addEventListener('click', () => this.selectCandidate(candidate.id));
            candidatesList.appendChild(candidateDiv);
        });
    }

    selectCandidate(candidateId) {
        if (this.currentUser && this.currentUser.hasVoted) {
            this.showMessage('voteMessage', 'Anda sudah memberikan suara sebelumnya', 'error');
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.candidate').forEach(c => c.classList.remove('selected'));

        // Select new candidate
        const selectedElement = document.querySelector(`[data-candidate-id="${candidateId}"]`);
        selectedElement.classList.add('selected');
        this.selectedCandidate = candidateId;

        this.showMessage('voteMessage', 'Kandidat dipilih. Klik tombol "Vote" untuk mengkonfirmasi.', 'success');
    }

    submitVote() {
        if (!this.selectedCandidate) {
            this.showMessage('voteMessage', 'Pilih kandidat terlebih dahulu', 'error');
            return;
        }

        if (this.currentUser && this.currentUser.hasVoted) {
            this.showMessage('voteMessage', 'Anda sudah memberikan suara sebelumnya', 'error');
            return;
        }

        // Record vote
        localStorage.setItem(`voted_${this.currentUser.email}`, 'true');
        this.currentUser.hasVoted = true;

        const candidate = this.candidates.find(c => c.id === this.selectedCandidate);
        this.showMessage('voteMessage', `Suara Anda untuk ${candidate.name} telah direkam! Terima kasih atas partisipasi Anda.`, 'success');

        // Disable further voting
        document.querySelectorAll('.candidate').forEach(c => {
            c.style.pointerEvents = 'none';
            c.style.opacity = '0.6';
        });
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = type === 'error' ? 'error-message' : 'success-message';

        // Clear message after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = '';
        }, 5000);
    }
}

// Add CSS for message types
const style = document.createElement('style');
style.textContent = `
    .error-message {
        background: #fed7d7;
        color: #c53030;
        border: 1px solid #feb2b2;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        margin: 1rem 0;
        font-weight: 500;
    }

    .success-message {
        background: #c6f6d5;
        color: #22543d;
        border: 1px solid #9ae6b4;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        margin: 1rem 0;
        font-weight: 500;
    }
`;
document.head.appendChild(style);

// Add vote button to voting section
document.addEventListener('DOMContentLoaded', function() {
    const votingSection = document.getElementById('votingSection');
    const voteButton = document.createElement('button');
    voteButton.id = 'voteBtn';
    voteButton.textContent = 'Vote';
    voteButton.style.cssText = `
        background: linear-gradient(45deg, #48bb78, #38a169);
        color: white;
        padding: 12px 24px;
        margin: 1rem auto;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        display: block;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    voteButton.addEventListener('click', () => {
        const votingSystem = new VotingSystem();
        votingSystem.submitVote();
    });

    // Insert vote button before the message
    votingSection.insertBefore(voteButton, document.getElementById('voteMessage'));

    // Initialize the voting system
    new VotingSystem();
});
