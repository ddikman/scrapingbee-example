const csv = require('csv-stringify/sync')
const fs = require('fs/promises')

// convert the data to a csv string and save it to a file
async function saveCsv(filename, data) {
  const csvContent = csv.stringify(data, { header: true })
  await fs.writeFile(filename, csvContent, 'utf8')
}

module.exports = saveCsv