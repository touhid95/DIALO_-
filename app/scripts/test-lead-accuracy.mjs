// Test what Apollo API and Serper API return
const apolloKey = "GB19OqGFybJyvd0Feq-2VA";
const serperKey = "5c5aa21b0d574a48066209c779370c44b9284c6c";

async function testApolloContacts() {
  console.log("--- Testing Apollo /contacts/search ---");
  try {
    const res = await fetch("https://api.apollo.io/api/v1/contacts/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apolloKey,
      },
      body: JSON.stringify({
        api_key: apolloKey,
        per_page: 5,
      }),
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Pagination:", data.pagination);
    console.log("Contacts count:", data.contacts?.length);
    if (data.contacts && data.contacts.length > 0) {
      console.log("Sample contact:", data.contacts[0].name, data.contacts[0].title, data.contacts[0].organization_name);
    }
  } catch (err) {
    console.error("Apollo contacts error:", err.message);
  }
}

async function testApolloMixedPeople() {
  console.log("\n--- Testing Apollo /mixed_people/search ---");
  try {
    const res = await fetch("https://api.apollo.io/api/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apolloKey,
      },
      body: JSON.stringify({
        api_key: apolloKey,
        q_keywords: "Bangladesh News Media",
        person_locations: ["Dhaka, Bangladesh"],
        per_page: 5,
      }),
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.slice(0, 300));
  } catch (err) {
    console.error("Apollo mixed_people error:", err.message);
  }
}

async function testSerperPlaces() {
  console.log("\n--- Testing Serper Places for 'News agency Dhaka Bangladesh' ---");
  try {
    const res = await fetch("https://google.serper.dev/places", {
      method: "POST",
      headers: {
        "X-API-KEY": serperKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: "News Media agencies in Dhaka, Bangladesh",
        location: "Dhaka, Bangladesh",
        num: 5,
      }),
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Places count:", data.places?.length);
    if (data.places && data.places.length > 0) {
      for (const p of data.places.slice(0, 3)) {
        console.log(`- ${p.title} | Phone: ${p.phoneNumber} | Address: ${p.address} | Rating: ${p.rating} | Category: ${p.category}`);
      }
    }
  } catch (err) {
    console.error("Serper error:", err.message);
  }
}

async function run() {
  await testApolloContacts();
  await testApolloMixedPeople();
  await testSerperPlaces();
}

run();
