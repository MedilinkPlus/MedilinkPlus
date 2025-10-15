'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import InterpreterBottomNavigation from '@/components/InterpreterBottomNavigation';
import Link from 'next/link';

export default function InterpreterProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const [profileData, setProfileData] = useState({
    name: 'Sarah Kim',
    age: 28,
    gender: 'Female',
    phone: '+82-10-1234-5678',
    email: 'sarah.interpreter@email.com',
    lineId: 'sarah_medilink',
    location: 'Seoul, South Korea',
    experience: 5,
    rating: 4.9,
    reviewCount: 142,
    photo: 'https://readdy.ai/api/search-image?query=Professional%20female%20medical%20interpreter%2C%20Asian%20woman%2C%20friendly%20smile%2C%20business%20casual%20attire%2C%20medical%20facility%20background%2C%20professional%20headshot%2C%20confident%20expression%2C%20healthcare%20worker&width=300&height=300&seq=interpreter-profile-main&orientation=squarish',
    specialties: ['Dental Care', 'Plastic Surgery', 'General Consultation', 'Dermatology'],
    hospitals: ['Seoul Dental Excellence', 'Gangnam Beauty Clinic', 'Myeongdong Medical Center', 'Samsung Medical Center'],
    bio: 'Experienced medical interpreter with 5+ years helping international patients navigate Korean healthcare. Fluent in Thai, Korean, and English.',
    currentCustomers: 8
  });

  const allReviews = [
    {
      id: 1,
      rating: 5,
      comment: 'Sarah was incredibly helpful during my dental procedure. She explained everything clearly and made me feel comfortable throughout the entire process.',
      date: '2024-02-10',
      customerInitials: 'S.T.',
      treatment: 'Dental Implant'
    },
    {
      id: 2,
      rating: 5,
      comment: 'Professional and kind interpreter. Really helped me understand the doctor and the treatment process. Highly recommended!',
      date: '2024-02-08',
      customerInitials: 'P.S.',
      treatment: 'Rhinoplasty Consultation'
    },
    {
      id: 3,
      rating: 4,
      comment: 'Good interpreter, arrived on time and was well prepared. Would recommend to other Thai patients visiting Korea.',
      date: '2024-02-05',
      customerInitials: 'N.K.',
      treatment: 'Dental Check-up'
    },
    {
      id: 4,
      rating: 5,
      comment: 'Excellent service! Sarah made my hospital visit so much easier. She was patient and explained everything in detail.',
      date: '2024-02-03',
      customerInitials: 'W.M.',
      treatment: 'Cardiology Consultation'
    },
    {
      id: 5,
      rating: 5,
      comment: 'Very professional and helpful. Sarah went above and beyond to ensure I understood all the medical information.',
      date: '2024-02-01',
      customerInitials: 'L.P.',
      treatment: 'Dermatology Treatment'
    },
    {
      id: 6,
      rating: 4,
      comment: 'Great interpreter service. Sarah was knowledgeable and made the appointment process smooth.',
      date: '2024-01-28',
      customerInitials: 'M.T.',
      treatment: 'General Surgery Consultation'
    },
    {
      id: 7,
      rating: 5,
      comment: 'Outstanding service! Sarah is very experienced and professional. Made my medical visit stress-free.',
      date: '2024-01-25',
      customerInitials: 'R.S.',
      treatment: 'Plastic Surgery Consultation'
    },
    {
      id: 8,
      rating: 5,
      comment: 'Highly recommend Sarah for medical interpretation. She is patient, kind, and very knowledgeable.',
      date: '2024-01-22',
      customerInitials: 'K.L.',
      treatment: 'Dental Treatment'
    }
  ];

  const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
  const currentReviews = allReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const openReviewsModal = () => {
    setShowReviewsModal(true);
    setCurrentPage(1);
  };

  const closeReviewsModal = () => {
    setShowReviewsModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="pt-4">
        {/* Profile Header */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div 
              className="w-24 h-24 rounded-full bg-cover bg-center bg-top mx-auto mb-4"
              style={{ backgroundImage: `url(${profileData.photo})` }}
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{profileData.name}</h1>
            <div className="flex items-center justify-center mb-4">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-star-fill text-yellow-400"></i>
              </div>
              <span className="text-lg font-semibold text-gray-800 mr-1">{profileData.rating}</span>
              <span className="text-gray-500">({profileData.reviewCount} reviews)</span>
            </div>
            <button 
              onClick={openEditModal}
              className="bg-[#A8E6CF] text-white px-6 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-user-line text-[#A8E6CF]"></i>
                </div>
                <span className="text-gray-500 text-sm">Age</span>
              </div>
              <p className="font-semibold text-gray-800">{profileData.age} years</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-genderless-line text-[#FFD3B6]"></i>
                </div>
                <span className="text-gray-500 text-sm">Gender</span>
              </div>
              <p className="font-semibold text-gray-800">{profileData.gender}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-phone-line text-[#E0BBE4]"></i>
                </div>
                <span className="text-gray-500 text-sm">Phone</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{profileData.phone}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-mail-line text-[#98FB98]"></i>
                </div>
                <span className="text-gray-500 text-sm">Email</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{profileData.email}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-chat-3-line text-[#00C300]"></i>
                </div>
                <span className="text-gray-500 text-sm">LINE ID</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{profileData.lineId}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  <i className="ri-map-pin-line text-[#FFB6C1]"></i>
                </div>
                <span className="text-gray-500 text-sm">Location</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{profileData.location}</p>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Professional Information</h2>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-time-line text-[#A8E6CF]"></i>
              </div>
              <span className="text-gray-500 text-sm">Years of Experience</span>
            </div>
            <p className="font-semibold text-gray-800">{profileData.experience} years</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center mb-3">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-stethoscope-line text-[#FFD3B6]"></i>
              </div>
              <span className="text-gray-500 text-sm">Specialties</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-[#A8E6CF]/20 text-[#A8E6CF] text-sm px-3 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-hospital-line text-[#E0BBE4]"></i>
              </div>
              <span className="text-gray-500 text-sm">Main Hospitals</span>
            </div>
            <div className="space-y-2">
              {profileData.hospitals.map((hospital, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-[#E0BBE4] rounded-full mr-3"></div>
                  <span className="text-gray-700 text-sm">{hospital}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <i className="ri-article-line text-[#98FB98]"></i>
              </div>
              <span className="text-gray-500 text-sm">About Me</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{profileData.bio}</p>
          </div>
        </div>

        {/* My Reviews */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">My Reviews</h2>
            <button
              onClick={openReviewsModal}
              className="text-[#A8E6CF] text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {allReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 text-sm">{review.customerInitials}</span>
                    <div className="flex items-center ml-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <div key={i} className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-star-fill text-yellow-400 text-xs"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                <span className="text-xs text-gray-500">Treatment: {review.treatment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Customers */}
        <div className="px-4 mb-8">
          <div className="bg-gradient-to-r from-[#A8E6CF]/10 to-[#E0BBE4]/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <i className="ri-user-heart-line text-[#A8E6CF]"></i>
                  </div>
                  <span className="font-semibold text-gray-800">Current Customers</span>
                </div>
                <p className="text-gray-600 text-sm">{profileData.currentCustomers} active customers</p>
              </div>
              <Link
                href="/interpreter/customers"
                className="bg-[#A8E6CF] text-white px-4 py-2 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap"
              >
                View All
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <InterpreterBottomNavigation />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal 
          profileData={profileData}
          setProfileData={setProfileData}
          onClose={closeEditModal}
        />
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <ReviewsModal
          reviews={currentReviews}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          onClose={closeReviewsModal}
        />
      )}
    </div>
  );
}

// Edit Profile Modal Component
function EditProfileModal({ profileData, setProfileData, onClose }: any) {
  const [formData, setFormData] = useState(profileData);
  const [errors, setErrors] = useState<any>({});

  const specialtyOptions = [
    'Dental Care', 'Plastic Surgery', 'General Consultation', 'Dermatology',
    'Cardiology', 'Orthopedics', 'Gynecology', 'Pediatrics', 'General Surgery',
    'Ophthalmology', 'ENT', 'Neurology', 'Psychiatry', 'Radiology'
  ];

  const hospitalOptions = [
    'Seoul Dental Excellence', 'Gangnam Beauty Clinic', 'Myeongdong Medical Center',
    'Samsung Medical Center', 'Severance Hospital', 'Asan Medical Center',
    'Seoul National University Hospital', 'Konkuk University Hospital'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const currentSpecialties = formData.specialties || [];
    if (currentSpecialties.includes(specialty)) {
      handleInputChange('specialties', currentSpecialties.filter((s: string) => s !== specialty));
    } else {
      handleInputChange('specialties', [...currentSpecialties, specialty]);
    }
  };

  const toggleHospital = (hospital: string) => {
    const currentHospitals = formData.hospitals || [];
    if (currentHospitals.includes(hospital)) {
      handleInputChange('hospitals', currentHospitals.filter((h: string) => h !== hospital));
    } else {
      handleInputChange('hospitals', [...currentHospitals, hospital]);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 18 || formData.age > 100) newErrors.age = 'Age must be between 18-100';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.experience || formData.experience < 0) newErrors.experience = 'Experience is required';
    if (!formData.specialties?.length) newErrors.specialties = 'At least one specialty is required';
    if (!formData.hospitals?.length) newErrors.hospitals = 'At least one hospital is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setProfileData(formData);
      onClose();
      alert('Profile updated successfully!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        <form className="space-y-6">
          {/* Photo Upload */}
          <div className="text-center">
            <div 
              className="w-24 h-24 rounded-full bg-cover bg-center bg-top mx-auto mb-4"
              style={{ backgroundImage: `url(${formData.photo})` }}
            />
            <button
              type="button"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm cursor-pointer whitespace-nowrap"
            >
              Change Photo
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                min="18"
                max="100"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] pr-8"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                placeholder="+82-10-xxxx-xxxx"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LINE ID</label>
              <input
                type="text"
                value={formData.lineId || ''}
                onChange={(e) => handleInputChange('lineId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                placeholder="your_line_id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
              <input
                type="number"
                value={formData.experience || ''}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                min="0"
                max="50"
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF]"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialties *</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {specialtyOptions.map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap ${
                    formData.specialties?.includes(specialty)
                      ? 'bg-[#A8E6CF] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
            {errors.specialties && <p className="text-red-500 text-xs mt-1">{errors.specialties}</p>}
          </div>

          {/* Hospitals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Hospitals *</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {hospitalOptions.map((hospital) => (
                <button
                  key={hospital}
                  type="button"
                  onClick={() => toggleHospital(hospital)}
                  className={`px-3 py-1 rounded-full text-sm cursor-pointer whitespace-nowrap ${
                    formData.hospitals?.includes(hospital)
                      ? 'bg-[#E0BBE4] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {hospital}
                </button>
              ))}
            </div>
            {errors.hospitals && <p className="text-red-500 text-xs mt-1">{errors.hospitals}</p>}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#A8E6CF] h-24 resize-none"
              placeholder="Tell customers about your experience and approach..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{(formData.bio || '').length}/500 characters</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-[#A8E6CF] text-white rounded-xl cursor-pointer whitespace-nowrap"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reviews Modal Component
function ReviewsModal({ reviews, currentPage, totalPages, setCurrentPage, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">All Reviews</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap"
          >
            <i className="ri-close-line text-gray-600"></i>
          </button>
        </div>

        <div className="space-y-4 mb-6">
          {reviews.map((review: any) => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 text-sm">{review.customerInitials}</span>
                  <div className="flex items-center ml-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <div key={i} className="w-3 h-3 flex items-center justify-center">
                        <i className="ri-star-fill text-yellow-400 text-xs"></i>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
              <span className="text-xs text-gray-500">Treatment: {review.treatment}</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-arrow-left-s-line text-gray-600"></i>
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-arrow-right-s-line text-gray-600"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}