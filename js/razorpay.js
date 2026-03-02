// Razorpay Payment Integration
// Configuration for video consultation pricing: 5 Rs for 15 minutes

export const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; // Replace with your Razorpay Key ID from dashboard

export const PRICING = {
  VIDEO_CALL_15_MIN: {
    amount: 500, // Amount in paise (5 Rs = 500 paise)
    duration: 15, // minutes
    description: "15 Minutes Video Consultation"
  }
};

// Load Razorpay Script
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Initiate Payment for Video Call
export async function initiateVideoCallPayment(patientId, patientEmail, patientName, doctorId, amount = PRICING.VIDEO_CALL_15_MIN.amount) {
  try {
    // Ensure Razorpay script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error("Failed to load Razorpay script");
    }

    // Create order on your backend (this is a placeholder - implement backend endpoint)
    const orderResponse = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount,
        patientId: patientId,
        doctorId: doctorId,
        description: PRICING.VIDEO_CALL_15_MIN.description
      })
    });

    const orderData = await orderResponse.json();

    if (!orderData.orderId) {
      throw new Error("Failed to create order");
    }

    // Razorpay Payment Options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount,
      currency: "INR",
      name: "Care Without Borders",
      description: PRICING.VIDEO_CALL_15_MIN.description,
      order_id: orderData.orderId,
      handler: function(response) {
        // Payment successful
        handlePaymentSuccess(response, patientId, doctorId);
      },
      prefill: {
        name: patientName,
        email: patientEmail,
      },
      theme: {
        color: "#0f766e"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment cancelled");
          showPaymentAlert("Payment cancelled", "warning");
        }
      }
    };

    // Open Razorpay Checkout
    const rzp = new window.Razorpay(options);
    rzp.open();
    
    rzp.on('payment.failed', function(response) {
      handlePaymentFailure(response);
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    showPaymentAlert("Error initiating payment: " + error.message, "error");
  }
}

// Handle Successful Payment
async function handlePaymentSuccess(response, patientId, doctorId) {
  try {
    // Verify payment on backend
    const verifyResponse = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        patientId: patientId,
        doctorId: doctorId
      })
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      showPaymentAlert("✅ Payment successful! Your video call session is ready.", "success");
      // Redirect to video call room or start call
      setTimeout(() => {
        startVideoCall(patientId, doctorId);
      }, 1500);
    } else {
      throw new Error("Payment verification failed");
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    showPaymentAlert("Payment verification failed: " + error.message, "error");
  }
}

// Handle Failed Payment
function handlePaymentFailure(response) {
  console.error("Payment failed:", response);
  showPaymentAlert("❌ Payment failed. Please try again.", "error");
}

// Show Payment Alert
export function showPaymentAlert(message, type = "success") {
  const alertDiv = document.getElementById("paymentAlert") || createAlertDiv();
  alertDiv.innerHTML = `<p style="margin: 0;">${message}</p>`;
  alertDiv.className = `payment-alert show ${type}`;
  
  if (type !== 'success') {
    setTimeout(() => alertDiv.classList.remove("show"), 5000);
  }
}

// Create Alert Div if not exists
function createAlertDiv() {
  const div = document.createElement('div');
  div.id = 'paymentAlert';
  div.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4caf50; color: white; padding: 15px 25px; border-radius: 4px; z-index: 1000; max-width: 400px;';
  document.body.appendChild(div);
  return div;
}

// Start Video Call (integration with your video call service)
function startVideoCall(patientId, doctorId) {
  // This should open your video call interface
  // For now, we'll log it - implement with your video service
  window.location.href = `video-room.html?patientId=${patientId}&doctorId=${doctorId}&duration=15`;
}

// Format Amount for Display
export function formatAmount(amountInPaise) {
  return (amountInPaise / 100).toFixed(2) + " Rs";
}

// Add Funds to Wallet
export async function addFundsToWallet(amount, userEmail, userName) {
  return initiateVideoCallPayment(null, userEmail, userName, null, amount);
}
