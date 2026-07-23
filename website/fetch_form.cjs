async function fetchForm() {
  try {
    const res = await fetch('https://forms.gle/XXAVtsiqobD1modg7');
    const data = await res.text();
    
    const fbzxMatch = data.match(/name="fbzx" value="([^"]+)"/);
    console.log('fbzx:', fbzxMatch ? fbzxMatch[1] : 'not found');
    
    // Log the resolved URL to know the long form ID
    console.log('Resolved URL:', res.url);
    
    // Extract FB_PUBLIC_LOAD_DATA_
    const fbDataMatch = data.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*?\]);/s);
    if (fbDataMatch) {
      try {
        const fbData = JSON.parse(fbDataMatch[1]);
        const formFields = fbData[1][1];
        formFields.forEach(field => {
          const fieldName = field[1];
          const fieldType = field[3];
          if (field[4] && field[4][0]) {
             const entryId = field[4][0][0];
             console.log(`Field: ${fieldName} -> entry.${entryId}`);
          }
        });
      } catch (e) {
        console.log('Parse error', e);
      }
    } else {
      console.log('FB_PUBLIC_LOAD_DATA_ not found');
    }
  } catch (err) {
    console.log('Error: ' + err.message);
  }
}
fetchForm();
