import argparse
import os
import json
import csv
import cv2
import pandas as pd
from fpdf import FPDF
from datetime import datetime
from typing import List, Dict
from tabulate import tabulate
from processor import PrescriptionProcessor
from nlp_parser import MedicalNLPParser
from models import DrugEntity

# Initialize Processors lazily in scan_directory

def flatten_data(data: List[Dict]) -> List[Dict]:
    flat_data = []
    for record in data:
        drugs = record.get('extracted_drugs', [])
        alerts = "; ".join(record.get('alerts', []))
        if not drugs:
             flat_data.append({
                "file_name": record['file_name'],
                "timestamp": record['timestamp'],
                "status": record['status'],
                "drug_name": "N/A",
                "dosage": "N/A",
                "frequency": "N/A",
                "duration": "N/A",
                "alerts": alerts
            })
        else:
            for d in drugs:
                d_dict = d if isinstance(d, dict) else d.dict()
                flat_data.append({
                    "file_name": record['file_name'],
                    "timestamp": record['timestamp'],
                    "status": record['status'],
                    "drug_name": d_dict.get('drug_name', ''),
                    "dosage": d_dict.get('dosage', ''),
                    "frequency": d_dict.get('frequency', ''),
                    "duration": d_dict.get('duration', ''),
                    "alerts": alerts
                })
    return flat_data

def export_data(input_file: str, output_file: str):
    """
    Exports the annotations JSON to various formats (CSV, Excel, PDF, JSON, TXT).
    """
    if not os.path.exists(input_file):
        print(f"Error: Input file '{input_file}' not found.")
        return

    try:
        with open(input_file, 'r') as f:
            data = json.load(f)
        
        flat_data = flatten_data(data)
        if not flat_data:
             print("No data to export.")
             return

        # Determine format based on extension
        ext = os.path.splitext(output_file)[1].lower()
        df = pd.DataFrame(flat_data)

        if ext == '.csv':
            df.to_csv(output_file, index=False)
            print(f"Exported to CSV: {output_file}")
        
        elif ext in ['.xlsx', '.xls']:
            df.to_excel(output_file, index=False)
            print(f"Exported to Excel: {output_file}")
            
        elif ext == '.json':
            df.to_json(output_file, orient='records', indent=4)
            print(f"Exported to JSON: {output_file}")
            
        elif ext == '.txt':
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(tabulate(flat_data, headers="keys", tablefmt="grid"))
            print(f"Exported to Text: {output_file}")
            
        elif ext == '.pdf':
            try:
                pdf = FPDF()
                pdf.add_page()
                pdf.set_font("Arial", size=10)
                
                # Title
                pdf.set_font("Arial", 'B', 16)
                pdf.cell(0, 10, txt="MedScan Analysis Report", ln=True, align='C')
                pdf.ln(10)
                
                # Content
                pdf.set_font("Arial", size=8)
                
                row_height = 6
                # Header
                headers = ["File", "Drug", "Dosage", "Freq", "Status"]
                col_widths = [45, 45, 25, 30, 30] 
                
                # Header Row
                for i, h in enumerate(headers):
                    pdf.cell(col_widths[i], row_height, h, border=1)
                pdf.ln(row_height)
                
                pdf.set_font("Arial", size=7)
                for item in flat_data:
                    # Very basic cell truncation to avoid breaking layout
                    # File Name
                    pdf.cell(col_widths[0], row_height, str(item.get('file_name', ''))[:20], border=1)
                     # Drug Name
                    pdf.cell(col_widths[1], row_height, str(item.get('drug_name', ''))[:20], border=1)
                    # Dosage
                    pdf.cell(col_widths[2], row_height, str(item.get('dosage', ''))[:10], border=1)
                    # Frequency
                    pdf.cell(col_widths[3], row_height, str(item.get('frequency', ''))[:15], border=1)
                    # Status
                    pdf.cell(col_widths[4], row_height, str(item.get('status', ''))[:15], border=1)
                    pdf.ln(row_height)
                    
                pdf.output(output_file)
                print(f"Exported to PDF: {output_file}")
            except Exception as pdf_err:
                 print(f"PDF generation error (ensure fpdf is installed): {pdf_err}")
                 
        else:
             print(f"Unsupported extension: {ext}. Defaulting to CSV.")
             df.to_csv(output_file + '.csv', index=False)
             print(f"Exported to CSV: {output_file}.csv")

    except Exception as e:
        print(f"Failed to export: {e}")

