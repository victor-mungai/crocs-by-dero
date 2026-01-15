# 🚚 E-Commerce Delivery System Guide

## Overview

This system provides a complete e-commerce and delivery solution with:
- ✅ Platform-only ordering (WhatsApp removed)
- ✅ Real-time order tracking with live maps
- ✅ Rider dashboard for delivery management
- ✅ Delivery location pinning and cost calculation
- ✅ Collect delivery option
- ✅ Real-time status updates

## System Components

### 1. Order Management (`src/firebase/ordersService.js`)
- Creates and manages orders in Firebase
- Tracks order status: `placed` → `confirmed` → `dispatched` → `in_transit` → `delivered`
- Real-time order updates using Firebase listeners
- Rider assignment and location tracking

### 2. Delivery Utilities (`src/utils/deliveryUtils.js`)
- Distance calculation using Haversine formula
- Delivery fee calculation based on distance:
  - 0-5 km: KES 200
  - 5-10 km: KES 300
  - 10-15 km: KES 400
  - 15-20 km: KES 500
  - 20+ km: KES 500 + KES 50 per additional km
- Dispatch location: 1°17'47.7"S 36°52'24.6"E (-1.296583, 36.8735)

### 3. Order Context (`src/context/OrderContext.jsx`)
- Manages order state across the application
- Provides functions: `placeOrder`, `fetchOrder`, `trackOrder`, `fetchCustomerOrders`

### 4. Checkout Page (`src/pages/Checkout.jsx`)
**Features:**
- Delivery type selection (Home Delivery or Collect)
- Interactive map for delivery location pinning
- Automatic delivery fee calculation
- Customer information collection
- M-Pesa payment integration
- Order creation after payment

**User Flow:**
1. Customer reviews cart
2. Selects delivery type (Delivery or Collect)
3. If Delivery: Pins location on map, enters address
4. Enters name and phone number
5. Pays via M-Pesa
6. Order is created and customer redirected to tracking page

### 5. Order Tracking Page (`src/pages/OrderTracking.jsx`)
**Features:**
- Real-time order status display
- Live map showing:
  - Pickup location (blue marker)
  - Delivery location (red marker)
  - Rider location (green marker, updates in real-time)
- Order details and items
- Distance to delivery calculation
- Status updates: Placed → Confirmed → Dispatched → In Transit → Delivered

**Access:** `/track-order/:orderId`

### 6. Rider Dashboard (`src/pages/RiderDashboard.jsx`)
**Features:**
- Rider authentication (ID-based)
- View pending deliveries
- Begin trip button for each delivery
- Real-time location tracking (updates every 5 seconds)
- Live map showing:
  - Rider's current location
  - Pickup location
  - Delivery location
- Complete delivery button
- View completed deliveries

**Access:** `/rider-dashboard`

**Rider Setup:**
1. Navigate to `/rider-dashboard`
2. Enter Rider ID when prompted
3. Enter name when prompted
4. Rider ID and name saved in localStorage

## Order Status Flow

```
placed → confirmed → dispatched → in_transit → delivered
```

- **placed**: Order created, payment initiated
- **confirmed**: Payment confirmed, order ready
- **dispatched**: Order assigned to rider
- **in_transit**: Rider has begun trip, location tracking active
- **delivered**: Order completed

## Setup Instructions

### 1. Google Maps API Key

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API (optional, for address lookup)
3. Add to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
4. Or set in Netlify/Vercel environment variables

### 2. Firebase Configuration

The system uses Firebase Firestore for:
- Orders collection (`orders`)
- Riders collection (`riders`)

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read: if true; // Anyone can read orders (for tracking)
      allow write: if true; // For now, allow writes (add auth later)
    }
    match /riders/{riderId} {
      allow read: if true;
      allow write: if true; // Add rider authentication later
    }
  }
}
```

### 3. Admin Dashboard Updates

The Admin dashboard should be updated to:
- View all orders
- Assign riders to orders
- Update order status
- View order details

## Usage Guide

### For Customers

1. **Place Order:**
   - Add items to cart
   - Go to checkout
   - Select delivery type
   - If delivery: Pin location on map
   - Enter name and phone
   - Pay via M-Pesa
   - Redirected to tracking page

2. **Track Order:**
   - Access tracking page via link or order ID
   - View real-time status and map
   - See rider location updates

### For Riders

1. **Access Dashboard:**
   - Navigate to `/rider-dashboard`
   - Enter Rider ID and name (first time only)

2. **Accept Delivery:**
   - View pending deliveries
   - Click "Begin Trip" on an order
   - Location tracking starts automatically

3. **Complete Delivery:**
   - Navigate to delivery location
   - Click "Complete Delivery" when arrived
   - Order status updates to "delivered"

### For Admins

1. **View Orders:**
   - Access admin dashboard
   - View all orders with status
   - Filter by status

2. **Assign Rider:**
   - Select an order
   - Assign a rider ID
   - Order status changes to "dispatched"

3. **Monitor Deliveries:**
   - View active deliveries
   - Track rider locations
   - Monitor delivery progress

## Technical Details

### Location Tracking

- Uses browser Geolocation API
- Updates every 5 seconds when trip is active
- Stores location in Firebase for real-time updates
- Requires location permissions from browser

### Real-time Updates

- Uses Firebase `onSnapshot` listeners
- Automatic updates across all devices
- No page refresh needed

### Distance Calculation

- Uses Haversine formula for great-circle distance
- Calculates distance between pickup and delivery locations
- Used for delivery fee calculation

## Environment Variables

Required:
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

Optional:
- Firebase config (already set in `src/firebase/config.js`)

## Future Enhancements

- [ ] Rider authentication system
- [ ] Push notifications for status updates
- [ ] Estimated delivery time calculation
- [ ] Route optimization for riders
- [ ] Customer rating system
- [ ] Delivery history
- [ ] Analytics dashboard

## Troubleshooting

### Map not showing
- Check Google Maps API key is set
- Verify API key has correct permissions
- Check browser console for errors

### Location tracking not working
- Ensure browser location permissions are granted
- Check HTTPS (required for geolocation)
- Verify Firebase configuration

### Orders not updating
- Check Firebase connection
- Verify Firestore security rules
- Check browser console for errors

---

**System Status:** ✅ Fully Functional
**Last Updated:** 2024

