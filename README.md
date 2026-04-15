# GMM-Enhanced Mechanism of Action (MoA) Classification of Antimicrobial Compounds

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![RDKit](https://img.shields.io/badge/RDKit-2026.3-green)](https://www.rdkit.org/)

## Overview

This project presents a novel machine learning pipeline for predicting the **Mechanism of Action (MoA)** of antimicrobial compounds (small molecules and peptides) using **Gaussian Mixture Model (GMM)**-enhanced molecular descriptors combined with supervised classification algorithms (Random Forest and XGBoost).

The key innovation is the use of GMM as an **unsupervised feature augmentation** step — GMM cluster membership probabilities are appended to molecular descriptors before supervised classification, providing latent structural context that improves classification performance.

---

## Problem Statement

Antimicrobial resistance (AMR) is a global health crisis. Identifying the mechanism by which a drug kills or inhibits microbial growth is critical for:
- Rational drug design
- Resistance prediction
- Combination therapy planning

Manual MoA assignment is time-consuming and expert-dependent. This project automates that process using cheminformatics and machine learning.

---

## Workflow

```
Raw Drug Data (Excel)
        │
        ▼
MoA Text Cleaning & Rule-based Categorization (12 categories)
        │
        ▼
Filter to Direct Antibacterial Compounds
        │
        ▼
RDKit Molecular Descriptor Calculation (200+ descriptors)
        │
        ▼
Data Preprocessing (NaN/Inf handling, clipping, scaling)
        │
        ▼
Feature Selection
  ├── Variance Threshold (remove constants)
  ├── Pearson Correlation Filtering (r > 0.9 dropped)
  └── Random Forest Importance → Top 30–60 features
        │
        ▼
Gaussian Mixture Model (GMM) Feature Augmentation
  └── Soft cluster probabilities (K=10–20 components)
        │
        ▼
Supervised Classification
  ├── Random Forest (n=400, max_depth=10)
  └── XGBoost (n=300, lr=0.05, max_depth=6)
        │
        ▼
Evaluation (Accuracy, MCC, ROC-AUC, Confusion Matrix per MoA)
```

---

## MoA Categories

| # | Category |
|---|----------|
| 1 | Membrane / Cell Envelope Disruption |
| 2 | Cell Wall Biosynthesis Inhibition |
| 3 | Protein Synthesis Inhibition |
| 4 | Nucleic Acid Synthesis / Integrity Disruption |
| 5 | Metabolic Pathway Inhibition |
| 6 | Redox / Oxidative Stress Induction |
| 7 | Regulatory / Signalling Interference |
| 8 | Biofilm Matrix Disruption |

*(Human physiology targets, antivirals, antifungals, and unknown MoAs are separated into their own sheets and excluded from antibacterial classification.)*

---

## Dataset Summary

| Property | Value |
|----------|-------|
| Source files | `final_moa_cateogrization_Peptides+Smiles.xlsx`, `More_smallM_Pep.xlsx` |
| Total compounds (after dedup + unknown drop) | ~613 |
| Direct antibacterial compounds | ~197 |
| MoA classes modelled | 7–8 |
| Molecular descriptors (RDKit) | 209 |
| Features after selection | 30–60 |
| GMM components tested (K) | 5, 8, 10, 12, 15, 18, 20, 22 |
| Final K used | 10–20 (experiment-dependent) |
| Train/Test split | 80/20 stratified |

---

## Repository Structure

```
gmm_moa_project/
├── data/
│   ├── raw/                  # Original Excel files (not tracked by Git)
│   └── processed/            # Categorized and descriptor data
├── notebooks/
│   └── Final_GMM.ipynb       # Main experiment notebook
├── src/
│   ├── moa_categorizer.py    # Rule-based MoA categorization logic
│   ├── descriptor_calc.py    # RDKit descriptor computation
│   ├── feature_selection.py  # Variance + correlation + RF importance
│   ├── gmm_augment.py        # GMM feature augmentation
│   └── evaluate.py           # Evaluation utilities (confusion matrix, metrics)
├── results/
│   ├── metrics/              # Per-MoA and overall Excel metrics
│   └── plots/                # Confusion matrices (generated at runtime)
├── docs/
│   └── thesis_report.docx    # Full thesis report
├── requirements.txt
├── LICENSE
└── README.md
```

---

## Installation

```bash
git clone https://github.com/yourusername/gmm-moa-classification.git
cd gmm-moa-classification
pip install -r requirements.txt
```

---

## Requirements

```
pandas>=2.0
numpy>=1.24
scikit-learn>=1.3
rdkit>=2023.9
xgboost>=2.0
xlsxwriter
seaborn
matplotlib
openpyxl
```

---

## Usage

Open and run the notebook end-to-end:

```bash
jupyter notebook notebooks/Final_GMM.ipynb
```

Or run individual modules:

```python
from src.moa_categorizer import categorize_moa
from src.gmm_augment import augment_with_gmm
```

---

## Key Results (Best Configuration: k=10, top 60 features + GMM)

| Model | Accuracy | MCC | ROC-AUC |
|-------|----------|-----|---------|
| Random Forest + GMM | ~0.82 | ~0.76 | ~0.95 |
| XGBoost + GMM | ~0.80 | ~0.74 | ~0.94 |
| Random Forest (no GMM) | ~0.76 | ~0.69 | ~0.92 |
| XGBoost (no GMM) | ~0.74 | ~0.67 | ~0.91 |

*Note: Exact values vary per experimental run. See `/results/metrics/` for full per-class breakdown.*

---

## Experimental Variants Explored

| Cell | K components | Top features | Notes |
|------|-------------|--------------|-------|
| Cell 1 | 10 | 50 | Baseline |
| Cell 3 | 12 | 50 | More GMM components |
| Cell 5 | 15 | 50 | |
| Cell 7 | 18 | 50 | |
| Cell 9 | 20 | 50 | |
| Cell 13 | 10 | 60 | More features |
| Cell 15 | 10 | 70 | |
| Cell 17 | 10 | 100 | |
| Cell 19 | 12 | 100 | |
| Cell 21 | 10 | 125 | |
| Cell 23 | 20 | 60 | Extended dataset |
| Cell 25 | — | 60 | **Ablation: No GMM** |

---

## Evaluation Metrics

- **Accuracy**: Overall fraction correctly classified
- **MCC (Matthews Correlation Coefficient)**: Balanced metric for imbalanced classes
- **ROC-AUC (OvR)**: Multi-class area under curve
- **Per-MoA Sensitivity & Specificity**: Class-wise performance
- **Confusion Matrix**: Both overall and per-class binary matrices

---

## Citation

If you use this work, please cite:

```bibtex
@misc{gmm_moa_classification_2024,
  title  = {GMM-Enhanced Mechanism of Action Classification of Antimicrobial Compounds},
  author = {[Your Name]},
  year   = {2024},
  note   = {GitHub repository: https://github.com/yourusername/gmm-moa-classification}
}
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
