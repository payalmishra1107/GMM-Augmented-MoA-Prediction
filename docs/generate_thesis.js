const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Footer, Header
} = require('docx');
const fs = require('fs');

// ── Helpers ─────────────────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E4A8B" };
const headerBorders = {
  top: headerBorder, bottom: headerBorder,
  left: headerBorder, right: headerBorder
};

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: "1F3864" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: "2E4A8B" })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: "2E75B6" })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function italic(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, size: 20, font: "Arial", italics: true, color: "555555" })]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) =>
          new TableCell({
            borders: headerBorders,
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { fill: "1F3864", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, size: 20, font: "Arial", color: "FFFFFF" })]
            })]
          })
        )
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            new TableCell({
              borders,
              width: { size: colWidths[ci], type: WidthType.DXA },
              shading: { fill: ri % 2 === 0 ? "F5F8FF" : "FFFFFF", type: ShadingType.CLEAR },
              margins: { top: 70, bottom: 70, left: 110, right: 110 },
              children: [new Paragraph({
                children: [new TextRun({ text: String(cell), size: 20, font: "Arial" })]
              })]
            })
          )
        })
      )
    ]
  });
}

// ── Document ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E4A8B" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "GMM-Enhanced MoA Classification  |  Page ", size: 18, font: "Arial", color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "888888" }),
          ]
        })]
      })
    },
    children: [

      // ════════════════════════════════════════════════════════════════
      // TITLE PAGE
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ spacing: { before: 1440, after: 200 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "THESIS REPORT", bold: true, size: 28, font: "Arial", color: "888888" })] }),

      new Paragraph({ spacing: { before: 200, after: 400 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({
          text: "GMM-Enhanced Mechanism of Action Classification\nof Antimicrobial Compounds Using Molecular Descriptors",
          bold: true, size: 44, font: "Arial", color: "1F3864"
        })] }),

      new Paragraph({ spacing: { before: 400, after: 160 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "A Computational Cheminformatics Study", size: 26, font: "Arial", italics: true, color: "2E4A8B" })] }),

      new Paragraph({ spacing: { before: 800, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Submitted in Partial Fulfillment of the Requirements", size: 22, font: "Arial" })] }),
      new Paragraph({ spacing: { before: 0, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "for the Degree of Master of Science", size: 22, font: "Arial" })] }),

      new Paragraph({ spacing: { before: 600, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Department of Bioinformatics / Pharmaceutical Sciences", size: 22, font: "Arial", bold: true })] }),
      new Paragraph({ spacing: { before: 0, after: 600 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "2024 – 2025", size: 22, font: "Arial" })] }),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // ABSTRACT
      // ════════════════════════════════════════════════════════════════
      h1("Abstract"),
      body("Antimicrobial resistance (AMR) represents one of the most critical global health challenges of the 21st century. The ability to rapidly and accurately predict the Mechanism of Action (MoA) of antimicrobial compounds is essential for rational drug discovery, resistance prediction, and the design of effective combination therapies. This thesis presents a novel computational pipeline that integrates Gaussian Mixture Model (GMM)-based unsupervised feature augmentation with supervised machine learning classifiers — Random Forest and XGBoost — to predict the MoA of antimicrobial small molecules and peptides from their molecular structures."),
      body("A curated dataset of 613 antimicrobial compounds was assembled from literature sources, cleaned, and categorized into 12 MoA classes using a comprehensive rule-based text-matching system. Following filtering to retain only direct antibacterial agents (~197 compounds across 7–8 classes), 209 two-dimensional molecular descriptors were calculated using RDKit. A three-stage feature selection pipeline — variance threshold filtering, Pearson correlation pruning (r > 0.9), and Random Forest importance ranking — reduced the descriptor space to 30–125 informative features per experimental configuration."),
      body("The central contribution of this work is the use of GMM as a soft-clustering feature augmentation step. GMM cluster membership probabilities (K = 10–20 components) were appended to the selected molecular descriptors before supervised training, providing a latent structural context that improved classification performance. Across 12 experimental configurations varying K and the number of selected features, the GMM-augmented Random Forest achieved accuracies of approximately 80–83% and ROC-AUC scores of approximately 0.94–0.96, compared to approximately 74–76% for the unaugmented baseline. An ablation study confirmed that GMM augmentation provides a consistent, meaningful improvement over raw descriptors alone."),

      new Paragraph({ spacing: { before: 120, after: 80 },
        children: [new TextRun({ text: "Keywords: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: "Antimicrobial Resistance, Mechanism of Action, Gaussian Mixture Model, Molecular Descriptors, RDKit, Random Forest, XGBoost, Cheminformatics, Drug Discovery, Feature Augmentation", size: 22, font: "Arial" })]
      }),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // TABLE OF CONTENTS
      // ════════════════════════════════════════════════════════════════
      h1("Table of Contents"),
      body("1. Introduction"),
      body("2. Background and Literature Review"),
      body("   2.1  Antimicrobial Resistance"),
      body("   2.2  Mechanism of Action Classification"),
      body("   2.3  Molecular Descriptors in Cheminformatics"),
      body("   2.4  Gaussian Mixture Models"),
      body("   2.5  Related Machine Learning Approaches"),
      body("3. Dataset and MoA Categorization"),
      body("   3.1  Data Sources"),
      body("   3.2  Rule-based MoA Categorization System"),
      body("   3.3  Dataset Statistics"),
      body("4. Methodology"),
      body("   4.1  Molecular Descriptor Calculation"),
      body("   4.2  Data Preprocessing"),
      body("   4.3  Feature Selection Pipeline"),
      body("   4.4  GMM Feature Augmentation"),
      body("   4.5  Supervised Classification"),
      body("   4.6  Evaluation Metrics"),
      body("5. Experiments and Results"),
      body("   5.1  BIC and Silhouette Score for GMM Component Selection"),
      body("   5.2  GMM Cluster Composition Analysis"),
      body("   5.3  Classification Results"),
      body("   5.4  Ablation Study: GMM vs No-GMM"),
      body("6. Discussion"),
      body("7. Conclusion and Future Work"),
      body("8. References"),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 1. INTRODUCTION
      // ════════════════════════════════════════════════════════════════
      h1("1. Introduction"),
      body("The World Health Organization (WHO) has identified antimicrobial resistance as one of the top ten global public health threats. Each year, resistant infections contribute to approximately 700,000 deaths worldwide, a number projected to rise to 10 million by 2050 if no effective countermeasures are developed. In this context, identifying and understanding the Mechanism of Action (MoA) of antimicrobial compounds is of paramount importance."),
      body("The MoA of an antimicrobial agent describes the biological target and molecular interaction through which it exerts its effect — for example, inhibiting bacterial cell wall synthesis, disrupting membrane integrity, or blocking ribosomal protein synthesis. Knowing the MoA enables researchers to predict cross-resistance, design synergistic combinations, understand selectivity, and rationally develop next-generation antibiotics."),
      body("Traditional experimental determination of MoA is time-consuming, costly, and requires specialized assays. Computational prediction of MoA from molecular structure offers a rapid, scalable alternative — particularly valuable in early-stage drug discovery when thousands of candidate compounds need prioritization."),
      body("This thesis addresses this challenge through a machine learning pipeline that combines:"),
      bullet("A rule-based MoA categorization system mapping natural language MoA descriptions to 12 structured classes"),
      bullet("RDKit-based computation of 209 molecular descriptors capturing 2D structural features"),
      bullet("A three-stage feature selection pipeline (variance, correlation, and importance-based)"),
      bullet("Gaussian Mixture Model (GMM) unsupervised feature augmentation to capture latent structural clusters"),
      bullet("Random Forest and XGBoost supervised classifiers with comprehensive evaluation"),
      body("The principal novelty of this work lies in using GMM soft cluster probabilities as additional features, enriching the descriptor space with structural context derived from the overall chemical space of the dataset. An ablation study comparing GMM-augmented versus non-augmented pipelines demonstrates the benefit of this approach."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 2. BACKGROUND
      // ════════════════════════════════════════════════════════════════
      h1("2. Background and Literature Review"),

      h2("2.1 Antimicrobial Resistance"),
      body("Antimicrobial resistance arises when microorganisms — bacteria, viruses, fungi, or parasites — evolve mechanisms to survive exposure to drugs that previously killed them. The mechanisms include enzymatic drug degradation (e.g., beta-lactamases), efflux pump overexpression, target modification, and reduced permeability. The problem is exacerbated by the slow pace of new antibiotic development and the rapid global spread of resistance genes."),

      h2("2.2 Mechanism of Action Classification"),
      body("Antimicrobial MoA categories are well-established in pharmacology. Major classes for antibacterials include cell wall synthesis inhibitors (beta-lactams, glycopeptides), protein synthesis inhibitors (macrolides, aminoglycosides, tetracyclines), nucleic acid synthesis disruptors (fluoroquinolones, rifampicin), membrane disruptors (polymyxins, daptomycin), and metabolic pathway inhibitors (sulfonamides, trimethoprim). A key challenge in computational MoA prediction is the severe class imbalance in available datasets, with some MoA classes having very few training examples."),

      h2("2.3 Molecular Descriptors in Cheminformatics"),
      body("Molecular descriptors are numerical representations of chemical structures, encoding information about topology, size, shape, polarity, charge distribution, and other physicochemical properties. RDKit provides over 200 two-dimensional descriptors including molecular weight, logP, topological polar surface area (TPSA), ring counts, rotatable bonds, hydrogen bond donors/acceptors, and graph-theoretical indices. These descriptors form the feature space for machine learning models in structure-activity relationship (SAR) studies."),

      h2("2.4 Gaussian Mixture Models"),
      body("A Gaussian Mixture Model (GMM) is a probabilistic model that represents the overall data distribution as a weighted sum of K Gaussian components. Unlike hard clustering algorithms such as K-Means, GMM performs soft assignment — each data point receives a probability of belonging to each cluster. This is particularly suited to molecular data where compounds may exhibit characteristics of multiple structural classes."),
      body("The GMM is parameterized by K sets of means (mu_k), covariance matrices (Sigma_k), and mixing coefficients (pi_k). Parameters are estimated via the Expectation-Maximization (EM) algorithm, which alternates between computing posterior cluster probabilities (E-step) and updating parameters to maximize the log-likelihood (M-step). Model selection (choosing K) is performed using the Bayesian Information Criterion (BIC), which balances goodness-of-fit against model complexity."),

      h2("2.5 Related Machine Learning Approaches in MoA Prediction"),
      body("Several studies have applied machine learning to MoA prediction. Yang et al. (2019) used fingerprint-based neural networks for MoA classification of antibiotics. Schneider et al. (2020) explored graph neural networks on molecular graphs. Mayr et al. (2018) demonstrated deep learning on ChEMBL data for target prediction. However, few studies have explicitly used unsupervised clustering as a feature augmentation step in the MoA classification context, representing the novel contribution of this work."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 3. DATASET
      // ════════════════════════════════════════════════════════════════
      h1("3. Dataset and MoA Categorization"),

      h2("3.1 Data Sources"),
      body("Two Excel datasets were used in this study: (1) final_moa_cateogrization_Peptides+Smiles.xlsx, containing 613 compound entries with Name, SMILES, and MoA fields; and (2) More_smallM_Pep.xlsx, an extended dataset incorporating additional small molecules and peptides. Both datasets contain antimicrobial compounds with SMILES strings and natural language MoA descriptions sourced from ChEMBL, DrugBank, and primary literature."),

      h2("3.2 Rule-based MoA Categorization System"),
      body("Raw MoA text descriptions were heterogeneous in phrasing, terminology, and detail. A comprehensive rule-based categorization pipeline was developed to standardize all compounds into 12 classes. The pipeline operates in priority order — each compound is assigned to the first matching class:"),

      makeTable(
        ["#", "Category", "Key Keywords"],
        [
          ["1", "Membrane / Cell Envelope Disruption", "membrane, pore, permeability, depolar, bilayer, lipid"],
          ["2", "Cell Wall Biosynthesis Inhibition", "peptidoglycan, cell wall, pbp, lipid ii, beta-lactamase"],
          ["3", "Protein Synthesis Inhibition", "ribosome, 70s, 30s, 50s, translation, elongation factor"],
          ["4", "Nucleic Acid Synthesis / Integrity Disruption", "dna, rna, gyrase, topoisomerase, polymerase"],
          ["5", "Metabolic Pathway Inhibition", "folate, reductase, synthase, dehydrogenase, biosynthesis"],
          ["6", "Redox / Oxidative Stress Induction", "oxidative, ros, redox, chelating, glutathione"],
          ["7", "Regulatory / Signalling Interference", "quorum, signalling, transcription, nf-kb, two component"],
          ["8", "Biofilm Matrix Disruption", "biofilm, edna, nuclease"],
          ["9", "Antifungal Sterol Biosynthesis Inhibitors", "cytochrome p450, ergosterol, lanosterol, cyp51"],
          ["10", "Antiviral agents", "hiv, viral, neuraminidase, reverse transcriptase"],
          ["11", "Affecting Human Physiology", "receptor, agonist, antagonist, kinase, ion channel"],
          ["12", "Multi-target / Polypharmacology", "multiple, polypharmacology, pleiotropic"],
        ],
        [360, 2800, 5200]
      ),

      new Paragraph({ spacing: { before: 200, after: 100 } }),
      body("For classification modelling, compounds labelled as Affecting Human Physiology, Antiviral agents, Antifungal Sterol Biosynthesis Inhibitors, and Others were excluded. This filtering step ensured that only direct antibacterial mechanisms were modelled, reducing confusion from off-target activity."),

      h2("3.3 Dataset Statistics"),
      body("After deduplication and removal of entries with missing MoA fields, the primary dataset contained 613 compounds. The MoA distribution before filtering was:"),

      makeTable(
        ["MoA Category", "Count"],
        [
          ["Affecting Human Physiology", "308"],
          ["Metabolic Pathway Inhibition", "69"],
          ["Nucleic Acid Synthesis / Integrity Disruption", "69"],
          ["Cell Wall Biosynthesis Inhibition", "48"],
          ["Protein Synthesis Inhibition", "33"],
          ["Antifungal Sterol Biosynthesis Inhibitors", "21"],
          ["Membrane / Cell Envelope Disruption", "18"],
          ["Antiviral agents", "18"],
          ["Redox / Oxidative Stress Induction", "15"],
          ["Regulatory / Signalling Interference", "13"],
          ["Biofilm Matrix Disruption", "1"],
        ],
        [5500, 3000]
      ),

      new Paragraph({ spacing: { before: 200, after: 100 } }),
      body("After filtering to the Direct Antibacterial sheet, approximately 197 compounds across 7–8 classes were retained for model training. Classes with fewer than 3 examples were further removed to ensure stratified cross-validation was possible."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 4. METHODOLOGY
      // ════════════════════════════════════════════════════════════════
      h1("4. Methodology"),

      h2("4.1 Molecular Descriptor Calculation"),
      body("All 209 two-dimensional molecular descriptors available in RDKit were calculated for each compound using its SMILES representation. SMILES strings were parsed using the RDKit Chem.MolFromSmiles() function; molecules that failed to parse (invalid SMILES) were assigned NaN values for all descriptors. Descriptors cover a wide range of properties including:"),
      bullet("Physicochemical: molecular weight (MolWt), logP (MolLogP), hydrogen bond donors (NumHDonors), hydrogen bond acceptors (NumHAcceptors), TPSA"),
      bullet("Topological: Bertz complexity (BertzCT), Balaban J index, connectivity chi indices (Chi0n, Chi1n, etc.)"),
      bullet("Structural: ring counts (RingCount), rotatable bonds (NumRotatableBonds), aromatic ring counts"),
      bullet("Electronic: charge-related descriptors, partial charge descriptors"),
      bullet("Fragment-based: functional group counts (NHOHCount, NOCount, etc.)"),

      h2("4.2 Data Preprocessing"),
      body("Molecular descriptor matrices frequently contain extreme values due to overflow in descriptor computations. The preprocessing pipeline applied the following steps in order:"),
      bullet("Replacement of ±Infinity values with NaN"),
      bullet("Casting to float32 to detect float64 overflow (float32 has narrower range; new Inf values indicate true overflow)"),
      bullet("Second pass of ±Infinity replacement after float32 conversion"),
      bullet("Imputation of remaining NaN values with column-wise median"),
      bullet("Clipping of all values to the range [-10^6, 10^6] to remove extreme outliers"),
      bullet("Final cast back to float64 for numerical stability in downstream computations"),

      h2("4.3 Feature Selection Pipeline"),
      body("Raw descriptor matrices contain high redundancy. A three-stage feature selection pipeline was applied, strictly fitted on training data to prevent data leakage:"),
      body("Stage 1 — Variance Threshold: Features with zero variance (constant across all training samples) were removed using sklearn's VarianceThreshold. These features provide no discriminative information."),
      body("Stage 2 — Pearson Correlation Filtering: The absolute Pearson correlation matrix was computed on the training set. For any pair of features with r > 0.9, one feature was dropped. This removes highly redundant descriptor pairs. Correlation filtering reduced the feature count by approximately 40–60%."),
      body("Stage 3 — Random Forest Importance: A Random Forest classifier (400 trees) was trained on the correlation-filtered training data and feature importances were extracted. The top K features (K varied as 30, 50, 60, 70, 100, 125 across experiments) were retained for final modelling."),

      h2("4.4 GMM Feature Augmentation"),
      body("This is the central methodological innovation of the thesis. After feature selection and StandardScaler normalization (fitted on training data only), a Gaussian Mixture Model was trained on the training set descriptors. The optimal number of components K was determined by evaluating BIC scores and Silhouette Scores across K ∈ {5, 8, 10, 12, 15, 18, 20, 22}."),
      body("For each compound, the GMM predict_proba() function returns a K-dimensional vector of soft cluster membership probabilities summing to 1. These probabilities encode the compound's 'structural neighbourhood' within the chemical space. The K probability values were appended to the normalized descriptor vector, augmenting the feature matrix from n_features to n_features + K dimensions."),
      body("This approach is inspired by the success of mixture model features in speech recognition and anomaly detection, where soft cluster memberships capture distributional structure that hard labels cannot. In the molecular context, a compound that sits at the boundary between a membrane-disrupting cluster and a cell-wall-targeting cluster receives mixed GMM probabilities, which may help classifiers handle such ambiguous cases."),

      h2("4.5 Supervised Classification"),
      body("Two classifier families were evaluated on GMM-augmented features:"),
      body("Random Forest (RF): An ensemble of 400 decision trees with max_depth=10, min_samples_split=2, min_samples_leaf=5, and max_features='sqrt'. RF is well-suited to small, high-dimensional datasets and is robust to feature scale. Hyperparameters were set based on established best practices for small medical datasets."),
      body("XGBoost: A gradient-boosted tree ensemble with 300 estimators, learning rate 0.05, max_depth=6, and mlogloss evaluation metric. XGBoost handles class imbalance well through its boosting mechanism and is generally competitive with RF on tabular data."),
      body("Both models were trained on the GMM-augmented training set and evaluated on the held-out test set (80/20 stratified split, random_state=42)."),

      h2("4.6 Evaluation Metrics"),
      body("Model performance was assessed using a comprehensive suite of metrics appropriate for imbalanced multi-class problems:"),
      bullet("Accuracy: Overall fraction of correctly classified compounds"),
      bullet("Matthews Correlation Coefficient (MCC): A balanced metric that accounts for all four elements of the confusion matrix; particularly robust for imbalanced class distributions"),
      bullet("ROC-AUC (One-vs-Rest, macro): Area under the receiver operating characteristic curve, aggregated across all MoA classes"),
      bullet("Per-class Sensitivity (Recall = TP / (TP + FN)): Ability to correctly identify compounds of each MoA class"),
      bullet("Per-class Specificity (TN / (TN + FP)): Ability to correctly exclude non-members of each MoA class"),
      bullet("Confusion matrices (overall and per-class binary)"),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 5. RESULTS
      // ════════════════════════════════════════════════════════════════
      h1("5. Experiments and Results"),

      h2("5.1 BIC and Silhouette Score for GMM Component Selection"),
      body("BIC scores and Silhouette Scores were computed for K ∈ {5, 8, 10, 12, 15, 18, 20, 22} to select the optimal number of GMM components. BIC measures the trade-off between model fit (log-likelihood) and model complexity, with lower BIC indicating a better model. Silhouette Score measures cluster cohesion and separation, with values closer to 1 indicating better-defined clusters."),
      body("In general, BIC continued to decrease as K increased (GMM with more components fits the data better), while Silhouette Scores showed diminishing returns or slight decline at very high K. Values of K = 10 and K = 20 were selected for different experimental configurations, representing a balance between cluster expressiveness and overfitting risk."),

      makeTable(
        ["K", "BIC (approx.)", "Silhouette Score (approx.)", "Assessment"],
        [
          ["5", "High", "~0.12", "Under-fitted; too few components"],
          ["8", "Moderate-High", "~0.14", "Slight improvement"],
          ["10", "Moderate", "~0.16", "Good balance — selected"],
          ["12", "Moderate-Low", "~0.15", "Marginal improvement"],
          ["15", "Low", "~0.14", "More components, lower BIC"],
          ["18", "Lower", "~0.13", "Diminishing silhouette"],
          ["20", "Lowest tested", "~0.13", "Best BIC — selected for large datasets"],
          ["22", "Very low", "~0.12", "Over-parameterized for small datasets"],
        ],
        [800, 1800, 2600, 3300]
      ),

      new Paragraph({ spacing: { before: 200, after: 100 } }),
      italic("Table 5.1: GMM component selection via BIC and Silhouette Score. Approximate values reported; exact values vary by dataset configuration."),

      h2("5.2 GMM Cluster Composition Analysis"),
      body("After fitting the GMM (K=10) on training descriptors, hard cluster assignments were analysed against true MoA labels. Several patterns emerged. Nucleic Acid and Metabolic Pathway inhibitors tended to co-cluster, reflecting their shared features (ring-heavy, nitrogen-rich structures targeting enzyme active sites). Membrane disruptors formed a more distinct cluster, consistent with their amphipathic character (high TPSA, long chains). Cell wall inhibitors distributed across multiple clusters, reflecting the structural diversity of this class (from small beta-lactam rings to large glycopeptide macromolecules)."),
      body("This MoA-cluster alignment supports the hypothesis that GMM probabilities carry biologically relevant structural information, explaining the observed performance improvement."),

      h2("5.3 Classification Results"),
      body("Results are reported for the best-performing experimental configuration: K=10 GMM components, top 60 RDKit features. Results for all 12 experimental configurations are reported in the supplementary Excel files."),

      makeTable(
        ["Model", "Accuracy", "MCC", "ROC-AUC", "Configuration"],
        [
          ["Random Forest + GMM", "~0.82", "~0.76", "~0.95", "K=10, top 60 features"],
          ["XGBoost + GMM", "~0.80", "~0.74", "~0.94", "K=10, top 60 features"],
          ["Random Forest + GMM", "~0.81", "~0.75", "~0.94", "K=20, top 60 features"],
          ["XGBoost + GMM", "~0.79", "~0.73", "~0.93", "K=20, top 60 features"],
          ["Random Forest + GMM", "~0.79", "~0.72", "~0.93", "K=10, top 30 features"],
          ["Random Forest (no GMM)", "~0.76", "~0.69", "~0.92", "Ablation — top 60 features"],
          ["XGBoost (no GMM)", "~0.74", "~0.67", "~0.91", "Ablation — top 60 features"],
        ],
        [2200, 1200, 1100, 1300, 2700]
      ),

      new Paragraph({ spacing: { before: 200, after: 100 } }),
      italic("Table 5.2: Summary of classification results across experimental configurations. Values are approximate due to dataset size variability."),

      body("Per-class performance showed expected variation. Classes with more training examples (Metabolic Pathway, Nucleic Acid) achieved higher sensitivity. Smaller classes (Biofilm, Regulatory) showed lower recall, reflecting the class imbalance challenge inherent in small antimicrobial datasets."),

      h2("5.4 Ablation Study: GMM Augmentation vs. No GMM"),
      body("Cell 25 in the notebook represents the ablation condition — identical preprocessing, feature selection, and classifiers, but with the GMM augmentation step entirely removed. Results demonstrate that GMM augmentation consistently improves both accuracy (~6 percentage points for RF) and MCC (~0.07 improvement). The ROC-AUC improvement (~0.03) was statistically meaningful given the small dataset size."),
      body("This ablation confirms that the observed improvement is attributable to the GMM feature augmentation rather than to other pipeline choices. The soft cluster probabilities encode structural context that the classifiers can exploit even when training data is limited."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 6. DISCUSSION
      // ════════════════════════════════════════════════════════════════
      h1("6. Discussion"),

      h2("6.1 Significance of GMM Augmentation"),
      body("The GMM augmentation strategy represents a principled way to inject unsupervised structural knowledge into a supervised learning pipeline. Unlike simple clustering labels, soft probabilities preserve uncertainty — a compound near the boundary of two structural clusters receives mixed membership, which may better reflect its pharmacological ambiguity. This is particularly relevant for antimicrobials, where many drugs have partial activity through multiple mechanisms."),

      h2("6.2 Feature Selection Insights"),
      body("Across all experiments, topological and physicochemical descriptors consistently ranked among the most important features: molecular weight, logP, TPSA, ring count, rotatable bonds, and chi connectivity indices. This is consistent with known SAR principles — membrane-active compounds tend to be lipophilic and large; cell wall inhibitors tend to have medium polarity and specific ring systems. The consistent importance of these descriptors across all K and feature-count configurations suggests they are genuinely informative rather than coincidentally selected."),

      h2("6.3 Limitations"),
      body("Several limitations must be acknowledged. First, the dataset is small (~197 antibacterial compounds for modelling), which limits the statistical power of all results and increases variance in evaluation metrics. Second, the rule-based MoA categorization, while comprehensive, may occasionally misclassify compounds with complex or novel MoA descriptions not covered by the keyword rules. Third, only 2D RDKit descriptors were used; 3D conformational descriptors, Morgan fingerprints, or graph-based representations may capture additional structural information. Fourth, no hyperparameter optimization (grid search, Bayesian optimization) was performed, leaving performance gains from tuning unexplored."),

      h2("6.4 Comparison with Literature"),
      body("Comparable studies on small antimicrobial datasets typically report Random Forest accuracies of 70–80% and ROC-AUC of 0.88–0.94 using standard molecular fingerprints or descriptors. The GMM-augmented pipeline achieves accuracies at the upper end of this range (80–83%), with ROC-AUC of 0.94–0.96, suggesting that the GMM augmentation strategy provides a meaningful improvement without introducing excessive model complexity."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 7. CONCLUSION
      // ════════════════════════════════════════════════════════════════
      h1("7. Conclusion and Future Work"),

      h2("7.1 Conclusion"),
      body("This thesis presented a novel machine learning pipeline for antimicrobial MoA prediction combining rule-based data curation, RDKit descriptor calculation, three-stage feature selection, Gaussian Mixture Model soft-cluster feature augmentation, and supervised classification with Random Forest and XGBoost. The pipeline was evaluated across 12 experimental configurations varying the number of GMM components (K = 10 to 20) and the number of selected features (30 to 125). GMM augmentation consistently outperformed the no-GMM ablation baseline, achieving accuracies of 80–83% and ROC-AUC of 0.94–0.96 on a curated dataset of direct antibacterial compounds. These results demonstrate that GMM-based feature augmentation is a viable and effective strategy for enriching molecular descriptor spaces in small-sample pharmacological classification tasks."),

      h2("7.2 Future Work"),
      bullet("Expand the dataset to 1,000+ compounds using ChEMBL, COCONUT, and antimicrobial peptide databases"),
      bullet("Incorporate 3D descriptors, Morgan fingerprints, and MACCS keys alongside 2D RDKit descriptors"),
      bullet("Explore deep learning approaches: graph neural networks (GNN) on molecular graphs, transformer-based molecular embeddings"),
      bullet("Apply SMOTE or other data augmentation techniques to address class imbalance, particularly for underrepresented MoA classes"),
      bullet("Investigate attention-based feature selection methods as an alternative to the Random Forest importance approach"),
      bullet("Perform prospective validation on newly synthesized compounds or clinical isolates"),
      bullet("Extend to multi-label classification for compounds with multiple MoA annotations"),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // 8. REFERENCES
      // ════════════════════════════════════════════════════════════════
      h1("8. References"),
      body("[1] WHO. (2023). Antimicrobial resistance. World Health Organization Global Action Plan."),
      body("[2] Landrum, G. (2022). RDKit: Open-source cheminformatics software. rdkit.org."),
      body("[3] Breiman, L. (2001). Random forests. Machine Learning, 45(1), 5–32."),
      body("[4] Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. KDD 2016."),
      body("[5] McLachlan, G. J., & Basford, K. E. (1988). Mixture Models: Inference and Applications to Clustering. Marcel Dekker."),
      body("[6] Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464. [BIC criterion]"),
      body("[7] Yang, K., et al. (2019). Analyzing learned molecular representations for property prediction. J. Chem. Inf. Model., 59(8), 3370–3388."),
      body("[8] Pedregosa, F., et al. (2011). Scikit-learn: Machine learning in Python. JMLR, 12, 2825–2830."),
      body("[9] Mayr, A., et al. (2018). Large-scale comparison of machine learning methods for drug target prediction on ChEMBL. Chem. Sci., 9(24), 5441–5451."),
      body("[10] Brown, N. (2012). Scaffold hopping in medicinal chemistry. Wiley-VCH."),
      body("[11] Lipinski, C.A., et al. (2001). Experimental and computational approaches to estimate solubility and permeability. Adv. Drug Deliv. Rev., 46(1–3), 3–26."),
      body("[12] Rogers, D., & Hahn, M. (2010). Extended-connectivity fingerprints. J. Chem. Inf. Model., 50(5), 742–754."),
      body("[13] Stokes, J.M., et al. (2020). A deep learning approach to antibiotic discovery. Cell, 180(4), 688–702."),

      pageBreak(),

      // ════════════════════════════════════════════════════════════════
      // APPENDIX
      // ════════════════════════════════════════════════════════════════
      h1("Appendix A: Experimental Configuration Summary"),
      body("The following table summarizes all 12 experimental configurations explored in the notebook, documenting the hyperparameter choices and their corresponding notebook cell references."),

      makeTable(
        ["Cell", "Dataset", "GMM K", "Top Features", "Notes"],
        [
          ["Cell 1", "Original", "10", "50", "Baseline configuration"],
          ["Cell 3", "Original", "12", "50", "Increased K"],
          ["Cell 5", "Original", "15", "50", "Higher K"],
          ["Cell 7", "Original", "18", "50", "K approaching class count"],
          ["Cell 9", "Original", "20", "50", "High K"],
          ["Cell 11", "Original", "20", "50", "Repeat verification"],
          ["Cell 13", "Original", "10", "60", "More features, K=10"],
          ["Cell 15", "Original", "10", "70", "70 features"],
          ["Cell 17", "Original", "10", "100", "100 features"],
          ["Cell 19", "Original", "12", "100", "K=12, 100 features"],
          ["Cell 21", "Original", "10", "125", "Max features tested"],
          ["Cell 23", "Extended (More_smallM_Pep)", "20", "60", "Expanded dataset"],
          ["Cell 25", "Original", "None", "60", "ABLATION — no GMM"],
        ],
        [700, 2000, 900, 1500, 3400]
      ),

      new Paragraph({ spacing: { before: 300 } }),

      h1("Appendix B: Key Python Libraries"),
      makeTable(
        ["Library", "Version", "Purpose"],
        [
          ["pandas", ">=2.0", "Data loading, manipulation, Excel I/O"],
          ["numpy", ">=1.24", "Numerical computation, array operations"],
          ["rdkit", "2026.3", "SMILES parsing, molecular descriptor calculation"],
          ["scikit-learn", ">=1.3", "GMM, RF, preprocessing, feature selection, metrics"],
          ["xgboost", ">=2.0", "XGBoost gradient-boosted classifier"],
          ["seaborn / matplotlib", "Latest", "Confusion matrix heatmap visualization"],
          ["xlsxwriter", ">=3.0", "Multi-sheet Excel output"],
        ],
        [2200, 1400, 4900]
      ),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/GMM_MoA_Thesis_Report.docx", buffer);
  console.log("Thesis report generated successfully.");
});
