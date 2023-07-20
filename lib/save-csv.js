const csv = require('csv-stringify')
const fs = require('fs/promises')

// helper to promisify the stringify method
async function arrayToCsv(data) {
  return new Promise((resolve, reject) => {
    csv.stringify(data, { header: true }, (err, output) => {
      if (err) {
        reject(err)
      } else {
        resolve(output)
      }
    })
  })
}

// convert the data to a csv string and save it to a file
async function saveCsv(filename, data) {
  const csvContent = await arrayToCsv(data)
  await fs.writeFile(filename, csvContent, 'utf8')
}

module.exports = saveCsv