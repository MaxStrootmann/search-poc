import weaviate, { type WeaviateClient } from 'weaviate-client'
import 'dotenv/config'

async function main() {

  const weaviateURL = process.env.WEAVIATE_HOST_URL as string
  const weaviateKey = process.env.WEAVIATE_ADMIN_KEY as string
  const cohereKey = process.env.COHERE_API_KEY as string
  const githubToken = process.env.GITHUB_TOKEN as string

  // Step 1: Connect to your Weaviate instance  
  const client: WeaviateClient = await weaviate.connectToWeaviateCloud(weaviateURL, {
    authCredentials: new weaviate.ApiKey(weaviateKey),
    headers: {
      'X-Cohere-Api-Key': cohereKey,  // Replace with your inference API key
    }
  })


  // Delete the "Wikipedia" collection if it exists
  await client.collections.delete('Emails');

  if (await client.collections.exists('Emails') == false) {

    console.log("step 1 done")

    // Step 2: Create a collection with a vectorizer
    await client.collections.create({
      name: 'Emails',
      // Define your Cohere vectorizer 
      vectorizers: weaviate.configure.vectorizer.text2VecCohere({
        sourceProperties: ['subject', 'body']
      }),
    });

    try {
      let emailCollection = client.collections.get('Emails');

      // Step 3: Download data to import into the "Wikipedia" collection
      const url = `https://raw.githubusercontent.com/MaxStrootmann/data-sets/refs/heads/master/email.json?token=${githubToken}`
      const response = await fetch(url);
      console.log("got this far, here is the response object:", response)
      const emails = await response.json();

      // Step 4: Bulk insert downloaded data into the "Wikipedia" collection
      await emailCollection.data.insertMany(emails)

      console.log('Data Imported');
    } catch (e) {
      console.error("My error:", e);
    }
  }
}

void main();
