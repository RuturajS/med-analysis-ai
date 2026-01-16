import re
import torch
from typing import List, Dict
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
from models import DrugEntity

class MedicalNLPParser:
    def __init__(self):
        """
        Initialize medical NLP parser with ClinicalBERT for entity recognition
        """
        try:
            # Load BioClinicalBERT for medical NER
            model_name = "emilyalsentzer/Bio_ClinicalBERT"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForTokenClassification.from_pretrained(model_name)
            
            # Check for GPU
            device = 0 if torch.cuda.is_available() else -1
            if device == 0:
                print(f"Initializing ClinicalBERT on GPU: {torch.cuda.get_device_name(0)}")
            else:
                print("GPU not detected for Transformers, using CPU.")
            
            self.ner_pipeline = pipeline("ner", model=self.model, tokenizer=self.tokenizer, aggregation_strategy="simple", device=device)
        except Exception as e:
            print(f"Warning: Could not load ClinicalBERT: {e}")
            print("Falling back to rule-based parsing")
            self.ner_pipeline = None
        
        # Common medical abbreviations
        self.frequency_patterns = {
            r'\b(once|OD|qd)\b': '1x daily',
            r'\b(twice|BID|BD|bid)\b': '2x daily',
            r'\b(TID|tid|thrice)\b': '3x daily',
            r'\b(QID|qid)\b': '4x daily',
            r'\b(PRN|prn)\b': 'as needed',
            r'\b(QHS|qhs)\b': 'at bedtime',
            r'\b(Q\d+H|q\d+h)\b': 'every X hours',
        }
        
        self.dosage_patterns = [
            r'(\d+\.?\d*)\s*(mg|g|ml|mcg|units?)',
            r'(\d+)\s*(tablet|capsule|pill)s?',
        ]
    
    def parse_prescription(self, text: str) -> Dict:
        """
        Parse prescription text to extract drugs, dosages, and frequencies
        """
        drugs = []
        alerts = []
        
        # If NER model is available, use it
        if self.ner_pipeline:
            drugs = self._parse_with_ner(text)
        
        # Always apply rule-based parsing as fallback/enhancement
        rule_based_drugs = self._parse_with_rules(text)
        
        # Merge results
        if not drugs:
            drugs = rule_based_drugs
        
        # Validation and alerts
        if not drugs:
            alerts.append("⚠️ No medications detected in prescription")
        
        for drug in drugs:
            if not drug.get('dosage'):
                alerts.append(f"⚠️ Dosage unclear for {drug.get('drug_name', 'unknown drug')}")
            if not drug.get('frequency'):
                alerts.append(f"⚠️ Frequency not specified for {drug.get('drug_name', 'unknown drug')}")
        
        return {
            "drugs": drugs,
            "alerts": alerts
        }
    
    def _parse_with_ner(self, text: str) -> List[DrugEntity]:
        """Use NER model to extract drug entities"""
        try:
            entities = self.ner_pipeline(text)
            drugs = []
            
            for entity in entities:
                if entity.get('entity_group') in ['DRUG', 'MEDICATION', 'CHEMICAL']:
                    drugs.append({
                        'drug_name': entity['word'],
                        'confidence': entity['score']
                    })
            
            return drugs
        except Exception as e:
            print(f"NER parsing failed: {e}")
            return []
    
    def _parse_with_rules(self, text: str) -> List[Dict]:
        """
        Rule-based parsing for common prescription patterns
        """
        drugs = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or len(line) < 3:
                continue
            
            drug_info = {
                'drug_name': '',
                'dosage': '',
                'frequency': '',
                'duration': ''
            }
            
            # Extract dosage
            for pattern in self.dosage_patterns:
                dosage_match = re.search(pattern, line, re.IGNORECASE)
                if dosage_match:
                    drug_info['dosage'] = dosage_match.group(0)
                    break
            
            # Extract frequency
            for pattern, standardized in self.frequency_patterns.items():
                if re.search(pattern, line, re.IGNORECASE):
                    drug_info['frequency'] = standardized
                    break
            
            # Extract duration (e.g., "for 7 days", "x 14 days")
            duration_match = re.search(r'(?:for|x)\s*(\d+)\s*(day|week|month)s?', line, re.IGNORECASE)
            if duration_match:
                drug_info['duration'] = f"{duration_match.group(1)} {duration_match.group(2)}s"
            
            # Extract drug name (everything before dosage or first 3-5 words)
            if drug_info['dosage']:
                drug_name_part = line.split(drug_info['dosage'])[0].strip()
            else:
                # Take first few words as potential drug name
                words = line.split()[:4]
                drug_name_part = ' '.join(words)
            
            drug_info['drug_name'] = drug_name_part
            
            # Only add if we found at least a drug name
            if drug_info['drug_name']:
                drugs.append(drug_info)
        
        return drugs
    
    def validate_drug_interactions(self, drugs: List[str]) -> List[str]:
        """
        Check for known drug interactions (simplified version)
        In production, this would query a drug interaction database
        """
        warnings = []
        
        # Example: Simple interaction check (extend with real database)
        dangerous_combinations = [
            ('warfarin', 'aspirin'),
            ('metformin', 'alcohol'),
        ]
        
        drug_names_lower = [d.lower() for d in drugs]
        
        for drug1, drug2 in dangerous_combinations:
            if drug1 in drug_names_lower and drug2 in drug_names_lower:
                warnings.append(f"⚠️ INTERACTION WARNING: {drug1.title()} + {drug2.title()}")
        
        return warnings
