"""
feature_selection.py
--------------------
Three-stage feature selection for molecular descriptor matrices:
  1. Variance Threshold — remove zero-variance (constant) features
  2. Pearson Correlation — remove highly correlated features (r > threshold)
  3. Random Forest Importance — keep top-K most informative features

All selection steps are fitted on training data only and applied to test data
to prevent data leakage.

Usage:
    from src.feature_selection import select_features
"""

import numpy as np
import pandas as pd
from sklearn.feature_selection import VarianceThreshold
from sklearn.ensemble import RandomForestClassifier


def remove_constant_features(X_train: pd.DataFrame, X_test: pd.DataFrame):
    """
    Remove features with zero variance (constant across all samples).

    Parameters
    ----------
    X_train, X_test : pd.DataFrame

    Returns
    -------
    X_train_out, X_test_out : pd.DataFrame
    selector : VarianceThreshold (fitted)
    """
    selector = VarianceThreshold(threshold=0)
    X_train_out = selector.fit_transform(X_train)
    X_test_out = selector.transform(X_test)

    selected_columns = X_train.columns[selector.get_support()]
    X_train_out = pd.DataFrame(X_train_out, columns=selected_columns)
    X_test_out = pd.DataFrame(X_test_out, columns=selected_columns)

    print(f"After removing constant features: {X_train_out.shape[1]} features remain "
          f"(dropped {X_train.shape[1] - X_train_out.shape[1]})")
    return X_train_out, X_test_out, selector


def remove_correlated_features(X_train: pd.DataFrame, X_test: pd.DataFrame,
                                threshold: float = 0.9):
    """
    Remove features with absolute Pearson correlation > threshold.
    Correlation is computed only on training data.

    Parameters
    ----------
    X_train, X_test : pd.DataFrame
    threshold : float
        Features with r > threshold with any earlier feature are dropped.

    Returns
    -------
    X_train_out, X_test_out : pd.DataFrame
    to_drop : list of str (dropped column names)
    """
    corr_matrix = X_train.corr().abs()
    upper = corr_matrix.where(
        np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
    )
    to_drop = [col for col in upper.columns if any(upper[col] > threshold)]

    X_train_out = X_train.drop(columns=to_drop)
    X_test_out = X_test.drop(columns=to_drop)

    print(f"After correlation removal (r > {threshold}): "
          f"{X_train_out.shape[1]} features remain "
          f"(dropped {len(to_drop)})")
    return X_train_out, X_test_out, to_drop


def select_top_rf_features(X_train: pd.DataFrame, X_test: pd.DataFrame,
                            y_train, top_k: int = 60,
                            n_estimators: int = 400, random_state: int = 42):
    """
    Use Random Forest feature importances to select the top-K features.
    The RF is fitted on training data only.

    Parameters
    ----------
    X_train, X_test : pd.DataFrame
    y_train : array-like
    top_k : int
        Number of features to retain.
    n_estimators : int
    random_state : int

    Returns
    -------
    X_train_out, X_test_out : pd.DataFrame
    importance_series : pd.Series (all features, sorted descending)
    """
    rf = RandomForestClassifier(n_estimators=n_estimators, random_state=random_state)
    rf.fit(X_train, y_train)

    importance = pd.Series(rf.feature_importances_, index=X_train.columns)
    importance = importance.sort_values(ascending=False)

    top_features = importance.head(top_k).index
    X_train_out = X_train[top_features]
    X_test_out = X_test[top_features]

    print(f"Top {top_k} features selected.")
    print(f"Final train shape: {X_train_out.shape} | test shape: {X_test_out.shape}")
    return X_train_out, X_test_out, importance


def select_features(X_train: pd.DataFrame, X_test: pd.DataFrame,
                    y_train, top_k: int = 60,
                    corr_threshold: float = 0.9):
    """
    Run the full three-stage feature selection pipeline.

    Parameters
    ----------
    X_train, X_test : pd.DataFrame
    y_train : array-like
    top_k : int
    corr_threshold : float

    Returns
    -------
    X_train_sel, X_test_sel : pd.DataFrame
    importance : pd.Series
    """
    print("=== Stage 1: Variance Threshold ===")
    X_train_v, X_test_v, _ = remove_constant_features(X_train, X_test)

    print("\n=== Stage 2: Correlation Filtering ===")
    X_train_c, X_test_c, _ = remove_correlated_features(X_train_v, X_test_v, corr_threshold)

    print("\n=== Stage 3: Random Forest Importance ===")
    X_train_sel, X_test_sel, importance = select_top_rf_features(
        X_train_c, X_test_c, y_train, top_k=top_k
    )

    return X_train_sel, X_test_sel, importance
