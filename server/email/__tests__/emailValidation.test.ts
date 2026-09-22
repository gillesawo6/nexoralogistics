import { validateEmailRequest } from '../validation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('--- RUNNING EMAIL VALIDATION & ROUTING SUITE ---');

// Test 1: Dynamic customer recipient
const t1 = validateEmailRequest({
  to: 'customer@example.com',
  subject: 'Test Quote Confirmation',
  html: '<p>Hello Customer</p>',
});
assert(t1.valid === true, 'Test 1 should be valid');
assert(t1.data?.to === 'customer@example.com', 'Test 1 recipient must be customer@example.com');
console.log('✓ Test 1 Passed: Dynamic recipient customer@example.com preserved');

// Test 2: Dynamic alternative field recipientEmail
const t2 = validateEmailRequest({
  recipientEmail: 'john@example.com',
  subject: 'Tracking Update',
  text: 'Your shipment is moving.',
});
assert(t2.valid === true, 'Test 2 should be valid');
assert(t2.data?.to === 'john@example.com', 'Test 2 recipient must be john@example.com');
console.log('✓ Test 2 Passed: Dynamic recipient john@example.com via recipientEmail preserved');

// Test 3: Nexora internal domain is NOT rewritten to gillesawo6@gmail.com
const t3 = validateEmailRequest({
  to: 'operations@nexoralogistics.com',
  subject: 'Internal Notification',
  html: '<p>Internal dispatch</p>',
});
assert(t3.valid === true, 'Test 3 should be valid');
assert(t3.data?.to === 'operations@nexoralogistics.com', 'Test 3 recipient must remain operations@nexoralogistics.com');
console.log('✓ Test 3 Passed: operations@nexoralogistics.com is NOT rewritten');

// Test 4: Missing recipient must FAIL (No silent fallback!)
const t4 = validateEmailRequest({
  subject: 'Missing to',
  html: '<p>Test</p>',
});
assert(t4.valid === false, 'Test 4 must fail');
assert(t4.error === 'Recipient email is required.', 'Test 4 must return explicit error');
console.log('✓ Test 4 Passed: Missing recipient strictly rejected');

// Test 5: Empty recipient must FAIL (No silent fallback!)
const t5 = validateEmailRequest({
  to: '   ',
  subject: 'Empty to',
  html: '<p>Test</p>',
});
assert(t5.valid === false, 'Test 5 must fail');
assert(t5.error === 'Recipient email is required.', 'Test 5 must return explicit error');
console.log('✓ Test 5 Passed: Empty recipient strictly rejected');

// Test 6: Invalid email syntax must FAIL
const t6 = validateEmailRequest({
  to: 'invalid-email-address',
  subject: 'Invalid syntax',
  html: '<p>Test</p>',
});
assert(t6.valid === false, 'Test 6 must fail');
assert(t6.error?.includes('Invalid recipient email format'), 'Test 6 must reject invalid format');
console.log('✓ Test 6 Passed: Invalid email syntax rejected');

// Test 7: Header injection attempt with CRLF in recipient
const t7 = validateEmailRequest({
  to: 'victim@example.com\r\nBcc: attacker@evil.com',
  subject: 'Injection test',
  html: '<p>Test</p>',
});
assert(t7.valid === false, 'Test 7 must fail on CRLF');
console.log('✓ Test 7 Passed: Header injection in recipient blocked');

// Test 8: Header injection attempt with CRLF in subject
const t8 = validateEmailRequest({
  to: 'valid@example.com',
  subject: 'Injection test\nBcc: attacker@evil.com',
  html: '<p>Test</p>',
});
assert(t8.valid === false, 'Test 8 must fail on CRLF in subject');
console.log('✓ Test 8 Passed: Header injection in subject blocked');

// Test 9: Missing body content (neither html nor text)
const t9 = validateEmailRequest({
  to: 'valid@example.com',
  subject: 'Missing body',
});
assert(t9.valid === false, 'Test 9 must fail when body is missing');
console.log('✓ Test 9 Passed: Missing body content rejected');

console.log('--- ALL EMAIL VALIDATION & ROUTING TESTS PASSED! ---');
