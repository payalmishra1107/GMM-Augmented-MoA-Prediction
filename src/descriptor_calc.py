"""
descriptor_calc.py
------------------
RDKit molecular descriptor calculation for antimicrobial compound datasets.

Usage:
    from src.descriptor_calc import calculate_all_descriptors, build_descriptor_df
"""

import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors


# Full list of RDKit descriptor names
DESCRIPTOR_NAMES = [desc[0] for desc in Descriptors.descList]


def calculate_descriptors(smiles: str) -> list:
    """
    Calculate all RDKit molecular descriptors for a given SMILES string.

    Parameters
    ----------
    smiles : str
        A valid SMILES string.

    Returns
    -------
    list
        List of descriptor values. Returns list of None if SMILES is invalid.
    """
    mol = Chem.MolFromSmiles(str(smiles))
    if mol is None:
        return [None] * len(DESCRIPTOR_NAMES)

    values = []
    for name, func in Descriptors.descList:
        try:
            values.append(func(mol))
        except Exception:
            values.append(None)
    return values


def build_descriptor_df(df: pd.DataFrame, smiles_col: str = "SMILES") -> pd.DataFrame:
    """
    Build a DataFrame of all RDKit descriptors from a compound dataset.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame with a SMILES column.
    smiles_col : str
        Name of the SMILES column.

    Returns
    -------
    pd.DataFrame
        Descriptor matrix with shape (n_compounds, n_descriptors).
    """
    descriptor_data = df[smiles_col].astype(str).apply(calculate_descriptors)
    X = pd.DataFrame(descriptor_data.tolist(), columns=DESCRIPTOR_NAMES)
    print(f"Total descriptors extracted: {len(DESCRIPTOR_NAMES)}")
    print(f"Descriptor matrix shape: {X.shape}")
    return X


def preprocess_descriptors(X: pd.DataFrame) -> pd.DataFrame:
    """
    Clean descriptor matrix: handle NaN, Inf, overflow, and clip extreme values.

    Steps:
        1. Replace ±Inf with NaN
        2. Cast to float32 to detect float64 overflow
        3. Replace ±Inf again (float32 overflow produces new Infs)
        4. Fill NaN with column median
        5. Clip to [-1e6, 1e6]
        6. Cast back to float64 for downstream stability

    Parameters
    ----------
    X : pd.DataFrame
        Raw descriptor matrix.

    Returns
    -------
    pd.DataFrame
        Cleaned descriptor matrix.
    """
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.astype(np.float32)
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.median())
    X = X.clip(-1e6, 1e6)
    X = X.astype(np.float64)

    nan_count = np.isnan(X.values).sum()
    inf_count = np.isinf(X.values).sum()
    print(f"After preprocessing — NaN: {nan_count}, Inf: {inf_count}, Max: {np.nanmax(X.values):.4f}")
    return X
