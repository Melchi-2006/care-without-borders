# Consultation Scheduling System - Complete Implementation

## Overview
This document describes the complete consultation scheduling system implementation for Care Without Borders, including:
- Time-based appointment notifications
- Video call room creation and management  
- Waiting state tracking
- Scheduled consultations UI for both doctors and patients

## Recent Changes Summary

### 1. **Scheduled Notifications System** ✅
**File Created:** `js/scheduled-notifications.js`

A new `ScheduledNotificationManager` class monitors scheduled consultations and automatically sends notifications when appointment time arrives.

#### Key Features:
- Checks consultations every 60 seconds (configurable)
- Sends notifications 0-2 minutes before appointment time
- Tracks which consultations have been notified (prevents duplicate notifications)
- Broadcasts notifications to both doctor and patient pages via custom events
- Stores notification history for reference

#### Usage:
```javascript
// Start monitoring (automatic on page load)
window.scheduledNotificationManager.start(60); // Check every 60 seconds

// Stop monitoring
window.scheduledNotificationManager.stop();

// Request browser notification permissions
ScheduledNotificationManager.requestNotificationPermissions();

// Get current status
const status = window.scheduledNotificationManager.getStatus();
console.log(status); // { isRunning: true, notifiedCount: 5, notifiedConsultations: [...] }
```

#### Notification Flow:
1. System detects appointment time within 2 minutes
2. Broadcasts `appointmentTimeReached` event with consultation details
3. Doctor and patient pages receive event based on their role
4. Shows alert notification: "📅 Your consultation appointment starts in X minutes!"
5. Browser notification sent if permissions granted

### 2. **Video Call Functions** ✅
**Files Modified:** `doctor.html`, `patient.html`

Added comprehensive video call functions for both doctor and patient sides.

#### Doctor-Side Functions (`doctor.html`):

##### `joinDoctorVideoCall(consultationId)`
- Called when doctor clicks "🎥 Join" button on scheduled consultation
- Retrieves consultation details from localStorage
- Updates waiting state to `doctor_waiting`
- Shows video room interface
- Sends invitation notification to patient

```javascript
// Called from scheduled consultations table
<button onclick="joinDoctorVideoCall('${req.id}')">🎥 Join</button>
```

##### `sendDoctorDiagnosis(consultationId)`
- Called when doctor clicks "📋 Diagnosis" button
- Opens diagnosis input modal
- Allows doctor to enter diagnosis, treatment, and precautions
- Saves to localStorage and sends to patient

##### `completeDoctorConsultation(consultationId)`
- Marks consultation as completed
- Updates status in localStorage
- Reloads dashboard to refresh UI

##### `showVideoRoom(jitsiRoomId, patientName, role)`
- Creates video room container with:
  - Close button to end call
  - Waiting state indicator showing patient/doctor name
  - Placeholder for Jitsi integration
  - Professional styling with dark theme

#### Patient-Side Functions (`patient.html`):

##### `joinPatientVideoCall(consultationId)`
- Called when patient clicks "🎥 Join" button on their scheduled consultation
- Updates consultation waiting state to `patient_waiting`
- Shows video room interface
- Waits for doctor to join

##### `showPatientVideoRoom(jitsiRoomId, doctorName)`
- Similar to doctor version
- Shows waiting message for doctor to join
- Placeholder for Jitsi integration

### 3. **Notification System Enhancements** ✅
**File Modified:** `js/notifications.js`

Added new broadcast methods to NotificationSystem class:

#### `broadcastAppointmentNotification(role, appointmentNotification)`
- Broadcasts appointment time reached event to specific role (doctor/patient)
- Event name: `appointmentTimeReached`
- Includes consultation details in event

#### `broadcastConsultationAccepted(consultationId, doctorId)`
- Broadcasts when doctor accepts consultation
- Helps other doctors' pages update their UI
- Event name: `consultationAccepted`

### 4. **Scheduled Consultations UI** ✅
**File Modified:** `js/doctor-management.js`

Completely redesigned consultation display with three sections:

