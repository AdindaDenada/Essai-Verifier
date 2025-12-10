import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  LogOut
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import * as mammoth from 'mammoth';
import './KerjakanEssai.css';

// Tambahan untuk ambil user login
import { getAuth } from "firebase/auth";

export default function KerjakanEssai() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = location.state || {};
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [essayTitle, setEssayTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [taskData, setTaskData] = useState(null);

  // DATA MAHASISWA LOGIN
  const [studentName, setStudentName] = useState("");

  // CLOUDINARY + GEMINI
  const CLOUD_NAME = "dvip0qmty";
  const UPLOAD_PRESET = "essayverifier";
  const GEMINI_API_KEY = "AIzaSyChdxuuujYmmC4AfDTaSkOCrXYiwEAlpL4";
  const GEMINI_MODEL = "models/gemini-2.5-pro";

  // ============================================================
  //                   FETCH USER (MAHASISWA)
  // ============================================================
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const fetchUser = async () => {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setStudentName(snap.data().fullName || "Nama Tidak Ditemukan");
        } else {
          console.warn("Data user tidak ditemukan di Firestore.");
        }
      };
      fetchUser();
    } else {
      console.warn("Tidak ada user login.");
    }
  }, []);

  // ============================================================
  //                        FETCH TASK DATA
  // ============================================================
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) {
        alert("Task ID tidak ditemukan.");
        navigate("/mahasiswa/dashboard");
        return;
      }

      const docRef = doc(db, "soalEssai", taskId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Soal tidak ditemukan.");
        navigate("/mahasiswa/dashboard");
        return;
      }

      const data = docSnap.data();

      setTaskData({
        title: data.judulSoal,
        instruction: data.teksPernyataan,
        deadline: `${data.tanggalBatas} ${data.jamBatas}`,
        criteria: data.kriteria || [],
        dosenNama: data.dosenNama || "Tidak diketahui",
      });
    };

    fetchTaskData();
  }, [taskId, navigate]);

  // ============================================================
  //                  UPLOAD CLOUDINARY
  // ============================================================
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", "essay");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  // ============================================================
  //                   EXTRACT TEXT (WORD / PDF)
  // ============================================================
  const extractTextFromFile = async (file) => {
    if (file.type.includes("wordprocessingml")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    if (file.type === "application/pdf") return null;
    return await file.text();
  };

  // ============================================================
  //                GEMINI ANALYSIS (DIPERBAIKI)
  // ============================================================
  const analyzeTextWithGemini = async (text, fileUrl) => {
    const strictJSON = `
Return only this EXACT JSON structure:
{
  "persentase_kebohongan": number,
  "status": "Asli" | "Curiga" | "Plagiat",
  "analisis": string,
  "extracted_text_snippet": string
}
Rules:
- extracted_text_snippet MUST be taken from the actual essay text.
- DO NOT invent content.
    `;

    let prompt = "";

    if (text && text.trim() !== "") {
      prompt = `
You are an academic essay checker.
Analyze the following REAL essay text:

"""${text}"""

${strictJSON}
`;
    } else {
      prompt = `
The essay text is not provided. Extract from this file URL:

${fileUrl}

${strictJSON}
`;
    }

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    // =============== HANDLE ERROR RESPONSE ===============
    if (!json?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini API error / empty response (503 or malformed response).");
    }

    const raw = json.candidates[0].content.parts[0].text;

    // safe parsing
    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");

    if (first === -1 || last === -1) {
      throw new Error("Gemini response does not contain valid JSON.");
    }

    const parsed = JSON.parse(raw.slice(first, last + 1));

    // Hitung skor
    parsed.skor = 100 - (parsed.persentase_kebohongan || 0);

    // Konversi status
    parsed.status_lolos = parsed.skor >= 70 ? "Lolos" : "Tidak Lolos";

    return parsed;
  };

  // ============================================================
  //               SAVE FIRESTORE → ESSAY & RIWAYAT
  // ============================================================
  const saveResultToFirestore = async (fileUrl, resultObj) => {
    await addDoc(collection(db, "essay_submissions"), {
      title: essayTitle || taskData.title,
      fileUrl,
      aiResult: resultObj,
      persentase_kebohongan: resultObj.persentase_kebohongan,
      skor: resultObj.skor,
      status: resultObj.status_lolos,
      mahasiswa: studentName,
      taskId,
      dosenNama: taskData.dosenNama,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "riwayatEssai"), {
      essayId: taskId,
      title: essayTitle || taskData.title,
      skor: resultObj.skor,
      persentase_kebohongan: resultObj.persentase_kebohongan,
      status: resultObj.status_lolos,
      analisis: resultObj.analisis,
      snippet: resultObj.extracted_text_snippet,
      mahasiswa: studentName,
      fileUrl,
      timestamp: serverTimestamp()
    });
  };

  // ============================================================
  //                         SUBMIT
  // ============================================================
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Upload file terlebih dahulu.");
      return;
    }

    setUploading(true);
    try {
      const cloud = await uploadToCloudinary(selectedFile);
      const fileUrl = cloud.secure_url;

      const extracted = await extractTextFromFile(selectedFile);
      const result = await analyzeTextWithGemini(extracted, fileUrl);

      await saveResultToFirestore(fileUrl, result);

      alert(`Selesai. Skor: ${result.skor}`);
      navigate("/mahasiswa/dashboard");
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat memproses (API mungkin 503).");
    }
    setUploading(false);
  };

  // ============================================================
  //                 RENDER (TIDAK diubah)
  // ============================================================
  if (!taskData) return <p>Memuat soal...</p>;

  return (
    <div className="dashboard-mhs-container">

      <aside className="dashboard-mhs-sidebar">
        <div className="dashboard-mhs-logo">
          <h1 className="dashboard-mhs-logo-text">Essay Verifier</h1>
        </div>

        <nav className="dashboard-mhs-nav">
          <button className="dashboard-mhs-nav-item" onClick={() => navigate('/mahasiswa/dashboard')}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button className="dashboard-mhs-nav-item" onClick={() => navigate('/mahasiswa/riwayat-nilai')}>
            <History size={20} />
            Riwayat Nilai Esai
          </button>

          <button className="dashboard-mhs-nav-item logout" onClick={() => navigate('/login')}>
            <LogOut size={20} />
            Keluar
          </button>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="header">
          <div className="header-container">
            <span className="breadcrumb-current">{taskData.title}</span>
          </div>
        </header>

        <div className="main-container">
          <div className="content-grid">

            {/* LEFT */}
            <div className="left-column">
              <div className="card">
                <h1 className="page-title">{taskData.title}</h1>

                <div className="info-section">
                  <div className="info-row">
                    <span className="info-label">Dosen Pengampu</span>
                    <span className="info-value">{taskData.dosenNama}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Tenggat</span>
                    <span className="info-value">{taskData.deadline}</span>
                  </div>

                  <div className="info-row">
                    <span className="info-label">Kriteria</span>
                    <span className="info-value">
                      {taskData.criteria.map(c => `${c.nama} (${c.bobot})`).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="instruction-section">
                  <h2 className="instruction-title">Instruksi</h2>
                  <p className="instruction-text">{taskData.instruction}</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="right-column">
              <div className="card">
                <h3 className="section-title">Judul Esai</h3>
                <input
                  type="text"
                  placeholder="Masukkan judul"
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                  className="title-input"
                />
              </div>

              <div className="card">
                <h3 className="section-title">Unggah File</h3>
                <div className="upload-area">
                  <input
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <p>{selectedFile ? selectedFile.name : "Belum ada file dipilih"}</p>
                  {uploading && <p>Mengunggah & Memproses...</p>}
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary">Simpan Draft</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={uploading}>
                  {uploading ? "Memproses..." : "Kirim Esai"}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
