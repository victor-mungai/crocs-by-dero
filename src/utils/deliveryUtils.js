// Delivery utilities for distance calculation and cost

// Dispatch location coordinates (goods are dispatched from here)
// 1°17'47.7"S 36°52'24.6"E
const PICKUP_LOCATION = {
  lat: -1.296583,  // 1°17'47.7"S converted to decimal degrees
  lng: 36.8735     // 36°52'24.6"E converted to decimal degrees
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  
  return distance
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

// Calculate delivery fee based on distance
export function calculateDeliveryFee(distance) {
  // Pricing structure:
  // 0-5 km: KES 200
  // 5-10 km: KES 300
  // 10-15 km: KES 400
  // 15-20 km: KES 500
  // 20+ km: KES 500 + KES 50 per additional km
  
  if (distance <= 5) {
    return 200
  } else if (distance <= 10) {
    return 300
  } else if (distance <= 15) {
    return 400
  } else if (distance <= 20) {
    return 500
  } else {
    return 500 + Math.ceil((distance - 20) * 50)
  }
}

// Get pickup location
export function getPickupLocation() {
  return PICKUP_LOCATION
}

// Format distance for display
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