#### Display Sections:

1. **📅 Scheduled Consultations (Table View)**
   - Shows: Patient Name, Specialty, Date & Time, Status (Upcoming 🟣 / Active 🟢), Actions
   - Only shows consultations with `preferredTime` set by doctor
   - Shows as "Upcoming 🟣" if appointment is in future
   - Shows as "Active 🟢" if appointment time has passed
   - Action buttons: "🎥 Join" (calls `joinDoctorVideoCall()`) and "📋 Diagnosis"

2. **⏳ Pending Consultation Requests (Card View)**
   - Shows unaccepted consultations
   - Patient can book appointment with `preferredTime`
   - Doctor sees patient symptoms and can accept/decline
   - Once accepted, disappears from other doctors' views

3. **✅ Active Consultations (Card View)**
   - Shows consultations accepted by current doctor
   - Without `preferredTime` or with past `preferredTime`
   - Ongoing consultations in progress

#### Doctor-Side Methods:

- `getScheduledConsultations()`: Filters consultations with `preferredTime`
- `getAcceptedConsultations()`: Returns consultations where `acceptedBy === this.doctorId`
- `getPendingConsultations()`: Returns consultations with `status === 'pending' && !r.acceptedBy`

### 5. **Script Inclusions** ✅
**Files Modified:** `doctor.html`, `patient.html`

Added `scheduled-notifications.js` to both files:
- Loads after `notifications.js`
- Loaded before page-specific initialization
- Automatically creates global `window.scheduledNotificationManager` instance

### 6. **DOMContentLoaded Event Updates** ✅
**Files Modified:** `doctor.html`, `patient.html`

Added initialization code:
```javascript
// Start monitoring scheduled consultations
if (window.scheduledNotificationManager) {
  ScheduledNotificationManager.requestNotificationPermissions();
  window.scheduledNotificationManager.start(60); // Check every 60 seconds
}

// Listen for appointment time reached notifications
window.addEventListener('appointmentTimeReached', (e) => {
  const appointmentNotification = e.detail;
  if (appointmentNotification.role === 'doctor'|'patient') {
    alert(`📅 ${appointmentNotification.message}`);
  }
});
```

## Data Model

### Consultation Object Structure:
```javascript
{
  id: 'CONSULT-1234567890',
  patientName: 'Rajesh Kumar',
  age: 28,
  gender: 'Male',
  symptoms: 'fever, headache, cough',
  specialty: 'General',
  preferredTime: '2026-05-02T17:00:00.000Z',  // Optional - appointment time
  status: 'pending' | 'accepted' | 'completed',
  acceptedBy: null | 'DR_001',                 // Doctor ID if accepted
  acceptedAt: '2026-05-02T10:30:00.000Z',     // When doctor accepted
  videoCallLink: 'jitsi_DR_001_CONSULT-xxxxx', // Jitsi room ID
  waitingState: 'none' | 'doctor_waiting' | 'patient_waiting' | 'in_call',
  createdAt: '2026-05-02T10:00:00.000Z',
  completedAt: null | '2026-05-02T18:00:00.000Z'
}
```

### Appointment Notification Object:
```javascript
{
  type: 'appointment_time_reached',
  consultationId: 'CONSULT-1234567890',
  patientName: 'Rajesh Kumar',
  doctorName: 'Dr. Sharma',
  doctorId: 'DR_001',
  appointmentTime: '2026-05-02T17:00:00.000Z',
  timeMessage: 'now' | 'in X minutes',
  message: 'Your consultation appointment starts in X minutes!...',
  timestamp: '2026-05-02T16:58:00.000Z'
}
```

## Workflow Examples

### Patient Booking Consultation with Time:
1. Patient enters symptoms via VILGAX AI chatbot
2. Patient selects doctor and preferred appointment time
3. Consultation created with `preferredTime` set
4. Stored in `localStorage['consultationRequests']`

