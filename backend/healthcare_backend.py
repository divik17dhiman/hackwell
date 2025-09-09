import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pickle
import json
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
from sklearn.model_selection import train_test_split, StratifiedKFold, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (roc_auc_score, average_precision_score, 
                           confusion_matrix, classification_report,
                           roc_curve, precision_recall_curve, calibration_curve)
import lightgbm as lgb
import shap

# API Framework
from flask import Flask, request, jsonify
from flask_cors import CORS

# Plotting
import matplotlib.pyplot as plt
import seaborn as sns
plt.style.use('default')

class HealthcareRiskPredictor:
    """
    Complete healthcare risk prediction backend system
    """
    
    def __init__(self, data_path='synthetic_healthcare_dataset.csv', 
                 events_path='deterioration_events.csv', 
                 demographics_path='patient_demographics.csv'):
        """
        Initialize the risk prediction system
        
        Args:
            data_path (str): Path to main dataset CSV
            events_path (str): Path to events CSV  
            demographics_path (str): Path to demographics CSV
        """
        self.data_path = data_path
        self.events_path = events_path
        self.demographics_path = demographics_path
        
        # Model components
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.model_metrics = {}
        self.shap_explainer = None
        
        # Data storage
        self.raw_data = None
        self.processed_data = None
        self.events_data = None
        self.demographics_data = None
        
        print("Healthcare Risk Prediction System initialized")
    
    def load_data(self):
        """Load all CSV files and perform initial validation"""
        print("Loading data files...")
        
        try:
            # Load main dataset
            self.raw_data = pd.read_csv(self.data_path)
            self.raw_data['date'] = pd.to_datetime(self.raw_data['date'])
            
            # Load events data
            self.events_data = pd.read_csv(self.events_path)
            if not self.events_data.empty:
                self.events_data['event_date'] = pd.to_datetime(self.events_data['event_date'])
            
            # Load demographics
            self.demographics_data = pd.read_csv(self.demographics_path)
            
            print(f"✓ Loaded main dataset: {self.raw_data.shape}")
            print(f"✓ Loaded events data: {self.events_data.shape}")
            print(f"✓ Loaded demographics: {self.demographics_data.shape}")
            
            # Validate data integrity
            self._validate_data()
            
        except Exception as e:
            print(f"❌ Error loading data: {str(e)}")
            raise
    
    def _validate_data(self):
        """Validate data integrity and consistency"""
        print("Validating data integrity...")
        
        # Check for required columns
        required_cols = ['patient_id', 'date', 'deterioration_90d']
        missing_cols = [col for col in required_cols if col not in self.raw_data.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Check date ranges
        date_range = (self.raw_data['date'].max() - self.raw_data['date'].min()).days
        print(f"✓ Date range: {date_range} days")
        
        # Check target distribution
        target_dist = self.raw_data['deterioration_90d'].value_counts()
        print(f"✓ Target distribution: {dict(target_dist)}")
        
        # Check for data quality issues
        missing_pct = self.raw_data.isnull().sum().sum() / (self.raw_data.shape[0] * self.raw_data.shape[1]) * 100
        print(f"✓ Missing data: {missing_pct:.2f}%")
        
        print("Data validation complete ✓")
    
    def preprocess_data(self):
        """Comprehensive data preprocessing and feature engineering"""
        print("Starting data preprocessing...")
        
        df = self.raw_data.copy()
        
        # 1. Handle missing values
        print("- Handling missing values...")
        
        # Forward fill lab values within patients
        lab_cols = ['hba1c', 'creatinine', 'egfr', 'cholesterol_total', 'cholesterol_ldl']
        for col in lab_cols:
            if col in df.columns:
                df[col] = df.groupby('patient_id')[col].fillna(method='ffill')
                df[col] = df.groupby('patient_id')[col].fillna(method='bfill')
        
        # Fill vital signs with patient-specific medians
        vital_cols = ['weight_kg', 'glucose_mg_dl', 'systolic_bp', 'diastolic_bp', 'heart_rate']
        for col in vital_cols:
            if col in df.columns:
                df[col] = df.groupby('patient_id')[col].fillna(
                    df.groupby('patient_id')[col].transform('median')
                )
        
        # Fill lifestyle data with population medians
        lifestyle_cols = ['steps', 'exercise_minutes', 'sleep_hours']
        for col in lifestyle_cols:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        # 2. Create advanced clinical features
        print("- Engineering clinical features...")
        
        # Time in range features (glucose)
        if 'glucose_mg_dl' in df.columns:
            df['glucose_tir'] = ((df['glucose_mg_dl'] >= 70) & (df['glucose_mg_dl'] <= 180)).astype(int)
            df['glucose_very_high'] = (df['glucose_mg_dl'] > 250).astype(int)
            df['glucose_very_low'] = (df['glucose_mg_dl'] < 70).astype(int)
        
        # Blood pressure control
        if 'systolic_bp' in df.columns and 'diastolic_bp' in df.columns:
            df['bp_controlled'] = ((df['systolic_bp'] < 140) & (df['diastolic_bp'] < 90)).astype(int)
            df['hypertensive_crisis'] = ((df['systolic_bp'] > 180) | (df['diastolic_bp'] > 120)).astype(int)
        
        # Weight stability
        if 'weight_kg' in df.columns:
            df['weight_change_7d'] = df.groupby('patient_id')['weight_kg'].pct_change(periods=7)
            df['rapid_weight_gain'] = (df['weight_change_7d'] > 0.02).astype(int)  # >2% in 7 days
        
        # Medication adherence categories
        if 'adherence_avg' in df.columns:
            df['adherence_excellent'] = (df['adherence_avg'] >= 0.9).astype(int)
            df['adherence_poor'] = (df['adherence_avg'] < 0.7).astype(int)
        
        # 3. Create time-based features
        print("- Creating time-based features...")
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Days since start of monitoring
        df['days_since_start'] = df.groupby('patient_id')['date'].rank() - 1
        
        # 4. Create rolling aggregation features
        print("- Computing rolling aggregations...")
        self._create_rolling_features(df)
        
        # 5. Create patient-level risk features
        print("- Computing patient risk features...")
        self._create_patient_risk_features(df)
        
        # 6. Handle categorical variables
        print("- Encoding categorical variables...")
        categorical_cols = ['primary_condition', 'baseline_risk', 'gender', 'smoking_history']
        le_dict = {}
        
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                le_dict[col] = le
        
        # 7. Remove highly correlated features
        print("- Removing highly correlated features...")
        df_numeric = df.select_dtypes(include=[np.number])
        correlation_matrix = df_numeric.corr().abs()
        upper_triangle = correlation_matrix.where(
            np.triu(np.ones(correlation_matrix.shape), k=1).astype(bool)
        )
        
        # Find features with correlation > 0.95
        high_corr_features = [column for column in upper_triangle.columns 
                             if any(upper_triangle[column] > 0.95)]
        df = df.drop(columns=high_corr_features)
        
        print(f"- Removed {len(high_corr_features)} highly correlated features")
        
        self.processed_data = df
        print(f"✓ Preprocessing complete. Final shape: {df.shape}")
        
        return df
    
    def _create_rolling_features(self, df):
        """Create rolling window features for time series analysis"""
        
        # Sort by patient and date
        df_sorted = df.sort_values(['patient_id', 'date'])
        
        # Define windows and features
        windows = [7, 14, 30]
        rolling_cols = ['glucose_mg_dl', 'weight_kg', 'systolic_bp', 'heart_rate', 
                       'adherence_avg', 'steps', 'sleep_hours']
        
        for window in windows:
            for col in rolling_cols:
                if col in df.columns:
                    # Rolling mean
                    df[f'{col}_mean_{window}d'] = df_sorted.groupby('patient_id')[col].rolling(
                        window=window, min_periods=1
                    ).mean().reset_index(0, drop=True)
                    
                    # Rolling standard deviation
                    df[f'{col}_std_{window}d'] = df_sorted.groupby('patient_id')[col].rolling(
                        window=window, min_periods=1
                    ).std().reset_index(0, drop=True)
                    
                    # Rolling trend (slope)
                    def calculate_slope(series):
                        if len(series.dropna()) < 2:
                            return 0
                        x = np.arange(len(series))
                        y = series.values
                        valid_idx = ~np.isnan(y)
                        if np.sum(valid_idx) < 2:
                            return 0
                        return np.polyfit(x[valid_idx], y[valid_idx], 1)[0]
                    
                    df[f'{col}_slope_{window}d'] = df_sorted.groupby('patient_id')[col].rolling(
                        window=window, min_periods=2
                    ).apply(calculate_slope).reset_index(0, drop=True)
    
    def _create_patient_risk_features(self, df):
        """Create patient-level risk assessment features"""
        
        # Aggregate patient-level features
        patient_features = df.groupby('patient_id').agg({
            'age': 'first',
            'comorbidity_count': 'first',
            'bmi': 'first',
            'glucose_mg_dl': ['mean', 'std', 'max', 'min'],
            'systolic_bp': ['mean', 'std', 'max'],
            'weight_kg': ['mean', 'std'],
            'adherence_avg': ['mean', 'min'],
            'steps': ['mean', 'std'],
            'glucose_tir': 'mean',
            'bp_controlled': 'mean'
        }).fillna(0)
        
        # Flatten column names
        patient_features.columns = ['_'.join(col).strip() for col in patient_features.columns]
        patient_features = patient_features.reset_index()
        
        # Create composite risk scores
        patient_features['glucose_variability_score'] = (
            patient_features['glucose_mg_dl_std'] / patient_features['glucose_mg_dl_mean']
        ).fillna(0)
        
        patient_features['bp_risk_score'] = (
            (patient_features['systolic_bp_mean'] > 140).astype(int) +
            (patient_features['systolic_bp_max'] > 180).astype(int)
        )
        
        patient_features['adherence_risk_score'] = (
            (patient_features['adherence_avg_mean'] < 0.8).astype(int) +
            (patient_features['adherence_avg_min'] < 0.6).astype(int)
        )
        
        # Merge back to main dataframe
        risk_cols = ['patient_id', 'glucose_variability_score', 'bp_risk_score', 'adherence_risk_score']
        df = df.merge(patient_features[risk_cols], on='patient_id', how='left')
    
    def prepare_ml_dataset(self, lookback_days=30):
        """
        Prepare dataset for machine learning with proper temporal splits
        
        Args:
            lookback_days (int): Number of days of historical data to use for prediction
        """
        print(f"Preparing ML dataset with {lookback_days}-day lookback...")
        
        df = self.processed_data.copy()
        
        # Create prediction dataset by taking the last N days for each patient
        prediction_data = []
        
        for patient_id in df['patient_id'].unique():
            patient_data = df[df['patient_id'] == patient_id].sort_values('date')
            
            # Skip patients with insufficient data
            if len(patient_data) < lookback_days:
                continue
            
            # Take the most recent data for prediction
            recent_data = patient_data.tail(lookback_days)
            
            # Aggregate features for this patient
            patient_features = {
                'patient_id': patient_id,
                'target': patient_data['deterioration_90d'].iloc[-1]  # Target from latest record
            }
            
            # Demographic features (static)
            static_cols = ['age', 'comorbidity_count', 'bmi', 'primary_condition_encoded', 
                          'baseline_risk_encoded', 'gender_encoded']
            for col in static_cols:
                if col in recent_data.columns:
                    patient_features[col] = recent_data[col].iloc[-1]
            
            # Latest values
            latest_cols = ['glucose_mg_dl', 'weight_kg', 'systolic_bp', 'diastolic_bp',
                          'heart_rate', 'adherence_avg', 'steps', 'sleep_hours', 'hba1c',
                          'creatinine', 'egfr']
            for col in latest_cols:
                if col in recent_data.columns:
                    patient_features[f'{col}_latest'] = recent_data[col].iloc[-1]
            
            # Rolling features (use latest computed values)
            rolling_cols = [col for col in recent_data.columns if any(
                suffix in col for suffix in ['_mean_', '_std_', '_slope_']
            )]
            for col in rolling_cols:
                if col in recent_data.columns:
                    patient_features[col] = recent_data[col].iloc[-1]
            
            # Clinical risk indicators
            risk_cols = ['glucose_tir', 'bp_controlled', 'glucose_variability_score',
                        'bp_risk_score', 'adherence_risk_score']
            for col in risk_cols:
                if col in recent_data.columns:
                    if col.endswith('_score'):
                        patient_features[col] = recent_data[col].iloc[-1]
                    else:
                        patient_features[col] = recent_data[col].mean()
            
            prediction_data.append(patient_features)
        
        # Convert to DataFrame
        ml_df = pd.DataFrame(prediction_data)
        
        # Remove rows with too many missing values
        ml_df = ml_df.dropna(thresh=len(ml_df.columns) * 0.8)  # Keep rows with at least 80% non-null
        
        # Fill remaining missing values
        numeric_cols = ml_df.select_dtypes(include=[np.number]).columns
        ml_df[numeric_cols] = ml_df[numeric_cols].fillna(ml_df[numeric_cols].median())
        
        print(f"✓ ML dataset prepared: {ml_df.shape}")
        print(f"✓ Features: {len(ml_df.columns) - 2}")  # Subtract patient_id and target
        print(f"✓ Positive cases: {ml_df['target'].sum()}/{len(ml_df)} ({ml_df['target'].mean():.3f})")
        
        return ml_df
    
    def train_models(self, ml_df, test_size=0.2, random_state=42):
        """
        Train multiple models and select the best one
        
        Args:
            ml_df (DataFrame): Prepared ML dataset
            test_size (float): Proportion of data for testing
            random_state (int): Random state for reproducibility
        """
        print("Starting model training...")
        
        # Prepare features and target
        feature_cols = [col for col in ml_df.columns if col not in ['patient_id', 'target']]
        X = ml_df[feature_cols].copy()
        y = ml_df['target'].copy()
        
        self.feature_names = feature_cols
        print(f"Training with {len(feature_cols)} features")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models to try
        models = {
            'LightGBM': lgb.LGBMClassifier(
                n_estimators=500,
                learning_rate=0.05,
                max_depth=6,
                min_child_samples=20,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=random_state,
                verbose=-1
            ),
            'Random Forest': RandomForestClassifier(
                n_estimators=300,
                max_depth=8,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=random_state
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=6,
                random_state=random_state
            ),
            'Logistic Regression': LogisticRegression(
                random_state=random_state,
                max_iter=1000
            )
        }
        
        # Train and evaluate models
        model_results = {}
        
        for name, model in models.items():
            print(f"\n🔄 Training {name}...")
            
            try:
                # Use scaled data for LR, original for tree-based models
                if name == 'Logistic Regression':
                    model.fit(X_train_scaled, y_train)
                    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
                    y_pred = model.predict(X_test_scaled)
                else:
                    model.fit(X_train, y_train)
                    y_pred_proba = model.predict_proba(X_test)[:, 1]
                    y_pred = model.predict(X_test)
                
                # Calculate metrics
                auc = roc_auc_score(y_test, y_pred_proba)
                auprc = average_precision_score(y_test, y_pred_proba)
                cm = confusion_matrix(y_test, y_pred)
                
                model_results[name] = {
                    'model': model,
                    'auc': auc,
                    'auprc': auprc,
                    'confusion_matrix': cm,
                    'predictions': y_pred_proba,
                    'actual': y_test
                }
                
                print(f"  ✓ AUC: {auc:.4f}")
                print(f"  ✓ AUPRC: {auprc:.4f}")
                
            except Exception as e:
                print(f"  ❌ Error training {name}: {str(e)}")
        
        # Select best model based on AUC
        best_model_name = max(model_results.keys(), key=lambda k: model_results[k]['auc'])
        self.model = model_results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        
        # Store comprehensive metrics for the best model
        self.model_metrics = {
            'best_model': best_model_name,
            'auc': model_results[best_model_name]['auc'],
            'auprc': model_results[best_model_name]['auprc'],
            'confusion_matrix': model_results[best_model_name]['confusion_matrix'],
            'all_results': model_results
        }
        
        # Calculate additional metrics
        y_test_pred = model_results[best_model_name]['predictions']
        
        # Calibration
        fraction_of_positives, mean_predicted_value = calibration_curve(
            y_test, y_test_pred, n_bins=10
        )
        self.model_metrics['calibration'] = {
            'fraction_of_positives': fraction_of_positives,
            'mean_predicted_value': mean_predicted_value
        }
        
        # Feature importance (for tree-based models)
        if hasattr(self.model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': self.feature_names,
                'importance': self.model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            self.model_metrics['feature_importance'] = feature_importance
        
        # Setup SHAP explainer
        try:
            if best_model_name == 'Logistic Regression':
                self.shap_explainer = shap.LinearExplainer(self.model, X_train_scaled)
            else:
                self.shap_explainer = shap.TreeExplainer(self.model)
                
            print("✓ SHAP explainer initialized")
        except Exception as e:
            print(f"⚠️ Warning: Could not initialize SHAP explainer: {str(e)}")
        
        print(f"\n✅ Model training complete!")
        return self.model_metrics
    
    def predict_patient_risk(self, patient_id):
        """
        Generate risk prediction and explanation for a specific patient
        
        Args:
            patient_id (str): Patient identifier
            
        Returns:
            dict: Comprehensive prediction results
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train_models() first.")
        
        # Get patient data
        patient_data = self.processed_data[
            self.processed_data['patient_id'] == patient_id
        ].sort_values('date')
        
        if patient_data.empty:
            raise ValueError(f"Patient {patient_id} not found")
        
        # Prepare features (similar to ML dataset preparation)
        recent_data = patient_data.tail(30)  # Last 30 days
        
        patient_features = {}
        
        # Static features
        static_cols = ['age', 'comorbidity_count', 'bmi', 'primary_condition_encoded', 
                      'baseline_risk_encoded', 'gender_encoded']
        for col in static_cols:
            if col in recent_data.columns:
                patient_features[col] = recent_data[col].iloc[-1]
        
        # Latest values
        latest_cols = ['glucose_mg_dl', 'weight_kg', 'systolic_bp', 'diastolic_bp',
                      'heart_rate', 'adherence_avg', 'steps', 'sleep_hours', 'hba1c',
                      'creatinine', 'egfr']
        for col in latest_cols:
            if col in recent_data.columns:
                patient_features[f'{col}_latest'] = recent_data[col].iloc[-1]
        
        # Rolling features
        rolling_cols = [col for col in recent_data.columns if any(
            suffix in col for suffix in ['_mean_', '_std_', '_slope_']
        )]
        for col in rolling_cols:
            if col in recent_data.columns:
                patient_features[col] = recent_data[col].iloc[-1]
        
        # Risk indicators
        risk_cols = ['glucose_tir', 'bp_controlled', 'glucose_variability_score',
                    'bp_risk_score', 'adherence_risk_score']
        for col in risk_cols:
            if col in recent_data.columns:
                if col.endswith('_score'):
                    patient_features[col] = recent_data[col].iloc[-1]
                else:
                    patient_features[col] = recent_data[col].mean()
        
        # Create feature vector
        feature_vector = []
        for feature_name in self.feature_names:
            if feature_name in patient_features:
                feature_vector.append(patient_features[feature_name])
            else:
                feature_vector.append(0)  # Default value for missing features
        
        feature_vector = np.array(feature_vector).reshape(1, -1)
        
        # Scale features
        if hasattr(self, 'scaler') and self.scaler is not None:
            if type(self.model).__name__ == 'LogisticRegression':
                feature_vector = self.scaler.transform(feature_vector)
        
        # Make prediction
        risk_probability = self.model.predict_proba(feature_vector)[0, 1]
        risk_class = self.model.predict(feature_vector)[0]
        
        # Risk categorization
        if risk_probability < 0.3:
            risk_category = "Low"
        elif risk_probability < 0.6:
            risk_category = "Medium"
        else:
            risk_category = "High"
        
        # Generate explanations
        explanations = self._generate_explanations(feature_vector, patient_features)
        
        # Get recent trends
        trends = self._analyze_patient_trends(patient_data)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            risk_probability, patient_features, trends
        )
        
        return {
            'patient_id': patient_id,
            'risk_probability': float(risk_probability),
            'risk_category': risk_category,
            'risk_class': int(risk_class),
            'explanations': explanations,
            'trends': trends,
            'recommendations': recommendations,
            'last_updated': datetime.now().isoformat()
        }
    
    def _generate_explanations(self, feature_vector, patient_features):
        """Generate SHAP-based explanations for the prediction"""
        try:
            if self.shap_explainer is None:
                return self._generate_rule_based_explanations(patient_features)
            
            # Calculate SHAP values
            shap_values = self.shap_explainer.shap_values(feature_vector)
            
            if isinstance(shap_values, list):
                shap_values = shap_values[1]  # For binary classification
            
            # Get top contributing features
            shap_df = pd.DataFrame({
                'feature': self.feature_names,
                'shap_value': shap_values[0],
                'feature_value': feature_vector[0]
            })
            
            # Sort by absolute SHAP value
            shap_df['abs_shap'] = np.abs(shap_df['shap_value'])
            top_features = shap_df.nlargest(5, 'abs_shap')
            
            explanations = []
            for _, row in top_features.iterrows():
                direction = "increases" if row['shap_value'] > 0 else "decreases"
                feature_readable = self._make_feature_readable(row['feature'])
                
                explanations.append({
                    'factor': feature_readable,
                    'impact': direction + " risk",
                    'magnitude': abs(row['shap_value']),
                    'value': row['feature_value']
                })
            
            return explanations
            
        except Exception as e:
            print(f"SHAP explanation failed: {e}")
            return self._generate_rule_based_explanations(patient_features)
    
    def _generate_rule_based_explanations(self, patient_features):
        """Generate rule-based explanations when SHAP is not available"""
        explanations = []
        
        # Glucose control
        if 'glucose_mg_dl_latest' in patient_features:
            glucose = patient_features['glucose_mg_dl_latest']
            if glucose > 200:
                explanations.append({
                    'factor': 'Recent glucose levels',
                    'impact': 'increases risk',
                    'magnitude': 0.8,
                    'value': glucose
                })
        
        # Blood pressure
        if 'systolic_bp_latest' in patient_features:
            bp = patient_features['systolic_bp_latest']
            if bp > 150:
                explanations.append({
                    'factor': 'Blood pressure control',
                    'impact': 'increases risk',
                    'magnitude': 0.6,
                    'value': bp
                })
        
        # Medication adherence
        if 'adherence_avg_latest' in patient_features:
            adherence = patient_features['adherence_avg_latest']
            if adherence < 0.8:
                explanations.append({
                    'factor': 'Medication adherence',
                    'impact': 'increases risk',
                    'magnitude': 0.9,
                    'value': adherence
                })
        
        # Age
        if 'age' in patient_features:
            age = patient_features['age']
            if age > 70:
                explanations.append({
                    'factor': 'Age',
                    'impact': 'increases risk',
                    'magnitude': 0.4,
                    'value': age
                })
        
        return sorted(explanations, key=lambda x: x['magnitude'], reverse=True)[:5]
    
    def _make_feature_readable(self, feature_name):
        """Convert technical feature names to readable descriptions"""
        readable_map = {
            'glucose_mg_dl_latest': 'Recent glucose levels',
            'systolic_bp_latest': 'Recent blood pressure',
            'adherence_avg_latest': 'Medication adherence',
            'weight_kg_latest': 'Current weight',
            'hba1c_latest': 'Long-term glucose control (HbA1c)',
            'glucose_mean_30d': '30-day average glucose',
            'glucose_std_30d': 'Glucose variability (30 days)',
            'weight_change_7d': 'Recent weight change',
            'bp_controlled': 'Blood pressure control',
            'glucose_tir': 'Time in glucose target range',
            'age': 'Age',
            'comorbidity_count': 'Number of chronic conditions',
            'adherence_risk_score': 'Medication adherence pattern',
            'bp_risk_score': 'Blood pressure risk level'
        }
        
        return readable_map.get(feature_name, feature_name.replace('_', ' ').title())
    
    def _analyze_patient_trends(self, patient_data, days=30):
        """Analyze recent trends in patient data"""
        recent_data = patient_data.tail(days)
        
        trends = {}
        
        # Glucose trend
        if 'glucose_mg_dl' in recent_data.columns:
            glucose_data = recent_data['glucose_mg_dl'].dropna()
            if len(glucose_data) >= 7:
                slope = np.polyfit(range(len(glucose_data)), glucose_data, 1)[0]
                trends['glucose_trend'] = {
                    'direction': 'increasing' if slope > 1 else 'decreasing' if slope < -1 else 'stable',
                    'magnitude': abs(slope),
                    'current_avg': glucose_data.tail(7).mean()
                }
        
        # Weight trend
        if 'weight_kg' in recent_data.columns:
            weight_data = recent_data['weight_kg'].dropna()
            if len(weight_data) >= 7:
                slope = np.polyfit(range(len(weight_data)), weight_data, 1)[0]
                trends['weight_trend'] = {
                    'direction': 'increasing' if slope > 0.1 else 'decreasing' if slope < -0.1 else 'stable',
                    'magnitude': abs(slope),
                    'current_avg': weight_data.tail(7).mean()
                }
        
        # Blood pressure trend
        if 'systolic_bp' in recent_data.columns:
            bp_data = recent_data['systolic_bp'].dropna()
            if len(bp_data) >= 7:
                slope = np.polyfit(range(len(bp_data)), bp_data, 1)[0]
                trends['bp_trend'] = {
                    'direction': 'increasing' if slope > 0.5 else 'decreasing' if slope < -0.5 else 'stable',
                    'magnitude': abs(slope),
                    'current_avg': bp_data.tail(7).mean()
                }
        
        # Adherence trend
        if 'adherence_avg' in recent_data.columns:
            adherence_data = recent_data['adherence_avg'].dropna()
            if len(adherence_data) >= 7:
                trends['adherence_trend'] = {
                    'current_avg': adherence_data.tail(7).mean(),
                    'consistency': 1 - adherence_data.tail(7).std()  # Higher is more consistent
                }
        
        return trends
    
    def _generate_recommendations(self, risk_probability, patient_features, trends):
        """Generate actionable clinical recommendations"""
        recommendations = []
        
        # High risk interventions
        if risk_probability > 0.6:
            recommendations.append({
                'priority': 'high',
                'action': 'Schedule immediate clinical assessment',
                'rationale': 'High risk of deterioration in next 90 days',
                'timeframe': 'within 48 hours'
            })
        
        # Glucose management
        if 'glucose_mg_dl_latest' in patient_features:
            glucose = patient_features['glucose_mg_dl_latest']
            if glucose > 180:
                recommendations.append({
                    'priority': 'high',
                    'action': 'Review and adjust diabetes medications',
                    'rationale': f'Recent glucose level {glucose:.0f} mg/dL is above target',
                    'timeframe': 'within 1 week'
                })
            elif glucose > 150:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Increase glucose monitoring frequency',
                    'rationale': f'Glucose level {glucose:.0f} mg/dL trending above target',
                    'timeframe': 'within 2 weeks'
                })
        
        # Medication adherence
        if 'adherence_avg_latest' in patient_features:
            adherence = patient_features['adherence_avg_latest']
            if adherence < 0.7:
                recommendations.append({
                    'priority': 'high',
                    'action': 'Medication adherence counseling and support',
                    'rationale': f'Poor medication adherence ({adherence:.1%})',
                    'timeframe': 'within 1 week'
                })
            elif adherence < 0.8:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Review medication barriers and simplify regimen if possible',
                    'rationale': f'Suboptimal adherence ({adherence:.1%})',
                    'timeframe': 'within 2 weeks'
                })
        
        # Blood pressure management
        if 'systolic_bp_latest' in patient_features:
            bp = patient_features['systolic_bp_latest']
            if bp > 160:
                recommendations.append({
                    'priority': 'high',
                    'action': 'Urgent blood pressure management',
                    'rationale': f'Systolic BP {bp:.0f} mmHg requires immediate attention',
                    'timeframe': 'within 24 hours'
                })
            elif bp > 140:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Optimize antihypertensive therapy',
                    'rationale': f'BP {bp:.0f} mmHg above target',
                    'timeframe': 'within 1 week'
                })
        
        # Weight management
        if 'weight_trend' in trends and trends['weight_trend']['direction'] == 'increasing':
            if trends['weight_trend']['magnitude'] > 0.3:  # >0.3 kg/day trend
                recommendations.append({
                    'priority': 'high',
                    'action': 'Evaluate for fluid retention and heart failure',
                    'rationale': 'Rapid weight gain detected',
                    'timeframe': 'within 48 hours'
                })
        
        # Lab monitoring
        if 'hba1c_latest' in patient_features:
            hba1c = patient_features['hba1c_latest']
            if hba1c > 8.0:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Intensify diabetes management plan',
                    'rationale': f'HbA1c {hba1c:.1f}% above target',
                    'timeframe': 'within 1 week'
                })
        
        # Lifestyle interventions
        if risk_probability > 0.4:
            recommendations.append({
                'priority': 'medium',
                'action': 'Reinforce lifestyle modifications (diet, exercise, stress management)',
                'rationale': 'Elevated risk profile warrants comprehensive lifestyle review',
                'timeframe': 'within 2 weeks'
            })
        
        return sorted(recommendations, key=lambda x: 0 if x['priority'] == 'high' else 1)
    
    def get_cohort_risk_summary(self, risk_threshold=0.3):
        """Generate cohort-level risk summary for dashboard"""
        if self.processed_data is None:
            raise ValueError("Data not processed. Call preprocess_data() first.")
        
        # Get all unique patients
        patients = self.processed_data['patient_id'].unique()
        
        cohort_results = []
        risk_distribution = {'low': 0, 'medium': 0, 'high': 0}
        
        for patient_id in patients:
            try:
                result = self.predict_patient_risk(patient_id)
                cohort_results.append({
                    'patient_id': patient_id,
                    'risk_probability': result['risk_probability'],
                    'risk_category': result['risk_category'],
                    'top_risk_factor': result['explanations'][0]['factor'] if result['explanations'] else 'Unknown'
                })
                
                # Update distribution
                category = result['risk_category'].lower()
                risk_distribution[category] += 1
                
            except Exception as e:
                print(f"Error processing patient {patient_id}: {e}")
                continue
        
        # Sort by risk probability
        cohort_results.sort(key=lambda x: x['risk_probability'], reverse=True)
        
        # Calculate summary statistics
        risk_scores = [r['risk_probability'] for r in cohort_results]
        summary_stats = {
            'total_patients': len(cohort_results),
            'high_risk_count': len([r for r in cohort_results if r['risk_probability'] > 0.6]),
            'medium_risk_count': len([r for r in cohort_results if 0.3 <= r['risk_probability'] <= 0.6]),
            'low_risk_count': len([r for r in cohort_results if r['risk_probability'] < 0.3]),
            'average_risk': np.mean(risk_scores) if risk_scores else 0,
            'risk_distribution': risk_distribution
        }
        
        return {
            'summary_stats': summary_stats,
            'patient_risks': cohort_results,
            'generated_at': datetime.now().isoformat()
        }
    
    def save_model(self, filepath='healthcare_risk_model.pkl'):
        """Save the trained model and components"""
        model_package = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_metrics': self.model_metrics,
            'shap_explainer': self.shap_explainer
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_package, f)
        
        print(f"✓ Model saved to {filepath}")
    
    def load_model(self, filepath='healthcare_risk_model.pkl'):
        """Load a pre-trained model"""
        with open(filepath, 'rb') as f:
            model_package = pickle.load(f)
        
        self.model = model_package['model']
        self.scaler = model_package['scaler']
        self.feature_names = model_package['feature_names']
        self.model_metrics = model_package['model_metrics']
        self.shap_explainer = model_package.get('shap_explainer')
        
        print(f"✓ Model loaded from {filepath}")
    
    def generate_model_report(self):
        """Generate comprehensive model evaluation report"""
        if not self.model_metrics:
            raise ValueError("No model metrics available. Train a model first.")
        
        report = {
            'model_performance': {
                'best_model': self.model_metrics['best_model'],
                'auc_roc': self.model_metrics['auc'],
                'auprc': self.model_metrics['auprc'],
                'confusion_matrix': self.model_metrics['confusion_matrix'].tolist()
            },
            'feature_importance': None,
            'calibration': self.model_metrics.get('calibration'),
            'clinical_interpretation': self._generate_clinical_interpretation()
        }
        
        if 'feature_importance' in self.model_metrics:
            report['feature_importance'] = self.model_metrics['feature_importance'].to_dict('records')
        
        return report
    
    def _generate_clinical_interpretation(self):
        """Generate clinical interpretation of model results"""
        interpretation = {
            'model_reliability': 'Good' if self.model_metrics['auc'] > 0.75 else 'Moderate' if self.model_metrics['auc'] > 0.65 else 'Poor',
            'recommended_use': [],
            'limitations': [],
            'clinical_value': []
        }
        
        auc = self.model_metrics['auc']
        
        if auc > 0.8:
            interpretation['recommended_use'].append("Suitable for clinical decision support")
            interpretation['clinical_value'].append("High discriminative ability for risk stratification")
        elif auc > 0.7:
            interpretation['recommended_use'].append("Useful for population health management")
            interpretation['clinical_value'].append("Moderate ability to identify high-risk patients")
        else:
            interpretation['recommended_use'].append("Requires further development before clinical use")
            interpretation['limitations'].append("Limited discriminative ability")
        
        # Add general limitations
        interpretation['limitations'].extend([
            "Based on synthetic data - requires validation with real clinical data",
            "Performance may vary across different patient populations",
            "Should be used as a decision support tool, not replacement for clinical judgment"
        ])
        
        return interpretation


# Flask API for web interface
class HealthcareAPI:
    """Flask API wrapper for the healthcare risk prediction system"""
    
    def __init__(self, predictor):
        self.predictor = predictor
        self.app = Flask(__name__)
        CORS(self.app)
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup API routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
        
        @self.app.route('/predict/<patient_id>', methods=['GET'])
        def predict_patient(patient_id):
            try:
                result = self.predictor.predict_patient_risk(patient_id)
                return jsonify(result)
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/cohort_summary', methods=['GET'])
        def cohort_summary():
            try:
                result = self.predictor.get_cohort_risk_summary()
                return jsonify(result)
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/model_metrics', methods=['GET'])
        def model_metrics():
            try:
                result = self.predictor.generate_model_report()
                return jsonify(result)
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/patients', methods=['GET'])
        def list_patients():
            try:
                patients = self.predictor.processed_data['patient_id'].unique().tolist()
                return jsonify({'patients': patients, 'count': len(patients)})
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        
        @self.app.route('/patient_details/<patient_id>', methods=['GET'])
        def patient_details(patient_id):
            try:
                patient_data = self.predictor.processed_data[
                    self.predictor.processed_data['patient_id'] == patient_id
                ].tail(30).to_dict('records')
                
                return jsonify({
                    'patient_id': patient_id,
                    'recent_data': patient_data,
                    'record_count': len(patient_data)
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 400
    
    def run(self, host='0.0.0.0', port=5000, debug=True):
        """Run the Flask API server"""
        print(f"🚀 Starting Healthcare Risk Prediction API on http://{host}:{port}")
        self.app.run(host=host, port=port, debug=debug)


# Example usage and main execution
def main():
    """Main execution function demonstrating the complete pipeline"""
    print("🏥 Healthcare Risk Prediction System")
    print("=" * 50)
    
    # Initialize the system
    predictor = HealthcareRiskPredictor(
        data_path='synthetic_healthcare_dataset.csv',
        events_path='deterioration_events.csv',
        demographics_path='patient_demographics.csv'
    )
    
    try:
        # Step 1: Load and validate data
        predictor.load_data()
        
        # Step 2: Preprocess data
        predictor.preprocess_data()
        
        # Step 3: Prepare ML dataset
        ml_dataset = predictor.prepare_ml_dataset(lookback_days=30)
        
        # Step 4: Train models
        metrics = predictor.train_models(ml_dataset)
        
        # Step 5: Save the trained model
        predictor.save_model('trained_healthcare_model.pkl')
        
        # Step 6: Generate model report
        report = predictor.generate_model_report()
        print("\n📊 Model Performance Report:")
        print(f"Best Model: {report['model_performance']['best_model']}")
        print(f"AUC-ROC: {report['model_performance']['auc_roc']:.4f}")
        print(f"AUPRC: {report['model_performance']['auprc']:.4f}")
        
        # Step 7: Test predictions on sample patients
        print("\n🔮 Sample Predictions:")
        sample_patients = predictor.processed_data['patient_id'].unique()[:5]
        
        for patient_id in sample_patients:
            try:
                prediction = predictor.predict_patient_risk(patient_id)
                print(f"\nPatient {patient_id}:")
                print(f"  Risk: {prediction['risk_probability']:.3f} ({prediction['risk_category']})")
                print(f"  Top factor: {prediction['explanations'][0]['factor'] if prediction['explanations'] else 'N/A'}")
            except Exception as e:
                print(f"  Error: {e}")
        
        # Step 8: Generate cohort summary
        print("\n👥 Cohort Risk Summary:")
        cohort_summary = predictor.get_cohort_risk_summary()
        stats = cohort_summary['summary_stats']
        print(f"Total Patients: {stats['total_patients']}")
        print(f"High Risk: {stats['high_risk_count']} ({stats['high_risk_count']/stats['total_patients']:.1%})")
        print(f"Medium Risk: {stats['medium_risk_count']} ({stats['medium_risk_count']/stats['total_patients']:.1%})")
        print(f"Low Risk: {stats['low_risk_count']} ({stats['low_risk_count']/stats['total_patients']:.1%})")
        print(f"Average Risk Score: {stats['average_risk']:.3f}")
        
        # Step 9: Start API server
        print("\n🌐 Starting API server...")
        api = HealthcareAPI(predictor)
        
        print("\nAPI Endpoints:")
        print("- GET /health - Health check")
        print("- GET /predict/<patient_id> - Individual patient prediction")
        print("- GET /cohort_summary - Cohort risk summary")
        print("- GET /model_metrics - Model performance metrics")
        print("- GET /patients - List all patients")
        print("- GET /patient_details/<patient_id> - Patient historical data")
        
        # Uncomment to start the API server
        # api.run(host='0.0.0.0', port=5000, debug=False)
        
        print("\n✅ Healthcare Risk Prediction System is ready!")
        print("📝 Files generated:")
        print("   - trained_healthcare_model.pkl (saved model)")
        print("   - API ready to serve predictions")
        
    except Exception as e:
        print(f"\n❌ Error in main execution: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
