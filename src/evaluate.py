"""
evaluate.py
-----------
Comprehensive evaluation utilities for multi-class MoA classification models.

Computes:
  - Overall and per-class confusion matrices
  - Sensitivity (Recall) and Specificity per MoA
  - Accuracy, Matthews Correlation Coefficient (MCC), ROC-AUC (OvR)

Usage:
    from src.evaluate import evaluate_model_full
"""

import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    matthews_corrcoef,
    roc_auc_score,
    classification_report,
)
from sklearn.preprocessing import label_binarize


def evaluate_model_full(model_name: str,
                        y_test,
                        y_pred,
                        y_prob,
                        label_encoder,
                        save_results: bool = True,
                        results_dir: str = "results/metrics"):
    """
    Full evaluation of a multi-class classifier.

    Parameters
    ----------
    model_name : str
        Name used for titles and output file names.
    y_test : array-like
        True encoded labels.
    y_pred : array-like
        Predicted encoded labels.
    y_prob : np.ndarray
        Predicted class probabilities (shape: n_samples × n_classes).
    label_encoder : LabelEncoder
        Fitted LabelEncoder for decoding class indices to MoA names.
    save_results : bool
        Whether to save per-class and overall metrics to Excel files.
    results_dir : str
        Directory to save Excel output.

    Returns
    -------
    dict
        Dictionary with keys: accuracy, mcc, roc_auc.
    """
    import os
    os.makedirs(results_dir, exist_ok=True)

    classes = label_encoder.classes_
    print(f"\n{'='*40}")
    print(f"MODEL: {model_name}")
    print(f"{'='*40}")

    # ── Overall Confusion Matrix ─────────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred)
    print("\nOverall Confusion Matrix:\n", cm)

    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=classes, yticklabels=classes)
    plt.xlabel("Predicted MoA")
    plt.ylabel("Actual MoA")
    plt.title(f"{model_name} — Overall Confusion Matrix")
    plt.tight_layout()
    plt.savefig(f"{results_dir}/{model_name}_confusion_matrix.png", dpi=150)
    plt.show()

    # ── Per-class TP / FP / FN / TN ─────────────────────────────────────────
    TP = np.diag(cm)
    FP = np.sum(cm, axis=0) - TP
    FN = np.sum(cm, axis=1) - TP
    TN = np.sum(cm) - (TP + FP + FN)

    # ── Per-MoA Binary Confusion Matrices ───────────────────────────────────
    per_moa_cm_list = []
    for i, moa in enumerate(classes):
        tp, fp, fn, tn = TP[i], FP[i], FN[i], TN[i]
        cm_moa = np.array([[tp, fn], [fp, tn]])
        print(f"\nConfusion Matrix for MoA: {moa}")
        print(cm_moa)

        plt.figure(figsize=(4, 4))
        sns.heatmap(cm_moa, annot=True, fmt="d", cmap="Blues",
                    xticklabels=[f"Pred {moa}", "Pred Other"],
                    yticklabels=[f"Act {moa}", "Act Other"])
        plt.title(f"{model_name} — {moa}")
        plt.tight_layout()
        plt.savefig(f"{results_dir}/{model_name}_{moa.replace(' ', '_')}_cm.png", dpi=100)
        plt.show()
        per_moa_cm_list.append({"MoA": moa, "TP": tp, "FN": fn, "FP": fp, "TN": tn})

    per_moa_cm_df = pd.DataFrame(per_moa_cm_list)

    # ── Sensitivity & Specificity per MoA ───────────────────────────────────
    sensitivity = TP / (TP + FN + 1e-9)
    specificity = TN / (TN + FP + 1e-9)

    per_class_df = pd.DataFrame({
        "MoA": classes,
        "TP": TP, "FP": FP, "FN": FN, "TN": TN,
        "Sensitivity": sensitivity,
        "Specificity": specificity,
    })
    print("\nPer-MoA Metrics:\n", per_class_df.to_string(index=False))

    if save_results:
        per_class_df.to_excel(f"{results_dir}/{model_name}_per_MoA_metrics.xlsx", index=False)
        per_moa_cm_df.to_excel(f"{results_dir}/{model_name}_per_moa_confusion_matrix.xlsx", index=False)

    # ── Overall Aggregated Metrics ────────────────────────────────────────────
    overall_sens = TP.sum() / (TP.sum() + FN.sum())
    overall_spec = TN.sum() / (TN.sum() + FP.sum())
    acc = accuracy_score(y_test, y_pred)
    mcc = matthews_corrcoef(y_test, y_pred)

    y_test_bin = label_binarize(y_test, classes=np.unique(y_test))
    auc = roc_auc_score(y_test_bin, y_prob, multi_class="ovr")

    print(f"\nAccuracy:  {acc:.4f}")
    print(f"MCC:       {mcc:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    print(f"Overall Sensitivity: {overall_sens:.4f}")
    print(f"Overall Specificity: {overall_spec:.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred, target_names=classes)}")

    overall_df = pd.DataFrame({
        "Metric": ["Accuracy", "MCC", "ROC-AUC", "Sensitivity", "Specificity"],
        "Value": [acc, mcc, auc, overall_sens, overall_spec]
    })
    if save_results:
        overall_df.to_excel(f"{results_dir}/{model_name}_overall_metrics.xlsx", index=False)

    return {"accuracy": acc, "mcc": mcc, "roc_auc": auc}
