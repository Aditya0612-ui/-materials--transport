// smsService.js
class SMSService {
  constructor() {
    // Hardcoded SMS API credentials (same as Java implementation)
    this.username = "Experts";
    this.authkey = "ba9dcdcdfcXX"; // Replace XX with actual key digits
    this.senderId = "EXTSKL";
    this.accusage = "1";
    this.apiUrl = "https://mobicomm.dove-sms.com//submitsms.jsp";
    
    console.log('📱 SMS Service initialized');
    console.log('   Username:', this.username);
    console.log('   Sender ID:', this.senderId);
    console.log('   API URL:', this.apiUrl);
  }

  // Generate random OTP
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

 // Send OTP via SMS (matching Java implementation exactly)
async sendOTP(phoneNumber, otp) {
  console.log('📤 SMS Service: Initiating OTP send');
  console.log('📱 Phone Number:', phoneNumber);
  console.log('🔑 OTP:', otp);
  
  // Create message with exact template (same as Java)
  let message = `Your Verification Code for login is ${otp}. - Expertskill Technology.`;
  
  // Replace spaces with %20 (same as Java: message.replace(" ", "%20"))
  message = message.replace(/ /g, '%20');
  
  console.log('📝 Encoded Message:', message);
  
  try {
    // Build URL exactly like Java implementation
    const url = `${this.apiUrl}?user=${this.username}&key=${this.authkey}&mobile=+91${phoneNumber}&message=${message}&accusage=${this.accusage}&senderid=${this.senderId}`;
    
    console.log('🌐 Request URL:', url);
    console.log('🚀 Sending SMS via DoveSMS API...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, text/html, application/json'
      }
    });
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response OK:', response.ok);
    
    // Get response as text (Java gets string response)
    const responseText = await response.text();
    console.log('📦 Response Text:', responseText);
    
    // Check if response contains "success" (same as Java)
    if (responseText.toLowerCase().includes('success')) {
      console.log('✅ SMS sent successfully');
      return {
        success: true,
        message: 'OTP sent successfully',
        response: responseText
      };
    } else {
      console.error('❌ Failed to send OTP - Response does not contain success');
      return {
        success: false,
        error: 'Failed to send OTP',
        response: responseText
      };
    }
    
  } catch (error) {
    console.error('❌ SMS Service Error:', error);
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      phoneNumber: phoneNumber
    });
    
    return {
      success: false,
      error: error.message || 'Error sending OTP'
    };
  }
}

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    return indianPhoneRegex.test(phoneNumber.toString());
  }

  // Format phone number for display
  formatPhoneNumber(phoneNumber) {
    const s = phoneNumber.toString();
    if (s.length === 10) {
      return `+91 ${s.slice(0, 5)} ${s.slice(5)}`;
    }
    return phoneNumber;
  }



  // Debug function to check SMS service configuration
  getServiceStatus() {
    const isKeyComplete = this.authkey && !this.authkey.includes('XX');
    
    return {
      username: this.username,
      senderId: this.senderId,
      apiUrl: this.apiUrl,
      hasAuthKey: !!this.authkey,
      authKeyValid: isKeyComplete,
      authKeyPreview: this.authkey ? `${this.authkey.slice(0, 4)}...${this.authkey.slice(-2)}` : 'Not set',
      warning: !isKeyComplete ? '⚠️ Auth key contains XX - replace with actual key digits' : null
    };
  }
}

export default new SMSService();
export { SMSService };
