# 🚀 Quick Start Guide

## Step 1: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: This will download the following:
- FastAPI and Uvicorn (API server)
- EasyOCR (will download ~500MB of ML models on first run)
- Transformers + PyTorch (will download BioClinicalBERT on first use)
- OpenCV, SQLAlchemy, and other dependencies

## Step 2: Start the Backend

```bash
# From the backend directory
python main.py
```

The API will start at `http://localhost:8000`

Visit `http://localhost:8000/docs` to see the interactive API documentation.

## Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Step 4: Start the Frontend

```bash
npm run dev
```

The UI will start at `http://localhost:5173`

## Step 5: Test the System

1. **Create a Patient** (optional):
   - Use the API at `/api/patients` or create one automatically

2. **Upload a Prescription**:
   - Go to the "Rx Analyzer" tab
   - Upload an image of a prescription (handwritten or printed)
   - Click "Analyze Prescription"
   - View the extracted medications and alerts

3. **Track Medication**:
   - Go to the "Med Tracker" tab
   - Enter the medication ID from the analysis
   - Log intake status (taken/missed/skipped)

4. **View Dashboard**:
   - Go to the "Dashboard" tab
   - See compliance statistics and active medications

## Testing with Sample Images

You can test with:
- Photos of real prescriptions
- Printed prescription templates
- Handwritten medication notes

## Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Ensure Node.js 16+ is installed: `node --version`
- Install dependencies: `npm install`

### OCR not working
- EasyOCR downloads models on first run (~500MB)
- Ensure stable internet connection
- Check console for download progress

### NLP errors
- BioClinicalBERT downloads on first use
- Fallback to rule-based parsing if model fails
- Check logs for specific errors

## Performance Notes

- **First run**: Slower due to model downloads
- **Subsequent runs**: Much faster with cached models
- **OCR processing**: 5-15 seconds per image
- **NLP parsing**: 1-3 seconds per prescription

## Demo Workflow

```
1. Upload prescription → 2. AI extracts text → 3. Parses medications →
4. Shows alerts → 5. Saves to DB → 6. Track intake → 7. Monitor compliance
```

Enjoy! 🎉
