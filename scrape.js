require('dotenv').config();
const scrapingbee = require('scrapingbee');
const csv = require('csv-stringify/sync')
const fs = require('fs/promises')

const API_KEY = process.env.SCRAPINGBEE_API_KEY;

const LIMIT_LEADS = process.env.SCRAPINGBEE_LIMIT_LEADS || 5

if (!API_KEY) {
  console.error('Please set the SCRAPINGBEE_API_KEY environment variable.');
  process.exit(1);
}

async function parseUrlWithRules(url, extractRules) {
  const client = new scrapingbee.ScrapingBeeClient(API_KEY);
  const decoder = new TextDecoder();
  try {
    const response = await client.get({
      url: url,
      params: {
        render_js: false,
        extract_rules: extractRules
      },
    })

    // parse the response to text, then parse it to json
    const text = decoder.decode(response.data);
    return JSON.parse(text);
  } catch (err) {
    if (err.response) {
      throw new Error(`Request failed [${response.statusText}]: ${url}`)
    }
    throw err
  }
}

async function parseListPage(url) {
  const extractRules = {
    users: {
      selector: '.user-id',
      type: 'list'
    },
    nextPage: 'a.next-page@href',
  }
  const pageData = await parseUrlWithRules(url, extractRules)

  // clean the collected user ids
  pageData.users = pageData.users.map((user) => user.replace('@', '').trim())

  // make next page absolute
  if (pageData.nextPage) {
    pageData.nextPage = 'https://leads-example-page.vercel.app/' + pageData.nextPage
  }

  return pageData
}

async function parseProfilePage(url) {
  const extractRules = {
    name: '.profile span.name',
    role: '.profile span.role',
    email: 'a[href^="mailto:"]@href'
  }
  const userData = await parseUrlWithRules(url, extractRules)

  // clean the user email
  userData.email = userData.email.replace('mailto:', '')

  return userData
}

async function saveCsv(filename, data) {
  // convert the data to a csv string and save it to a file
  const csvContent = csv.stringify(data, { header: true })
  await fs.writeFile(filename, csvContent, 'utf8')
}

(async () => {
  const users = []

  // start at the first lead page, then iterate until we no longer have a next page to follow
  let nextPage = 'https://leads-example-page.vercel.app/'
  while (nextPage) {
    console.log(`Parsing ${nextPage}..`)
    const data = await parseListPage(nextPage);
    users.push(...data.users)
    nextPage = data.nextPage
  }

  // deduplicate all users to make sure we only parse each profile once
  const uniqueUsers = [...new Set(users)]
  console.log(`\nFound ${uniqueUsers.length} unique leads..\n`)

  // for testing demo purposes, to avoid burning too much credits, we limit the number of leads
  const parseLeads = uniqueUsers.slice(0, LIMIT_LEADS)
  console.log(`\nSelected ${parseLeads.length} leads for further parsing..\n`)

  // now we parse each lead profile page
  const leads = []
  for (const user of parseLeads) {
    // clean the parsed id
    const userId = user.replace('@', ' ')
    const userProfileUrl = 'https://leads-example-page.vercel.app/user/' + userId
    console.log(`Parsing ${userProfileUrl}..`)
    const data = await parseProfilePage(userProfileUrl)
    leads.push(data)
  }

  const outputFilename = 'leads.csv'
  await saveCsv(outputFilename, leads)
  console.log(`Successfully parsed ${leads.length} leads and saved to ${outputFilename}`)
})();