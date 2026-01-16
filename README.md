# 🏥 Medical Prescription Analysis & Tracking System

> **AI-powered prescription digitization + medication compliance tracking**

A comprehensive medical solution that uses computer vision and NLP to digitize handwritten/printed prescriptions and track medication compliance in real-time.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Features

### 📸 Prescription Analysis
- **OCR Extraction**: Uses EasyOCR for robust text extraction from images
- **Medical NLP**: Powered by BioClinicalBERT for entity recognition
- **Smart Parsing**: Extracts drug names, dosages, frequencies, and durations
- **Rule-based Fallback**: Handles medical abbreviations (BID, TID, PRN, etc.)
- **Quality Alerts**: Flags illegible or ambiguous entries

### 💊 Medication Tracking
- **Intake Logging**: Track taken/missed/skipped doses
- **Multiple Verification**: Manual, barcode, or QR code scanning
- **Compliance Monitoring**: Real-time compliance rate calculation
- **Audit Trail**: Complete timestamp logs for all actions

### 🔐 Safety Features
- **Drug Interaction Detection**: Warns about dangerous combinations
- **Human-in-the-Loop**: System assists, doesn't prescribe
- **Privacy-First**: Local processing with SQLite database
- **Error Flagging**: Highlights ambiguities for review

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:5173`

---

## 🏗️ Architecture

```
┌─────────────┐
│   Camera    │ (Upload prescription image)
└──────┬──────┘
       │
       v
┌─────────────┐
│ Preprocess  │ (Deskew, denoise, enhance)
└──────┬──────┘
       │
       v
┌─────────────┐
│  EasyOCR    │ (Extract text)
└──────┬──────┘
       │
       v
┌─────────────┐
│   NLP       │ (Parse entities with ClinicalBERT)
└──────┬──────┘
       │
       v
┌─────────────┐
│ Validation  │ (Safety checks, interactions)
└──────┬──────┘
       │
       v
┌─────────────┐
│  Database   │ (SQLite storage)
└─────────────┘
```

---

## 📁 Project Structure

```
med-analysis-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── processor.py         # Image preprocessing & OCR
│   ├── nlp_parser.py        # Medical NLP & entity extraction
│   ├── database.py          # SQLAlchemy models
│   ├── models.py            # Pydantic schemas
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # Uploaded prescription images
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx      # Stats & active meds
│   │   │   ├── RxAnalyzer.jsx     # Prescription upload
│   │   │   └── MedTracker.jsx     # Intake logging
│   │   ├── App.jsx                # Main app component
│   │   └── index.css              # Premium design system
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🎨 Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| **API Framework** | FastAPI |
| **OCR** | EasyOCR |
| **Medical NLP** | BioClinicalBERT (Transformers) |
| **Image Processing** | OpenCV |
| **Database** | SQLite (SQLAlchemy) |
| **Validation** | Pydantic |

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (Glassmorphism) |
| **HTTP Client** | Axios |

---

## 📊 API Endpoints

### Prescription Analysis
```http
POST /api/prescriptions/analyze
Content-Type: multipart/form-data

{
  "file": <image_file>,
  "patient_id": 1
}
```

### Patient Management
```http
POST /api/patients
GET  /api/patients/{patient_id}
GET  /api/patients/code/{patient_code}
```

### Medication Tracking
```http
POST /api/intake/log
GET  /api/medications/{patient_id}/active
GET  /api/compliance/{patient_id}
```

---

## 🎯 Use Cases

1. **Hospitals**: Digitize doctor prescriptions for pharmacy systems
2. **Pharmacies**: Verify prescriptions and detect errors
3. **Elderly Care**: Track medication compliance for patients
4. **Clinical Trials**: Monitor drug intake timestamps
5. **Home Healthcare**: Remote medication adherence tracking

---

## 🔬 AI Models Used

1. **BioClinicalBERT** (`emilyalsentzer/Bio_ClinicalBERT`)
   - Pre-trained on medical literature
   - Fine-tuned for medical entity recognition
   - Identifies drugs, dosages, frequencies

2. **EasyOCR**
   - Handles handwritten + printed text
   - No separate Tesseract installation needed
   - Supports 80+ languages

---

## 🛡️ Safety & Compliance

✅ **This system does NOT diagnose or prescribe**  
✅ All outputs require pharmacist/doctor review  
✅ Privacy-first: local inference and storage  
✅ Complete audit trail for regulatory compliance  
✅ Drug interaction warnings for safety  

**Regulatory Note**: This is a clinical decision support tool. All outputs must be reviewed by licensed healthcare professionals.

---

## 🌟 Key Differentiators

- ✅ Handles **handwritten + printed** prescriptions
- ✅ **Medical-specific NLP** (not generic OCR)
- ✅ **Compliance tracking** beyond just reading Rx
- ✅ **Drug interaction warnings**
- ✅ **Premium UI** with modern design
- ✅ **Privacy-focused** with local processing

---

## 🎨 UI Preview

The frontend features:
- 🌈 **Glassmorphism** design
- 🎭 **Framer Motion** animations
- 🎨 Medical-themed **gradient palette**
- 📱 **Responsive** layout
- ♿ **Accessible** components

---

## 📝 Sample Workflow

1. **Upload Prescription**: User uploads image via drag-drop
2. **AI Processing**: System extracts text and parses medications
3. **Review Results**: Dashboard shows drugs, dosages, alerts
4. **Track Intake**: Patient logs medication via barcode/manual
5. **Monitor Compliance**: Real-time compliance stats on dashboard

---

## 🚧 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time camera capture
- [ ] Multi-language support
- [ ] Advanced drug interaction database
- [ ] Integration with pharmacy systems
- [ ] Allergy checking
- [ ] Medication reminders/notifications
- [ ] Cloud deployment option

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🤝 Contributing

Contributions welcome! This is a demo/proof-of-concept project. For production use:
- Add comprehensive testing
- Implement authentication
- Use PostgreSQL instead of SQLite
- Add HIPAA compliance measures
- Integrate with certified drug databases

---

## ⚠️ Disclaimer

**This software is for educational and demonstration purposes only.**  
It is NOT certified for clinical use. Always consult licensed healthcare professionals for medical decisions.

---

## 📧 Contact

Built with ❤️ by author Ruturaj Sharbidre  using FastAPI, React, and AI

For questions or collaboration: [Create an issue](https://github.com/RuturajS/med-analysis-ai/issues)

---

**Star ⭐ this repo if you find it useful!**
