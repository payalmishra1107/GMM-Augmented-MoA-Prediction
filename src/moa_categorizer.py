"""
moa_categorizer.py
------------------
Rule-based Mechanism of Action (MoA) categorization for antimicrobial compounds.

Usage:
    from src.moa_categorizer import clean_moa, categorize_moa, apply_categorization
"""

import re
import pandas as pd


def clean_moa(text: str) -> str:
    """Lowercase, strip punctuation, normalize whitespace."""
    text = str(text).lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def categorize_moa(text: str) -> str:
    """
    Map a cleaned MoA text string to one of 12 categories.

    Priority order (most specific → most general):
        1. Membrane / Cell Envelope Disruption
        2. Cell Wall Biosynthesis Inhibition
        3. Protein Synthesis Inhibition
        4. Nucleic Acid Synthesis / Integrity Disruption
        5. Metabolic Pathway Inhibition
        6. Redox / Oxidative Stress Induction
        7. Regulatory / Signalling Interference
        8. Biofilm Matrix Disruption
        9. Antifungal Sterol Biosynthesis Inhibitors
       10. Antiviral agents
       11. Affecting Human Physiology
       12. Multi-target / Polypharmacology
       13. Others (fallback)

    Returns the category string.
    """
    text = text.lower()

    if text == "unknown":
        return "Multi-target / Polypharmacology"

    # ── 1. Membrane / Cell Envelope Disruption ─────────────────────────────
    membrane_kws = [
        "membrane", "cell membrane", "pore", "permeability", "depolar",
        "lipid", "bilayer", "detergent", "ferriprotoporphyrin",
        "reactive nitro radical", "reactive intermediates",
        "membrane depolarization", "membrane permeabilization",
        "membrane damage", "membrane disrupting",
        "breaks down membrane lipids", "destroys cell membranes",
    ]
    if any(k in text for k in membrane_kws):
        return "Membrane / Cell Envelope Disruption"

    # ── 2. Cell Wall Biosynthesis Inhibition ────────────────────────────────
    wall_kws = [
        "penicillin-binding protein", "pbp", "peptidoglycan", "cell wall",
        "lipid ii", "alanine racemase", "beta lactamase", "beta-lactamase",
        "penicillin binding protein", "fab i",
        "enoyl acyl carrier protein reductase",
    ]
    if any(k in text for k in wall_kws):
        return "Cell Wall Biosynthesis Inhibition"

    # ── 3. Protein Synthesis Inhibition ─────────────────────────────────────
    protein_kws = [
        "ribosome", "70s", "30s", "50s", "translation", "elongation factor",
        "trna", "protein synthesis", "trna synthetase", "trna ligase",
    ]
    if any(k in text for k in protein_kws):
        return "Protein Synthesis Inhibition"

    # ── 4. Nucleic Acid Synthesis / Integrity Disruption ───────────────────
    nucleic_kws = [
        "dna", "rna", "gyrase", "topoisomerase", "polymerase", "replication",
        "intercalat", "dna binding", "dna disrupting", "dna inhibitor",
        "ribonucleotide reductase",
    ]
    if any(k in text for k in nucleic_kws):
        return "Nucleic Acid Synthesis / Integrity Disruption"

    # ── 5. Metabolic Pathway Inhibition ─────────────────────────────────────
    metabolic_kws = [
        "dihydrofolate reductase", "dihydropteroate synthase", "folate",
        "biosynthesis", "metabolism", "amidophosphoribosyltransferase",
        "oxidoreductase", "thymidylate synthase",
        "inosine monophosphate dehydrogenase", "dxr", "reductase",
        "synthase", "dehydrogenase", "cyclooxygenase", "carbonic anhydrase",
        "monoamine oxidase", "hmg coa reductase", "xanthine dehydrogenase",
        "caspase", "matrix metalloproteinase", "reductoisomerase",
        "dioxp reductoisomerase", "dipeptidase",
        "diacylglycerol o acyltransferase", "dgat", "glucosyltransferase",
        "ceramide glucosyltransferase",
    ]
    if any(k in text for k in metabolic_kws):
        return "Metabolic Pathway Inhibition"

    # ── 6. Redox / Oxidative Stress Induction ───────────────────────────────
    redox_kws = [
        "oxidative", "redox", "ros", "reactive", "nitro", "oxidase",
        "reducing agent", "antioxidant", "increases ros", "chelating",
        "copper chelating", "iron chelating", "aluminium chelating",
        "glutathione", "glutathione precursor", "redox regulator",
    ]
    if any(k in text for k in redox_kws):
        return "Redox / Oxidative Stress Induction"

    # ── 7. Regulatory / Signalling Interference ─────────────────────────────
    signalling_kws = [
        "quorum", "two component", "regulation", "signalling",
        "stress response", "transcription", "toll like receptor", "nf kb",
        "mtor", "map kinase", "cyclin dependent kinase",
        "biofilm related genes", "guanylate cyclase", "cyclase activator",
        "cyclase inhibitor", "cap binding complex",
        "signal transduction modulator", "arca", "arcb", "arcc", "arcd",
        "arc gene", "arginine deiminase pathway",
    ]
    if any(k in text for k in signalling_kws):
        return "Regulatory / Signalling Interference"

    # ── 8. Biofilm Matrix Disruption ────────────────────────────────────────
    biofilm_kws = ["biofilm", "edna", "nuclease"]
    if any(k in text for k in biofilm_kws):
        return "Biofilm Matrix Disruption"

    # ── 9. Antifungal Sterol Biosynthesis Inhibitors ─────────────────────────
    antifungal_kws = [
        "cytochrome p450", "cyp51", "lanosterol", "ergosterol",
        "sterol biosynthesis", "squalene monooxygenase",
    ]
    if any(k in text for k in antifungal_kws):
        return "Antifungal Sterol Biosynthesis Inhibitors"

    # ── 10. Antiviral agents ─────────────────────────────────────────────────
    antiviral_kws = [
        "hiv", "herpesvirus", "influenza", "hepatitis c",
        "reverse transcriptase", "viral protease", "viral capsid",
        "neuraminidase", "viral polymerase", "viral", "hepatitis", "capsid",
        "viral kinase", "helicase", "primase", "hiv protease",
        "hiv 1 protease", "pul97", "viral phosphotransferase",
        "human immunodeficiency virus type 1 protease",
    ]
    if any(k in text for k in antiviral_kws):
        return "Antiviral agents"

    # ── 11. Affecting Human Physiology ──────────────────────────────────────
    human_kws = [
        "receptor", "agonist", "antagonist", "partial agonist",
        "inverse agonist", "allosteric modulator", "ion channel",
        "channel blocker", "voltage gated", "calcium channel",
        "sodium channel", "potassium channel", "acetylcholinesterase",
        "dopamine transporter", "serotonin transporter", "kinase",
        "phosphatase", "transporter", "tubulin", "microtubule",
        "egfr", "mtor", "nf kb", "signal transduction",
    ]
    if any(k in text for k in human_kws):
        return "Affecting Human Physiology"

    # ── 12. Multi-target / Polypharmacology ─────────────────────────────────
    multi_kws = ["multi target", "multiple", "polypharmacology", "pleiotropic"]
    if any(k in text for k in multi_kws):
        return "Multi-target / Polypharmacology"

    return "Others"


def apply_categorization(df: pd.DataFrame, moa_col: str = "MoA") -> pd.DataFrame:
    """
    Apply full MoA cleaning + categorization pipeline to a DataFrame.

    Parameters
    ----------
    df : pd.DataFrame
        Input dataframe with a MoA column.
    moa_col : str
        Name of the column containing raw MoA text.

    Returns
    -------
    pd.DataFrame
        DataFrame with added 'MoA_clean' and 'MoA_category' columns,
        duplicates removed, and unknowns dropped.
    """
    df = df.drop_duplicates()
    df[moa_col] = df[moa_col].fillna("Unknown")
    df = df[df[moa_col] != "Unknown"].copy()
    df["MoA_clean"] = df[moa_col].apply(clean_moa)
    df["MoA_category"] = df["MoA_clean"].apply(categorize_moa)
    return df
