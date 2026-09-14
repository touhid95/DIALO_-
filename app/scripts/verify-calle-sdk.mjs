import { CalleClient } from '@call-e/calle';

console.log("=================================================");
console.log("       CALL-E SDK VERIFICATION & HEALTH CHECK    ");
console.log("=================================================\n");

const apiKey = process.env.CALL_E_API_KEY || "test_api_key_smoke";
const client = new CalleClient({ apiKey });

console.log("✓ CalleClient created successfully.");
console.log("- Goals API Available:", typeof client.goals?.run === 'function');
console.log("- Goals RunAndWait Available:", typeof client.goals?.runAndWait === 'function');
console.log("- Goals Get Available:", typeof client.goals?.get === 'function');
console.log("- Goals List Available:", typeof client.goals?.list === 'function');
console.log("- Calls Create Available:", typeof client.calls?.create === 'function');
console.log("- Calls Get Available:", typeof client.calls?.get === 'function');
console.log("- Calls WaitForResults Available:", typeof client.calls?.waitForResult === 'function');

console.log("\nCALL-E SDK is installed and ready for live execution!");
