import handler from '../../../api/send-email.js';

function createMockRes() {
  const res: any = {
    statusCode: 200,
    headers: {},
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: any) {
      this.headers[name] = value;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function runHandlerTests() {
  console.log('--- RUNNING HTTP HANDLER TESTS ---');

  // Test A: Non-POST methods must return 405 Method Not Allowed
  const getReq: any = { method: 'GET' };
  const getRes = createMockRes();
  await handler(getReq, getRes);
  if (getRes.statusCode !== 405 || getRes.jsonData?.stage !== 'request_validation') {
    throw new Error(`Expected 405 for GET, got ${getRes.statusCode}`);
  }
  console.log('✓ Handler Test A Passed: GET returns 405');

  // Test B: Missing recipient returns 400 Bad Request
  const badReq: any = {
    method: 'POST',
    body: {
      subject: 'Test missing recipient',
      html: '<p>Hello</p>',
    },
  };
  const badRes = createMockRes();
  await handler(badReq, badRes);
  if (badRes.statusCode !== 400 || badRes.jsonData?.error !== 'Recipient email is required.') {
    throw new Error(`Expected 400 with "Recipient email is required.", got: ${JSON.stringify(badRes.jsonData)}`);
  }
  console.log('✓ Handler Test B Passed: Missing recipient returns 400');

  // Test C: Invalid email format returns 400 Bad Request
  const invalidReq: any = {
    method: 'POST',
    body: {
      to: 'notanemail',
      subject: 'Test bad syntax',
      html: '<p>Hello</p>',
    },
  };
  const invalidRes = createMockRes();
  await handler(invalidReq, invalidRes);
  if (invalidRes.statusCode !== 400 || invalidRes.jsonData?.stage !== 'request_validation') {
    throw new Error(`Expected 400 for invalid email, got ${invalidRes.statusCode}`);
  }
  console.log('✓ Handler Test C Passed: Invalid recipient returns 400');

  // Test D: Malformed JSON string returns 400 Bad Request with stage: request_parsing
  const malformedReq: any = {
    method: 'POST',
    body: '{not valid json',
  };
  const malformedRes = createMockRes();
  await handler(malformedReq, malformedRes);
  if (malformedRes.statusCode !== 400 || malformedRes.jsonData?.stage !== 'request_parsing') {
    throw new Error(`Expected 400 with stage request_parsing for malformed JSON, got ${malformedRes.statusCode}`);
  }
  console.log('✓ Handler Test D Passed: Malformed JSON body returns 400 with stage request_parsing');

  // Test E: When providers are not configured in environment, returns 503 Service Unavailable with safe message
  const savedPass = process.env.SMTP_PASS;
  const savedUser = process.env.SMTP_USER;
  const savedGoogleSecret = process.env.GOOGLE_CLIENT_SECRET;
  try {
    delete process.env.SMTP_PASS;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REFRESH_TOKEN;

    const validReq: any = {
      method: 'POST',
      body: {
        to: 'customer@example.com',
        subject: 'Test delivery',
        text: 'Testing dispatch flow',
      },
    };
    const validRes = createMockRes();
    await handler(validReq, validRes);
    if (validRes.statusCode !== 503 || validRes.jsonData?.stage !== 'configuration') {
      throw new Error(`Expected 503 with stage configuration, got: status=${validRes.statusCode}, body=${JSON.stringify(validRes.jsonData)}`);
    }
    if (!validRes.jsonData?.error || typeof validRes.jsonData.error !== 'string') {
      throw new Error('Expected clean string error message in client response');
    }
    console.log(`✓ Handler Test E Passed: Unconfigured provider safely returns 503 with stage: "${validRes.jsonData.stage}"`);
  } finally {
    if (savedPass) process.env.SMTP_PASS = savedPass;
    if (savedUser) process.env.SMTP_USER = savedUser;
    if (savedGoogleSecret) process.env.GOOGLE_CLIENT_SECRET = savedGoogleSecret;
  }

  // Test F: Live dispatch with active credentials returns 200 and messageId
  if (process.env.SMTP_PASS) {
    const liveReq: any = {
      method: 'POST',
      body: {
        to: 'gillesawo6@gmail.com',
        subject: 'Test delivery verification',
        text: 'Live testing flow',
      },
    };
    const liveRes = createMockRes();
    await handler(liveReq, liveRes);
    if (liveRes.statusCode !== 200 || !liveRes.jsonData?.messageId) {
      throw new Error(`Expected 200 with messageId, got: status=${liveRes.statusCode}, body=${JSON.stringify(liveRes.jsonData)}`);
    }
    console.log(`✓ Handler Test F Passed: Active provider delivers email successfully with messageId: ${liveRes.jsonData.messageId}`);
  }

  console.log('--- ALL HTTP HANDLER TESTS PASSED! ---');
}

runHandlerTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
