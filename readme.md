# Scrapingbee example

This repository shows how to use [Scrapingbee](https://scrapingbee.com/) to parse leads from an example site.

The example site used is https://leads-example-page.vercel.app/.

## Running the example

To run this example, you must first set your Scrapingbee API key as an environment variable or add a `.env` file.

```bash
export SCRAPINGBEE_API_KEY="your key here"
yarn install
yarn start
```

The scraped leads will be saved to an output csv file.

To avoid using too many credits, a variable `SCRAPINGBEE_LIMIT_LEADS` can is defaulted to `5` leads. You can set this variable as well to scrape more leads.

## Script explanation

Most of the script is in [scrape.js](./scrape.js). The storage of the csv is placed in the `lib/save-csv.js` file just to avoid cluttering the main script.

The script parses the example site like this:

1. Scrape the main landing page, getting all user ids
2. If there was a next page link, follow that link and get all user ids, add to list
3. Deduplicate user list
4. Limit the list of users (to conserve credits used)
5. Parse each user details page
6. Save results to csv file