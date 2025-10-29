import React from 'react';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import '../styles/PropertyCard.css';

function PropertyCard({ property }) {
  const {
    title,
    city,
    locality,
    bhk,
    price,
    carpetArea,
    status,
    amenities,
    bathrooms,
    balcony,
    furnishedType,
    address,
    image,
    id
  } = property;

  // Generate clean slug from property details
  const generateSlug = () => {
    const parts = [];
    
    // Add title (project name)
    if (title && title !== 'N/A') {
      parts.push(cleanText(title));
    }
    
    // Add locality/area
    if (locality && locality !== 'N/A') {
      parts.push(cleanText(locality));
    }
    
    // Add city
    if (city && city !== 'N/A') {
      parts.push(cleanText(city));
    }
    
    // Join with hyphens and return
    return parts.join('-');
  };

  // Clean text for URL (remove special chars, spaces to hyphens, lowercase)
  const cleanText = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
  };

  const handleViewDetails = () => {
    const baseUrl = 'https://nobrokerage.com';
    
    // Generate slug from THIS property card's data
    const generatedSlug = generateSlug();
    
    if (generatedSlug) {
      const propertyUrl = `${baseUrl}/project/${generatedSlug}`;
      console.log('===== Property Details =====');
      console.log('Title:', title);
      console.log('Locality:', locality);
      console.log('City:', city);
      console.log('Generated Slug:', generatedSlug);
      console.log('Full URL:', propertyUrl);
      console.log('==========================');
      
      window.open(propertyUrl, '_blank');
    } else {
      alert('Cannot generate property URL. Property details incomplete.');
    }
  };

  return (
    <div className="property-card">
      {/* Property Image */}
      <div className="property-image">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x250?text=Property+Image';
            }} 
          />
        ) : (
          <div className="placeholder-image">
            <FaMapMarkerAlt size={50} />
            <p>No Image Available</p>
          </div>
        )}
        <div className="status-badge">
          {status}
        </div>
      </div>

      {/* Property Details */}
      <div className="property-details">
        <div className="property-header">
          <h3 className="property-title">{title}</h3>
          <p className="property-location">
            <FaMapMarkerAlt className="icon" />
            {locality}, {city}
          </p>
        </div>

        <div className="property-price">
          <span className="price-tag">{price}</span>
        </div>

        <div className="property-info">
          <div className="info-item">
            <FaBed className="icon" />
            <span>{bhk}</span>
          </div>
          {bathrooms !== 'N/A' && (
            <div className="info-item">
              <FaBath className="icon" />
              <span>{bathrooms} Bath</span>
            </div>
          )}
          <div className="info-item">
            <FaRulerCombined className="icon" />
            <span>{carpetArea}</span>
          </div>
        </div>

        <div className="property-meta">
          <span className="meta-item">
            <strong>Balcony:</strong> {balcony}
          </span>
          <span className="meta-item">
            <strong>Type:</strong> {furnishedType}
          </span>
        </div>

        {amenities && amenities.length > 0 && (
          <div className="property-amenities">
            {amenities.map((amenity, index) => (
              <span key={index} className="amenity-tag">
                <FaCheckCircle className="icon" />
                {amenity}
              </span>
            ))}
          </div>
        )}

        <button 
          className="view-details-btn"
          onClick={handleViewDetails}
          title={`View ${title} on NoBrokerage.com`}
        >
          <FaExternalLinkAlt style={{ marginRight: '8px', fontSize: '14px' }} />
          View on NoBrokerage.com
        </button>

        {/* Show generated slug for reference (optional - can remove)
        <p className="slug-preview">
          🔗 /{generateSlug()}
        </p> */}
      </div>
    </div>
  );
}

export default PropertyCard;
