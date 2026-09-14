async function test() {
  const res = await fetch("http://localhost:3000/api/discovery/extract-arrays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: [
        { role: "user", content: "I want to target dental clinics in Austin, TX" }
      ],
      text: "Target Product: CALL-E Voice Agent. Target Industry: Dental & Healthcare Clinics. Preferred Location: Austin, TX."
    })
  });
  const json = await res.json();
  console.log("STATUS:", res.status);
  console.log("EXTRACTED ARRAYS:");
  console.log("- Domains Count:", json.data?.organization_domain?.length, json.data?.organization_domain);
  console.log("- Locations Count:", json.data?.client_location?.length, json.data?.client_location);
  console.log("- Keywords Count:", json.data?.keywords?.length, json.data?.keywords);
}

test().catch(console.error);
