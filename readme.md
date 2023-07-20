# Scrapingbee example

This repository shows how to use [Scrapingbee](https://scrapingbee.com/) to parse leads from an example site.

The example site used is https://leads-example-page.vercel.app/.

## Running the example

To run this example, you must first set your Scrapingbee API key as an environment variable or add it to a `.env` file.

```bash
echo "SCRAPINGBEE_API_KEY=your-key" > .env
npm install
node scrape.js
```

The scraped leads will be saved to an output csv file.

To avoid using too many credits, only 3 leads are scraped. This can be changed by updating the `MAX_LEADS` constant.

## Script explanation

The script parses the example site like this:

1. Scrape the main landing page, getting all user ids
2. If there was a next page link, follow that link and get all user ids, add to list
3. Deduplicate user list
4. Limit the list of users (to conserve credits used)
5. Parse each user details page
6. Save results to csv file