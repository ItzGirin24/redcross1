// PMR Voting System - Complete Implementation
class PMRVotingSystem {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.selectedCandidate = null;
        this.hasVoted = false;
        this.candidates = [
            {
                id: 'rangga',
                name: 'Muhammad Rangga',
                class: 'XII IPA 1',
                photo: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=R',
                vision: 'Membangun PMR yang lebih aktif dalam pelayanan kesehatan masyarakat sekolah dengan mengutamakan pencegahan dan promosi kesehatan.',
                mission: [
                    'Mengadakan pelatihan P3K rutin untuk seluruh anggota PMR',
                    'Membuat program penyuluhan kesehatan berkala',
                    'Meningkatkan kerja sama dengan puskesmas setempat',
                    'Mengembangkan Unit Kesehatan Sekolah (UKS) yang lebih baik'
                ]
            },
            {
                id: 'ghazi',
                name: 'Ahmad Ghazi Maulana',
                class: 'XII IPS 2',
                photo: 'https://via.placeholder.com/300x300/dc2626/ffffff?text=G',
                vision: 'Mewujudkan PMR sebagai organisasi yang profesional dan inovatif dalam bidang kesehatan dengan fokus pada gaya hidup sehat siswa.',
                mission: [
                    'Menyelenggarakan donor darah rutin di sekolah',
                    'Membuat aplikasi monitoring kesehatan siswa',
                    'Mengadakan kompetisi kesehatan antar kelas',
                    'Melatih siswa menjadi peer educator kesehatan'
                ]
            }
        ];
        
        this.adminCredentials = {
            email: 'redcross@admin.app',
            password: 'redcross2025'
        };
        
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            this.showLoading(true);
            
            // Wait for Firebase to be ready
            await this.waitForFirebase();
            
            // Setup authentication listener
            this.setupAuthListener();
            
            // Bind events
            this.bindEvents();
            
