import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight, faArrowLeft, faCheck, faCog, faCreditCard,
  faBell, faShoppingCart, faToggleOn, faToggleOff, faSpinner,
  faExclamationTriangle, faStore, faClock, faPhone, faEnvelope,
  faMapMarkerAlt, faSave
} from '@fortawesome/free-solid-svg-icons';
import { runtimeApi } from '../../api/runtime';
import '../styles/onboarding.css';

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    // Restaurant Profile
    name: '',
    email: '',
    phone: '',
    address: '',
    openingHours: '08:00',
    closingHours: '22:00',
    
    // Payment Settings
    manualPayment: false,
    paymentInstructions: '',
    
    // Order Settings
    acceptOrders: false,
    notifyOnOrder: false,
    autoConfirm: false,
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Check if onboarding is already completed
    const checkOnboardingStatus = async () => {
      try {
        // Redirect if onboarding is already completed
        if (user?.onboarding?.status === 'completed') {
          navigate('/overview', { replace: true });
          return;
        }
        // API call to check if restaurant has completed onboarding
        // For now, we'll assume new restaurants need onboarding
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Restaurant Profile validation
      if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }
    
    if (step === 2) {
      // Payment Settings validation
      if (formData.manualPayment && !formData.paymentInstructions.trim()) {
        newErrors.paymentInstructions = 'Payment instructions are required when manual payment is enabled';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return;
    
    setSaving(true);
    try {
      const restaurantId = user?.restaurantId || 'r1';
      
      // Save all settings using the existing API
      await runtimeApi.updateRestaurantSettings(restaurantId, formData);
      
      // Navigate to dashboard
      navigate('/overview');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({ submit: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <FontAwesomeIcon icon={faStore} className="step-icon" />
              <h2>Restaurant Profile</h2>
              <p>Let's set up your restaurant's basic information</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Restaurant Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Mama Put Kitchen"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contact@restaurant.ng"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+234 801 234 5678"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Street, City, State"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              
              <div className="form-group">
                <label>Opening Hours</label>
                <input
                  type="time"
                  value={formData.openingHours}
                  onChange={(e) => updateField('openingHours', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Closing Hours</label>
                <input
                  type="time"
                  value={formData.closingHours}
                  onChange={(e) => updateField('closingHours', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <FontAwesomeIcon icon={faCreditCard} className="step-icon" />
              <h2>Payment Settings</h2>
              <p>Configure how you want to receive payments</p>
            </div>
            
            <div className="settings-section">
              <div className="toggle-item">
                <div className="toggle-content">
                  <h3>Manual Payment</h3>
                  <p>Accept manual payments (bank transfer, cash on delivery, etc.)</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('manualPayment', !formData.manualPayment)}
                  className="toggle-button"
                >
                  <FontAwesomeIcon icon={formData.manualPayment ? faToggleOn : faToggleOff} />
                </button>
              </div>
              
              {formData.manualPayment && (
                <div className="conditional-field">
                  <label>Payment Instructions *</label>
                  <textarea
                    value={formData.paymentInstructions}
                    onChange={(e) => updateField('paymentInstructions', e.target.value)}
                    placeholder="Provide your bank account details, payment instructions, or other payment methods..."
                    rows={4}
                    className={errors.paymentInstructions ? 'error' : ''}
                  />
                  {errors.paymentInstructions && (
                    <span className="error-message">{errors.paymentInstructions}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="onboarding-step">
            <div className="step-header">
              <FontAwesomeIcon icon={faCog} className="step-icon" />
              <h2>Order Settings</h2>
              <p>Configure how you want to handle orders</p>
            </div>
            
            <div className="settings-section">
              <div className="toggle-item">
                <div className="toggle-content">
                  <h3>Accept Orders</h3>
                  <p>Allow customers to place orders via WhatsApp</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('acceptOrders', !formData.acceptOrders)}
                  className="toggle-button"
                >
                  <FontAwesomeIcon icon={formData.acceptOrders ? faToggleOn : faToggleOff} />
                </button>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-content">
                  <h3>Notify on New Order</h3>
                  <p>Push immediate alerts when a new customer order arrives</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('notifyOnOrder', !formData.notifyOnOrder)}
                  className="toggle-button"
                >
                  <FontAwesomeIcon icon={formData.notifyOnOrder ? faToggleOn : faToggleOff} />
                </button>
              </div>
              
              <div className="toggle-item">
                <div className="toggle-content">
                  <h3>Auto-confirm Orders</h3>
                  <p>Automatically confirm orders without staff review</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('autoConfirm', !formData.autoConfirm)}
                  className="toggle-button"
                >
                  <FontAwesomeIcon icon={formData.autoConfirm ? faToggleOn : faToggleOff} />
                </button>
              </div>
            </div>
            
            {!formData.acceptOrders && (
              <div className="warning-box">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <p>You won't receive any orders until you enable "Accept Orders". You can change this later in Settings.</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="step-indicators">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`step-indicator ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
              >
                {step < currentStep ? <FontAwesomeIcon icon={faCheck} /> : step}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="error-banner">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {errors.submit}
          </div>
        )}

        {/* Step Content */}
        <div className="step-content">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="navigation">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="nav-btn secondary"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
          
          {currentStep === totalSteps ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={saving}
              className="nav-btn primary"
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Completing Setup...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  Complete Setup
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="nav-btn primary"
            >
              Next
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
