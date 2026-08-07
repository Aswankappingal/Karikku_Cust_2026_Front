import React, { useState, useEffect } from 'react'
import Modal from 'react-modal';
import PhoneInput from 'react-phone-input-2';
import { toast } from 'react-toastify';
import './AddressModal.scss'

Modal.setAppElement('#root');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    border: 'none',
    borderRadius: '8px',
    maxWidth: '600px',
    width: '90%',
    height: 'auto',
    maxHeight: '85vh',
    overflowY: 'hidden',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  }
};

const AddressModal = ({ isOpen, onClose, onAddAddress, editingAddress }) => {
  const [selectedType, setSelectedType] = useState('Home');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    saveAs: 'Home'
  });

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Initialize form with editing data
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        fullName: editingAddress.fullName || '',
        addressLine1: editingAddress.addressLine1 || '',
        addressLine2: editingAddress.addressLine2 || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        pinCode: editingAddress.zipCode || '',
        saveAs: editingAddress.addressType || 'Home'
      });
      setPhone(editingAddress.phone || '');
      setSelectedType(editingAddress.addressType || 'Home');
    }
  }, [editingAddress]);

  const addressTypes = [
    { id: 'Home', label: 'Home' },
    { id: 'Office', label: 'Office' }
  ];

  // Validation functions
  const validateFullName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Full name cannot exceed 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Full name can only contain letters and spaces';
    }
    return '';
  };

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return 'Phone number is required';
    }
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length !== 12) {
      return 'Phone number must be exactly 12 digits';
    }
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Phone number can only contain digits';
    }
    return '';
  };

  const validateAddress = (address) => {
    if (!address || address.trim().length === 0) {
      return 'Address line 1 is required';
    }
    if (address.trim().length < 5) {
      return 'Address must be at least 5 characters';
    }
    if (address.trim().length > 100) {
      return 'Address cannot exceed 100 characters';
    }
    return '';
  };

  const validateCity = (city) => {
    if (!city || city.trim().length === 0) {
      return 'City name is required';
    }
    if (city.trim().length < 2) {
      return 'City name must be at least 2 characters';
    }
    if (city.trim().length > 50) {
      return 'City name cannot exceed 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(city.trim())) {
      return 'City name can only contain letters and spaces';
    }
    return '';
  };

  const validateState = (state) => {
    if (!state || state.trim().length === 0) {
      return 'State is required';
    }
    if (state.trim().length < 2) {
      return 'State name must be at least 2 characters';
    }
    if (state.trim().length > 50) {
      return 'State name cannot exceed 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(state.trim())) {
      return 'State name can only contain letters and spaces';
    }
    return '';
  };

  const validatePinCode = (pinCode) => {
    if (!pinCode || pinCode.trim().length === 0) {
      return 'PIN code is required';
    }
    const cleanPinCode = pinCode.trim();
    if (!/^\d{6}$/.test(cleanPinCode)) {
      return 'PIN code must be exactly 6 digits';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'phone':
        return validatePhone(value);
      case 'addressLine1':
        return validateAddress(value);
      case 'city':
        return validateCity(value);
      case 'state':
        return validateState(value);
      case 'pinCode':
        return validatePinCode(value);
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {};

    errors.fullName = validateFullName(formData.fullName);
    errors.phone = validatePhone(phone);
    errors.addressLine1 = validateAddress(formData.addressLine1);
    errors.city = validateCity(formData.city);
    errors.state = validateState(formData.state);
    errors.pinCode = validatePinCode(formData.pinCode);

    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handlePhoneChange = (value) => {
    // Truncate to 12 digits
    const truncatedValue = value.slice(0, 12);
    setPhone(truncatedValue);

    const phoneError = validateField('phone', truncatedValue);
    setFieldErrors(prev => ({
      ...prev,
      phone: phoneError
    }));
  };

  const handleSaveAsChange = (type) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      saveAs: type
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pinCode: '',
      saveAs: 'Home'
    });
    setPhone('');
    setSelectedType('Home');
    setFieldErrors({});
  };

 // Replace the handleSubmit function in AddressModal.js with this

