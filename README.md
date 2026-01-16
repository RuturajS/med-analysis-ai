# MedScan Engine 🏥

**MedScan Engine** is a robust, AI-powered backend tool designed for high-volume digitization and analysis of medical prescriptions. By leveraging Optical Character Recognition (OCR) and optimized Medical NLP, it extracts drug names, dosages, frequencies, and alerts from raw prescription images.

> **Focus**: This project is strictly backend-focused, providing a CLI for scanning, data parsing, and structured data export (JSON/CSV).

---

## 🚀 Key Features

- **Batch Scanning**: Process entire directories of prescription images in seconds.
- **AI-Powered Extraction**: 
  - **EasyOCR** for text recognition (handwritten & printed).
  - **Medical NLP** (BioClinicalBERT + Regex) for structured extraction of medications.
- **Interactive Tagging**: A "Human-in-the-loop" CLI mode to verify or correct AI outputs manually.
- **Data Export**: Convert structured JSON annotations into flat CSV files for data analysis.
- **Privacy First**: All processing happens locally.

---

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- pip

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

The `cli_scanner.py` is the main entry point for all operations.

### 1. 📂 Batch Scan
Scan a folder of images and generate a JSON annotation file.

```bash
python cli_scanner.py scan --dir uploads --output annotations.json
```
- `--dir`: Directory containing `.jpg`, `.png` images.
- `--output`: Path to save the structured JSON data.

### 2. ✍️ Interactive Tagging (Human Verification)
Run the scanner in interactive mode to approve or edit extractions one by one.

```bash
python cli_scanner.py scan --dir uploads --output annotations.json --interactive
```
- **y**: Approve result.
- **skip**: Skip file.
- **Manual Entry**: Type corrected details when prompted.

### 3. 📊 View Usage
Display currently saved annotations in a readable table format in the terminal.

```bash
python cli_scanner.py view --output annotations.json
```

### 4. 📤 Export Data
Convert the complex JSON output into various formats for reporting and analysis.
Supported formats: `.csv`, `.xlsx` (Excel), `.json`, `.pdf`, `.txt`.

```bash
# Export to CSV
python cli_scanner.py export --input annotations.json --output results.csv

# Export to Excel
python cli_scanner.py export --input annotations.json --output report.xlsx

# Export to PDF
python cli_scanner.py export --input annotations.json --output analysis.pdf
```

---

## 📂 Project Structure

```
med-analysis-ai/
├── med_scan_engine/       # Core Application
│   ├── cli_scanner.py     # Main CLI Tool
│   ├── processor.py       # Image Preprocessing & OCR
│   ├── nlp_parser.py      # Medical Entity Extraction (BERT)
│   ├── models.py          # Data Structures (Pydantic)
│   ├── uploads/           # Drop your images here
│   ├── annotations.json   # Generated output
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