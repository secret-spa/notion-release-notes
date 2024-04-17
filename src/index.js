const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { markdownToBlocks } = require('@tryfabric/martian')

try {
  // `who-to-greet` input defined in action metadata file
  const body = core.getInput('body')
  const version = core.getInput('version')
  const token = core.getInput('token')
  const platform = core.getInput('platform') || ''
  const database = core.getInput('database')
  const date = new Date().toISOString().split('T')[0]
  const author = core.getInput('author') || ''

  const authorId = {
    1864825: 'db283023-c18c-4aa3-93b4-3f78d9907dca',
    59967673: 'd84e5646-cade-4eb4-97be-8b6c97eec35d',
    151772: '32f88495-36f8-4073-95e7-f0e2f8b47e95'
  }[author]

  console.log('authorId', authorId)
  console.log('author', author)

  core.debug('Creating notion client ...', version, platform)
  const notion = new Client({
    auth: token,
    logLevel: LogLevel.ERROR
  })

  const blocks = markdownToBlocks(body)

  notion.databases.query({
    database_id: database,
    filter: {
      and: [
        {
          property: 'Version',
          text: {
            contains: version
          }
        },
        {
          property: 'Platform',
          select: {
            equals: platform
          }
        }
      ]
    }
  }).then((queryResult) => {
    console.log(queryResult)

    if (queryResult.results.length > 0) {
      core.info('🚨 Changelog already exists for this version and platform.')
      core.setOutput('status', 'skipped')
      return
    }

    core.debug('Creating page ...')
    notion.pages.create({
      parent: {
        database_id: database
      },
      properties: {
        Version: {
          title: [
            {
              text: {
                content: version
              }
            }
          ]
        },
        Platform: {
          select: {
            name: platform
          }
        },
        Status: {
          select: {
            name: 'In Progress'
          }
        },
        'Release Date': {
          date: {
            start: date
          }
        },
        'Released by': {
          people: authorId
            ? [{
                object: 'user',
                id: authorId
              }]
            : []
        }
      },
      children: blocks
    }).then((result) => {
      core.debug(`${result}`)
      core.info('🎉 Changelog published to Notion!')
      core.setOutput('status', 'complete')
    })
  })
} catch (error) {
  core.info('❌ Changelog failed to be published (see error in error message).')
  core.setFailed(error.message)
}