            // Hide loading screen
            setTimeout(() => {
                this.showLoading(false);
            }, 1500);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showMessage('loginMessage', 'Terjadi kesalahan saat memuat sistem. Silakan refresh halaman.', 'error');
            this.showLoading(false);
        }
    }

    waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.auth && window.db) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    showLoading(show) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (show) {
            loadingScreen.style.display = 'flex';
        } else {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    setupAuthListener() {
        window.onAuthStateChanged(window.auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.checkUserRole();
                await this.checkVotingStatus();
                this.showUserSection();
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.showLoginSection();
            }
        });
    }

    bindEvents() {
        // Login events
        document.getElementById('googleLoginBtn').addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('adminLoginBtn').addEventListener('click', () => this.handleAdminLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Voting events
        document.getElementById('voteBtn').addEventListener('click', () => this.handleVote());
        
        // Admin events
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.loadAdminData());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('backToResultsBtn')?.addEventListener('click', () => this.showResultsToUser());
        
        // Enter key support
        document.getElementById('adminPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAdminLogin();
        });
    }

    async handleGoogleLogin() {
        try {
            this.showMessage('loginMessage', 'Menghubungkan dengan Google...', 'info');
            
            const result = await window.signInWithPopup(window.auth, window.googleProvider);
            const user = result.user;
            
            // Verify it's a real Google account
            if (!user.email || !user.email.includes('@')) {
                throw new Error('Akun Google tidak valid');
            }
            
            this.showMessage('loginMessage', `Selamat datang, ${user.displayName}!`, 'success');
            
        } catch (error) {
            console.error('Google login error:', error);
            let errorMessage = 'Gagal masuk dengan Google. ';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage += 'Login dibatalkan.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage += 'Pop-up diblokir browser. Silakan izinkan pop-up.';
            } else {
                errorMessage += 'Silakan coba lagi.';
            }
            
            this.showMessage('loginMessage', errorMessage, 'error');
        }
    }

    async handleAdminLogin() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        if (!email || !password) {
            this.showMessage('loginMessage', 'Mohon isi email dan password admin', 'error');
            return;
        }
        
        if (email !== this.adminCredentials.email || password !== this.adminCredentials.password) {
            this.showMessage('loginMessage', 'Email atau password admin salah', 'error');
            return;
        }
        
        try {
            this.showMessage('loginMessage', 'Masuk sebagai admin...', 'info');
            
            await window.signInWithEmailAndPassword(window.auth, email, password);
            this.showMessage('loginMessage', 'Selamat datang, Admin!', 'success');
            
        } catch (error) {
            console.error('Admin login error:', error);
            this.showMessage('loginMessage', 'Gagal masuk sebagai admin. Silakan coba lagi.', 'error');
        }
    }

    async handleLogout() {
        try {
            await window.signOut(window.auth);
            this.resetForm();
            this.showMessage('loginMessage', 'Anda telah keluar dari sistem', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('loginMessage', 'Gagal keluar dari sistem', 'error');
        }
    }

    async checkUserRole() {
        if (this.currentUser && this.currentUser.email === this.adminCredentials.email) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
        }
    }

    async checkVotingStatus() {
        if (!this.currentUser || this.isAdmin) return;
        
        try {
            const voteDoc = await window.getDoc(window.doc(window.db, 'votes', this.currentUser.uid));
            if (voteDoc.exists()) {
                this.hasVoted = true;
                const voteData = voteDoc.data();
                this.showThankYouSection(voteData);
            } else {
                this.hasVoted = false;
            }
        } catch (error) {
            console.error('Error checking voting status:', error);
        }
    }

    showLoginSection() {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('votingSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('thankYouSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'none';
    }

    showUserSection() {
        document.getElementById('userSection').style.display = 'flex';
        document.getElementById('loginSection').style.display = 'none';
        
        if (this.isAdmin) {
            this.showAdminSection();
        } else if (this.hasVoted) {
            // Thank you section will be shown by checkVotingStatus
        } else {
            this.showVotingSection();
        }
        
        this.updateUserInfo();
    }

    showVotingSection() {
        document.getElementById('votingSection').style.display = 'block';
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('thankYouSection').style.display = 'none';
        this.loadCandidates();
    }

    showAdminSection() {
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('votingSection').style.display = 'none';
        document.getElementById('thankYouSection').style.display = 'none';
        this.loadAdminData();
    }

    showThankYouSection(voteData) {
        document.getElementById('thankYouSection').style.display = 'block';
        document.getElementById('votingSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'none';
        
        if (voteData) {
            const candidate = this.candidates.find(c => c.id === voteData.candidateId);
            document.getElementById('voteDetails').innerHTML = `
                <h3>Detail Suara Anda:</h3>
                <p><strong>Kandidat:</strong> ${candidate ? candidate.name : 'Tidak diketahui'}</p>
                <p><strong>Waktu:</strong> ${voteData.timestamp ? new Date(voteData.timestamp.seconds * 1000).toLocaleString('id-ID') : 'Tidak diketahui'}</p>
            `;
        }
    }

    updateUserInfo() {
        const userInfo = document.getElementById('userInfo');
        if (this.currentUser) {
            userInfo.innerHTML = `
                <i class="fas fa-user"></i>
                ${this.isAdmin ? 'Admin' : this.currentUser.displayName || this.currentUser.email}
            `;
        }
    }

    loadCandidates() {
        const container = document.getElementById('candidatesContainer');
        container.innerHTML = '';
        
        this.candidates.forEach(candidate => {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'candidate-card';
            candidateCard.dataset.candidateId = candidate.id;
            
            candidateCard.innerHTML = `
                <div class="candidate-photo">
                    <img src="${candidate.photo}" alt="${candidate.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\"fas fa-user\\"></i>';">
                </div>
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-class">${candidate.class}</div>
                <div class="candidate-vision">
                    <h4>Visi</h4>
                    <p>${candidate.vision}</p>
                </div>
                <div class="candidate-vision">
                    <h4>Misi</h4>
                    <ul style="text-align: left; font-size: 0.875rem; color: var(--gray-600); padding-left: 1rem;">
                        ${candidate.mission.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            
            candidateCard.addEventListener('click', () => this.selectCandidate(candidate.id));
            container.appendChild(candidateCard);
        });
    }

    selectCandidate(candidateId) {
        if (this.hasVoted) {
            this.showMessage('votingMessage', 'Anda sudah memberikan suara sebelumnya', 'error');
            return;
        }
        
        // Remove previous selection
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select new candidate
        const selectedCard = document.querySelector(`[data-candidate-id="${candidateId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedCandidate = candidateId;
            document.getElementById('voteBtn').disabled = false;
            
            const candidate = this.candidates.find(c => c.id === candidateId);
            this.showMessage('votingMessage', `Anda memilih ${candidate.name}. Klik "Kirim Suara" untuk mengonfirmasi.`, 'success');
        }
    }

    async handleVote() {
        if (!this.selectedCandidate) {
            this.showMessage('votingMessage', 'Silakan pilih kandidat terlebih dahulu', 'error');
            return;
        }
        
        if (this.hasVoted) {
            this.showMessage('votingMessage', 'Anda sudah memberikan suara sebelumnya', 'error');
            return;
        }
        
        const candidate = this.candidates.find(c => c.id === this.selectedCandidate);
        const confirmVote = confirm(`Apakah Anda yakin ingin memilih ${candidate.name}?\
\
Setelah memilih, Anda tidak dapat mengubah pilihan.`);
        
        if (!confirmVote) return;
        
        try {
            const voteBtn = document.getElementById('voteBtn');
            voteBtn.disabled = true;
            voteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim suara...';
            
            // Save vote
            const voteData = {
                userId: this.currentUser.uid,
                userEmail: this.currentUser.email,
                userName: this.currentUser.displayName || this.currentUser.email,
                candidateId: this.selectedCandidate,
                candidateName: candidate.name,
                timestamp: window.serverTimestamp(),
                election: 'ketua-pmr-2024'
            };
            
            await window.setDoc(window.doc(window.db, 'votes', this.currentUser.uid), voteData);
            
            // Update vote count
            const candidateRef = window.doc(window.db, 'candidates', this.selectedCandidate);
            const candidateDoc = await window.getDoc(candidateRef);
            
            if (candidateDoc.exists()) {
                await window.updateDoc(candidateRef, {
                    voteCount: window.increment(1)
                });
            } else {
                await window.setDoc(candidateRef, {
                    id: this.selectedCandidate,
                    name: candidate.name,
                    voteCount: 1
                });
            }
            
            this.hasVoted = true;
            this.showThankYouSection(voteData);
            this.showMessage('votingMessage', `Terima kasih! Suara Anda untuk ${candidate.name} telah tercatat.`, 'success');
            
        } catch (error) {
            console.error('Error submitting vote:', error);
            this.showMessage('votingMessage', 'Terjadi kesalahan saat mengirim suara. Silakan coba lagi.', 'error');
            
            const voteBtn = document.getElementById('voteBtn');
            voteBtn.disabled = false;
            voteBtn.innerHTML = '<i class="fas fa-vote-yea"></i> Kirim Suara';
        }
    }

    async loadAdminData() {
        if (!this.isAdmin) return;
        
        try {
            const refreshBtn = document.getElementById('refreshBtn');
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
            
            // Get all votes
            const votesQuery = window.query(window.collection(window.db, 'votes'));
            const votesSnapshot = await window.getDocs(votesQuery);
            
            const totalVotes = votesSnapshot.size;
            const votes = {};
            
            votesSnapshot.forEach(doc => {
                const vote = doc.data();
                votes[vote.candidateId] = (votes[vote.candidateId] || 0) + 1;
            });
            
            // Calculate stats
            const totalVoters = await this.getTotalVoters();
            const participationRate = totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0;
            
            // Update stats
            document.getElementById('totalVoters').textContent = totalVoters;
            document.getElementById('totalVotes').textContent = totalVotes;
            document.getElementById('participationRate').textContent = `${participationRate}%`;
            
            // Load results
            this.loadResults(votes, totalVotes);
            
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
            
        } catch (error) {
            console.error('Error loading admin data:', error);
            const refreshBtn = document.getElementById('refreshBtn');
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        }
    }

    async getTotalVoters() {
        // This is a simplified calculation
        // In a real app, you might have a separate collection for registered voters
        return 100; // Placeholder - adjust based on actual school data
    }

    loadResults(votes, totalVotes) {
        const container = document.getElementById('resultsContainer');
        container.innerHTML = '<h3 style="margin-bottom: 1.5rem; color: var(--gray-800);">Hasil Pemilihan</h3>';
        
        this.candidates.forEach(candidate => {
            const voteCount = votes[candidate.id] || 0;
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="result-candidate">
                    <div class="result-photo">
                        <img src="${candidate.photo}" alt="${candidate.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\"fas fa-user\\"></i>';" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    </div>
                    <div class="result-info">
                        <h4>${candidate.name}</h4>
                        <p>${candidate.class}</p>
                    </div>
                </div>
                <div class="result-votes">
                    <div class="vote-count">${voteCount}</div>
                    <div class="vote-percentage">${percentage}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
            
            container.appendChild(resultItem);
        });
    }

    showResultsToUser() {
        // Simple results view for regular users
        alert('Fitur ini akan segera tersedia. Hasil akan diumumkan setelah pemilihan selesai.');
    }

    exportData() {
        alert('Fitur export akan segera tersedia.');
    }

    resetForm() {
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
        this.selectedCandidate = null;
        this.hasVoted = false;
        
        document.querySelectorAll('.candidate-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.getElementById('voteBtn').disabled = true;
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `message ${type}`;
            element.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize the voting system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Firebase is loaded
    setTimeout(() => {
        new PMRVotingSystem();
    }, 500);
});

// Error handling for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