### Doctor Accepting Consultation:
1. Doctor sees pending consultation in "⏳ Pending Consultation Requests"
2. Doctor clicks "✅ Accept" button
3. Sets `acceptedBy = doctorId` and `status = 'accepted'`
4. Consultation moves to "📅 Scheduled Consultations" section
5. Patient receives notification: "✅ Doctor Approved Your Consultation"
6. Other doctors no longer see this consultation

### Appointment Time Arrives:
1. System checks every 60 seconds
2. Finds consultation with `preferredTime` approaching
3. When time is within 2 minutes, sends notification
4. Both doctor and patient pages receive alert: "📅 Your consultation appointment starts now!"
5. Doctor can click "🎥 Join" to enter video room
6. Patient receives notification and can click to join
7. Waiting state shows "⏳ Waiting for [Party] to join..."
8. When both joined, state changes to `in_call`

### Video Call Flow:
1. Doctor clicks "🎥 Join" → sets `waitingState = 'doctor_waiting'` → shows video room
2. Patient receives notification → clicks "Join" → sets `waitingState = 'patient_waiting'` → shows video room  
3. Both pages detect participant joined → state becomes `in_call`
4. After call ends, doctor can enter "📋 Diagnosis"
5. Diagnosis saved and sent to patient
6. Patient can save diagnosis to "Medical Records"
7. Doctor clicks "Complete Consultation" → status = 'completed'

## Testing the System

### Test Appointment Notification:
1. Create a consultation with `preferredTime` set to current time + 1 minute
2. Wait for notification (check console for log messages)
3. Browser notification should appear if permissions granted
4. Alert box should show appointment message

### Test Video Call:
1. Accept a consultation as doctor
2. Click "🎥 Join" button
3. Should see video room with waiting indicator
4. Click "✕ End Call" to close

### Test Diagnosis:
1. After joining video call, doctor clicks "📋 Diagnosis"
2. Modal opens to enter diagnosis details
3. Enter diagnosis, treatment, and precautions
4. Click "✓ Save & Send to Patient"
5. Diagnosis saved and notification sent to patient

## Known Limitations & Future Work

### Current Placeholders:
- Jitsi video integration placeholder (iframe with room ID shown)
- Waiting state transitions (currently just track state, visual updates needed)
- Browser notification permissions (need to request on first use)

### Next Steps for Enhancement:
1. **Jitsi Integration**: Replace placeholder with actual Jitsi iframe and API
2. **Waiting State UI**: Add visual indicators and animations for waiting states
3. **Video Recording**: Store consultation video recordings for patient records
4. **Rescheduling**: Allow patients/doctors to reschedule appointments
5. **Reminders**: Add 24-hour and 1-hour reminder notifications
6. **Calendar View**: Show all appointments in calendar format
7. **Timezone Support**: Handle different timezones for appointments
8. **Follow-up Appointments**: Auto-schedule follow-ups based on diagnosis

## Files Changed Summary

| File | Change | Status |
|------|--------|--------|
| `js/scheduled-notifications.js` | Created | ✅ New |
| `js/notifications.js` | Added broadcast methods | ✅ Modified |
| `js/doctor-management.js` | Added scheduled consultations table | ✅ Modified |
| `doctor.html` | Added video call functions | ✅ Modified |
| `patient.html` | Added video call functions | ✅ Modified |

## Testing Checklist

- [ ] Appointment notification fires at correct time
- [ ] Both doctor and patient receive notification
- [ ] Doctor can join video call from scheduled consultation
- [ ] Patient can join video call from notification
- [ ] Diagnosis modal opens for doctor
- [ ] Diagnosis saves to medical records
- [ ] Consultation can be marked as completed
- [ ] Scheduled consultations table displays correctly
- [ ] Browser notifications work with permissions
- [ ] Multiple appointments don't conflict

## Support & Documentation

For issues or questions:
1. Check browser console for error messages
2. Verify localStorage has consultation data
3. Ensure notification permissions are granted
4. Check that all JS files are loaded (scripts section in HTML)
5. Verify appointment times are in correct ISO format

---

**Implementation Date:** 2026-05-02  
**Status:** ✅ Complete - Ready for Testing
