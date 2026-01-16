# MedScan Engine 🏥

**MedScan Engine** is a robust, AI-powered backend tool designed for high-volume digitization and analysis of medical prescriptions. By leveraging Optical Character Recognition (OCR) and optimized Medical NLP, it extracts drug names, dosages, frequencies, and alerts from raw prescription images.

> **Focus**: This project is strictly backend-focused, providing a CLI for scanning, data parsing, and structured data export (JSON/CSV).

---

## 🚀 Key Features

- **Batch Scanning**: Process entire directories of prescription images in seconds.
- **GPU Acceleration**: Utilizes CUDA-enabled GPUs for faster OCR (EasyOCR) and NLP (Transformers) inference.
- **Smart Validation**: 
  - Automatically identifies non-prescription images.
  - Skips invalid files with no detected medications to keep data clean.
- **Automated File Management**: 
  - Saves every scan with a unique timestamp in the `results/` folder.
  - Commands intelligently default to the latest scan file.
- **Interactive Tagging**: A "Human-in-the-loop" CLI mode to verify or correct AI outputs manually.
- **Data Export**: Convert structured JSON annotations into CSV, Excel, PDF, or Text formats.
- **Privacy First**: All processing happens locally.

---

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- pip
- (Optional) NVIDIA GPU + CUDA Toolkit for acceleration

### Setup
1. Clone the repository and navigate to the engine directory:
   ```bash
   cd med-analysis-ai/med_scan_engine
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: The first run may download OCR/BERT models ~500MB)*

---

## 💻 Usage

The `cli_scanner.py` is the main entry point.

### 1. 📂 Batch Scan
Scan a folder of images. A new timestamped JSON file is automatically created in the `results/` directory.

```bash
python cli_scanner.py scan --dir uploads
```
*Output*: `results/annotation_YYYYMMDD_HHMMSS.json`

### 2. ✍️ Interactive Tagging
Review and verify extractions manually as they process.

```bash
python cli_scanner.py scan --dir uploads --interactive
```

### 3. 📊 View Usage
View the content of an annotation file. If no file is specified, it opens the **latest** one from the `results/` folder.

```bash
python cli_scanner.py view
```
*Optional*: View a specific file:
```bash
python cli_scanner.py view --output results/annotation_20260116_120000.json
```

### 4. 📤 Export Data
Export annotations to report formats. Defaults to the **latest** scan if input is not provided.

```bash
# Export latest scan to Excel
python cli_scanner.py export --output report.xlsx

# Export specific scan to PDF
python cli_scanner.py export --input results/annotation_20260116_123000.json --output analysis.pdf
```

---

## 📂 Project Structure

```
med-analysis-ai/
├── med_scan_engine/       # Core Application
│   ├── cli_scanner.py     # Main CLI Tool
│   ├── processor.py       # Image Preprocessing & OCR (GPU Enabled)
│   ├── nlp_parser.py      # Medical Entity Extraction (BERT)
│   ├── uploads/           # Drop your images here
│   ├── results/           # Auto-generated annotation files
│   └── requirements.txt   # Dependencies
├── README.md              # Documentation
└── LICENSE                # MIT License
```

---

## 📝 Example Output

**Input Image**: `rx_sample.jpg`

**CLI Output (Table View)**:
```text
+----------------------+----------+-------------+------------+
| Drug Name            | Dosage   | Frequency   | Duration   |
+======================+==========+=============+============+
| Amoxicillin          | 500mg    | 3x daily    | 7 days     |
+----------------------+----------+-------------+------------+
```

**CSV Export**:
```csv
file_name,drug_name,dosage,frequency,duration,alerts
rx_sample.jpg,Amoxicillin,500mg,3x daily,7 days,
```

---

## 📄 License
MIT License

Made with 🤖 by [Ruturaj Sharbidre]