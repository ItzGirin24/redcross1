from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from datetime import datetime

app = FastAPI(title="PMR Voting System Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="../"), name="static")

@app.get("/")
async def root():
    """Serve the main voting application"""
    return FileResponse("../index.html")

@app.get("/firebase")
async def firebase_version():
    """Serve the Firebase version of the application"""
    return FileResponse("../index-firebase.html")

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "message": "PMR Voting System Backend is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/candidates")
async def get_candidates():
    """Get list of PMR candidates"""
    return {
        "candidates": [
            {
                "id": "rangga",
                "name": "Muhammad Rangga ",
                "position": "Calon Ketua PMR",
                "vision": "Membangun PMR yang lebih aktif dalam pelayanan kesehatan masyarakat dan mengembangkan program-program inovatif untuk meningkatkan kesadaran kesehatan di lingkungan sekolah."
            },
            {
                "id": "ghazi",
                "name": "Ghazi",
                "position": "Calon Ketua PMR", 
                "vision": "Mewujudkan PMR sebagai organisasi yang profesional dalam bidang kesehatan dengan fokus pada pencegahan penyakit dan promosi gaya hidup sehat di kalangan siswa."
            }
        ]
    }

@app.get("/api/vote-info")
async def get_vote_info():
    """Get voting information"""
    return {
        "message": "Voting system uses Firebase Firestore for data storage",
        "election": "ketua-pmr-2024",
        "school": "SMA IT Abu Bakar Boarding School"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)