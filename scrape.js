require('dotenv').config()
const scrapingbee = require('scrapingbee');
const csv = require('csv-stringify/sync')
const fs = require('fs/promises')

const API_KEY = process.env.SCRAPINGBEE_API_KEY

if (!API_KEY) {
  throw new Error('You need to set the SCRAPINGBEE_API_KEY environment variable or add it to a .env file to run this script')
}

const client = new scrapingbee.ScrapingBeeClient(API_KEY);

(async () => {
  const textDecoder = new TextDecoder()
  const pageBaseUrl = 'https://leads-example-page.vercel.app/'

  const userProfiles = []
  let nextPage = pageBaseUrl
  while (nextPage) {
    const response = await client.get({
      url: nextPage,
      params: {
        render_js: false,
        extract_rules: {
          users: {
            selector: ".user-id",
            type: "list"
          },
          nextPage: "a.next-page@href"
        }
      },
    })

    const data = JSON.parse(textDecoder.decode(response.data))

    // only if there is a next page, set it, otherwise set it to null, breaking the loop
    nextPage = data.nextPage ? 'https://leads-example-page.vercel.app/' + data.nextPage : null

    // add all the new user profile links to the array
    userProfiles.push(...data.users.map((user) => 'https://leads-example-page.vercel.app/user/' + user.replace('@ ', '')))
  }

  // deduplicate the user profiles
  const uniqueUserProfiles = [...new Set(userProfiles)]

  const leads = []
  const MAX_LEADS = 3
  for (let i = 0; i < MAX_LEADS && i < uniqueUserProfiles.length; i++) {
    const profileUrl = uniqueUserProfiles[i]
    const response = await client.get({
      url: profileUrl,
      params: {
        render_js: false,
        extract_rules: {
          name: '.profile span.name',
          role: '.profile span.role',
          email: 'a[href^="mailto:"]@href'
        }
      }
    })

    const data = JSON.parse(textDecoder.decode(response.data))
    leads.push({
      name: data.name,
      role: data.role,
      email: data.email.replace('mailto:', '')
    })
  }

  const csvContent = csv.stringify(leads, { header: true })
  await fs.writeFile('leads.csv', csvContent, 'utf8')
  console.log('Wrote leads to leads.csv')
})()