const handleSubmit = async (e) => {
  e.preventDefault();

  // Prevent double submission
  if (isSubmitting) {
    return;
  }

  // Validate all fields
  const errors = validateForm();

  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    return;
  }

  setIsSubmitting(true);

  try {
    // Prepare data for parent component
    const addressData = {
      ...(editingAddress?.id && { id: editingAddress.id }),
      fullName: formData.fullName.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || '',
      city: formData.city.trim() || '',
      state: formData.state.trim(),
      country: 'India',
      zipCode: formData.pinCode.trim(),
      addressType: selectedType,
      phone: phone
    };

    // Call parent callback
    if (onAddAddress && typeof onAddAddress === 'function') {
      const result = await onAddAddress(addressData);
      
      // Check if there was an error
      if (result?.error) {
        // Show error but keep modal open
        toast.error(result.error.message || 'Failed to save address. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Check for explicit success
      if (result?.success === true || !result?.error) {
        // Success - reset form and close modal
        resetForm();
        onClose();
        
        // Show success message
        const successMessage = editingAddress 
          ? 'Address updated successfully!' 
          : 'Address added successfully!';
        toast.success(successMessage);
      } else {
        // Unexpected response format
        toast.warn('Unexpected response. Please check if the address was saved.');
        setIsSubmitting(false);
      }
    } else {
      throw new Error('onAddAddress callback is not defined');
    }
  } catch (error) {
    console.error('Error in form submission:', error);
    toast.error(error.message || 'Failed to save address. Please try again.');
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const getInputClass = (fieldName) => {
    const baseClass = 'form-control';
    return fieldErrors[fieldName] ? `${baseClass} is-invalid` : baseClass;
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel}
      style={customStyles}
      contentLabel="Add New Address Modal"
    >
      <div className='AddressFormwrapper' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ padding: '8px 20px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="address-form" style={{ padding: '20px', flex: 1 }}>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label htmlFor="fullName" className="form-label text-muted small input-label">
                  Enter your full name*
                </label>
                <input
                  type="text"
                  className={getInputClass('fullName')}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder='Enter Full name here'
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.fullName && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.fullName}
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <label htmlFor="phone" className="form-label text-muted small input-label">
                  Phone*
                </label>
                <PhoneInput
                  country={'in'}
                  value={phone}
                  onChange={handlePhoneChange}
                  enableSearch={true}
                  disableCountryCode={true}
                  disableDropdown={false}
                  disabled={isSubmitting}
                  masks={{ in: '............' }}
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: false
                  }}
                  containerClass={`custom-phone-container ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  inputClass={`custom-phone-input ${fieldErrors.phone ? 'is-invalid' : ''}`}
                  buttonClass="custom-flag-dropdown"
                />
                {fieldErrors.phone && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label htmlFor="addressLine1" className="form-label text-muted small input-label">
                  Address line 1*
                </label>
                <input
                  type="text"
                  className={getInputClass('addressLine1')}
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  placeholder='Enter address here'
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.addressLine1 && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.addressLine1}
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <label htmlFor="addressLine2" className="form-label text-muted small input-label">
                  Address line 2
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder='Enter address here'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label htmlFor="city" className="form-label text-muted small input-label">
                  City*
                </label>
                <input
                  type="text"
                  className={getInputClass('city')}
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder='Enter city here'
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.city && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.city}
                  </div>
                )}
              </div>

              <div className="col-lg-6">
                <label htmlFor="state" className="form-label text-muted small input-label">
                  State*
                </label>
                <input
                  type="text"
                  className={getInputClass('state')}
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder='Enter state here'
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.state && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.state}
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label htmlFor="pinCode" className="form-label text-muted small input-label">
                  Pincode*
                </label>
                <input
                  type="text"
                  className={getInputClass('pinCode')}
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder='Enter pincode here'
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.pinCode && (
                  <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                    {fieldErrors.pinCode}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-md mx-auto p-1 bg-white address-type" style={{ padding: '20px 0' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Save address as</h3>
              <div className="mb-6 adresses">
                {addressTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSaveAsChange(type.id)}
                    disabled={isSubmitting}
                    className={`rounded-full font-medium transition-all duration-200 ${selectedType === type.id
                      ? 'bg-green-500 text-white shadow-md transform scale-105 selected-type'
                      : 'bg-transparent text-gray-700 hover:bg-gray-200 border border-gray-300 non-selected-type'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="checkout-btn" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '20px' }}>
              <button
                className='cancel-btn'
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                style={{
                  marginRight: '10px',
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key])}
                style={{
                  opacity: (isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key])) ? 0.5 : 1,
                  cursor: (isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key])) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? (editingAddress ? 'Updating...' : 'Adding...') : (editingAddress ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddressModal