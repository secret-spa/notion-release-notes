# Notion Release Notes

[![CodeQL](https://github.com/infinitaslearning/notion-release-notes/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/infinitaslearning/notion-release-notes/actions/workflows/codeql-analysis.yml)

This action allows you to specify an existing database in your Notion workspace, and create a new entry each time your action runs.  This is currently specifically aimed at release notes, but could be used for a more generic purpose if you like, fields are kept purposefully quite generic.

This would typically be used alongside https://github.com/mikepenz/release-changelog-builder-action to actually programmatically build the release notes based on tags / pull-requests.

## Notion integration and token

First, you need to have an integration access token - which you can get from https://www.notion.so/my-integrations after creating an integration.  Give the integration a friendly name like 'Github Action Release Notes'.

By default integrations cant access any content so you you *must* share your database with the integration you created earlier to be able to access it!

## Notion Database

This action expects a Notion database with the following properties:

- Version: title
- Date: date
- Platform: platform

## Usage

Typically this is used with a changelog builder:

```yaml
- name: Release Changelog Builder
    uses: mikepenz/release-changelog-builder-action@v2.7.1
    id: build_changelog
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   
- name: Notion release notes        
  uses: infinitaslearning/notion-release-notes@main        
  with:          
    token: ${{ secrets.NOTION_TOKEN }}
    database: 619f0845c68a4c18837ebdb9812b90c0
    version: 1.1.0    
    platform: API
    body: ${{ steps.build_changelog.outputs.changelog }}
```

To get the database ID, simply browse to it, click on the '...' and get a 'Copy link'.  The GUID at the end of the URL is the id.

## Development

Assumes you have `@vercel/ncc` installed globally.
After changes ensure you `npm run build`, commit and then submit a PR.
