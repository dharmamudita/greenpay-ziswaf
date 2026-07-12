const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const enJsonPath = './i18n/locales/en.json';
const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf8'));

function setKey(obj, pathParts, value) {
  let current = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (current[pathParts[i]] === undefined) {
      current[pathParts[i]] = {};
    }
    current = current[pathParts[i]];
  }
  
  if (current[pathParts[pathParts.length - 1]] === undefined) {
      current[pathParts[pathParts.length - 1]] = value;
  }
}

const files = walkSync('./app').filter(f => f.endsWith('.js'));

// Hardcode some translations for auth since I didn't add defaultValues for all of them in previous steps
setKey(enJson, ['auth', 'login'], 'Log In');
setKey(enJson, ['auth', 'register'], 'Register');
setKey(enJson, ['auth', 'email'], 'Email');
setKey(enJson, ['auth', 'password'], 'Password');
setKey(enJson, ['auth', 'fullname'], 'Full Name');
setKey(enJson, ['auth', 'email_ph'], 'email@example.com');
setKey(enJson, ['auth', 'password_ph'], 'Enter your password');
setKey(enJson, ['auth', 'min_6_char'], 'Min. 6 characters');
setKey(enJson, ['auth', 'fullname_ph'], 'Enter your name');
setKey(enJson, ['auth', 'login_fail'], 'Login failed. Check your email and password.');
setKey(enJson, ['auth', 'confirm_pass'], 'Confirm Password');
setKey(enJson, ['auth', 'pass_not_match'], 'Passwords do not match.');
setKey(enJson, ['auth', 'reg_fail'], 'Registration failed.');
setKey(enJson, ['auth', 'otp_6_digit'], 'OTP must be 6 digits.');
setKey(enJson, ['auth', 'invalid_otp'], 'Invalid OTP code.');
setKey(enJson, ['auth', 'sk_intro'], 'Welcome to GreenPay ZISWAF. By registering, you agree to:');
setKey(enJson, ['auth', 'sk_1_title'], '1. Service Usage');
setKey(enJson, ['auth', 'sk_1_desc'], 'Use properly.');
setKey(enJson, ['auth', 'sk_2_title'], '2. Data Accuracy');
setKey(enJson, ['auth', 'sk_2_desc'], 'Provide accurate info.');
setKey(enJson, ['auth', 'sk_3_title'], '3. Transactions');
setKey(enJson, ['auth', 'sk_3_desc'], 'GP points cannot be cashed out.');
setKey(enJson, ['auth', 'sk_4_title'], '4. Privacy & Security');
setKey(enJson, ['auth', 'sk_4_desc'], 'Keep your password safe.');
setKey(enJson, ['auth', 'sk_5_title'], '5. Term Changes');
setKey(enJson, ['auth', 'sk_5_desc'], 'We can change terms anytime.');
setKey(enJson, ['auth', 'sk_6_title'], '6. Disclaimer');
setKey(enJson, ['auth', 'sk_6_desc'], 'Not responsible for network errors.');
setKey(enJson, ['auth', 'sk_7_title'], '7. Governing Law');
setKey(enJson, ['auth', 'sk_7_desc'], 'Subject to Indonesian law.');
setKey(enJson, ['auth', 'sk_scroll_info'], '(Scroll to bottom to agree)');
setKey(enJson, ['forgot_password', 'success_otp_sent'], 'OTP sent to email');


files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/t\(['"]([^'"]+)['"]\s*(?:,\s*\{\s*defaultValue\s*:\s*['"`](.*?)['"`]\s*\})?/g)];
  
  matches.forEach(match => {
    const key = match[1];
    let defaultValue = match[2];
    
    // ignore API routes mistakenly matched
    if (key.startsWith('/') || key === 'window' || key === 'style' || key.includes(' ')) return;
    
    if (defaultValue === undefined) {
        // Fallback default value for missing ones just to ensure it's not blank
        defaultValue = key.split('.').pop().replace(/_/g, ' ');
        // capitalize
        defaultValue = defaultValue.charAt(0).toUpperCase() + defaultValue.slice(1);
    }
    
    const parts = key.split('.');
    
    setKey(enJson, parts, defaultValue);
  });
});

fs.writeFileSync(enJsonPath, JSON.stringify(enJson, null, 2));
console.log('Successfully patched en.json');
