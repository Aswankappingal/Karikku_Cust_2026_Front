import React, { useState } from 'react'
import PhoneInput from 'react-phone-input-2';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddressForm.scss'
import baseUrl from '../../../baseUrl';

const AddressForm = ({onClose}) => {
  const [selectedType, setSelectedType] = useState('Home');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: 'James Jacobe',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    saveAs: 'Home'
  });

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

  const validateZipCode = (zipCode) => {
    if (!zipCode || zipCode.trim().length === 0) {
      return 'PIN code is required';
    }
    const cleanZipCode = zipCode.trim();
    if (!/^\d{6}$/.test(cleanZipCode)) {
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
      case 'zipCode':
        return validateZipCode(value);
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
    errors.zipCode = validateZipCode(formData.zipCode);

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

    // Validate field on change
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

    // Validate phone on change
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

  const handleSubmit = async () => {
    // Prevent double submission
    if (isLoading) {
      return;
    }

    // Validate all fields
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare the data according to API requirements
      const addressData = {
        fullName: formData.fullName.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || '',
        phone: phone,
        city: formData.city.trim() || '',
        state: formData.state.trim(),
        country: formData.country,
        zipCode: formData.zipCode.trim(),
        addressType: selectedType
      };

      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('authToken');

      const response = await axios.post(`${baseUrl}/add-address`, addressData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Address added successfully!');
        window.location.reload(); 
      }
    } catch (error) {
      console.error('Error adding address:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data.error || 'Failed to add address';
        toast.error(`Error: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const baseClass = 'form-control';
    return fieldErrors[fieldName] ? `${baseClass} is-invalid` : baseClass;
  };

  return (
    <div className='AddressFormwrapper'>
      <div className="address-form">
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
            <select
              className={getInputClass('state')}
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            >
              <option value="">Select state</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
              <option value="Daman and Diu">Daman and Diu</option>
              <option value="Delhi">Delhi</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>
            {fieldErrors.state && (
              <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                {fieldErrors.state}
              </div>
            )}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-lg-6">
            <label htmlFor="country" className="form-label text-muted small input-label">
              Country
            </label>
            <input
              type="text"
              className="form-control"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder='Enter country here'
              disabled={isLoading}
            />
          </div>

          <div className="col-lg-6">
            <label htmlFor="zipCode" className="form-label text-muted small input-label">
              Pincode/Zip Code*
            </label>
            <input
              type="text"
              className={getInputClass('zipCode')}
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder='Enter pincode here'
              disabled={isLoading}
              required
            />
            {fieldErrors.zipCode && (
              <div className="invalid-feedback d-block" style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                {fieldErrors.zipCode}
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto p-6 bg-white address-type">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Save address as</h3>
          <div className="mb-6 adresses">
            {addressTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleSaveAsChange(type.id)}
                disabled={isLoading}
                className={`rounded-full font-medium transition-all duration-200 ${
                  selectedType === type.id
                    ? 'bg-green-500 text-white shadow-md transform scale-105 selected-type'
                    : 'bg-transparent text-gray-700 hover:bg-gray-200 border border-gray-300 non-selected-type'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="checkout-btn">
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
            style={{
              opacity: (isLoading || Object.keys(fieldErrors).some(key => fieldErrors[key])) ? 0.5 : 1,
              cursor: (isLoading || Object.keys(fieldErrors).some(key => fieldErrors[key])) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Adding Address...' : 'Add Address'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressForm