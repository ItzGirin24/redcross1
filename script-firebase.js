// Firebase Voting System for Ketua PMR SMA IT ABU BAKAR BOARDING SCHOOL
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

class FirebaseVotingSystem {
    constructor() {
        this.currentUser = null;
        this.selectedCandidate = null;
        this.hasVoted = false;
        this.candidates = [
            { id: 1, name: "Ahmad Rizki", class: "XII IPA 1", vision: "Membangun PMR yang lebih aktif dan peduli terhadap kesehatan masyarakat" },
            { id: 2, name: "Siti Nurhaliza", class: "XII IPS 1", vision: "Mengembangkan program kesehatan preventif dan edukasi di sekolah" },
            { id: 3, name: "Budi Santoso", class: "XII IPA 2", vision: "Meningkatkan kerjasama PMR dengan organisasi kesehatan eksternal" }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAuthListener();
        this.showAuthSection();
    }

    setupAuthListener() {
        onAuthStateChanged(window.auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.checkVotingStatus();
                this.showVotingSection();
            } else {
                this.currentUser = null;
                this.showAuthSection();
            }
        });
    }

    async checkVotingStatus() {
        try {
            const voteDoc = await getDoc(doc(window.db, 'votes', this.currentUser.uid));
            if (voteDoc.exists()) {
                this.hasVoted = true;
                this.showMessage('voteMessage', 'Anda sudah memberikan suara sebelumnya', 'info');
                this.disableVoting();
            } else {
                this.hasVoted = false;
            }
        } catch (error) {
            console.error('Error checking voting status:', error);
        }
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

    async handleLogin() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            this.showMessage('authMessage', 'Mohon isi email dan password', 'error');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
            this.showMessage('authMessage', `Selamat datang, ${userCredential.user.email.split('@')[0]}!`, 'success');
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('authMessage', this.getErrorMessage(error.code), 'error');
        }
    }

    async handleRegister() {
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

        try {
            const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
            this.showMessage('authMessage', 'Registrasi berhasil! Anda sudah login.', 'success');
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('authMessage', this.getErrorMessage(error.code), 'error');
        }
    }

    async handleLogout() {
        try {
            await signOut(window.auth);
            this.currentUser = null;
            this.selectedCandidate = null;
            this.hasVoted = false;
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            this.showMessage('authMessage', 'Anda telah logout', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('authMessage', 'Error saat logout', 'error');
        }
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
        if (this.hasVoted) {
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

    async submitVote() {
        if (!this.selectedCandidate) {
            this.showMessage('voteMessage', 'Pilih kandidat terlebih dahulu', 'error');
            return;
        }

        if (this.hasVoted) {
            this.showMessage('voteMessage', 'Anda sudah memberikan suara sebelumnya', 'error');
            return;
        }

        try {
            // Save vote to Firestore
            await setDoc(doc(window.db, 'votes', this.currentUser.uid), {
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email,
                candidateId: this.selectedCandidate,
                candidateName: this.candidates.find(c => c.id === this.selectedCandidate).name,
                timestamp: new Date(),
                election: 'ketua-pmr-2024'
            });

            // Update vote count for the candidate
            const candidateRef = doc(window.db, 'voteCounts', this.selectedCandidate.toString());
            const candidateDoc = await getDoc(candidateRef);

            if (candidateDoc.exists()) {
                await updateDoc(candidateRef, {
                    count: candidateDoc.data().count + 1
                });
            } else {
                await setDoc(candidateRef, {
                    candidateId: this.selectedCandidate,
                    candidateName: this.candidates.find(c => c.id === this.selectedCandidate).name,
                    count: 1
                });
            }

            this.hasVoted = true;
            const candidate = this.candidates.find(c => c.id === this.selectedCandidate);
            this.showMessage('voteMessage', `Suara Anda untuk ${candidate.name} telah direkam! Terima kasih atas partisipasi Anda.`, 'success');

            // Disable further voting
            this.disableVoting();

        } catch (error) {
            console.error('Error submitting vote:', error);
            this.showMessage('voteMessage', 'Error saat menyimpan vote. Silakan coba lagi.', 'error');
        }
    }

    disableVoting() {
        document.querySelectorAll('.candidate').forEach(c => {
            c.style.pointerEvents = 'none';
            c.style.opacity = '0.6';
        });
    }

    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'Email tidak terdaftar';
            case 'auth/wrong-password':
                return 'Password salah';
            case 'auth/email-already-in-use':
                return 'Email sudah terdaftar';
            case 'auth/weak-password':
                return 'Password terlalu lemah';
            case 'auth/invalid-email':
                return 'Format email tidak valid';
            default:
                return 'Terjadi kesalahan. Silakan coba lagi.';
        }
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.className = type === 'error' ? 'error-message' :
                          type === 'success' ? 'success-message' :
                          'info-message';

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

    .info-message {
        background: #bee3f8;
        color: #2a69ac;
        border: 1px solid #90cdf4;
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
        const votingSystem = new FirebaseVotingSystem();
        votingSystem.submitVote();
    });

    // Insert vote button before the message
    votingSection.insertBefore(voteButton, document.getElementById('voteMessage'));

    // Initialize the voting system
    new FirebaseVotingSystem();
});
