"""
gmm_augment.py
--------------
Gaussian Mixture Model (GMM) feature augmentation for molecular descriptor matrices.

The core idea: fit a GMM on training descriptors (unsupervised), then extract
soft cluster membership probabilities for each compound. These probabilities
encode latent structural similarity between compounds and are appended to
the original descriptors before supervised classification.

Usage:
    from src.gmm_augment import select_gmm_components, augment_with_gmm
"""

import numpy as np
import pandas as pd
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score


def evaluate_gmm_components(X_train_scaled: np.ndarray,
                             k_values: list = None,
                             random_state: int = 42) -> pd.DataFrame:
    """
    Evaluate GMM with multiple values of K using BIC and Silhouette Score.
    Used to select the optimal number of mixture components.

    Parameters
    ----------
    X_train_scaled : np.ndarray
        Standardised training features.
    k_values : list of int
        Values of K to evaluate. Defaults to [5, 8, 10, 12, 15, 18, 20, 22].
    random_state : int

    Returns
    -------
    pd.DataFrame
        Table with columns [K, BIC, Silhouette_Score].
    """
    if k_values is None:
        k_values = [5, 8, 10, 12, 15, 18, 20, 22]

    results = []
    for k in k_values:
        gmm = GaussianMixture(
            n_components=k,
            covariance_type='full',
            random_state=random_state
        )
        labels = gmm.fit_predict(X_train_scaled)
        bic = gmm.bic(X_train_scaled)
        sil = silhouette_score(X_train_scaled, labels)
        results.append({"K": k, "BIC": bic, "Silhouette_Score": sil})
        print(f"K = {k:2d}  |  BIC = {bic:.2f}  |  Silhouette = {sil:.4f}")

    return pd.DataFrame(results)


def augment_with_gmm(X_train_scaled: np.ndarray,
                     X_test_scaled: np.ndarray,
                     train_columns,
                     n_components: int = 10,
                     random_state: int = 42):
    """
    Fit a GMM on training data and augment both train and test feature matrices
    with soft cluster membership probabilities.

    The GMM is fitted only on X_train_scaled to prevent leakage. The
    predict_proba method is then applied to both train and test sets.

    Parameters
    ----------
    X_train_scaled : np.ndarray
        Standardised training features (shape: n_train × n_features).
    X_test_scaled : np.ndarray
        Standardised test features (shape: n_test × n_features).
    train_columns : Index or list
        Original feature column names (used to reconstruct DataFrames).
    n_components : int
        Number of GMM mixture components (K).
    random_state : int

    Returns
    -------
    X_train_enhanced : pd.DataFrame
        Training features + GMM cluster probabilities (shape: n_train × (n_features + K)).
    X_test_enhanced : pd.DataFrame
        Test features + GMM cluster probabilities (shape: n_test × (n_features + K)).
    gmm : GaussianMixture
        The fitted GMM model.
    """
    print(f"Fitting GMM with K = {n_components} components...")
    gmm = GaussianMixture(n_components=n_components, random_state=random_state)
    gmm.fit(X_train_scaled)

    # Cluster membership probabilities
    gmm_train_probs = gmm.predict_proba(X_train_scaled)
    gmm_test_probs = gmm.predict_proba(X_test_scaled)

    gmm_cols = [f"GMM_Cluster_{i}" for i in range(n_components)]
    gmm_train_df = pd.DataFrame(gmm_train_probs, columns=gmm_cols)
    gmm_test_df = pd.DataFrame(gmm_test_probs, columns=gmm_cols)

    # Reconstruct scaled DataFrames with column names
    X_train_scaled_df = pd.DataFrame(X_train_scaled, columns=train_columns)
    X_test_scaled_df = pd.DataFrame(X_test_scaled, columns=train_columns)

    X_train_enhanced = pd.concat([X_train_scaled_df, gmm_train_df], axis=1)
    X_test_enhanced = pd.concat([X_test_scaled_df, gmm_test_df], axis=1)

    print(f"Enhanced train shape: {X_train_enhanced.shape}")
    print(f"Enhanced test shape:  {X_test_enhanced.shape}")

    return X_train_enhanced, X_test_enhanced, gmm


def analyze_cluster_composition(gmm: GaussianMixture,
                                 X_train_scaled: np.ndarray,
                                 y_train) -> pd.DataFrame:
    """
    Analyse MoA composition of each GMM cluster (hard assignment).

    Parameters
    ----------
    gmm : GaussianMixture
        Fitted GMM model.
    X_train_scaled : np.ndarray
    y_train : array-like

    Returns
    -------
    pd.DataFrame
        Cluster × MoA value counts.
    """
    cluster_labels = gmm.predict(X_train_scaled)
    df_analysis = pd.DataFrame({"Cluster": cluster_labels, "MoA": y_train})
    composition = df_analysis.groupby("Cluster")["MoA"].value_counts()
    print("\nCluster MoA Composition:\n", composition)
    return composition