def scan_directory(input_dir: str, output_file: str, interactive: bool = False):
    """
    Scans a directory for images, processes them, and optionally allows for manual annotation.
    """
    if not os.path.exists(input_dir):
        print(f"Error: Directory '{input_dir}' not found.")
        return

    valid_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    files = [f for f in os.listdir(input_dir) if os.path.splitext(f)[1].lower() in valid_extensions]
    
    if not files:
        print(f"No valid image files found in '{input_dir}'.")
        return

    print("Initializing AI models (this may take a moment)...")
    processor = PrescriptionProcessor()
    nlp_parser = MedicalNLPParser()

    print(f"Found {len(files)} images. Starting scan...\n")
    
    all_records = []
    
    # Load existing annotations if appending (optional logic, simplifed to overwrite or load for now)
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r') as f:
                all_records = json.load(f)
            print(f"Loaded {len(all_records)} existing records from {output_file}.")
        except:
            print("Starting with empty annotation set.")

    for i, filename in enumerate(files):
        file_path = os.path.join(input_dir, filename)
        print(f"[{i+1}/{len(files)}] Processing {filename}...")
        
        try:
            # reading image
            with open(file_path, "rb") as image_file:
                image_bytes = image_file.read()
            
            # OCR Processing
            raw_text, _ = processor.process_prescription(image_bytes)
            
            # NLP Parsing
            parsed_result = nlp_parser.parse_prescription(raw_text)
            drugs = parsed_result.get('drugs', [])
            alerts = parsed_result.get('alerts', [])

            # Validation: Check if it looks like a prescription
            if not drugs:
                print(f"⚠️  ALERT: No medication found in {filename}.")
                print(f"   -> This does not appear to be a valid prescription or the text is illegible.")
                print(f"   -> Skipping save for this file.")
                continue

            record = {
                "file_name": filename,
                "file_path": os.path.abspath(file_path),
                "timestamp": datetime.now().isoformat(),
                "raw_text": raw_text,
                "extracted_drugs": drugs,
                "alerts": alerts,
                "status": "auto_generated"
            }
            
            if interactive:
                record = interactive_tagging(record)
                # If during interactive mode user clears all drugs, we treat it as skipped/invalid
                if not record.get('extracted_drugs'):
                    print("   -> Marked as invalid/skipped by user.")
                    continue
            else:
                display_record(record)
            
            all_records.append(record)
            
            # Save incrementally
            save_annotations(all_records, output_file)
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print(f"\nScan complete. annotations saved to {output_file}")

def display_record(record: Dict):
    print("\n--- Extracted Data ---")
    print(f"File: {record['file_name']}")
    print(f"Raw Text Snippet: {record['raw_text'][:100]}...")
    
    drugs = record.get('extracted_drugs', [])
    if drugs:
        table_data = []
        for d in drugs:
            # Handle both object and dict (Pydantic model or dict)
            d_dict = d if isinstance(d, dict) else d.dict()
            table_data.append([
                d_dict.get('drug_name', 'N/A'),
                d_dict.get('dosage', 'N/A'),
                d_dict.get('frequency', 'N/A'),
                d_dict.get('duration', 'N/A')
            ])
        
        print(tabulate(table_data, headers=["Drug Name", "Dosage", "Frequency", "Duration"], tablefmt="grid"))
    else:
        print("No drugs detected.")
    
    if record.get('alerts'):
        print("\nAlerts:")
        for alert in record['alerts']:
            print(f"- {alert}")
    print("----------------------\n")

