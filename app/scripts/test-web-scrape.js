async function test() {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent('Dental Clinics Austin TX');
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  
  // Extract results
  const results = [];
  const titleRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let titleMatch;
  while ((titleMatch = titleRegex.exec(html)) !== null) {
    const rawUrl = titleMatch[1];
    const rawTitle = titleMatch[2].replace(/<[^>]+>/g, '').trim();
    
    // Decode DDG redirect URL if present
    let finalUrl = rawUrl;
    const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) {
      finalUrl = decodeURIComponent(uddgMatch[1]);
    }

    results.push({
      title: rawTitle,
      url: finalUrl,
    });
  }

  // Snippets
  let snippetMatch;
  let idx = 0;
  while ((snippetMatch = snippetRegex.exec(html)) !== null) {
    if (results[idx]) {
      results[idx].snippet = snippetMatch[1].replace(/<[^>]+>/g, '').trim();
    }
    idx++;
  }

  console.log(`Extracted ${results.length} real search results:`);
  for (const r of results.slice(0, 5)) {
    console.log(`- [${r.title}] -> ${r.url}`);
    console.log(`  Snippet: ${r.snippet?.slice(0, 100)}...`);
  }
}
test();