def interactive_tagging(record: Dict) -> Dict:
    display_record(record)
    
    print("\n[Interactive Tagging]")
    choice = input("Is the extraction correct? (y/n/skip): ").strip().lower()
    
    if choice == 'y':
        record['status'] = 'verified'
        return record
    elif choice == 'skip':
        record['status'] = 'skipped'
        return record
    
    # Manual Correction
    print("Enter correct details (leave empty to stop adding):")
    new_drugs = []
    while True:
        print("\n--- Add Drug ---")
        name = input("Drug Name (or Enter to finish): ").strip()
        if not name:
            break
        dosage = input("Dosage: ").strip()
        frequency = input("Frequency: ").strip()
        duration = input("Duration: ").strip()
        
        new_drugs.append({
            "drug_name": name,
            "dosage": dosage,
            "frequency": frequency,
            "duration": duration,
            "confidence": 1.0
        })
    
    if new_drugs:
        record['extracted_drugs'] = new_drugs
        record['status'] = 'manual_correction'
        print("Updated record with manual labels.")
    
    return record

def save_annotations(records: List[Dict], filepath: str):
    """Saves the annotations list to a JSON file."""
    try:
        with open(filepath, 'w') as f:
            json.dump(records, f, indent=4, default=str)
    except Exception as e:
        print(f"Failed to save annotations: {e}")

def main():
    parser = argparse.ArgumentParser(description="Medical Prescription CLI Scanner & Tagger")
    
    parser.add_argument("command", choices=["scan", "view", "export"], help="Command to execute")
    parser.add_argument("--dir", help="Directory containing prescription images", default="uploads")
    parser.add_argument("--output", help="Output file path (for export) or file to view", default="annotations.json")
    parser.add_argument("--input", help="Input JSON file for export command", default="annotations.json")
    parser.add_argument("--interactive", action="store_true", help="Enable interactive tagging mode")
    parser.add_argument("--export-to", help="Immediately export results to this file after scanning (e.g. report.pdf)")

    args = parser.parse_args()
    
    if args.command == "scan":
        # Enforce results folder and timestamped filename for annotations
        results_dir = "results"
        if not os.path.exists(results_dir):
            os.makedirs(results_dir)
        
        # Generate timestamped filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"annotation_{timestamp}.json"
        output_path = os.path.join(results_dir, output_filename)
        
        print(f"Starting scan. Results will be saved to: {output_path}")
        scan_directory(args.dir, output_path, args.interactive)

        # Auto-export if requested
        if args.export_to:
            output_dir = "output"
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
            
            # If user provided a path like "report.pdf", prepend "output/"
            # If user provided "output/report.pdf", allow it.
            # We simple enforce it goes into output/ folder if no dir specified.
            export_target = args.export_to
            if os.path.dirname(export_target) == "":
                 export_target = os.path.join(output_dir, export_target)
            
            print(f"\nAuto-exporting to {export_target}...")
            export_data(output_path, export_target)

    elif args.command == "view":
        target_file = args.output
        # Smart default: If default "annotations.json" missing, try latest in results
        if args.output == "annotations.json" and not os.path.exists("annotations.json"):
            if os.path.exists("results"):
                files = os.listdir("results")
                json_files = [f for f in files if f.startswith("annotation_") and f.endswith(".json")]
                if json_files:
                    json_files.sort(reverse=True)
                    target_file = os.path.join("results", json_files[0])
                    print(f"No specific file provided. Viewing latest: {target_file}")
        
        if os.path.exists(target_file):
            with open(target_file, 'r') as f:
                data = json.load(f)
                print(f"Loaded {len(data)} records from {target_file}")
                for record in data:
                    display_record(record)
        else:
            print(f"File {target_file} not found.")

    elif args.command == "export":
        # Output arg here refers to the target file name
        input_file = args.input
        target_output = args.output
        
        # Enforce output directory
        output_dir = "output"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # If user didn't specify a directory, put it in 'output/'
        if os.path.dirname(target_output) == "":
            target_output = os.path.join(output_dir, target_output)

        # Smart default for input
        if args.input == "annotations.json" and not os.path.exists("annotations.json"):
             if os.path.exists("results"):
                files = os.listdir("results")
                json_files = [f for f in files if f.startswith("annotation_") and f.endswith(".json")]
                if json_files:
                    json_files.sort(reverse=True)
                    input_file = os.path.join("results", json_files[0])
                    print(f"No input file provided. Using latest: {input_file}")

        export_data(input_file, target_output)

if __name__ == "__main__":
    main()
